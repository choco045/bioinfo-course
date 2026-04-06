# NGS Data: DNA-seq and Genomic Features

## 1. 基因组基本特征 (Basic Genome Features)

### 基因组大小与复杂性
* **C-value paradox (C值悖论)**：基因组的大小并不一定与生物体的复杂程度成正比。例如，一些单细胞生物的基因组远大于人类的基因组。
* **人类基因组大小**：约 3.2 Gbp (3,280,481,986 Base Pairs)。
* **基因数量**：曾经预估人类有超过3.5万个基因，目前注释显示人类约有 **21,000** 个蛋白质编码基因（与线虫数量接近，"Why Do Humans Have So Few Genes?" 是一个重要的生物学问题）。

### GC含量 (GC Content) 与 等容体 (Isochores)
* 哺乳动物基因组是等容体（isochores）的马赛克。**基因更集中在富含GC的区域**。
* **Isochore**：是指DNA中较长的一段区域（通常大于300 KB），其G-C和C-G的含量具有高度一致性。在全基因组水平上具有异质性，但在isochore内部GC含量较均匀。
* 人类基因组平均GC含量约为41%。

### 基因组的组成内容 (Content of Human Genome)
只有极小部分（约3%）编码蛋白质，大部分被曾认为是"垃圾DNA"的区域实际上具有重要功能。
* **Coding regions (蛋白质编码区)**: ~3%
* **Introns (内含子)**: ~42%
* **Repeats and Transposons (重复序列与转座子)**: ~34%
* **Regulatory Elements (调控元件)**: ~10%
* **Others (其他)**: ~11%
* *ENCODE计划发现，人类基因组中有74.7%的区域可以被转录 (Pervasive transcribed regions)。*

---

## 2. 非编码 RNA (Noncoding RNAs)

根据中心法则，DNA转录出mRNA，进而翻译出蛋白质。除此之外，还会转录出大量具有功能的非编码RNA (ncRNA)。
* **Canonical ncRNAs (经典ncRNA)**: rRNA, tRNA, snRNA, snoRNA, srp RNA.
* **Small ncRNAs (小ncRNA)**: miRNA (~0.01% of genome), piRNA, siRNA.
* **Long ncRNAs (lncRNAs, 长链非编码RNA)**: MALAT1, HOTAIR 等 (GENCODE 注释了约 20,000 个 lncRNA 基因座)。
* *非编码区变异在疾病关联 (如 GWAS 发现的 SNPs) 中占了很大比例 (88%)。*

---

## 3. 常见基因组注释文件格式

### GFF / GTF 格式
基于 1-based (起始位置从1开始计算) 的闭区间。
包含9列主要信息：
1. `seqname`: 染色体名称
2. `source`: 注释来源
3. `feature`: 特征类型 (如 gene, exon, CDS)
4. `start`: 起始坐标 (从1开始)
5. `end`: 终止坐标 (包含该位置)
6. `score`: 得分
7. `strand`: 正负链 (+ / -)
8. `frame`: 读码框 (0, 1, 2)
9. `attribute`: 附加属性 (如 gene_id, transcript_id)

### BED 格式
基于 0-based (起始位置从0开始计算) 的前闭后开区间。
前3列为必须：
1. `chrom`: 染色体名字
2. `chromStart`: 起始位置 (从0开始)
3. `chromEnd`: 终止位置 (不包含该位置)

**示例代码：计算外显子长度**
```bash
# 对于 GTF/GFF 文件 (1-based, 闭区间)
# 长度 = 终止位置 - 起始位置 + 1
awk 'BEGIN{OFS="\t"}{print $5-$4+1}' hg38.ACTB.exon.gff

# 对于 BED 文件 (0-based, 前闭后开区间)
# 长度 = 终止位置 - 起始位置
awk 'BEGIN{OFS="\t"}{print $3-$2}' hg38.ACTB.exon.bed
```

---

## 4. 基因组序列变异 (Genome Sequence Variance)

人类与人类之间的基因组相似度高达 99.9%，但剩下的 0.1% (约 0.5% DNA sequence 差异) 导致了个体差异。
* **SNP (Single Nucleotide Polymorphism)**: 单核苷酸多态性。
* **INDEL (Insertion & Deletion)**: 较小的插入与缺失。
* **CNV (Copy Number Variation)**: 拷贝数变异，常由片段重复 (Segmental duplication) 引起。
* **SV (Structural Variation)**: 结构变异 (包括大的缺失、重复、插入和倒位)。

### GWAS 与 LD
* **GWAS (Genome-wide association studies)**: 全基因组关联分析，寻找与特定性状/疾病相关的 SNP。
* **LD (Linkage Disequilibrium, 连锁不平衡)**: 在群体遗传学中，两个或多个基因座上的等位基因非随机结合的现象。它反映了不同等位基因在群体中以高于随机组合频率共同出现的倾向。
* *Genetic linkage (遗传连锁)*: 位于同一染色体上的等位基因倾向于在减数分裂中一起遗传，但会受重组影响。LD不仅与遗传连锁有关，还与群体历史等因素有关。