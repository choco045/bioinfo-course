# Week 9 学习笔记（三）：RNA 网络分析

> 来源：
> - [5.1 Co-expression Network](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/5.rna-network/co_expression)
> - [5.2 miRNA Targets](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/5.rna-network/mirna-targets)
> - [5.3 CLIP-seq (RNA-Protein Interaction)](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/5.rna-network/clip-seq)

---

# 一、5.1 Co-expression Network（共表达网络 / WGCNA）

## 0) WGCNA 简介

**WGCNA**（Weighted Gene Co-expression Network Analysis，加权基因共表达网络分析）旨在：
- 寻找**协同表达的基因模块（module）**
- 探索基因网络与**表型**之间的关联
- 找到网络中的**核心基因（hub gene）**

适用场景：推荐 ≥5 组（或 ≥15 个样品）的数据，常用于不同器官/组织类型发育调控、同一组织不同发育阶段、非生物胁迫不同时间点应答、病原菌侵染后不同时间点应答等研究。

**基本原理**：
1. 计算任意两基因间的 Pearson 相关系数
2. 对相关系数取 N 次幂（加权），使网络服从**无尺度网络分布（scale-free networks）**
   - 无尺度网络：大部分节点连接少，极少数 hub 节点连接极多，保证少数关键基因执行主要功能
3. 根据加权相关系数聚类，确定基因模块
4. 下游分析：模块功能富集、模块与性状相关性、核心基因挖掘

## 1) Pipeline

1. 计算基因间相关系数，构建基因网络
2. 将相似表达模式的基因划分为模块
3. 计算各模块与样本表型的相关性
4. 分析感兴趣模块的核心基因（hub gene，通常是转录因子等关键调控因子）
5. 提取特定模块基因，进行 GO/KEGG 富集分析

## 2) Data Structure

### 输入数据

| 文件名 | 描述 |
|--------|------|
| `input_fpkm_matrix.rds` | GSE48213 乳腺癌基因表达矩阵（前 5000 个基因，56 个细胞系） |
| `data_traits.rds` | 56 个细胞系的表型信息（gsm 编号、细胞系名称、亚型） |

> **RPKM**：Reads Per Kilobase per Million mapped reads，每百万 mapped reads 中来自某基因每千碱基长度的 reads 数，是衡量基因表达丰度的单位。

### 输出数据

| 文件名 | 描述 |
|--------|------|
| `FPKM-TOM-block.1.Rdata` | WGCNA 结果中的拓扑重叠矩阵（TOM） |
| `CytoscapeInput-edges-brown.txt` | Cytoscape 网络边信息（brown 模块） |
| `CytoscapeInput-nodes-brown.txt` | Cytoscape 网络节点信息（brown 模块） |
| `geneID_brown.txt` | 特定模块的基因 ID 列表 |

## 3) Running Steps

### 3a) 安装 R 包

```r
# 安装 Bioconductor 包管理器（R 3.5 以上版本）
if (!requireNamespace("BiocManager", quietly = TRUE))
    install.packages("BiocManager")

# 安装 AnnotationDbi 注释包（用于基因 ID 转换和注释）
BiocManager::install("AnnotationDbi")
```

### 3b) 加载 WGCNA 包

```r
# 加载 WGCNA 包（加权基因共表达网络分析核心包）
library(WGCNA)
```

### 3c) 导入数据

```r
# 设置工作目录（Win/Mac 用户需修改为本地路径）
setwd("/home/bioc")

# 读取基因表达矩阵（RDS 格式，行为样本，列为基因的 FPKM 值）
datExpr <- readRDS(file="/home/bioc/input_fpkm_matrix.rds")

# 读取样本表型信息（包含 gsm 编号、细胞系名称、乳腺癌亚型）
datTraits <- readRDS(file="/home/bioc/data_traits.rds")

# 查看表达矩阵的前4行4列（验证数据格式）
datExpr[1:4,1:4]

# 查看矩阵维度（应为 56 个样本 × 5000 个基因）
dim(datExpr)

# 查看表型数据前4行
datTraits[1:4,]
dim(datTraits)
```

### 3d) 选择软阈值（Soft Thresholding Power）

```r
# 关闭字符串自动转因子（避免数据类型问题）
options(stringsAsFactors = FALSE)

# 开启多线程加速计算（某些系统可能报错，可注释掉此行）
enableWGCNAThreads()

# 定义候选软阈值范围（1-10，再以步长2从12到20）
powers = c(c(1:10), seq(from=12, to=20, by=2))

# 计算各软阈值下的网络拓扑特征，选择最优软阈值
# powerVector：候选软阈值向量；verbose = 5：输出详细日志
sft = pickSoftThreshold(datExpr, powerVector = powers, verbose = 5)
```

```r
# 将软阈值选择结果可视化，保存为 PDF
pdf(file="/home/bioc/soft_thresholding.pdf", width=9, height=5)
par(mfrow = c(1,2))  # 设置画布为1行2列
cex1 = 0.9

# 左图：Scale-free 拓扑拟合指数（R²）随软阈值的变化
# 纵轴越大说明网络越接近无尺度网络，一般选 R² > 0.9 的最小软阈值
plot(sft$fitIndices[,1], -sign(sft$fitIndices[,3])*sft$fitIndices[,2],
     xlab="Soft Threshold (power)",
     ylab="Scale Free Topology Model Fit, signed R^2",
     type="n", main = paste("Scale independence"))
text(sft$fitIndices[,1], -sign(sft$fitIndices[,3])*sft$fitIndices[,2],
     labels=powers, cex=cex1, col="red")
abline(h=0.90, col="red")  # 红线标注 R²=0.9 的阈值

# 右图：平均连接度随软阈值的变化（软阈值越大，平均连接度越低）
plot(sft$fitIndices[,1], sft$fitIndices[,5],
     xlab="Soft Threshold (power)",
     ylab="Mean Connectivity", type="n",
     main = paste("Mean connectivity"))
text(sft$fitIndices[,1], sft$fitIndices[,5], labels=powers, cex=cex1, col="red")
dev.off()

# 查看自动估计的最优软阈值（此例为 6）
sft$powerEstimate
```

### 3e) 一步法构建网络并检测模块

```r
# blockwiseModules：一步法自动构建共表达网络并划分模块
# power：软阈值（使用上一步估计的值）
# maxBlockSize：每个计算块最多包含的基因数（受内存限制）
# TOMType = "unsigned"：无向拓扑重叠矩阵
# minModuleSize = 30：模块最小基因数
# mergeCutHeight = 0.25：合并相似模块的树高阈值（相关性>0.75的模块合并）
# numericLabels = TRUE：用数字标记模块（后续可转为颜色）
# saveTOMs = TRUE：保存拓扑重叠矩阵到文件
# saveTOMFileBase：保存TOM文件的前缀名
net = blockwiseModules(datExpr,
                 power = sft$powerEstimate,
                 maxBlockSize = 6000,
                 TOMType = "unsigned", minModuleSize = 30,
                 reassignThreshold = 0, mergeCutHeight = 0.25,
                 numericLabels = TRUE, pamRespectsDendro = FALSE,
                 saveTOMs = TRUE,
                 saveTOMFileBase = "FPKM-TOM",
                 verbose = 3)

# 查看各模块的基因数量（0 表示未归入任何模块的基因）
table(net$colors)
```

### 3f) 模块可视化

```r
# 将数字模块标签转换为颜色标签（便于可视化）
mergedColors = labels2colors(net$colors)
table(mergedColors)  # 查看各颜色模块的基因数量

# 绘制基因树状图及模块颜色条，保存为 PDF
pdf(file="/home/bioc/module_visualization.pdf", width=9, height=5)
# plotDendroAndColors：绘制聚类树和模块颜色
# net$dendrograms[[1]]：第一个计算块的聚类树
# mergedColors[net$blockGenes[[1]]]：对应的模块颜色
# dendroLabels = FALSE：不显示基因标签（基因太多）
# hang = 0.03：树枝悬挂高度
# addGuide = TRUE：添加引导线
plotDendroAndColors(net$dendrograms[[1]], mergedColors[net$blockGenes[[1]]],
                    "Module colors",
                    dendroLabels = FALSE, hang = 0.03,
                    addGuide = TRUE, guideHang = 0.05)
dev.off()
```

### 3g) 模块间相似性（特征基因相关性）

```r
# 计算各模块的特征基因（eigengene）并量化模块间相似性
moduleColors = labels2colors(net$colors)

# moduleEigengenes：计算每个模块的特征基因（第一主成分）
MEs = moduleEigengenes(datExpr, moduleColors)$eigengenes

# orderMEs：按相似性对模块特征基因排序
MET = orderMEs(MEs)

# 绘制模块特征基因网络（树状图 + 热图），保存为 PDF
pdf(file="/home/bioc/eigengenes_trait_relationship.pdf", width=7, height=9)
par(cex = 0.9)
# plotEigengeneNetworks：上半部分为特征基因树状图，下半部分为特征基因邻接热图
plotEigengeneNetworks(MET, "", marDendro=c(0,4,1,2),
                      marHeatmap=c(3,4,1,2), cex.lab=0.8, xLabelsAngle=90)
dev.off()
```

### 3h) 模块与性状关联分析

```r
# 构建设计矩阵（将乳腺癌亚型转为哑变量）
design = model.matrix(~0+ datTraits$subtype)
colnames(design) = levels(datTraits$subtype)

moduleColors = labels2colors(net$colors)
nGenes = ncol(datExpr)
nSamples = nrow(datExpr)

# 重新计算模块特征基因（使用颜色标签）
MEs0 = moduleEigengenes(datExpr, moduleColors)$eigengenes
MEs = orderMEs(MEs0)

# 计算模块特征基因与各表型之间的 Pearson 相关系数
moduleTraitCor = cor(MEs, design, use = "p")

# 计算相关系数对应的 p 值（Student t 检验）
moduleTraitPvalue = corPvalueStudent(moduleTraitCor, nSamples)

# 绘制模块-性状关联热图，保存为 PDF
pdf(file="/home/bioc/module_trait_relationship.pdf", width=9, height=10)
# 构建热图标注文本（相关系数 + p 值）
textMatrix = paste(signif(moduleTraitCor, 2), "\n(",
                   signif(moduleTraitPvalue, 1), ")", sep = "")
dim(textMatrix) = dim(moduleTraitCor)
par(mar = c(6, 8.5, 3, 3))
# labeledHeatmap：带标注的热图，颜色表示相关系数（蓝-白-红）
labeledHeatmap(Matrix = moduleTraitCor,
               xLabels = colnames(design),
               yLabels = names(MEs),
               ySymbols = names(MEs),
               colorLabels = FALSE,
               colors = blueWhiteRed(50),
               textMatrix = textMatrix,
               setStdMargins = FALSE,
               cex.text = 0.6,
               zlim = c(-1,1),
               main = paste("Module-trait relationships"))
dev.off()
```

> **结果解读**：Luminal 表型与 brown 模块相关性高达 0.86（极显著），说明 brown 模块中的基因可作为 Luminal 乳腺癌的表达 signature。

### 3i) 选择特定模块进行深入分析（以 brown 模块为例）

#### 3i.1) 模块内连接度与 hub 基因筛选

```r
# 计算所有基因的绝对相关系数矩阵，取6次幂（与软阈值一致）
connet = abs(cor(datExpr, use="p"))^6

# 计算模块内连接度（intramodular connectivity）
Alldegrees1 = intramodularConnectivity(connet, moduleColors)

# 选择 brown 模块，计算基因与 Luminal 表型的相关性（基因显著性 GS）
which.module = "brown"
Luminal = as.data.frame(design[,3])
names(Luminal) = "Luminal"
GS1 = as.numeric(cor(datExpr, Luminal, use = "p"))
GeneSignificance = abs(GS1)

# 计算所有基因与各模块特征基因的相关性（模块成员度 MM）
datKME = signedKME(datExpr, MEs, outputColumnName="MM.")

# 筛选 hub 基因：基因显著性 > 0.8 且 brown 模块成员度 > 0.8
FilterGenes = abs(GS1) > 0.8 & abs(datKME$MM.brown) > 0.8
table(FilterGenes)  # 找到 3 个 hub 基因

# 输出 hub 基因的 Ensembl ID
hubgenes <- rownames(datKME)[FilterGenes]
hubgenes
```

#### 3i.2) 导出网络到 Cytoscape

```r
# 重新计算拓扑重叠矩阵（TOM），power=6
TOM = TOMsimilarityFromExpr(datExpr, power = 6)

# 选择 brown 模块的基因
module = "brown"
probes = colnames(datExpr)
inModule = (moduleColors == module)
modProbes = probes[inModule]

# 提取 brown 模块对应的 TOM 子矩阵
modTOM = TOM[inModule, inModule]
dimnames(modTOM) = list(modProbes, modProbes)

# 导出完整 brown 模块的网络（边和节点文件）供 Cytoscape 可视化
# threshold = 0.02：只导出权重 > 0.02 的边（过滤弱连接）
cyt = exportNetworkToCytoscape(modTOM,
    edgeFile = paste("CytoscapeInput-edges-", paste(module, collapse="-"), ".txt", sep=""),
    nodeFile = paste("CytoscapeInput-nodes-", paste(module, collapse="-"), ".txt", sep=""),
    weighted = TRUE,
    threshold = 0.02,
    nodeNames = modProbes,
    nodeAttr = moduleColors[inModule])

# 筛选 top 10 连接度最高的基因，导出精简网络
nTop = 10
IMConn = softConnectivity(datExpr[, modProbes])
top = (rank(-IMConn) <= nTop)
filter = modTOM[top, top]

cyt = exportNetworkToCytoscape(filter,
    edgeFile = paste("CytoscapeInput-edges-filter-", paste(module, collapse="-"), ".txt", sep=""),
    nodeFile = paste("CytoscapeInput-nodes-filter-", paste(module, collapse="-"), ".txt", sep=""),
    weighted = TRUE,
    threshold = 0.02,
    nodeNames = rownames(filter),
    nodeAttr = moduleColors[inModule][1:nTop])
```

#### 3i.3) 提取模块基因 ID

```r
# 提取 brown 模块的所有基因 ID
module = "brown"
probes = colnames(datExpr)
inModule = (moduleColors == module)
modProbes = probes[inModule]

# 将基因 ID 列表写入文件（用于 GO/KEGG 富集分析）
# sep="\t"：制表符分隔；quote=F：不加引号；row.names=F, col.names=F：不输出行列名
write.table(modProbes, file="/home/bioc/geneID_brown.txt",
            sep="\t", quote=F, row.names=F, col.names=F)
```

```bash
# 查看输出的基因 ID 列表（Bash 命令）
head geneID_brown.txt
```

---

# 二、5.2 miRNA Targets（miRNA 靶标预测）

## 1) Background

- **miRNA**（microRNA）是约 22 nt 的单链内源非编码小 RNA，广泛存在于动物、植物、病毒中。
- 通过与靶标 mRNA 的选择性结合**抑制蛋白表达**，在发育、细胞分化、增殖、凋亡、肿瘤转移等过程中发挥关键作用。
- 确定 miRNA 靶标的方法：
  - **实验方法**：degradome sequencing、针对 AGO 蛋白的 CLIP-seq
  - **生物信息学预测**：基于序列互补性、保守性、热稳定性等特征

## 2) 数据库资源

### 2a) miRTarBase
- 网址：http://mirtarbase.cuhk.edu.cn/
- 收录超过 36 万条经实验验证的 miRNA-靶标相互作用（MTIs）
- 验证方法：reporter assay、western blot、microarray、NGS 等

### 2b) miRWalk2.0
- 网址：http://mirwalk.umm.uni-heidelberg.de/
- 收录约 9.49 亿条预测和实验验证的 miRNA-靶标相互作用

## 3) 生物信息学预测工具

miRNA 与靶标相互作用的预测特征：
- miRNA 与靶基因的互补性
- miRNA 靶位点在不同物种间的保守性
- miRNA-mRNA 双链的热稳定性
- miRNA 靶位点不会有复杂的二级结构
- miRNA 5' 端与靶基因的结合能力强于 3' 端

### 3a) 软件与数据获取

使用 Docker 容器或从课程文件服务器下载。

### 3b) miRanda

miRanda 输入两个 FASTA 文件（miRNA 序列 + mRNA 序列），输出 mRNA 上可能的 miRNA 靶标位点：

```bash
# 进入 mirna 工作目录
cd /home/test/mirna

# 运行 miRanda 预测 miRNA 靶标
# miRanda.miRNA.fa：miRNA 序列文件（FASTA 格式）
# miRanda.target_sequence.fa：目标 mRNA 序列文件（FASTA 格式）
# > miRanda.output.txt：将结果重定向输出到文件
miranda miRanda.miRNA.fa miRanda.target_sequence.fa > miRanda.output.txt
```

**输出格式说明**：

```
# 输出示例：
# Score：比对得分（越高越可能是真实靶标）
# Energy：结合自由能（kcal/mol，越负越稳定）
# Q:2 to 20：miRNA 上参与配对的位置范围
# R:3340 to 3360：mRNA 上靶位点的位置范围
# Align Len (18)：比对长度
# (83.33%)：Subject Identity（mRNA 侧互补比例）
# (94.44%)：Query Identity（miRNA 侧互补比例）
```

输出列含义：`miRNA Target Score Energy-Kcal/Mol Query-Aln(start-end) Subject-Aln(Start-End) Al-Len Subject-Identity Query-Identity`

### 3c) psRobot

psRobot 同样输入两个 FASTA 文件，适用于植物 miRNA 靶标预测：

```bash
# 运行 psRobot 预测 miRNA 靶标
# -s psRobot.miRNA.fa：miRNA 序列文件
# -t psRobot.target_sequence.fa：目标序列文件
# -o psRobot.output.txt：输出文件路径
psRobot_tar -s psRobot.miRNA.fa -t psRobot.target_sequence.fa -o psRobot.output.txt
```

> **Score（target penalty score）**：数值越低，说明是靶标的可能性越大（与 miRanda 的 Score 含义相反）。

## 4) 其他推荐工具

- **RNAhybrid**：https://bibiserv.cebitec.uni-bielefeld.de/rnahybrid/
- **TargetScan**：http://www.targetscan.org/vert_72/
- **psRNATarget**：https://www.zhaolab.org/psRNATarget/（植物专用）

---

# 三、5.3 CLIP-seq（RNA-蛋白质相互作用）

## 1) Background

- **RBP**（RNA-binding protein，RNA 结合蛋白）在 RNA 调控中发挥重要作用。
- **CLIP-seq**（CrossLinking and ImmunoPrecipitation sequencing）：用紫外光对 RBP 和 RNA 进行共价交联，用抗体富集目标 RBP，对 RBP-RNA 复合物中的 RNA 建库测序，确定 RBP 在转录组上的结合位点。
- **PAR-CLIP**（PhotoActivatable-Ribonucleoside-enhanced CLIP）：在培养基中加入 4-thiouridine（4-SU），4-SU 掺入 RNA 后，交联位点在逆转录时被识别为胞嘧啶，引入 **T→C 转变**，提供额外的结合位点信息。
- 本章使用 **CTK**（CLIP Tool Kit）处理 PAR-CLIP 数据。

## 2) Workflow

CLIP-seq 数据分析与 ChIP-seq 类似：
1. reads 预处理（去接头、质控、去重）
2. mapping 到参考基因组
3. peak calling 确定 RBP 结合位点
4. CIMS 分析（PAR-CLIP 特有，利用 T→C 转变信息）

**去重复（deduplication）策略**（CTK 的严格去重）：
- 预处理阶段：对完全相同的 reads 只保留一个（`fastx_collapser`）
- `tag2collapse.pl`：mapping 起始位置相同的 reads 也视为 duplication，只保留一个

## 3) Data Structure

### 输入

| 格式 | 描述 |
|------|------|
| `*.sam.gz` | mapping 后的比对文件（gzip 压缩的 SAM 格式） |

### 输出

| 格式 | 描述 |
|------|------|
| `*.tag.uniq.peak.sig.bed` | peak calling 后显著富集的 RBP 结合区域 |
| `*.tag.uniq.t2c.CIMS.s13.txt` | CIMS 分析后显著的 RBP 互作位点（FDR < 0.05） |

## 4) Running Steps

### 进入 Docker 容器

```bash
# 进入名为 bioinfo_tsinghua 的 Docker 容器
docker exec -it bioinfo_tsinghua bash
```

### 创建工作目录

```bash
# 进入 home 目录，创建并进入 CLIP-seq 工作目录
cd /home/test/
mkdir CLIP-seq
cd CLIP-seq
```

### 4a) 解析比对结果 & 去除 PCR 重复

```bash
# 循环处理两个样本（SRR048967 和 SRR048968）
for i in SRR048967 SRR048968
do
  echo $i
  # parseAlignment.pl：从 SAM 文件中提取 reads 位置信息和突变信息
  # -v：输出详细日志（verbose）
  # --map-qual 1：只保留 mapping quality > 1 的 reads（过滤低质量比对）
  # --min-len 18：只保留长度 >= 18 nt 的 reads（过滤过短片段）
  # --mutation-file：将突变信息（如 T->C 转变）输出到指定文件
  # 输入：gzip 压缩的 SAM 文件；输出：BED 格式的 reads 位置文件
  perl /home/test/app/ctk/parseAlignment.pl -v --map-qual 1 --min-len 18 \
    --mutation-file ${i}.mutations.txt \
    /home/test/file/input/${i}.sam.gz ${i}.tag.bed
done
```

```bash
# 去除 PCR 重复：mapping 起始位置相同的 reads 只保留一个
for i in SRR048967 SRR048968
do
  echo $i
  # tag2collapse.pl：合并起始位置相同的重复 reads
  # -v：输出详细日志
  # -big：输入文件较大，采用特定算法
  # -weight：合并时考虑每条序列的权重
  # --weight-in-name：权重信息存储在 BED 文件的 name 列
  # --keep-max-score：保留权重最高的序列（默认保留最长序列）
  # --keep-tag-name：保留原有的 read name
  perl /home/test/app/ctk/tag2collapse.pl -v -big -weight \
    --weight-in-name --keep-max-score --keep-tag-name \
    ${i}.tag.bed ${i}.tag.uniq.bed
done
```

```bash
# 从去重后的 reads 中提取对应的突变信息
for i in SRR048967 SRR048968
do
  echo $i
  # joinWrapper.py：基于 read ID（第4列）连接两个文件
  # 参数：mutations.txt  uniq.bed  列号1  列号2  连接方式  输出文件
  # N：只输出两文件第4列（read ID）匹配的行（inner join）
  python2 /home/test/app/ctk/joinWrapper.py \
    ${i}.mutations.txt ${i}.tag.uniq.bed 4 4 N \
    ${i}.tag.uniq.mutations.txt
done
```

### 4b) Peak Calling

```bash
# 通过