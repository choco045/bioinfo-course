# 2.3 Differential Expression with DESeq2 & edgeR

> 📖 原文链接：https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/2.rna-seq/2.3.differential_expression_with_deseq2-edger

本节使用 **DESeq2** 和 **edgeR** 完成差异表达（Differential Expression）分析。

> ⚠️ 注意：本章需要读者具有 R 的编程基础。

---

## 1) Getting Software & Data

本章不需要 Docker，可以直接在自己的计算机上安装以下 R 包，并下载相应文件。

### 软件依赖

- 在基因差异表达分析中，**DESeq2** 和 **edgeR** 是两个最常用的 R package。
- 这两个 package 使用的统计模型非常相似，都是用**基于负二项分布的广义线性模型**直接对 counts 类型的数据建模，来计算统计显著性。
- 这两个 package 都 host 在 Bioconductor 上，可以通过 `BiocManager::install` 来安装：

```r
# 如果未安装 BiocManager，可使用 install.packages("BiocManager") 安装
# BiocManager 是 Bioconductor 包的管理工具，类似 CRAN 的 install.packages
BiocManager::install("DESeq2")   # 安装 DESeq2 包
BiocManager::install("edgeR")    # 安装 edgeR 包
```

### 数据

`count_exon.txt`（可从课程文件服务器下载）是**拟南芥野生型（WT）与 uvr8 突变型（uvr8\*）在光照前后的基因表达矩阵**：

| 列范围 | 含义 |
|--------|------|
| 第 1 列 | 基因名称 |
| 第 2–4 列 | WT 光照前（dark）的表达值，3 个生物学重复 |
| 第 5–7 列 | WT 光照后（light）的表达值，3 个生物学重复 |
| 第 8–10 列 | *uvr8* 光照前的表达值 |
| 第 11–13 列 | *uvr8* 光照后的表达值 |

> 在本例中，我们考虑**野生型在光照前后基因表达量的变化**，所以只用到前 7 列的数据。

---

## 2) DESeq2

DESeq2 是目前最广泛使用的 RNA-seq 差异表达分析工具之一，基于负二项分布对 count 数据建模。

### 2a) 准备输入数据

> 💡 **Tips**：由于 DESeq2 和 edgeR 都是用负二项分布直接对 counts 建模，**输入矩阵需为原始的 count 矩阵**，而不应该是 CPM/FPKM/TPM 一类的标准化数值。

```r
# 读取原始 count 矩阵
# sep='\t' 表示制表符分隔，header=T 表示第一行为列名，row.names=1 表示第一列为行名（基因名）
raw.counts <- read.table("count_exon.txt", sep='\t', header = T, row.names = 1)

# 我们这里只使用野生型数据进行分析
# CD1_1/CD1_2/CD1_3 为 WT 光照后（Treatment），CD0_1/CD0_2/CD0_3 为 WT 光照前（Control）
wt.raw.counts <- raw.counts[, c("CD1_1", "CD1_2", "CD1_3", "CD0_1", "CD0_2", "CD0_3")]

# 过滤掉表达量过低的基因（行均值 <= 5 的基因被去除）
# 低表达基因统计功效低，过滤可减少多重检验负担
wt.filtered.counts <- wt.raw.counts[rowMeans(wt.raw.counts) > 5, ]
```

### 2b) 提供样本条件信息

这里我们用一个叫做 `colData` 的数据框来存储样本信息。每行对应一个样本，我们只考虑一种条件（是否光照），所以数据框只有一列。

```r
# 定义样本分组条件
# "CD1_1", "CD1_2", "CD1_3" 三个样本为 Control（光照前/dark）
# "CD0_1", "CD0_2", "CD0_3" 三个样本对应 Treatment（光照后/light）
# factor() 将字符向量转为因子，levels 参数指定参考水平（Control 为基准）
conditions <- factor(c(rep("Control", 3), rep("Treatment", 3)),
                     levels = c("Control", "Treatment"))

# 创建 colData 数据框，行名为样本名，列为条件信息
# DESeq2 要求 colData 的行名与 count 矩阵的列名一致
colData <- data.frame(row.names = colnames(wt.filtered.counts),
                      conditions = conditions)
```

### 2c) 差异分析

```r
# 加载 DESeq2 包
# suppressPackageStartupMessages() 可以抑制加载时的提示信息
library(DESeq2)
# 我们到这里才开始使用 DESeq2 package
# library(DESeq2) 会输出一长串的提示信息，如果不需要可使用：
# suppressPackageStartupMessages(library(DESeq2))

# 创建 DESeqDataSet 对象
# wt.filtered.counts: count 矩阵
# colData: 样本信息数据框
# design = ~conditions: 指定实验设计公式，表示我们要比较 conditions 这个因子的不同水平
dds <- DESeqDataSetFromMatrix(wt.filtered.counts, colData, design = ~conditions)

# 进行差异分析（核心步骤）
# DESeq() 内部依次调用了三个函数：
#   1. estimateSizeFactors()  - 估计 library size 归一化因子
#   2. estimateDispersions()  - 估计负二项分布的离散度参数
#   3. nbinomWaldTest()       - 用 Wald 检验计算差异显著性
dds <- DESeq(dds)

# 获取差异分析结果
# results() 默认比较最后一个因子水平 vs 第一个因子水平（Treatment vs Control）
res <- results(dds)
```

**`DESeq()` 内部三步详解：**

| 函数 | 作用 |
|------|------|
| `estimateSizeFactors` | 对 library size 的大小进行估计，作为模型的一个系数（归一化） |
| `estimateDispersions` | 对负二项分布模型进行参数估计（离散度） |
| `nbinomWaldTest` | 用 Wald test 检验两个条件之间差异的显著性（广义线性模型中对应系数不为 0 的显著性） |

### 2d) 保存结果

```r
# 如果你想保存所有基因的结果（包括不显著的），可以直接写出
write.table(res, "wt.light.vs.dark.all.txt", sep='\t', row.names = T, quote = F)

# 你也可以筛选出有差异的基因
# 过滤标准：padj < 0.05（校正后 p 值），且 |log2FoldChange| > 1（即倍数变化 > 2 倍）
diff.table <- subset(res, padj < 0.05 & abs(log2FoldChange) > 1)

# 将筛选后的差异基因结果保存至文件
write.table(diff.table, "wt.light.vs.dark.txt", sep='\t', row.names = T, quote = F)
```

**输出结果各列含义：**

| 列名 | 含义 |
|------|------|
| `baseMean` | 所有样本的平均表达量 |
| `log2FoldChange` | Treatment 相对于 Control 的 log₂ 倍数变化 |
| `lfcSE` | 估计出的 log2FoldChange 的标准差 |
| `stat` | 假设检验用到的统计量（Wald statistic） |
| `pvalue` | 原始 p 值 |
| `padj` | 经过多重检验校正（Benjamini-Hochberg）后的 p 值（即 FDR） |

> 我们一般会根据 `log2FoldChange` 和 `padj` 两列信息对基因进行筛选，并进行下游的通路富集等分析。

---

## 3) edgeR

edgeR 同样基于负二项分布对 count 数据建模，提供了多种检验方法，适用于更复杂的实验设计。

### 3a) 准备输入数据

```r
# 读取表达矩阵（与 DESeq2 步骤相同）
# 如果你之前已经读取了表达矩阵，就不用重复这步操作了
raw.counts <- read.table("count_exon.txt", sep='\t', header = T, row.names = 1)

# 只使用野生型数据
wt.raw.counts <- raw.counts[, c("CD1_1", "CD1_2", "CD1_3", "CD0_1", "CD0_2", "CD0_3")]

# 过滤低表达基因（行均值 <= 5 的基因被去除）
wt.filtered.counts <- wt.raw.counts[rowMeans(wt.raw.counts) > 5, ]
```

### 3b) 提供样本条件信息

```r
# 定义样本分组条件（与 DESeq2 相同）
conditions <- factor(c(rep("Control", 3), rep("Treatment", 3)),
                     levels = c("Control", "Treatment"))

# 获取 design 矩阵
# model.matrix() 根据实验设计公式生成设计矩阵
# ~conditions 会生成一个截距列和一个 conditionsTreatment 列
# 第二列（conditionsTreatment）表示 Treatment vs Control 的对比
design <- model.matrix(~conditions)
```

### 3c) 差异分析

edgeR 对差异分析提供了三种检验方法：

| 方法 | 适用场景 |
|------|----------|
| **Exact test** | 仅适用于两组样本的简单比较 |
| **Likelihood ratio test (LRT)** | 适用于更复杂的实验设计（本例使用） |
| **Quasi-likelihood GLM** | 适用于更复杂的实验设计，对离散度估计更保守 |

```r
library(edgeR)  # 至此我们开始用到 edgeR package

# 创建 DGEList 对象，edgeR 用于存储基因表达信息的核心数据结构
y <- DGEList(counts = wt.filtered.counts)

# TMM 标准化（Trimmed Mean of M-values）
# TMM 是 edgeR 的默认标准化方法，用于校正不同样本间 library size 的差异
# method="TMM" 实际上是默认参数，可以省略
y <- calcNormFactors(y, method = "TMM")

# 估计 dispersion（离散度）
# estimateDisp() 内部依次调用了三个函数：
# y <- estimateGLMCommonDisp(y, design = design)   # 估计所有基因共享的离散度
# y <- estimateGLMTrendedDisp(y, design = design)  # 估计随表达量变化的趋势离散度
# y <- estimateGLMTagwiseDisp(y, design = design)  # 估计每个基因特有的离散度
y <- estimateDisp(y, design = design)

# 拟合广义线性模型（GLM）
# glmFit() 对每个基因拟合一个负二项分布的广义线性模型
fit <- glmFit(y, design = design)

# 似然比检验（Likelihood Ratio Test）
# coef = 2 指的是对 design 矩阵的第二列（即是否照光，conditionsTreatment）对应的系数进行检验
# 即检验 Treatment 效应是否显著不为 0
lrt <- glmLRT(fit, coef = 2)
```

> 💡 **另一种做法**：用 `design <- model.matrix(~0+conditions)` 定义 design matrix，再用 `lrt <- glmLRT(fit, contrast=c(-1,1))` 进行检验，结果应当是相同的。

### 3d) 选取差异显著的基因

```r
# topTags() 返回差异分析结果表格
# 这里 tag 就是基因的意思，topTags 意思是返回变化最显著的基因
# 默认返回 10 个基因，按 p 值排序
# 这里我们用 n = nrow(y) 要求它返回所有基因的结果
diff.table <- topTags(lrt, n = nrow(y))$table

# 保存差异分析结果（所有基因）
write.table(diff.table, file = 'edger.wt.light.vs.dark.txt',
            sep = "\t", quote = F, row.names = T, col.names = T)

# 当然你也可以只挑选显著变化的基因
# 筛选标准：|log2FC| > 1 且 FDR < 0.05
diff.table.filtered <- diff.table[abs(diff.table$logFC) > 1 & diff.table$FDR < 0.05, ]
```

**`topTags` 返回结果各列含义：**

| 列名 | 含义 |
|------|------|
| `logFC` | 相对 Control 的 log₂ fold change |
| `logCPM` | 平均表达量（log₂ CPM） |
| `LR` | 似然比统计量（Likelihood Ratio statistic） |
| `PValue` | 原始 p 值 |
| `FDR` | 经过多重检验校正（Benjamini-Hochberg）后的 p 值 |

---

## 4) DESeq2 vs edgeR 对比

| 特性 | DESeq2 | edgeR |
|------|--------|-------|
| 统计模型 | 负二项分布 GLM | 负二项分布 GLM |
| 归一化方法 | Median of Ratios | TMM |
| 离散度估计 | 基因特异性（借助先验收缩） | 基因特异性（empirical Bayes） |
| 检验方法 | Wald test / LRT | Exact test / LRT / QL-GLM |
| 适用场景 | 两组及多组比较 | 两组及多组比较 |
| 结果 FDR 列名 | `padj` | `FDR` |
| 结果 FC 列名 | `log2FoldChange` | `logFC` |

---

## 5) References

- **DESeq2 文档**：https://bioconductor.org/packages/release/bioc/vignettes/DESeq2/inst/doc/DESeq2.html
- **edgeR 用户手册**：https://www.bioconductor.org/packages/release/bioc/vignettes/edgeR/inst/doc/edgeRUsersGuide.pdf
- 学生分享的 GitHub 页面：[用 edgeR 寻找差异基因](https://yj-mo.github.io/2020/10/26/Team/#%E7%94%A8edger%E5%AF%BB%E6%89%BE%E5%B7%AE%E5%BC%82%E5%9F%BA%E5%9B%A0)

---

## 6) Homework（作业题目）

1. 什么是 Multiple test correction？并解释 q value（很多时候也叫 FDR）和 p value 的差别。
2. 请结合上课时所讲的知识阐述 DESeq2 和 edgeR 中如何对数据进行 normalization，列出并解释具体的公式。
3. 利用以上介绍的方法和数据，分别使用 DESeq2 和 edgeR 找出 uvr8 突变型（uvr8\*）在光照前后的差异基因，保存为文本文件。
4. 对于 uvr8 突变型的差异基因，定义 |log2FC| > 1，FDR < 0.05 的基因为差异表达基因。比较两个软件得到的差异基因有多少是重合的，有多少是不同的，用 Venn 图的形式展示。
5. 对于 edgeR 找出的 FDR < 0.05 的基因，选出 log2FoldChange 最大的 10 个基因和最小的 10 个基因。计算原始表达量矩阵的 log10CPM 值并对每个基因进行 Z-score 处理，使用筛选出来的 20 个基因绘制热图（heatmap）作为最后结果输出。
