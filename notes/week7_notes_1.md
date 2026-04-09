# Week 7 Notes: RNA-seq and Function Analysis

> **课程来源**: 3.1 RNA-seq and Function Analysis - I & 3.1+ Strand-specific Seq  
> **主题**: NGS数据分析 — RNA-seq表达数据分析 + 链特异性测序

---

## 目录

1. [基因表达测量方法概述](#1-基因表达测量方法概述)
2. [RNA-seq文库类型](#2-rna-seq文库类型)
3. [基因表达数据库](#3-基因表达数据库)
4. [表达数据分析与标准化](#4-表达数据分析与标准化)
5. [差异表达分析与统计检验](#5-差异表达分析与统计检验)
6. [RNA-seq分析工具与流程](#6-rna-seq分析工具与流程)
7. [链特异性测序 (Strand-specific Seq)](#7-链特异性测序-strand-specific-seq)
8. [不同文库的参数设置对照表](#8-不同文库的参数设置对照表)

---

## 1. 基因表达测量方法概述

### 1.1 为什么要测量基因表达？

- **绝对丰度**：测量样本中mRNA的绝对含量
- **相对差异**：比较两个样本之间的表达差异，或在扰动（如DNA损伤、饥饿、热休克、药物处理）前后的变化

### 1.2 三种主要测量技术

| 方法 | 特点 |
|------|------|
| **RT-qPCR** | 低通量，低成本，临床金标准（如COVID-19检测），常用于验证差异表达基因 |
| **Array（芯片）** | 中高通量，基于荧光信号强度定量；可提取定性信息（P/A/M）和定量信息 |
| **RNA-seq（测序）** | 高通量，可同时测量数万个基因的表达水平 |

### 1.3 RT-qPCR 关键概念

- 定量结果为 **Ct值（Cycle threshold）**
- Ct值在样本间不可直接比较，原因包括：
  - 真实的生物学差异
  - RNA投入量偏差
  - 实验操作偏差
  - 批次效应等技术问题
- **→ 必须对Ct值进行标准化（Normalization）**

---

## 2. RNA-seq文库类型

### 2.1 标准RNA-seq文库对比

| 文库类型 | 目标RNA | 最低RNA投入量 | 纯化/rRNA去除方法 |
|----------|---------|--------------|-----------------|
| **Poly(A)+ RNA-seq** | mRNA, 多腺苷酸化lncRNA | 总RNA 100ng / 纯化RNA 10ng | Oligo-dT引物 |
| **Small RNA-seq** | 小RNA（miRNA, piRNA等） | 100ng | 大小选择（Size selection） |
| **Total RNA-seq** | 全转录组 | 100ng | Ribo-Zero Kit去除rRNA |

> **⚠️ 重点**：
> - Small RNA-seq **默认具有链信息**
> - Poly-A RNA-seq **默认没有链信息**，除非使用特殊方案（如dUTP法）

### 2.2 rRNA的丰度问题

- **酵母**：基因组中约150个rrn基因拷贝；快速指数生长期约有200,000个核糖体
- **人类**：基因组中约200个rrn基因拷贝
- → rRNA占细胞总RNA的绝大部分，测序前必须去除

### 2.3 低投入量RNA-seq（单细胞/exRNA-seq）

| 试剂盒 | 目标RNA | 最低投入量 | 方法 |
|--------|---------|-----------|------|
| SMARTer kit | PolyA RNA | 100pg | Template Switching + Oligo-dT |
| SMARTer smRNA kit | Small RNA | 1ng | 大小选择 + 加3'polyA |
| SMARTer Stranded RNA Kit | Total RNA | 100pg | rRNA去除后随机引物 |
| SMARTer Stranded RNA Kit - Pico | Total RNA | 250pg | 去除核糖体cDNA + 随机引物 |

**SMART-seq** 是目前最流行的单细胞RNA-seq方法。

---

## 3. 基因表达数据库

### 3.1 通用基因表达数据库

| 数据库 | 内容 |
|--------|------|
| **GEO (Gene Expression Omnibus)** | 最常用的基因表达数据库（NCBI） |
| Expression Atlas | 欧洲生物信息学中心基因表达数据库 |
| SMD | Stanford基因表达数据库 |
| RNA-Seq Atlas | 正常组织基因表达谱数据 |
| GXD | 小鼠发育基因表达信息 |

### 3.2 疾病相关基因表达数据库

| 数据库 | 内容 |
|--------|------|
| GENT | 肿瘤组织与正常组织的表达对比 |
| ParkDB | 帕金森病基因表达数据库 |
| cMAP | 小分子化合物对人类细胞基因表达的影响 |
| CGED | 癌症基因表达数据库（含临床信息） |

---

## 4. 表达数据分析与标准化

### 4.1 分析流程概述

```
原始数据
  ↓
预处理（Preprocessing）
  ├── qPCR数据标准化
  ├── Array数据标准化
  └── RNA-seq数据标准化
  ↓
推断统计（Inferential Statistics）
  └── t-test, Wilcoxon test, ANOVA, ...
```

### 4.2 qPCR数据标准化

**内参对照（Internal Control）**：
- 使用内源性管家基因（稳定表达），如 ACTB、GAPDH、miR-16
- 公式：**ΔCt = -(Ct(target) - Ct(reference))**

**外参对照（External Control / Spike-in）**：
- 外加已知量的人工合成RNA，如 ERCC、cel-miR-39
- 适用场景：内源基因表达不稳定，或目标基因丰度远低于内参基因时

> **注意**：GAPDH的reads数与总reads数高度相关（R=0.895），说明其可作为内参，但在某些条件下可能不稳定。

### 4.3 Array数据标准化

- **中位数标准化（Median Normalization）**：将每个样本的中位数调整到相同水平
- **分位数标准化（Quantile Normalization）**：
  - 将测试分布与参考分布对齐
  - 对多个分布：排序后取各排名位置的均值
  - 示例：
    ```
    原始数据（Gene × Sample）:
    Gene  lab_1  lab_2  lab_3
    A       5      4      3
    B       2      1      4
    C       3      4      6
    D       4      2      8
    
    排序后各排名均值:
    rank i   = (2+1+3)/3 = 2.00
    rank ii  = (3+2+4)/3 = 3.00
    rank iii = (4+4+6)/3 = 4.67
    rank iv  = (5+4+8)/3 = 5.67
    
    标准化结果:
    Gene  lab_1  lab_2  lab_3
    A     5.67   4.67   2.00
    B     2.00   2.00   3.00
    C     3.00   4.67   4.67
    D     4.67   3.00   5.67
    ```

### 4.4 RNA-seq数据标准化

RNA-seq原始reads计数需要考虑三个因素：
1. **测序深度差异**（不同样本总reads数不同）
2. **基因长度差异**（长基因比短基因获得更多reads）
3. **样本间表达差异**

#### 常用标准化方法汇总

| 方法 | 类型 | 公式 | 特点 | 适用场景 |
|------|------|------|------|---------|
| **CPM/RPM** | 通用分析 | reads数 / (总mapped reads / 10⁶) | 仅校正测序深度 | 主要用于small RNA-seq |
| **RPKM** | 通用分析 | reads数 / (总mapped reads / 10⁶) / 基因长度(Kbp) | 校正深度+基因长度 | poly-A/total RNA-seq（单端） |
| **FPKM** | 通用分析 | RPKM / 2 | 校正深度+基因长度 | 双端RNA-seq |
| **TPM** | 通用分析 | RPKM / Σ(RPKM) × 10⁶ | 校正深度+基因长度，样本间可比 | 推荐用于表达量比较 |
| **TMM** | 差异表达分析 | Craw(g) × Cj⁻¹，Cj = 2^TMM | 校正测序深度 | edgeR |
| **RLE** | 差异表达分析 | Craw(g) × Cj⁻¹ | 校正测序深度 | DESeq2 |

#### RPKM/TPM 公式详解

```
# RPKM（Reads Per Kilobase per Million mapped reads）
RPKM = (某基因的mapped reads数) / (总mapped reads数 / 10⁶) / (基因长度 / 1000)

# TPM（Transcript Per Million）
TPM = RPKM / Σ(所有基因的RPKM) × 10⁶
# TPM的优势：所有样本的TPM之和均为10⁶，样本间可直接比较

# CPM/RPM（Counts Per Million）
CPM = (某基因的mapped reads数) / (总mapped reads数 / 10⁶)

# FPKM（Fragment Per Kilobase per Million）
FPKM = RPKM / 2  # 用于双端测序，每个fragment产生两条reads
```

#### TMM标准化（edgeR使用）

**TMM = Trimmed Mean of M-values（M值的截尾均值）**

步骤：
1. 计算每个基因的M值（log2倍数变化）和A值（平均表达量）
2. 截去M值上下各30%，A值上下各5%，得到代表性基因集G
3. 对G中每个基因计算加权M值
4. TMM = Σ(w(g) × M(g)) / Σ(w(g))
5. 标准化：Craw(g) / 2^TMM

```
# M值和A值定义
M = log2(处理样本count / 对照样本count)
A = (log2(处理样本count) + log2(对照样本count)) / 2
```

#### RLE标准化（DESeq2使用）

**RLE = Relative Log Expression（相对对数表达）**

步骤：
1. 计算每个基因在所有样本中raw counts的几何均值
2. 每个基因的counts除以其几何均值
3. 取每个样本中所有比值的中位数作为标准化因子Cj
4. 标准化：Craw(g) / Cj

---

## 5. 差异表达分析与统计检验

### 5.1 统计检验方法选择

| 比较场景 | 参数检验 | 非参数检验 |
|---------|---------|----------|
| 两组非配对 | Unpaired t-test | Mann-Whitney test |
| 两组配对 | Paired t-test | Wilcoxon test |
| 三组及以上非配对 | One-way ANOVA | Kruskal-Wallis test |
| 三组及以上配对 | Repeated-measures ANOVA | Friedman test |

### 5.2 火山图（Volcano Plot）

- X轴：log fold change（处理/对照）
- Y轴：-log10(p value)
- 同时展示**p值**和**倍数变化**两个维度

### 5.3 多重检验校正

> **问题**：当同时检验成千上万个基因时，p < 0.05的阈值会产生大量假阳性

**解决方案**：将p值转换为q值（adjusted p value）

**Bonferroni校正**（最保守）：
```
# 若检验10,000个基因
q = p × 10,000
# 等价于：q < 0.05 ⟺ p < 5 × 10⁻⁶
```

**FDR（False Discovery Rate）**：
- 比Bonferroni校正更宽松，更常用
- 控制假阳性在所有显著结果中的比例

---

## 6. RNA-seq分析工具与流程

### 6.1 常用工具分类

```
# 原始数据质控与预处理
Fastx toolkit    # FASTQ文件质控和过滤
Samtools         # SAM/BAM文件处理
BEDTools         # 基因组区间操作
HTSeq            # reads计数

# 短reads比对
Bowtie           # 快速短reads比对（不支持剪接）
TopHat           # 基于Bowtie的RNA-seq比对（支持剪接）
STAR             # 高速RNA-seq比对工具（推荐）
BWA              # DNA-seq比对（也可用于RNA-seq）
Novoalign        # 高精度比对

# 表达量分析
DESeq2           # 差异表达分析（基于负二项分布）
edgeR            # 差异表达分析（基于负二项分布）
Cufflinks        # 转录本组装和表达量估计
RSEQtools        # RNA-seq分析工具集

# 可变剪接分析
rMATS            # 检测可变剪接事件
MISO             # 可变剪接定量
Augustus         # 基因预测
```

### 6.2 RNA-seq分析流程

```
原始FASTQ文件
    ↓ 质控（FastQC, Fastx toolkit）
    ↓ 去接头、过滤低质量reads（Trimmomatic, Cutadapt）
    ↓ 比对到参考基因组（STAR, HISAT2, TopHat）
    ↓ 生成BAM文件（Samtools排序、索引）
    ↓ reads计数（HTSeq-count, featureCounts）
    ↓ 标准化（DESeq2/edgeR内置）
    ↓ 差异表达分析（DESeq2, edgeR）
    ↓ 功能富集分析（GO, KEGG）
```

### 6.3 推荐参考文献

- Manuel Garber et al., *Nature Methods*, 2011 — RNA-seq分析综述
- A survey of best practices for RNA-seq data analysis, *Genome Biology*, 2016

---

## 7. 链特异性测序 (Strand-specific Seq)

### 7.1 为什么需要链特异性测序？

**问题**：标准RNA-seq文库制备过程中会丢失链信息（sense/antisense）

**应用场景**：
1. 准确鉴定具有潜在调控功能的**反义转录本（antisense transcripts）**
2. 发现**没有注释的新基因**
3. 当两个基因重叠时，准确区分reads来自哪条链

### 7.2 非链特异性文库制备（标准方法）

```
RNA
 ↓ 逆转录（Reverse transcription）→ 1st cDNA
 ↓ 第二链合成（2nd cDNA synthesis）
 ↓ 末端加A（Add A at 3' end）
 ↓ 接头连接（Adapter ligation）→ 双链DNA两端加接头
 ↓ PCR扩增

结果：
- reads1.fastq: Adapter1 + 2nd cDNA序列（可能是sense或antisense）
- reads2.fastq: Adapter2 + 1st cDNA序列（可能是sense或antisense）
# 问题：无法区分reads来自哪条链！
```

### 7.3 链特异性文库制备方法一：连接法（Ligation Method）

```
RNA
 ↓ 3'端接头连接（3' adapter ligation）
 ↓ 5'端接头连接（5' adapter ligation）
 ↓ 逆转录（Reverse transcription）
 ↓ PCR扩增

结果（以GeneA为例，基因在+链）：
- reads1.fastq: Adapter1 + 2nd cDNA序列 → sense（正义链）
- reads2.fastq: Adapter2 + 1st cDNA序列 → antisense（反义链）

链信息推断规则：
  read1 mapped to '+' strand → 亲本基因在 '+' strand
  read2 mapped to '-' strand → 亲本基因在 '+' strand
  read1 mapped to '-' strand → 亲本基因在 '-' strand
  read2 mapped to '+' strand → 亲本基因在 '-' strand
```

### 7.4 链特异性文库制备方法二：dUTP法

```
RNA
 ↓ 逆转录 → 1st cDNA
 ↓ 用dUTP合成2nd cDNA（dUTP替代dTTP）
 ↓ Y形接头连接
 ↓ UNG酶降解含dUTP的2nd cDNA链
 ↓ 大小选择 + PCR扩增

结果（以GeneA为例，基因在+链）：
- reads1.fastq: Adapter1 + 1st cDNA序列 → antisense（反义链）
- reads2.fastq: Adapter2 + 1st cDNA序列 → sense（正义链）

链信息推断规则：
  read1 mapped to '-' strand → 亲本基因在 '+' strand
  read2 mapped to '+' strand → 亲本基因在 '+' strand
  read1 mapped to '+' strand → 亲本基因在 '-' strand
  read2 mapped to '-' strand → 亲本基因在 '-' strand
```

### 7.5 两种方法对比

| 特征 | 连接法（Ligation） | dUTP法 |
|------|------------------|--------|
| reads1 | sense（正义链） | antisense（反义链） |
| reads2 | antisense（反义链） | sense（正义链） |
| featureCounts参数 | `-s 1` | `-s 2` |
| 代表试剂盒 | Directional illumina, Standard SOLiD | TruSeq Stranded, NEB Ultra Directional |

### 7.6 featureCounts reads计数示例

```bash
# 案例：计算GeneA的raw counts
# 假设GeneA在+链，有3条reads在+链，1条reads在-链（来自antisense）

# 标准Illumina（非链特异性）
featureCounts -s 0 ...
# Gene A raw counts = (3+1) + (3+1) = 8  # 两端reads都计入

# 连接法（Ligation method）
featureCounts -s 1 ...
# Gene A raw counts = 3 + 3 = 6  # 只计sense链reads

# dUTP法或PICO法
featureCounts -s 2 ...
# Gene A raw counts = 1 + 1 = 2  # 只计antisense链reads（对应sense基因）
```

### 7.7 如何判断文库的链特异性？

**使用 RSeQC 工具中的 infer_experiment.py**：

```bash
# 安装RSeQC
pip install RSeQC

# 使用infer_experiment.py推断链特异性
# 步骤：
# 1. 先用Bowtie2将RNA-seq reads按非链特异性方式比对到参考基因组
# 2. 将比对结果与参考注释比较，推断链特异性

infer_experiment.py -r reference.bed -i input.bam

# 结果解读：
# 非链特异性：两种解释的比例接近 50:50
# 链特异性（连接法）：reads1与基因同链的比例接近100%
# 链特异性（dUTP法）：reads2与基因同链的比例接近100%
```

---

## 8. 不同文库的参数设置对照表

| 文库制备方法 | reads信息 | Cufflinks/TopHat | HISAT2 | RSeQC | HTSeq | featureCounts |
|------------|---------|-----------------|--------|-------|-------|--------------|
| **Standard Illumina**（非链特异性） | 非特异 | `--library-type fr-unstranded` | 不需要 | - | `--no` | `-s 0` |
| **Directional Illumina（连接法）** | reads1: sense | `--library-type fr-secondstrand` | `--rna-strandedness FR` | `++,--` | `--yes` | `-s 1` |
| **dUTP法**（TruSeq Stranded等） | reads1: antisense | `--library-type fr-firststrand` | `--rna-strandedness RF` | `+-,-+` | `--reverse` | `-s 2` |

### 常用试剂盒对应关系

**连接法（-s 1）**：
- Directional illumina (Ligation)
- Standard SOLiD
- ScriptSeq v2 RNA-Seq Library Preparation Kit
- Encore Complete RNA-Seq Library Systems
- NuGEN SoLo

**dUTP法（-s 2）**：
- TruSeq Stranded Total RNA Sample Prep Kit
- TruSeq Stranded mRNA Sample Prep Kit
- NEB Ultra Directional RNA Library Prep Kit
- SMARTer Stranded Total RNA (pico) V2
- Agilent SureSelect Strand-Specific
- All dUTP methods、NSR、NNSR

---

## 重点总结

### 🔑 关键概念

1. **RNA-seq文库类型**：Poly-A、Small RNA、Total RNA各有适用场景
2. **标准化方法选择**：
   - 一般分析用 TPM（样本间可比）
   - 差异表达分析用 TMM（edgeR）或 RLE（DESeq2）
3. **多重检验校正**：大规模测试必须进行FDR校正，避免假阳性
4. **链特异性**：连接法和dUTP法产生相反的链信息，分析时参数设置不同

### 🔑 常见错误

- 混淆RPKM和TPM：TPM更适合样本间比较
- 忘记多重检验校正：直接用p < 0.05会产生大量假阳性
- 不知道文库链特异性：导致featureCounts参数设置错误，reads计数偏差

### 🔑 工具选择建议

```
比对：STAR（速度快，准确率高）
计数：featureCounts（注意-s参数）
差异表达：DESeq2（小样本）或 edgeR（灵活）
链特异性判断：RSeQC infer_experiment.py
```

---

*参考文献：*
- *Joshua Z Levin et al., Nature Methods, 2010*
- *Manuel Garber et al., Nature Methods, 2011*
- *Robinson et al., Genome Biology, 2010*
- *Christoph Ziegenhain et al., Molecular Cell, 2017*
- *A survey of best practices for RNA-seq data analysis, Genome Biology, 2016*
