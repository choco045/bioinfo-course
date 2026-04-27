# Week 9 学习笔记：Motif 分析

> 来源：[Bioinformatics Tutorial - Part III. NGS Data Analyses - 4. Motif](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/4.motif)

---

## 4.1 Sequence Motif

### 0) 背景

在 ChIP-seq 一节中，我们已经用 **HOMER** 提供的工具从 ChIP-seq 的 peak 对应的序列出发进行过 motif discovery 分析。HOMER 主要是针对 ChIP-seq 的分析开发的，本节介绍的 **MEME Suite** 是一套更通用的、专门针对 motif 分析开发的工具。

- **MEME**：最早于 1994 年开发，使用 EM（期望最大化）算法进行 motif discovery。
- **MEME Suite**：将 MEME 和多个相关工具整合到一个工具包，是目前最流行的 motif 分析工具套件。

本节使用 MEME Suite 中的两个工具解决以下两个问题：

1. **Motif Discovery（motif 发现）**：假设有一组核酸序列（如 ChIP-seq/CLIP-seq 的 peaks、共表达基因的启动子、UTR 区域等），希望从这组序列出发，计算出一组 **PWM（位置权重矩阵）**，描述调控因子的序列偏好性。使用工具：**MEME**。

2. **Motif Enrichment（motif 富集分析）**：已知一组 motif（以 PWM 形式给出），希望判断这些 motif 在给定序列集合中是否显著富集。使用工具：**AME**。

---

### 1) 环境准备

#### 启动 Docker 容器

```bash
# 启动名为 motif 的 Docker 容器，挂载宿主机共享目录到容器的 /data 目录
# -d: 后台运行  -t: 分配伪终端  --name: 容器名称
# --restart unless-stopped: 除非手动停止，否则自动重启
# -v: 挂载目录（宿主机路径:容器路径）
docker run -dt --name motif --restart unless-stopped -v {host.machine.shared.directory}:/data bioinfo/motif:2.0 /bin/bash

# 以 test 用户身份进入容器的交互式终端
# exec: 在运行中的容器内执行命令  -it: 交互式终端  -u test: 指定用户
docker exec -it -u test motif /bin/bash
```

#### 进入工作目录并准备基因组文件

```bash
# 切换到 sequence_motif 工作目录
cd /home/test/motif/sequence_motif

# 建立软链接，将 /data/genome 链接到当前目录，方便访问
# ln -s: 创建符号链接（软链接），相当于快捷方式
ln -s /data/genome .

# 解压人类基因组 FASTA 文件（GRCh38 版本）
# gunzip: 解压 .gz 格式的压缩文件
gunzip genome/GRCh38.p10.genome.fa.gz

# 解压基因组注释 GTF 文件（GENCODE v27）
gunzip genome/gencode.v27.annotation.gtf.gz
```

---

### 2) 获取目标序列

#### 步骤一：用 R 脚本提取基因组区间（BED 格式）

```r
#!/usr/bin/env Rscript

message("Load required packages ...")
suppressPackageStartupMessages(library("GenomicFeatures"))
# 加载 GenomicFeatures 包，用于处理基因组注释

message("Load trasncripts in gencode human genome annotation ...")

# 指定基因组注释 GTF 文件路径
gtf.path <- "genome/gencode.v27.annotation.gtf"

# 使用 makeTxDbFromGFF 函数从 GTF 文件构建 TxDb 对象
# TxDb 是 GenomicFeatures 包用于存储转录本注释的数据结构
tx.db <- makeTxDbFromGFF(gtf.path, format="gtf")

# 获取每个转录本的长度信息
# with.cds_len/with.utr5_len/with.utr3_len=FALSE: 不单独计算各区域长度
tx.lengths <- transcriptLengths(tx.db, with.cds_len=FALSE, with.utr5_len=FALSE, with.utr3_len=FALSE)
# tx.lengths 是一个 data.frame，包含字段：
# tx_id, tx_name, gene_id, nexon（外显子数目）, tx_len（转录本长度）

# 对每个基因，只保留最长的转录本，避免多个异构体导致基因被过度代表
# split: 按 gene_id 分组；which.max: 找到最长转录本的索引
gene.id.2.longest.tx.id <- lapply(split(tx.lengths, tx.lengths$gene_id),
                                  function(isoform.length.table){
                                    isoform.length.table$tx_name[which.max(isoform.length.table$tx_len)]
                                  })
# 将列表转换为向量，得到"基因ID → 最长转录本ID"的查找表
gene.id.2.longest.tx.id <- unlist(gene.id.2.longest.tx.id)


message("Load gene ids of interest ...")
# 从文件读取感兴趣的基因 Ensembl ID 列表（每行一个 ID）
gene.ids <- read.delim("gene.ensembl.ids.txt", sep="\n", stringsAsFactors=F, header=F)$V1
message(length(gene.ids), " genes were loaded .")

# 根据基因 ID 获取对应的最长转录本 ID
considered.tx.ids <- gene.id.2.longest.tx.id[gene.ids]

# 建立"转录本ID → 基因ID"的反向查找表
names(gene.ids) <- considered.tx.ids


# ---- 提取 5' UTR 序列区间 ----
message("Fetch 5' UTR genomic intervals ...")
# fiveUTRsByTranscript: 按转录本获取 5' UTR 的基因组区间
five.prime.utrs = fiveUTRsByTranscript(tx.db, use.names=T)
five.prime.utrs <- data.frame(five.prime.utrs)
# 结果示例（data.frame 格式）：
#  group  group_name         seqnames  start    end   width strand exon_id          exon_name       exon_rank
#  1      ENST00000641515.1  chr1      65419  65433    15     +     21       ENSE00003812156.1       1

message("Saving 5' UTR genomic intervals in bed format ...")
fields <- c("seqnames","start","end","group_name","exon_id","strand")
# 只保留感兴趣的转录本对应的 5' UTR 区间
five.prime.utrs <- five.prime.utrs[five.prime.utrs$group_name %in% considered.tx.ids, fields]
# 将 group_name 改为"基因ID-转录本ID"格式，便于后续追踪
five.prime.utrs$group_name <- paste0(gene.ids[five.prime.utrs$group_name], "-", five.prime.utrs$group_name)
# BED 格式要求起始坐标为 0-based，GTF/GFF 是 1-based，所以 start 减 1
five.prime.utrs$start <- five.prime.utrs$start - 1
# 保存为 BED 格式文件（无引号、制表符分隔、无列名、无行名）
write.table(five.prime.utrs, "five.prime.utrs.bed", quote=FALSE, sep="\t", col.names=FALSE, row.names=FALSE)


# ---- 提取 3' UTR 序列区间 ----
message("Fetch 3' UTR genomic intervals ...")
# threeUTRsByTranscript: 按转录本获取 3' UTR 的基因组区间
three.prime.utrs = threeUTRsByTranscript(tx.db, use.names=T)
three.prime.utrs <- data.frame(three.prime.utrs)
message("Saving 3' UTR genomic intervals in bed format ...")
three.prime.utrs <- three.prime.utrs[three.prime.utrs$group_name %in% considered.tx.ids, fields]
three.prime.utrs$group_name <- paste0(gene.ids[three.prime.utrs$group_name], "-", three.prime.utrs$group_name)
three.prime.utrs$start <- three.prime.utrs$start - 1
write.table(three.prime.utrs, "three.prime.utrs.bed", quote=FALSE, sep="\t", col.names=FALSE, row.names=FALSE)


# ---- 提取启动子序列区间 ----
message("Fetch promoter genomic intervals ...")
# promoters: 获取启动子区间（默认定义：TSS 上游 2000bp，下游 200bp）
promoters.ivs <- promoters(tx.db)
promoters.ivs <- data.frame(promoters.ivs)
message("Saving promoter genomic intervals ...")
fields <- c("seqnames","start","end","tx_name","tx_id","strand")
promoters.ivs <- promoters.ivs[promoters.ivs$tx_name %in% considered.tx.ids, fields]
promoters.ivs$start <- promoters.ivs$start - 1
write.table(promoters.ivs, "promoters.bed", quote=FALSE, sep="\t", col.names=FALSE, row.names=FALSE)

message("All done .")
```

#### 整理 BED 文件

```bash
# 创建 bed 目录，用于存放所有 BED 格式文件
mkdir bed

# 将当前目录下所有 .bed 文件移动到 bed 目录
mv *.bed bed
```

#### 步骤二：用 bedtools 从基因组中提取 FASTA 序列

```bash
# 创建 sequences 目录（-p: 如果父目录不存在则一并创建）
mkdir -p sequences

# 使用 bedtools getfasta 从基因组 FASTA 中提取指定区间的序列
# -s: 根据链方向（strand）提取序列（负链自动取反向互补）
# -name+: 使用 BED 文件第4列作为序列名，并附加坐标信息
# -fi: 输入基因组 FASTA 文件
# -bed: 输入 BED 文件（指定提取区间）
# -fo: 输出 FASTA 文件路径

# 提取启动子序列
bedtools getfasta -s -name+ -fi genome/GRCh38.p10.genome.fa -bed bed/promoters.bed -fo sequences/promoters.fa

# 提取 5' UTR 序列
bedtools getfasta -s -name+ -fi genome/GRCh38.p10.genome.fa -bed bed/five.prime.utrs.bed -fo sequences/five.prime.utrs.fa

# 提取 3' UTR 序列
bedtools getfasta -s -name+ -fi genome/GRCh38.p10.genome.fa -bed bed/three.prime.utrs.bed -fo sequences/three.prime.utrs.fa
```

#### 步骤三：拼接同一转录本的多个外显子序列（splicing）

由于 UTR 可能由多个外显子组成，需要将同一转录本的多段序列按顺序拼接成完整的 spliced 序列。

```r
#!/usr/bin/env Rscript

message("Load required packages ...")
suppressPackageStartupMessages(library("Biostrings"))
# 加载 Biostrings 包，用于处理生物序列（DNA/RNA/蛋白质）

# 设置输入和输出文件路径（以 3' UTR 为例）
input.sequences.path <- "sequences/three.prime.utrs.fa"
output.sequences.path <- "sequences/three.prime.utrs.spliced.fa"

message("Load sequences ...")
# readBStringSet: 读取 FASTA 文件，返回 BStringSet 对象
sequences <- readBStringSet(input.sequences.path, format="fasta")

# 序列名示例：ENSG00000257315.2-ENST00000550078.2::chr1:203848330-203848407(+)
seq.names.long <- names(sequences)

# 提取基因/转录本 ID 部分（"::" 前的部分）
# 示例结果：ENSG00000257315.2-ENST00000550078.2
seq.names <- unlist(lapply(seq.names.long, function(s){strsplit(s, "::")[[1]][1]}))

# 提取基因组坐标部分（"::" 后的部分）
# 示例结果：chr1:203848330-203848407(+)
regions <- unlist(lapply(seq.names.long, function(s){strsplit(s, "::")[[1]][2]}))

# 提取起始坐标（用于排序外显子顺序）
# 示例结果：203848330
start.positions <- as.numeric(unlist(lapply(regions, function(s){
  strsplit(strsplit(s, ":")[[1]][2], "-")[[1]][1]
})))

# 提取链方向（"+" 或 "-"）
strands <- unlist(lapply(regions, function(s){l=nchar(s); substr(s, l-1, l-1)}))

# 构建区间信息表
region.table <- data.frame(seq.names.long=seq.names.long, start.positions=start.positions, strands=strands)

# 按转录本 ID 分组
intervals.by.tx <- split(region.table, seq.names)

message("Concatenate sequences ...")

string.set <- DNAStringSet()
for(tx.id in names(intervals.by.tx)){
  intervals <- intervals.by.tx[[tx.id]]
  # 正链（+）：按起始坐标升序排列外显子
  if(intervals$strands[1] == "+"){
    intervals <- intervals[order(intervals$start.positions, decreasing=F),]
  } else {
    # 负链（-）：按起始坐标降序排列（因为负链方向相反）
    intervals <- intervals[order(intervals$start.positions, decreasing=T),]
  }
  # 将同一 UTR 的多个外显子序列拼接成一条完整的 spliced 序列
  spliced.sequence <- paste(apply(intervals, 1, function(x){toString(sequences[x[1]])}), collapse="")
  string.set[[tx.id]] = spliced.sequence
}

message("Saving results ...")
# writeXStringSet: 将序列集合写出为 FASTA 格式文件
writeXStringSet(string.set, output.sequences.path)
message("All done.")
```

对 5' UTR 重复同样的拼接操作，只需修改路径：

```r
# 修改输入输出路径，对 5' UTR 执行相同的拼接操作
input.sequences.path <- "sequences/five.prime.utrs.fa"
output.sequences.path <- "sequences/five.prime.utrs.spliced.fa"
```

---

### 3) Motif 分析

#### 步骤一：生成 dinucleotide-shuffled 对照序列

```bash
# fasta-dinucleotide-shuffle: MEME Suite 提供的工具
# 对输入序列进行双核苷酸频率保留的随机打乱，生成对照序列
# 保留双核苷酸频率可以控制序列组成偏差，使对照更合理
# -f: 输入 FASTA 文件
# >: 将输出重定向到新文件

# 对启动子序列生成对照
fasta-dinucleotide-shuffle -f sequences/promoters.fa > sequences/promoters.dinuc.shuffled.fa

# 对 5' UTR spliced 序列生成对照
fasta-dinucleotide-shuffle -f sequences/five.prime.utrs.spliced.fa > sequences/five.prime.utrs.spliced.dinuc.shuffled.fa

# 对 3' UTR spliced 序列生成对照
fasta-dinucleotide-shuffle -f sequences/three.prime.utrs.spliced.fa > sequences/three.prime.utrs.spliced.dinuc.shuffled.fa
```

#### 步骤二：MEME 进行 Motif Discovery

```bash
# meme: MEME Suite 的核心工具，用于从序列中发现 de novo motif
# -dna: 指定输入序列类型为 DNA
# -minw 6: motif 最小宽度为 6 bp
# -maxw 10: motif 最大宽度为 10 bp
# -oc promoters.motif.discovery: 输出目录（如已存在则覆盖）
# -nmotifs 5: 最多发现 5 个 motif
# 最后一个参数为输入 FASTA 文件
meme -dna -minw 6 -maxw 10 -oc promoters.motif.discovery -nmotifs 5 sequences/promoters.fa
```

> **MEME 的 `-mod` 参数说明**（三种模型）：
> - **oops**（One Occurrence Per Sequence）：假设每条序列中恰好出现一次该 motif
> - **zoops**（Zero or One Occurrence Per Sequence）：假设每条序列中出现零次或一次该 motif
> - **anr**（Any Number of Repetitions）：假设每条序列中可以出现任意次数的该 motif

#### 步骤三：AME 进行 Motif Enrichment 分析

```bash
# ame: MEME Suite 的富集分析工具，检验已知 motif 在目标序列中是否显著富集
# --control: 指定对照序列（dinucleotide-shuffled 序列）
# --oc: 输出目录
# 第一个位置参数：目标序列（前景序列）
# 第二个位置参数：已知 motif 数据库文件（MEME 格式的 PWM 集合）
ame --control sequences/promoters.dinuc.shuffled.fa --oc promoter.motif.enrichment sequences/promoters.fa known-motifs/JASPAR2018_CORE_vertebrates_non-redundant.meme
```

#### 补充：用 HOMER 提取 ChIP-seq peak 序列

```bash
# homerTools extract: HOMER 工具，从基因组中提取 peak 对应的序列
# CHIP.peak: homer findPeaks 输出的 peak 文件
# /home/test/homer/data/genomes/sacCer2/: HOMER 使用的酵母基因组目录
# -fa: 输出为 FASTA 格式
# 提取的序列可作为 meme 的输入进行 motif finding
homerTools extract CHIP.peak /home/test/homer/data/genomes/sacCer2/ -fa
```

---

## 4.2 Structure Motif

### 1) Workflow 概述

选择 RNA structure motif discovery 的输入序列的方法和 RNA sequence motif discovery 完全一样。

RNA structure motif discovery 的应用场景相对更狭窄，目前也没有像 MEME Suite 那样具有统治地位的工具。本教程实际使用的是 **BEAM** 这个工具。

**BEAM 的核心思路**：
1. 先用 RNA 二级结构预测软件（如 **RNAfold**、**RNAstructure** 等）预测 RNA 的二级结构
2. 按照 BEAM 自定义的规则，定义一套掺入了结构信息的新字母表（**BEAR encoding**）
3. 将原来四个核苷酸的字符串编码成在新字母表上同样长度的字符串
4. 将 structure motif discovery 问题转化为 sequence motif discovery 问题，利用已有的成熟算法求解

**优点**：方法简单，可复用 sequence motif 的算法框架  
**局限性**：将二维结构按人为规则转化为一维序列，会丢失部分结构信息

---

### 2) Running Steps

#### 环境准备（使用 Singularity 容器）

```bash
# 加载 Singularity 环境配置脚本
source /WORK/Samples/singularity.sh

# 设置 Singularity 绑定路径（将宿主机 /data 目录挂载到容器内 /data）
export SINGULARITY_BINDPATH='/data:/data'

# 进入 Singularity 容器（使用指定的镜像文件）
singularity shell /data/images/bioinfo_motif_2.0.simg

# 加载容器内的环境变量配置
source /home/test/.bashrc

# ... 在容器内执行后续操作 ...

# 退出容器
exit
```

#### 步骤一：切换到工作目录

```bash
# 进入 BEAM 分析的工作目录
cd /home/test/motif/structure_motif/BEAM
```

#### 步骤二：用 RNAfold 预测 RNA 二级结构

```bash
# RNAfold: ViennaRNA 包中的 RNA 二级结构预测工具
# --noPS: 不生成 PostScript 结构图（节省时间和磁盘空间）
# <test.fa: 从 FASTA 文件读取输入序列
# >test.dbn: 将输出（dot-bracket notation 格式）写入文件
# dot-bracket notation 格式：每条序列输出三行
#   第1行：序列名（>开头）
#   第2行：核苷酸序列
#   第3行：二级结构（点括号表示法，"."=未配对，"("/")"=配对）
RNAfold --noPS <test.fa > test.dbn
```

#### 步骤三：修复 dbn 格式并进行 BEAR 编码

```bash
# 使用 awk 处理 RNAfold 输出的 dbn 文件
# NR%3==0: 每3行中的第3行（即结构行），只打印第1列（去掉能量信息）
# 其他行直接打印
# 目的：去除 RNAfold 在结构行末尾附加的自由能数值，得到标准 dbn 格式
cat test.dbn | awk 'NR%3==0{print $1;next;}{print $0}' > test.fixed.dbn

# BearEncoder: BEAM 工具包中的编码器
# 将 dot-bracket notation 格式的二级结构编码为 BEAR 字母表序列
# 输入：test.fixed.dbn（标准 dbn 格式）
# 输出：test.bear（BEAR 编码后的序列文件）
java -jar /home/test/software/BEAM/beam-2.0/BearEncoder.new.jar test.fixed.dbn test.bear
```

#### 步骤四：运行 BEAM 进行 Structure Motif Discovery

```bash
# BEAM: 基于 BEAR 编码的 RNA 结构 motif 发现工具
# -f test.bear: 输入 BEAR 编码文件
# -w 10: motif 最小宽度为 10
# -W 40: motif 最大宽度为 40
# -M 3: 最多发现 3 个 motif
java -jar /home/test/software/beam-2.0/BEAM_release_1.5.1.jar -f test.bear -w 10 -W 40 -M 3
```

#### 步骤五：用 WebLogo 可视化 Structure Motif

```bash
# 进入 BEAM 输出的 motif 结果目录
cd risultati/test/webLogoOut/motifs

# weblogo: 生成序列 logo 图（可视化 motif 的保守性）
# -a 'ZAQXSWCDEVFRBGTNHY': 指定 BEAR 字母表（包含结构信息的扩展字母）
# -f test_m1_run1_wl.fa: 输入 FASTA 文件（第1个 motif 的比对结果）
# -o out.jpeg: 输出图片文件名
# -F jpeg: 输出格式为 JPEG
# --composition="none": 不进行背景组成校正
# -C: 为指定字母组设置颜色，格式为 -C 颜色 字母 '标签'
#   BEAR 字母表中各字母对应的 RNA 结构元件：
#   ZAQ → Stem（茎）
#   XSW → Loop（环）
#   CDE → InternalLoop（内部环）
#   VFR → StemBranch（茎分支）
#   B   → Bulge（凸起）
#   G   → BulgeBranch（凸起分支）
#   T   → Branching（分支）
#   NHY → InternalLoopBranch（内部环分支）
weblogo -a 'ZAQXSWCDEVFRBGTNHY' -f test_m1_run1_wl.fa \
-o out.jpeg -F jpeg --composition="none" \
-C red ZAQ 'Stem' -C blue XSW 'Loop' -C forestgreen CDE 'InternalLoop' \
-C orange VFR 'StemBranch' -C DarkOrange B 'Bulge' \
-C lime G 'BulgeBranch' -C purple T 'Branching' \
-C limegreen NHY 'InternalLoopBranch'
```

---

## 总结

| 分析类型 | 工具 | 输入 | 输出 |
|---------|------|------|------|
| Sequence Motif Discovery | MEME | FASTA 序列 | PWM（位置权重矩阵） |
| Sequence Motif Enrichment | AME | FASTA 序列 + 已知 motif 库 | 富集统计结果 |
| Structure Motif Discovery | BEAM | FASTA 序列 → RNAfold → BEAR 编码 | Structure motif |
| 结构可视化 | WebLogo | BEAR 编码的 motif 比对 | Sequence logo 图 |

**关键概念**：
- **PWM（Position Weight Matrix）**：描述 motif 中每个位置各碱基出现频率的矩阵
- **BEAR encoding**：将 RNA 二级结构信息编码为一维字符序列的方法
- **Dinucleotide shuffling**：保留双核苷酸频率的序列随机化，用于生成合理的对照序列
- **Motif Discovery vs Enrichment**：前者从头发现新 motif，后者检验已知 motif 是否富集
