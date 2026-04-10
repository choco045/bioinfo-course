# Week 7 Notes: 2.1 Expression Matrix（表达矩阵）

> **课程来源**: Part III. NGS Data Analyses → 2. RNA-seq → 2.1 Expression Matrix  
> **原文链接**: https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/2.rna-seq/2.1.expression-matrix  
> **主题**: 使用 featureCounts 统计基因 reads 数量，构建表达矩阵

---

## 目录

1. [章节概述](#章节概述)
2. [所需文件与环境准备](#1-所需文件与环境准备)
3. [统计 mapping 到基因上的 reads 数](#2-统计-mapping-到基因上的-reads-数)
   - [2a. 测序方法（Sequencing Protocols）](#2a-测序方法)
   - [2b. 计算 reads/counts](#2b-计算-readscounts)
   - [2c. 判断测序方法的方向性](#2c-判断测序方法的方向性)
4. [featureCounts 工具使用](#3-featurecounts-工具使用)
   - [3a. 计数（Count）](#3a-计数)
   - [3b. 生成多样本表达矩阵](#3b-生成多样本表达矩阵)
5. [重点总结](#重点总结)

---

## 章节概述

本节教学如何使用 **featureCounts** 统计落在每个基因的 exons 上的 reads 数量，以及如何将这一步的结果整理成**表达矩阵（expression matrix）**。

表达矩阵是 RNA-seq 下游分析（差异表达、聚类、可视化等）的基础输入数据，其格式为：
- **行（rows）**：基因（gene）
- **列（columns）**：样本（sample）
- **值（values）**：每个基因在每个样本中的 reads 计数（raw counts）

---

## 1) 所需文件与环境准备

### 1.1 Docker 镜像准备

本节使用专用 Docker 镜像 `bioinfo/expmat:3.0`，包含所有必要的分析软件。

```bash
# 步骤1：加载 Docker 镜像（从下载的 .tar.gz 文件导入）
# -i 参数指定输入文件路径
docker load -i bioinfo_expmat-3.0.tar.gz

# 步骤2：创建并启动 Docker 容器
# --name=bioinfo_featurecount  容器名称
# -dt                          后台运行（detached）并分配伪终端
# -h featurecount_docker       设置容器主机名
# --restart unless-stopped     除非手动停止，否则自动重启
# -v C:\...\share:/home/test/share  将本地目录挂载到容器内（数据共享）
# bioinfo/expmat:3.0           使用的镜像名称和版本
# /bin/bash                    容器启动后执行的命令
docker run --name=bioinfo_featurecount -dt -h featurecount_docker \
  --restart unless-stopped \
  -v C:\Users\usrname\Desktop\bioinfo_tsinghua_share:/home/test/share \
  bioinfo/expmat:3.0 /bin/bash

# 步骤3：进入正在运行的容器（交互式终端）
# exec -it  以交互模式执行命令
docker exec -it bioinfo_featurecount /bin/bash

# 步骤4：切换到工作目录
cd /home/test
```

### 1.2 数据文件

本节需要用到两个 `.bam` 文件（已经过比对的 RNA-seq 数据），可从课程提供的文件服务器下载：
- 文件路径：[Files needed](https://courses.ncrnalab.org/files) → **Files/** → 对应文件夹

---

## 2) 统计 mapping 到基因上的 reads 数

### 2a. 测序方法

测序方法分为两大类，影响 reads 的方向性判断：

| 类型 | 特点 | reads 方向性 |
|------|------|------------|
| **非链特异性测序**（Strand nonspecific） | reads 无方向性，无法区分正义链/反义链 | 无方向 |
| **链特异性测序**（Strand specific） | reads 有方向性，可区分来自哪条链 | 有方向（forward 或 reverse） |

**非链特异性测序**：
- reads1.fastq 和 reads2.fastq 没有方向性
- 所有 mapping 到 Gene A 区域的 reads 都归为 Gene A 的 reads
- 问题：无法区分 Gene A 和其反义链上的 Gene B

**链特异性测序**：
- reads 具有方向性，可根据 reads1.fastq 的方向分为 **forward** 和 **reverse** 两种
- 可以准确区分正义链和反义链上的基因

### 2b. 计算 reads/counts

对不同的 sequencing protocols，计算每个基因（如 Gene A）上的 mapped reads 的方法也不同：

- **非链特异性**：将所有 mapping 到基因区域的 reads 计入（不区分方向）
- **链特异性 forward**：只计入与基因同向的 reads
- **链特异性 reverse**：只计入与基因反向的 reads（即 reads1 与基因反向）

### 2c. 判断测序方法的方向性

为了准确计算每个基因的 mapped reads，需要知道测序方法的方向性，主要有以下两种途径：

**方法一：查阅资料**
- 当明确知道测序方法时，可通过经验或查阅资料得知不同测序方法的方向性

**方法二：使用 RSeQC 软件判断**
- 当数据测序方法未知时，使用 `infer_experiment.py` 命令自动判断

```bash
# 使用 RSeQC 的 infer_experiment.py 判断测序方法的链特异性
# -r  参数指定参考基因组注释文件（.bed 格式，需要12列）
# -i  参数指定输入的 BAM 文件（RNA-seq 数据比对后的结果）
cd /home/test
/usr/local/bin/infer_experiment.py \
  -r GTF/Arabidopsis_thaliana.TAIR10.34.bed \
  -i bam/Shape01.bam
```

**输出示例**：

```
Reading reference gene model GTF/Arabidopsis_thaliana.TAIR10.34.bed ... Done
Loading SAM/BAM file ...  Total 200000 usable reads were sampled

This is PairEnd Data
Fraction of reads failed to determine: 0.0231
Fraction of reads explained by "1++,1--,2+-,2-+": 0.4792
Fraction of reads explained by "1+-,1-+,2++,2--": 0.4977
```

**结果解读**：

| 比例关系 | 结论 |
|---------|------|
| `"1++,1--,2+-,2-+"` ≈ `"1+-,1-+,2++,2--"` ≈ 50% | **非链特异性**（strand nonspecific） |
| `"1++,1--,2+-,2-+"` 接近 100% | **链特异性 forward**（strand specific - forward） |
| `"1+-,1-+,2++,2--"` 接近 100% | **链特异性 reverse**（strand specific - reverse） |

> 上例中两种比例约为 48% vs 50%，几乎相同，因此判断为**非链特异性**测序数据。

---

## 3) featureCounts 工具使用

**featureCounts** 是 Subread 软件包中的一个工具，用于统计 RNA-seq 数据中每个基因上的 reads 数量。

### 3a. 计数

**featureCounts 主要参数说明**：

| 参数 | 含义 |
|------|------|
| `-s` | 链特异性设置：`0`=非链特异；`1`=forward；`2`=reverse |
| `-a` | GTF/GFF 基因组注释文件路径 |
| `-p` | 声明输入 BAM 文件来自 paired-end 测序 |
| `-F` | 指定注释文件格式（默认 GTF） |
| `-g` | 从注释文件提取 Meta-features 信息（默认 `gene_id`，对应 GTF 第9列） |
| `-t` | 从注释文件提取 feature 类型（默认 `exon`，对应 GTF 第3列，可选 `CDS` 等） |
| `-o` | 输出文件路径/前缀 |
| `-T` | 使用的线程数 |

**实际使用示例**：

```bash
# 切换到工作目录
cd /home/test

# 使用 featureCounts 统计 Shape01.bam 中每个基因的 reads 数
# -s 0        非链特异性测序（由 infer_experiment.py 判断得出）
# -p          paired-end 数据
# -t exon     以 exon 为 feature 单位进行统计
# -g gene_id  以 gene_id 为 meta-feature（即基因级别）进行汇总
# -a          指定 GTF 注释文件（拟南芥基因组注释）
# -o          指定输出文件路径
# 最后一个参数是输入的 BAM 文件
/home/software/subread-2.0.3-source/bin/featureCounts \
  -s 0 \
  -p \
  -t exon \
  -g gene_id \
  -a GTF/Arabidopsis_thaliana.TAIR10.34.gtf \
  -o result/Shape01.featurecounts.exon.txt \
  bam/Shape01.bam
```

> ⚠️ **注意 paired-end 数据的计数方式**：
> - **旧版本 featureCounts**（subread < 2.0.3）：`-p` 参数默认将一个 read pair（即一个 RNA fragment）计为 1 次
> - **新版本 featureCounts**（subread-2.0.3）：默认按 reads 数量计数，即一个 read pair 计为 **2 次**
> - 如果希望按 fragment 计数（与旧版本一致），需要额外添加 `--countReadPairs` 参数
> - 建议使用前查看帮助文档：`featureCounts -h`

**featureCounts 输出文件格式**：

```
# 输出文件的前两行为注释信息（以 # 开头）
# 数据列格式：
# 第1列：Geneid（基因 ID）
# 第2列：Chr（染色体）
# 第3列：Start（起始位置）
# 第4列：End（终止位置）
# 第5列：Strand（链方向）
# 第6列：Length（基因长度）
# 第7列：counts（该基因的 reads 计数）
```

### 3b. 生成多样本表达矩阵

实际分析中通常有多个样本，需要将各样本的 counts 合并成一个表达矩阵：

**表达矩阵格式**：
- **行**：基因（gene）
- **列**：样本（sample）
- **值**：raw counts

**R 语言合并示例**：

```r
# 读取 featureCounts 输出文件并合并成表达矩阵
# featureCounts 输出前两行为注释，第1列为 gene_id，第7列为 counts

# 读取单个样本
sample1 <- read.table("result/sample1.featurecounts.exon.txt", 
                       header=TRUE, skip=1, sep="\t")
# 提取 gene_id（第1列）和 counts（第7列）
counts_sample1 <- sample1[, c(1, 7)]
colnames(counts_sample1) <- c("gene_id", "sample1")

# 合并多个样本（以两个样本为例）
sample2 <- read.table("result/sample2.featurecounts.exon.txt",
                       header=TRUE, skip=1, sep="\t")
counts_sample2 <- sample2[, c(1, 7)]
colnames(counts_sample2) <- c("gene_id", "sample2")

# 合并成表达矩阵
expression_matrix <- merge(counts_sample1, counts_sample2, by="gene_id")
rownames(expression_matrix) <- expression_matrix$gene_id
expression_matrix <- expression_matrix[, -1]  # 去掉 gene_id 列
```

**计算 CPM（Counts Per Million）**：

```r
# 方法一：手动计算 CPM
# CPM = (某基因的 counts / 该样本总 counts) × 10^6
# t() 转置矩阵，colSums() 计算每列（每个样本）的总 counts
CPM.matrix <- t(1000000 * t(counts.matrix) / colSums(counts.matrix))

# 计算 log10 CPM（加 pseudocount=1 避免 log(0) 未定义）
log10.CPM.matrix <- log10(CPM.matrix + 1)
# 1 为 pseudocount，避免 count 为 0 时对数未定义的情况
```

```r
# 方法二：使用 edgeR 包计算 CPM（推荐）
# 如果没有安装 edgeR，可通过 BiocManager::install("edgeR") 安装
library(edgeR)

# count.matrix 行为基因，列为样本，数值为 counts
# 定义 edgeR 用于存储基因表达信息的 DGEList 对象
y <- DGEList(counts = count.matrix)

# 计算 CPM（log=F 表示不取对数，返回原始 CPM 值）
CPM.matrix <- edgeR::cpm(y, log = F)

# 计算 log10 CPM（加 pseudocount=1）
log10.CPM.matrix <- log10(CPM.matrix + 1)
# 1 为 pseudocount，避免 count 为 0 时对数未定义的情况
```

**计算 Z-score（用于热图可视化）**：

```r
# 计算每个基因在各样本中的 Z-score
# Z-score = (某样本表达量 - 该基因平均表达量) / 该基因表达量标准差
z.scores <- (log10.CPM.matrix - rowMeans(log10.CPM.matrix)) / 
             apply(log10.CPM.matrix, 1, sd)
# apply(log10.CPM.matrix, 1, sd)：
#   第一个参数：输入矩阵
#   第二个参数：1 表示按行操作（2 表示按列操作）
#   第三个参数：sd 函数，计算标准差
# rowMeans(log10.CPM.matrix) 等价于 apply(log10.CPM.matrix, 1, mean)
```

---

## 重点总结

### 🔑 核心概念

1. **表达矩阵（Expression Matrix）**：
   - 行为基因，列为样本，值为 raw counts
   - 是 RNA-seq 下游分析的基础

2. **featureCounts 关键参数**：
   - `-s` 参数必须与实际测序方法匹配（0/1/2）
   - `-p` 参数用于 paired-end 数据
   - 注意不同版本对 read pair 的计数方式不同

3. **链特异性判断**：
   - 使用 `infer_experiment.py` 自动判断
   - 两种比例接近 50:50 → 非链特异性
   - 某种比例接近 100% → 链特异性（forward 或 reverse）

4. **标准化方法**：
   - **CPM**：校正测序深度，适用于 small RNA-seq
   - **RPKM/FPKM**：校正测序深度 + 基因长度
   - **TPM**：推荐用于样本间比较（各样本 TPM 之和均为 10⁶）
   - **Z-score**：用于热图可视化，消除基因间绝对表达量差异

### 🔑 分析流程

```
BAM 文件（比对后的 RNA-seq 数据）
    ↓
判断链特异性（infer_experiment.py）
    ↓
featureCounts 统计 reads 数（-s 参数根据链特异性设置）
    ↓
合并多样本 counts → 表达矩阵
    ↓
标准化（CPM/RPKM/TPM）
    ↓
下游分析（差异表达、聚类、可视化等）
```

### 🔑 常见错误

- **`-s` 参数设置错误**：链特异性参数与实际测序方法不匹配，导致 reads 计数偏差
- **忽略版本差异**：新旧版本 featureCounts 对 paired-end 数据的计数方式不同
- **未加 pseudocount**：计算 log CPM 时忘记加 1，导致 count=0 的基因出现 `-Inf`

---

*参考资料：*
- *RSeQC 文档: http://rseqc.sourceforge.net/#download-rseqc*
- *featureCounts 帮助: `featureCounts -h`*
- *edgeR 包: https://bioconductor.org/packages/release/bioc/html/edgeR.html*
- *pheatmap 包: https://cran.r-project.org/web/packages/pheatmap/index.html*
