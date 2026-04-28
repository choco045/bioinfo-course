# 3. ChIP-seq 学习笔记

> 来源：[Bioinformatics Tutorial - 3.ChIP-seq](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/3.chip-seq)

---

## 概述

- **ChIP-seq**（Chromatin Immunoprecipitation Sequencing，染色质免疫共沉淀测序）是一种分析蛋白质与 DNA 相互作用的高通量实验技术。
  - 常用于确定特定**转录因子**的结合位点，以及特定**组蛋白修饰**在基因组上的分布。
  - 是研究基因调控的重要手段。
  - 用抗体钓出DNA片段 $\rightarrow$ 把片段拼回基因组 $\rightarrow$ 和对照组比较 $\rightarrow$ 用算法寻找数据中的“山峰” $\rightarrow$ 最终定位蛋白质结合的具体位置和它喜欢的密码。
- ChIP-seq 实验通常包含两组样本：
  - **IP 组**：用特定抗体对感兴趣的蛋白/表观修饰进行富集。
  - **Input 组**（对照）：不做富集，代表基因组背景。
- 数据分析核心目标：通过比较 IP 组与 Input 组，推断基因组中哪些位置是感兴趣的结合位点。
- 富集区域在 reads coverage 上体现为**尖峰（peak）**，从背景中识别 peak 的过程称为 **peak calling**。
- Peak 类型：
  - **Narrow peaks**：转录因子结合区域，较短且尖锐。
  - **Broad peaks**：组蛋白修饰区域，较宽。
- 转录因子结合具有**序列偏好性**，可用 **motif** 描述。
- 本节主要工具：[HOMER](http://homer.ucsd.edu/homer/)，辅助介绍 [MACS](https://github.com/macs3-project/MACS) 和 R 包 [ChIPseeker](https://bioconductor.org/packages/release/bioc/html/ChIPseeker.html)。

---

## 1) Pipeline（分析流程）

ChIP-seq 分析从 mapping 之后的 `.bam` 文件开始（mapping 步骤参见 [1.mapping 章节](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/1.mapping)）。

主要流程：
1. 准备 BAM 文件（IP 组 + Input 组）
2. Peak Calling（找峰）
3. Motif Analysis（基序分析）
4. 可视化（ChIPseeker）

---

## 2) Data Structure（数据结构）

### 2a) 软件与数据获取

- 本流程全部使用 HOMER 工具完成。
- 数据来源：[GSE61210](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE61210)（酵母 SNF2 转录调控因子 ChIP-seq）
  - Input 样本：[GSM1499619](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=gsm1499619) → `input.bam`
  - IP 样本：[GSM1499607](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=gsm1499607) → `ip.bam`

**方法1：使用 Docker（推荐）**

Docker 镜像中已准备好所需文件，`.bam` 文件位于 `/home/test/chip-seq/input`。

**方法2：自行下载安装**

1. 安装 [HOMER](http://homer.ucsd.edu/homer/)
2. 从课程文件服务器下载数据

### 2b) 输入文件

| 格式 | 描述 |
|------|------|
| `.bam` | ChIP-seq reads 比对到参考基因组后的比对文件 |

### 2c) 输出文件

#### 主要输出

| 步骤 | 文件格式 | 描述 |
|------|----------|------|
| Peak calling | peak file | 每行包含一个 peak 的信息 |
| Motif analysis | `homerResults.html` | de novo motif 结果（HTML 格式） |

#### Peak 文件各列含义

| 列号 | 字段名 | 描述 |
|------|--------|------|
| 1 | PeakID | 每个 peak 的唯一标识符 |
| 2 | chr | peak 所在染色体 |
| 3 | start | peak 起始位置 |
| 4 | end | peak 终止位置 |
| 5 | Strand | 链方向（+/-） |
| 6 | Normalized Tag Counts | 标准化到 1000 万 mapped reads 的 tag 数 |
| 7 | Focus Ratio | peak 中心上下游 tag 的比例 |
| 8 | Peak Score | 初始 peak 区域的位置调整 reads 数 |
| 9 | Total Tags | peak 处的 tag 总数 |
| 10 | Control Tags | 标准化到 IP 实验的 input tag 数 |
| 11 | Fold Change vs Control | IP 与 input 的标准化 tag 数之比（≥4 倍为显著） |
| 12 | p-value vs Control | 泊松分布检验 p 值（阈值 0.0001） |
| 13 | Fold Change vs Local | peak 与周围 10 kb 区域的 tag 密度之比（≥4 倍） |
| 14 | p-value vs Local | 局部比较的泊松 p 值（阈值 0.0001） |
| 15 | Clonal Fold Change | 克隆扩增折叠变化（默认阈值 2，过高可能为重复序列） |

#### Motif 分析输出文件

| 文件名 | 描述 |
|--------|------|
| `homerMotifs.all.motifs` | 所有 de novo motif 的合并文件 |
| `motifFindingParameters.txt` | 运行 `findMotifsGenome.pl` 的命令记录 |
| `knownResults.txt` | 已知 motif 富集统计（可用 Excel 打开） |
| `seq.autonorm.tsv` | 低阶 oligo 标准化统计 |
| `homerResults.html` | de novo motif 发现的 HTML 结果 |
| `knownResults.html` | 已知 motif 发现的 HTML 结果 |
| `knownResults/` | 已知 motif 结果的相关文件目录 |

---

## 3) Running Steps（运行步骤）

### 进入 Docker 容器

```bash
# 在宿主机终端中运行，进入名为 bioinfo_tsinghua 的 Docker 容器
docker exec -it bioinfo_tsinghua bash
```

### 切换到工作目录

```bash
# 进入 chip-seq 分析的工作目录
cd /home/test/chip-seq/
```

### 创建输出目录

```bash
# 创建用于存放分析结果的 output 目录
mkdir output
```

---

### 3a) Peak Calling（峰值识别）

#### 第一步：生成 Tag Directory（中间文件）

```bash
# 为 IP 样本生成 tag directory（HOMER 分析所需的中间文件格式）
# 参数1：输出目录路径 input/ip
# 参数2：输入的 BAM 文件 input/ip.part.bam
makeTagDirectory input/ip    input/ip.part.bam

# 为 Input（对照）样本生成 tag directory
# 参数1：输出目录路径 input/input
# 参数2：输入的 BAM 文件 input/input.part.bam
makeTagDirectory input/input input/input.part.bam
```

> **说明**："tag" 在 ChIP-seq 中即指二代测序的 read，是 HOMER 工具的习惯叫法。  
  在 ChIP-seq 和二代测序的语境下，“tag” 其实就是指测序得到的 “read”（短序列片段）。  
  测序仪把目标 DNA 打碎后读取出来的无数个短小 DNA 片段（也就是通常说的 reads），在被 HOMER 这个软件处理时，就被统一换了个名字叫 tag。  
  把这些小片段（reads/tags）重新贴回完整的基因组地图上，如果某个位置贴上去的片段特别多，堆成了一座山峰（peak），软件就会去统计这里的 "Total Tags"。所以这里的“总 tag 数”，其实指的就是“到底有多少个 DNA 碎片在这个特定的位置堆积了起来”。  
  中间文件的作用： makeTagDirectory，其实就是把装满 reads 的 BAM 文件，转换并整理成 HOMER 喜欢的数据格式，方便它后续去数到底有多少个 tag 堆成了山峰。
> 运行后，`input/ip` 和 `input/input` 目录中会生成多个 `.tags.tsv` 文件和 `tagInfo.txt`（记录测序总 tag 数等信息，供后续步骤使用）。

#### 第二步：Peak Calling

```bash
# 使用 findPeaks 命令进行 peak calling
# input/ip/       ：IP 样本的 tag directory（第一个位置参数）
# -style factor   ：peak 类型为转录因子（factor），另一选项为 histone（组蛋白修饰）
# -o output/part.peak ：输出 peak 文件的路径
# -i input/input/ ：Input（对照）样本的 tag directory
findPeaks input/ip/ -style factor -o output/part.peak -i input/input/
```

> **参数说明**：
> - `-style factor`：适用于转录因子 ChIP-seq，产生 narrow peaks；`-style histone` 适用于组蛋白修饰，产生 broad peaks。
> - `-o`：输出文件路径。
> - `-i`：Input 对照样本的 tag directory 路径。

---

### 3b) Motif Analysis（基序分析）

```bash
# 使用 findMotifsGenome.pl 进行 motif 发现
# output/part.peak  ：peak calling 的结果文件（输入）
# sacCer2           ：参考基因组名称（酵母 sacCer2）
# output/part.motif.output ：motif 分析结果的输出目录
# -len 8            ：指定 motif 长度为 8 bp（可用逗号分隔多个长度，如 -len 8,10,12）
findMotifsGenome.pl output/part.peak sacCer2 output/part.motif.output -len 8
```

> **重要参数说明**：
> - `-len <#>`：motif 长度，默认为 8,10,12，可设置多个值用逗号分隔。
> - `-size <#>`（默认 200）：用于 motif 发现的区域大小。
>   - 转录因子：50 bp（主要 motif）或 200 bp（主要 + 协同 motif）
>   - 组蛋白修饰：500–1000 bp
> - `-S <#>`（默认 25）：每个长度要发现的 motif 数量。

最重要的输出文件：`/home/test/chip-seq/output/part.motif.output/homerResults.html`

---

## 4) Tips/Utilities（补充工具）

### 4a) 从 FASTQ 文件准备 BAM 文件

#### （1）下载数据并建立 Bowtie 索引

```bash
# 下载酵母 sacCer2 参考基因组（压缩的 tar.gz 格式）
wget http://hgdownload.soe.ucsc.edu/goldenPath/sacCer2/bigZips/chromFa.tar.gz

# 解压缩，得到各染色体的 .fa 文件
tar -xvf chromfa.tar.gz

# 将所有染色体的 fasta 文件合并为一个文件
cat *.fa > yeast.allchrom.fa

# 创建存放 bowtie 索引的目录
mkdir bowtie_index_yeast

# 使用 bowtie-build 构建参考基因组索引
# 参数1：合并后的参考基因组 fasta 文件
# 参数2：索引文件的前缀路径（生成 sacCer2.*.ebwt 系列文件）
bowtie-build yeast.allchrom.fa bowtie_index_yeast/sacCer2
```

#### （2）Mapping（序列比对）

```bash
# 使用 bowtie 将 IP 样本的 fastq 文件比对到参考基因组
# -p 4        ：使用 4 个线程并行运算
# -m 1        ：只保留唯一比对的 reads（多处比对的丢弃）
# -v 3        ：允许最多 3 个错配
# --best      ：报告最优比对结果
# --strata    ：只报告最优层次的比对
# bowtie_index_yeast/sacCer2 ：参考基因组索引前缀
# -q input/ip.fastq ：输入的 fastq 文件（-q 表示 fastq 格式）
# -S input/ip.sam   ：输出 SAM 格式文件
bowtie -p 4  -m 1  -v 3  --best --strata bowtie_index_yeast/sacCer2 -q input/ip.fastq -S input/ip.sam

# 使用 samtools sort 对 SAM 文件排序并转换为 BAM 格式
samtools sort input/ip.sam > input/ip.sorted.bam

# 为排序后的 BAM 文件建立索引（生成 .bai 文件，加速随机访问）
samtools index input/ip.sorted.bam
```

#### （3）Sampling（抽样，降低计算量）

```bash
# 只提取 chrI、chrII、chrIII 三条染色体的比对记录，用于学习练习
# -b ：输出 BAM 格式
# chrI chrII chrIII ：指定要提取的染色体名称
samtools view input/ip.sorted.bam chrI chrII chrIII -b > input/ip.part.bam
```

---

### 4b) Peak Calling using MACS

[MACS](https://github.com/macs3-project/MACS) 是 ChIP-seq 数据分析的另一常用工具（Docker 中已安装 MACS2）。

```bash
# 使用 MACS2 进行 peak calling
# -t input/ip.part.bam        ：IP 实验（treatment）的 BAM 文件
# -c input/input.part.bam     ：Input（control）的 BAM 文件
# --outdir output/macs_peak   ：输出目录
# --name=yeast_macs_p05       ：输出文件前缀名
# --format=BAM                ：输入文件格式为 BAM
# --gsize=1.2e7               ：有效基因组大小（酵母约 1.2×10^7 bp）
# --tsize=50                  ：测序 read 长度（50 bp）
# --pvalue=1e-5               ：显著性 p 值阈值
macs2 callpeak -t input/ip.part.bam -c input/input.part.bam --outdir output/macs_peak \
    --name=yeast_macs_p05 --format=BAM --gsize=1.2e7 --tsize=50 --pvalue=1e-5
```

输出文件 `yeast_macs_p05_peaks.xls`（实为文本文件）各列含义：

| 列 | 含义 |
|----|------|
| chromosome name | 染色体名 |
| start position | peak 起始位置（1-based） |
| end position | peak 终止位置（1-based） |
| length | peak 区域长度 |
| absolute peak summit position | peak 顶点的绝对位置 |
| pileup height at peak summit | peak 顶点的堆叠高度 |
| -log10(pvalue) | peak 顶点的 p 值（-log10 转换） |
| fold enrichment | 相对于泊松分布的富集倍数 |
| -log10(qvalue) | peak 顶点的 q 值（-log10 转换） |

---

### 4c) Visualize Peaks with ChIPseeker

[ChIPseeker](https://bioconductor.org/packages/release/bioc/html/ChIPseeker.html) 是国人开发的 R 包，用于 ChIP-seq peaks 的注释和可视化。

```r
# 加载所需 R 包
library("ChIPseeker")       # ChIP-seq peaks 注释和可视化
library("GenomicFeatures")  # 基因组特征处理
library("org.Sc.sgd.db")    # 酵母基因组注释数据库

# 从 UCSC 下载酵母 sacCer2 基因组的基因注释，构建 TxDb 对象
# genome：基因组版本名称
# tablename：UCSC 数据库中的表名（ensGene 为 Ensembl 基因模型）
# 注意：此步骤可能需要较长时间
txdb <- makeTxDbFromUCSC(genome ="sacCer2", tablename = "ensGene") 

# 读取 MACS2 生成的 peak 文件（narrowPeak 格式）
yeast <- readPeakFile("yeast_macs_p05_peaks.narrowPeak")

# 定义启动子区域：TSS 上下游各 3000 nt
# TxDb：基因组注释对象
# upstream/downstream：相对于 TSS 的上下游范围（单位：nt）
promoter <- getPromoters(TxDb = txdb, upstream = 3000, downstream = 3000)

# 计算 peaks 在启动子区域的 tag 矩阵
# peak：peak 文件对象
# windows：定义的窗口区域（此处为启动子区域）
tagMatrix <- getTagMatrix(peak = yeast, windows = promoter)

# 绘制 tag heatmap
# 每行对应一个转录本，每列对应相对 TSS 的位置，颜色表示 peak 数量
tagHeatmap(tagMatrix = tagMatrix, xlim = c(-3000, 3000), color = "red")

# 绘制 peaks 相对于 TSS 的平均 coverage profile
# conf = 0.95：95% 置信区间
# resample = 1000：bootstrap 重采样次数
plotAvgProf(tagMatrix, xlim = c(-3000, 3000), conf = 0.95, resample = 1000,
            xlab = "Genomic Region (5'->3')", ylab = "Read Count Frequency")
```

> **输出说明**：
> - `tagHeatmap`：热图，每行为一个转录本，颜色表示 peak 在该位置的数量。
> - `plotAvgProf`：平均 profile 图，展示所有转录本中 peaks 相对于 TSS 的总体分布趋势。

---

## 5) Homework（作业题目）

1. 请解释在 ChIP-seq 实验中为什么一般都要平行做一个 control（通常叫 input）的实验。
2. 请解释 `findPeaks` 和 `findMotifsGenome.pl` 主要参数的含义。
3. 使用 homer 对酵母 Snf1 蛋白 ChIP-seq 数据（`/home/test/chip-seq/homework`）进行 peak calling 和 motif finding 分析，提交 motif 截图及 `Fold Change (vs Control) >= 8` 且 `p-value (vs Control) < 10^-8` 的 peaks。

---

## 6) 延伸阅读

- [ChIP-seq analysis 资源汇总](https://github.com/crazyhottommy/ChIP-seq-analysis)：收集了大量 ChIP-seq 分析的参考资源，推荐阅读。

---

*笔记整理自 [Bioinformatics Tutorial](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/3.chip-seq)*
