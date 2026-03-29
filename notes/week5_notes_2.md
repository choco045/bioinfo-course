# NGS (Next-generation Sequencing) 学习笔记

**课件中紫色的部分要重点看一下**

## 1. 什么是 NGS？

* NGS 是 Next-generation Sequencing（下一代测序技术）的缩写。
* NGS 通常特指第二代测序技术（2nd gen. sequencing）。
* 这与依赖链终止法（Chain-termination methods）的第一代测序技术（如 Sanger 测序）有着显著区别。
* 随着技术发展，目前也出现了第三代测序技术（3rd generation），例如 Pacific Biosciences 的单分子实时测序（Single Molecule Real-time）和 Oxford 的纳米孔测序（Nanopore）。

## 2. 为什么使用 NGS？

* 之前的sanger测序：设置 A、T、C、G 四个反应管，各含相同模板、引物、dNTP 和 DNA 聚合酶，分别加入一种放射性标记的ddNTP；DNA 聚合酶从引物开始合成新链，随机掺入 ddNTP 导致链终止，生成不同长度的片段混合物；通过变性聚丙烯酰胺凝胶电泳（PAGE）分离四组反应产物，按片段长度从短到长排列，仅相差一个碱基的片段可被清晰分开；将凝胶曝光于 X 光片，根据条带位置读取 DNA 序列。
* 现代自动化测序（毛细管电泳法）：四种 ddNTP 分别标记不同荧光染料，在同一反应管中进行；使用细毛细管替代凝胶，提高分离效率和速度，短片段先通过检测器；激光激发荧光染料，检测器记录信号，计算机自动转换为 DNA 序列数据。
* **超高通量**：NGS 采用了大规模平行测序（Massively parallel sequencing）的原理。
* **产出巨大**：与早期的凝胶系统或毛细管测序相比，NGS 使得单台机器每天产出的 DNA 序列碱基数量（Kilobases per day per machine）呈指数级增长。
* **成本效益与深度**：在应用靶向测序（Targeted Sequencing）时，NGS 能够有效降低测序成本。
* **提高覆盖度**：靶向测序技术可以针对特定区域获取更深的覆盖度（greater depth of coverage）。
* **简化分析**：由于避免了将读取量“浪费”在非目标区域，NGS 的靶向测序可以大大简化下游的生物信息学分析工作。

## 3. 怎么开始使用 NGS（核心技术与流程）？

目前主流的 NGS 平台包括 Illumina 和 MGI（华大智造）。以最常见的 Illumina 平台为例，其标准的工作流程主要包含两大步骤：

### 步骤一：文库构建（Library Preparation / 建库）
* 首先需要对双链 DNA（dsDNA）进行片段化处理（Fragmentation）。
* 随后进行末端修复和加 A 尾操作（End repair and A-tailing / Adenylation）。
* 接下来是连接接头（Ligation of adaptors/linkers）。
* 接头（Adapter）中包含了用于结合 Flow-cell 的序列，以及用于区分不同样本的 Index（标签）。
* 最后通过 PCR 扩增（PCR amplification）完成建库。

### 步骤二：上机测序（Sequencing on a machine）
* 将带有接头的 DNA 片段附着到流动槽（Attach to flowcell）上。
* 通过结合引物（Bind to primer）并进行桥式扩增（Bridge Amplification），形成大量的 DNA 簇（Cluster formation）。（簇生成就是每个DNA片段被扩增的过程，为了增强信号。）
* 测序过程采用边合成边测序（Sequencing by synthesis）技术，向流动槽中加入带有荧光标记的可逆终止子（labeled reversible terminators）、引物和 DNA 聚合酶。
* 通过激光激发并进行信号扫描（Signal scanning），系统会逐个循环记录每个 Cluster 中碱基的荧光信号，从而确定序列。
* NGS 支持单端读取，也支持双端测序（Paired-End Reads），即从 DNA 片段的两端分别进行读取（Read 1 和 Read 2）。
* 测序产生的原始数据通常以 FASTQ 格式保存。

## 4. 怎么实际应用 NGS？

NGS 的应用范围极其广泛，主要可以分为以下几个方向与分析流程：

### 主要应用领域
* **基础组学研究**：包括 DNA 测序（DNA-seq）、RNA 测序（RNA-seq）以及表观遗传学研究（Epigenetics）。
* **表观遗传与互作**：例如研究 DNA 甲基化（Methylation），或者使用 ChIP-seq 研究组蛋白修饰（Histone modifications）和蛋白质-DNA 的相互作用。
* **靶向测序应用（Targeted Sequencing）**：常用于癌症基因 Panel 筛查、抗生素耐药性研究、细菌鉴定以及药物基因组学（Pharmacogenomics）。
    * 靶向测序主要分为杂交捕获（Hybrid capture）和扩增子测序（Amplicon sequencing）两种技术路线。
    * 杂交捕获适用于较大的 NGS Panel（>100kb），且具有更好的检测均一性（Assay uniformity）。
    * 扩增子测序在小 Panel 中具有极高的中靶率（On-target rate），但在大型 Panel 中容易出现非特异性 PCR 背景噪音。
* **外显子组测序（Exome Sequencing）**：这也是一种重要的靶向测序方法，专门捕获和测序全部外显子区域。
    * 外显子包含了合成蛋白质所需的重要信息。
    * 该技术常用于寻找癌症、糖尿病、肥胖症等复杂疾病的致病基因和易感基因。

### 标准生物信息学分析流程
一旦获得了 NGS 下机数据，通常需要经过以下分析步骤：
* **1. 质量控制（Quality Control）**：通常使用 FastQC 软件对数据进行质控。
    * FastQC 可以生成报告，展示诸如每个碱基的测序质量（Per base sequence quality）、GC 含量（GC content）以及序列长度分布等关键指标。
* **2. 序列比对（Reads mapping）**：将短序列比对到参考基因组上。常用的软件如 Bowtie，它是一个超快且节省内存的短序列比对工具。
* **3. 突变鉴定（Mutations Identification）**：在比对后，分析生殖系突变（Germinal mutation）或体细胞突变（Somatic mutation）。
    * 寻找的变异类型包括单核苷酸多态性（SNP）、插入与缺失（INDEL）、拷贝数变异（CNV）和结构变异（SV）。
* **4. 数据可视化（Visualization）**：比对和突变结果可以通过 IGV（Integrative Genomics Viewer）等高性能可视化工具进行查看。
    * IGV 支持交互式地探索大型、综合的基因组数据集。
