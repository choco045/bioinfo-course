# Week 8 Notes: Function Analysis — GO & KEGG Enrichment Analysis

> 来源：[3.1.GO](https://book.ncrnalab.org/teaching/part-ii.-basic-analyses/3.function-analysis/3.1.go) 和 [3.2.KEGG](https://book.ncrnalab.org/teaching/part-ii.-basic-analyses/3.function-analysis/3.2.kegg)

---

# 3.1 GO (Gene Ontology) 富集分析

## 1) Pipeline（分析流程）

GO 富集分析的基本流程：

1. 准备一组感兴趣的基因列表（如差异表达基因）
2. 前往 [Gene Ontology 官网](http://geneontology.org/) 进行在线分析
3. 输入基因 ID（Ensembl Gene ID 格式）
4. 选择参考物种（如 Homo sapiens）
5. 查看富集结果，筛选 FDR < 0.05 的显著 GO terms

---

## 2) Data Structure（数据结构）

参考文件获取方式下载 `GO_gene.txt` 文件，内容为一组人类基因的 Ensembl ID。

### 2a) Inputs（输入文件）

| 属性 | 说明 |
|------|------|
| **File format** | `.txt` 纯文本格式 |
| **Information** | Gene Ensembl ID（基因编码 ID） |
| **File description** | 文件包含待分析的基因 Ensembl ID 列表 |
| **Notes** | 每行一个 ID |

**示例输入文件内容（GO_gene.txt）：**

```
# 以下为待分析的人类基因 Ensembl ID 列表
# 每行一个基因 ID，共 51 个基因
ENSG00000001036
ENSG00000003756
ENSG00000008018
ENSG00000012048
ENSG00000043355
ENSG00000074755
ENSG00000079616
ENSG00000089280
ENSG00000100591
ENSG00000100941
ENSG00000101109
ENSG00000101974
ENSG00000104611
ENSG00000104738
ENSG00000105738
ENSG00000113318
ENSG00000114867
ENSG00000116221
ENSG00000116857
ENSG00000117724
ENSG00000119285
ENSG00000121774
ENSG00000127663
ENSG00000127884
ENSG00000128159
ENSG00000129187
ENSG00000130640
ENSG00000131473
ENSG00000134287
ENSG00000134644
ENSG00000136628
ENSG00000137273
ENSG00000146263
ENSG00000153187
ENSG00000160285
ENSG00000164818
ENSG00000164944
ENSG00000167325
ENSG00000167548
ENSG00000170448
ENSG00000179632
ENSG00000183207
ENSG00000187954
ENSG00000196700
ENSG00000196924
ENSG00000198604
ENSG00000198886
ENSG00000198899
ENSG00000206503
ENSG00000223609
ENSG00000272822
```

### 2b) Outputs（输出文件）

| 属性 | 说明 |
|------|------|
| **File format** | `.txt` 纯文本格式 |
| **Information** | 每个基因的 Gene Ontology 注释信息 |
| **File description** | 包含 GO term 富集分析结果 |
| **Notes** | 包含 GO term、P value、FDR 等统计信息 |

---

## 3) Running Steps（操作步骤）

### 3a) 输入基因名称

1. 打开 [http://geneontology.org/](http://geneontology.org/)
2. 在主页找到 "Gene/product search" 或 "Analyze your genes" 入口
3. 将 `GO_gene.txt` 中的基因 Ensembl ID 粘贴到输入框中
4. 选择物种为 **Homo sapiens**
5. 点击提交（Launch analysis）

### 3b) 查看 ID 映射结果

提交后，系统会显示 ID 映射情况：

| 类别 | Reference list | User upload |
|------|---------------|-------------|
| Mapped IDs | 21042 out of 21042 | 50 out of 50 |
| Unmapped IDs | 0 | 1 |
| Multiple mapping | 0 | 0 |

> **说明：** 参考基因组中共有 21042 个基因，用户上传的 51 个基因中有 50 个成功映射，1 个未能识别。

### 3c) 查看富集结果

系统只展示 **FDR < 0.05** 的显著富集 GO terms。

**示例结果表格：**

| GO term | Reference | Input number | expected | Fold Enrichment | +/- | raw P value | FDR |
|---------|-----------|--------------|----------|-----------------|-----|-------------|-----|
| DNA replication | 208 | 6 | 0.49 | 12.14 | + | 1.11E-05 | 1.25E-02 |

**各列含义解释：**

- **GO term**：基因本体论术语，描述基因的生物学功能
- **Reference**：参考基因组中被注释到该 GO term 的基因总数（此处 208 个基因注释为 DNA replication）
- **Input number**：用户上传基因中被注释到该 GO term 的基因数（此处 6 个）
- **expected**：期望值，即随机情况下预期有多少基因落入该 GO term
  - 计算公式：`expected = K × n / N = 208 × 50 / 21042 ≈ 0.4942`
- **Fold Enrichment**：富集倍数，实际观测值与期望值之比
  - 计算公式：`Fold Enrichment = k / expected = 6 / 0.4942 ≈ 12.14`
- **+/-**：`+` 表示富集（observed > expected），`-` 表示缺失（observed < expected）
- **raw P value**：原始 P 值，使用超几何分布（Hypergeometric test）计算
- **FDR**：假发现率（False Discovery Rate），对多重检验进行校正后的 P 值

**P value 计算原理（超几何分布）：**

$$P = \sum_{i=k}^{n} \frac{\binom{K}{i}\binom{N-K}{n-i}}{\binom{N}{n}}$$

其中：
- **N**：参考基因组中所有被 GO 注释的基因总数（此处 N = 21042）
- **n**：用户上传基因中成功映射到背景的基因数（此处 n = 50）
- **K**：参考基因组中被注释到某一 GO term 的基因数（此处 K = 208）
- **k**：用户上传基因中被注释到该 GO term 的基因数（此处 k = 6）

---

## 4) Tips/Utilities（其他工具）

其他常用的富集分析工具：

**网页工具：**
- [Metascape](https://metascape.org/) — 综合型富集分析平台，支持多物种
- [gProfiler](https://biit.cs.ut.ee/gprofiler/) — 支持 GO、KEGG、Reactome 等多种数据库
- [DAVID](https://david.ncifcrf.gov/) — 经典富集分析工具（3.2.KEGG 章节基于此实现）

**R 包：**
- [clusterProfiler](https://bioconductor.org/packages/release/bioc/html/clusterProfiler.html) — 功能强大的 R 富集分析包，支持 GO、KEGG 等

---

## 5) Homework（作业）

1. 从 `wt.light.vs.dark.all.txt`（差异表达分析一节获得的野生型结果）中选取显著上调的（FDR < 0.05, logFC > 1）的基因进行 GO 分析。
2. 请问上面的例子中，Fold Enrichment 和 P value 是如何计算的？请写出公式，并解释原理。此外，在定义显著富集的 GO terms 时为什么一般不是参考 P value 的大小，而是要计算一个 FDR 来作为参考？

---

---

# 3.2 KEGG (Kyoto Encyclopedia of Genes and Genomes) 富集分析

## 1) Pipeline（分析流程）

> **核心要点：** KEGG 富集分析和 GO 富集分析使用的**统计方法完全一致**（均基于超几何分布），二者的主要差异在于所使用的**基因集注释数据库不同**：
> - GO 分析：使用 Gene Ontology 数据库（分子功能、生物过程、细胞组分三个层次）
> - KEGG 分析：使用 KEGG Pathway 数据库（代谢通路、信号通路等）

KEGG 富集分析基本流程：

1. 准备基因 ID 列表（Ensembl Gene ID 格式）
2. 前往 [DAVID](https://david.ncifcrf.gov/) 在线工具
3. 粘贴基因 ID，选择 ID 类型和物种
4. 提交分析，查看 KEGG Pathway 富集结果

---

## 2) Data Structure（数据结构）

### 2a) 获取软件与数据

- 访问 [DAVID](https://david.ncifcrf.gov/) 在线分析平台
- 参考文件获取方式下载 `KEGG_gene.txt` 文件，内容包含人类基因的 Ensembl Gene ID

**示例输入文件内容（KEGG_gene.txt）：**

```
# 以下为待进行 KEGG 富集分析的人类基因 Ensembl ID 列表
# 与 GO 分析使用相同的基因集
ENSG00000001036
ENSG00000003756
ENSG00000008018
ENSG00000012048
ENSG00000043355
ENSG00000074755
ENSG00000079616
ENSG00000089280
ENSG00000100591
ENSG00000100941
ENSG00000101109
ENSG00000101974
ENSG00000104611
ENSG00000104738
ENSG00000105738
ENSG00000113318
ENSG00000114867
ENSG00000116221
ENSG00000116857
ENSG00000117724
ENSG00000119285
ENSG00000121774
ENSG00000127663
ENSG00000127884
ENSG00000128159
ENSG00000129187
ENSG00000130640
ENSG00000131473
ENSG00000134287
ENSG00000134644
ENSG00000136628
ENSG00000137273
ENSG00000146263
ENSG00000153187
ENSG00000160285
ENSG00000164818
ENSG00000164944
ENSG00000167325
ENSG00000167548
ENSG00000170448
ENSG00000179632
ENSG00000183207
ENSG00000187954
ENSG00000196700
ENSG00000196924
ENSG00000198604
ENSG00000198886
ENSG00000198899
ENSG00000206503
ENSG00000223609
ENSG00000272822
```

### 2b) Input（输入文件）

| 属性 | 说明 |
|------|------|
| **File format** | `.txt` 纯文本格式 |
| **Information** | Ensembl Gene ID（如 Homo sapiens ENSG00000001036） |
| **File description** | 包含待分析基因的 Ensembl Gene ID 列表 |

### 2c) Output（输出文件）

| 属性 | 说明 |
|------|------|
| **File format** | `.txt` 纯文本格式 |
| **Information** | 每个基因的 KEGG 通路注释及富集结果 |
| **File description** | 包含 KEGG Pathway 富集分析的统计结果 |

---

## 3) Running Steps（操作步骤）

在 DAVID 平台上进行 KEGG 富集分析的具体步骤：

```bash
# 步骤 1：访问 DAVID 网站
# 打开浏览器，前往 https://david.ncifcrf.gov/

# 步骤 2：粘贴基因 ID
# 将 KEGG_gene.txt 中的基因 Ensembl ID 粘贴到 "Enter Gene List" 文本框中

# 步骤 3：选择 ID 类型
# 在 "Select Identifier" 下拉菜单中选择 "ENSEMBL_GENE_ID"

# 步骤 4：选择列表类型
# 在 "List Type" 中选择 "Gene List"（基因列表，非背景列表）

# 步骤 5：提交分析
# 点击 "Submit List" 按钮提交

# 步骤 6：查看 KEGG 结果
# 在结果页面中，点击 "Functional Annotation Chart" 或 "Functional Annotation Clustering"
# 筛选 KEGG_PATHWAY 类别查看通路富集结果
```

**操作说明：**

1. **粘贴基因 ID**：将上文中的基因 ID 粘贴到文本框中
2. **选择 ID 类型**：选择 `ENSEMBL_GENE_ID`（因为我们使用的是 Ensembl 格式的基因 ID）
3. **选择列表类型**：选择 `Gene List`（表示这是待分析的基因列表，而非背景基因集）
4. **提交**：点击 `Submit List` 提交分析

**结果解读：**

KEGG 富集结果（图2）展示了基因集在各 KEGG Pathway 中的富集情况，包括：
- **Pathway**：KEGG 通路名称（如 Cell cycle、DNA replication 等）
- **Count**：用户基因中注释到该通路的基因数
- **%**：占用户基因总数的百分比
- **P-value**：超几何检验的原始 P 值
- **Benjamini**：Benjamini-Hochberg 方法校正后的 FDR

---

## 4) GO vs KEGG 比较

| 比较维度 | GO 分析 | KEGG 分析 |
|---------|---------|----------|
| **数据库** | Gene Ontology | KEGG Pathway |
| **注释层次** | 分子功能(MF)、生物过程(BP)、细胞组分(CC) | 代谢通路、信号通路、疾病通路 |
| **统计方法** | 超几何分布检验 | 超几何分布检验（相同） |
| **结果侧重** | 基因功能的分类描述 | 基因参与的具体生物学通路 |
| **工具** | geneontology.org | DAVID、KEGG 官网 |
| **优势** | 覆盖广，层次丰富 | 通路图直观，机制清晰 |

---

## 5) Homework（作业）

- 请用 KEGG enrichment 分析上一章（GO enrichment analysis）中的基因集，比较两章的结果，总结两种方法得到的生物学意义有哪些异同。

---

## 关键概念总结

| 概念 | 说明 |
|------|------|
| **GO** | Gene Ontology，基因本体论，描述基因功能的标准化词汇体系 |
| **KEGG** | Kyoto Encyclopedia of Genes and Genomes，京都基因与基因组百科全书 |
| **富集分析** | 判断某基因集是否在特定功能类别中显著富集的统计方法 |
| **超几何分布** | 富集分析使用的统计模型，类似于不放回抽样问题 |
| **FDR** | False Discovery Rate，假发现率，多重检验校正方法 |
| **Fold Enrichment** | 富集倍数 = 观测值 / 期望值，衡量富集程度 |
| **P value** | 原始 P 值，未经多重检验校正 |
| **Benjamini-Hochberg** | 常用的 FDR 校正方法 |
