# Basic Analyses

## 第一部分：序列比对与 BLAST 算法核心原理

### 1. 序列比对的生物学意义与基本原则
* **核心目的**：序列相似性（Similarity）通常意味着共享的进化历史（Homology，同源性），并暗示它们具有相似的蛋白质结构（约>30%序列一致性即可推断）和相似的生物学功能。保守的序列区域（如酶活性位点、底物结合位点）通常具有保守的功能。
* **蛋白质比对优于 DNA 比对的原因**：
    * 蛋白质序列包含 20 种氨基酸，而 DNA 只有 4 种碱基，因此蛋白质序列包含的信息量更大。
    * 许多氨基酸具有相似的生物物理特性，更容易反映进化上的保守替换。
    * 由于密码子的简并性（Degenerate codons），DNA 密码子第三个碱基的突变通常不会改变其编码的氨基酸，因此直接比对 DNA 可能会引入“同义突变”的噪音。

### 2. 评分系统 (Scoring Scheme)
序列比对的得分反映了相似程度，计算公式为：**比对得分 = 匹配得分 - 错配罚分 - 空位罚分** 。
* **替换矩阵 (Substitution Matrices)**：不同氨基酸之间的替换率不同。算法使用经验评分矩阵（例如人类-小鼠比对中使用的 PAM250 矩阵）来量化这种替换的概率。
* **空位罚分模型 (Gap Penalties)**：空位代表序列进化中的插入或缺失事件。通常采用**仿射空位罚分模型 (Affine penalty models)**，公式为：$W_{n}=a+(n-1)b$ 。
    * 开启一个新空位（Gap opening, $a$）的代价远大于延长一个已存在的空位（Gap extension, $b$） 。例如 BLAST 中的 DNA 比对参数通常为 $a=-5, b=-2$ 。

### 3. 两种基础动态规划比对算法
这两种算法在数学上保证能找到最高得分的比对结果。
* **Needleman-Wunsch 算法 (全局比对 Global Alignment)**：
    * 它强制比对整条序列，保证产生具有最高整体得分（overall score）的比对结果。
    * [cite_start]**致命缺点**：经常会漏掉短且高度相似的子串（motifs），因为这些短片段的高分会被序列其余部分的不匹配（低分）所掩盖或抵消（out-weighed） 。
* **Smith-Waterman 算法 (局部比对 Local Alignment)**：
    * [cite_start]专门寻找两条序列之间相似度最高的子串，不需要比对整条序列，非常适合在长序列中寻找特定的结构域（domains） [cite: 3296, 3297]。
    * [cite_start]**核心计算规则**：矩阵中每个单元格的分数代表了**以该位置结尾的、任意长度比对的最大可能得分** [cite: 3317][cite_start]（即如果分数为负，则直接归零重新开始）。回溯时，从矩阵中寻找得分最高的单元格开始，一直回溯到起点 [cite: 3318]。

### 4. 启发式算法：BLAST (Basic Local Alignment Search Tool)
[cite_start]由于动态规划算法的时间复杂度为 $O(m \times n) \times$ 数据库序列数，运行极其缓慢，无法处理大型数据库 [cite: 3331, 3332]。
* [cite_start]**启发式直觉**：如果两条生物序列高度相似，它们必然包含足够数量的、顺序相同的短局部匹配（k-tuples/hits） [cite: 3337]。
* [cite_start]**预计算哈希表 (Hash table)**：BLAST 会为数据库中的每条序列预先计算一个包含所有可能短片段（tuples）位置的查找表，这极大地节省了搜索时间 [cite: 3341, 3344]。
* [cite_start]**邻近词搜索 (Neighborhood words)**：BLAST 不仅仅寻找完美匹配的片段，它还会寻找长度为 $w$、且替换得分高于阈值 $T$ 的“邻近词”（例如，搜索 GTW 时，也会将 GSW、GTY 纳入考虑） [cite: 3375, 3379][cite_start]。对于蛋白质，$w=3$；对于 DNA，$w=11$ [cite: 3380]。

### 5. BLAST 结果的统计学意义
在 BLAST 输出结果中，得分的评估指标至关重要：
* [cite_start]**Bit Score (比特得分)**：原始得分（Raw score）如果不结合具体的评分系统和统计参数 $K$ 与 $\lambda$，是没有实际意义的 [cite: 3406][cite_start]。BLAST 使用公式 $S^{\prime}=\frac{\lambda S-\ln K}{\ln 2}$ 将原始得分标准化为具有标准单位的 Bit score ($S'$)，使得不同比对结果之间可以直接比较 [cite: 3409, 3410]。
* [cite_start]**P-value**：代表在随机情况下，获得大于或等于当前得分 $S$ 的比对结果的概率，公式推导为 $P \approx 2^{-S^{\prime}}$ [cite: 3417, 3418, 3421]。
* [cite_start]**E-value (Expectation value)**：**最核心的显著性指标**。它是针对多重假设检验校正后的 P-value，代表在大小为 $N$ 的数据库中，纯粹靠随机概率预期能找到的、得分等于或高于 $S$ 的不同比对的**数量** [cite: 3423, 3424]。
    * [cite_start]计算公式：$E = mn \cdot Pval = N/2^{S^{\prime}}$ （其中 $N$ 是搜索空间大小，即查询序列长度 $n$ 乘以数据库长度 $m$） [cite: 3426, 3427, 3428]。
    * [cite_start]**结论：E-value 越低（越接近0），匹配得分的统计学显著性越高** [cite: 3425]。

---

## 第二部分：保守性分析与分子进化

### 1. 同源性的两种核心类别
* **直系同源 (Orthologs)**：
    * [cite_start]指存在于**不同物种**中的同源序列 [cite: 3580]。
    * [cite_start]它们是在**物种形成 (speciation)**过程中从同一个祖先基因演化而来的 [cite: 3581]。
    * [cite_start]直系同源基因通常（但不绝对）在不同物种中保留着相似的生物学功能 [cite: 3582]。
* **旁系同源 (Paralogs)**：
    * [cite_start]指存在于**同一个物种**内的同源序列 [cite: 3583]。
    * [cite_start]它们是由**基因重复 (gene duplication)**事件产生的 [cite: 3584][cite_start]。（例如：人类基因组内的 $\alpha$-珠蛋白和 $\beta$-珠蛋白家族 [cite: 3643, 3668]）。

### 2. 寻找直系同源基因的方法
* [cite_start]**最佳双向 BLAST 匹配 (Best Bi-directional BLAST Hit, BBH)**：最常用的简易方法。如果在基因组 1 中将基因 A 拿去 BLAST 基因组 2 得到的最佳匹配是基因 B，反过来将基因 B 拿去 BLAST 基因组 1 的最佳匹配也是基因 A，则推断 A 和 B 是直系同源 [cite: 3685, 3686, 3687]。
* [cite_start]**基因组同线性分析 (Genomic synteny / Gene order)**：通过分析基因在染色体上的排列顺序，直系同源基因通常在不同物种中占据相同的基因组物理区域（即保持排列上的保守性） [cite: 3694, 3695]。
* [cite_start]**系统发育分析 (Phylogenic analysis)** [cite: 3693]。

---

## 第三部分：基因组学项目与公共数据库资源

### 1. 重大基因组学与组学项目
* [cite_start]**ENCODE 计划 (Encyclopedia of DNA Elements)**：继人类基因组计划之后的核心项目，旨在注释基因组中的所有功能元件（包括转录元件、3'UTR元件、转录因子结合位点、染色质状态与组蛋白修饰等） [cite: 3919, 3902, 3903, 3904, 3905]。
* [cite_start]**1000 Genomes Project**：旨在对 1000 个人类个体进行重测序，建立深度的人类遗传变异（Genetic Variation）目录 [cite: 3928, 3929, 3930]。
* [cite_start]**宏基因组学 (Metagenomics)**：直接对环境样品（如温泉、海洋、土壤）或宿主微生物群（如人体肠道、粪便、肺部）中的全部基因组序列进行研究 [cite: 3951, 3952, 3957][cite_start]。注意：人体包含100万亿个细胞，其中只有10万亿是人体自身的细胞（微生物数量极为庞大） [cite: 3958]。
* [cite_start]**古代 DNA (Ancient DNA)** 分析难点：DNA 被核酸酶降解严重；样本中大部分 DNA 来自死后入侵的无关生物（如细菌）；且极易受到现代人类 DNA 的污染 [cite: 3964, 3965, 3966]。

### 2. 核心公共数据库体系
[cite_start]全球三大主要公共核酸数据库共享数据 [cite: 4019]：
* [cite_start]**GenBank**：由美国国家生物技术信息中心 (NCBI) 维护 [cite: 4025, 4026, 4027]。
* [cite_start]**EMBL-Bank**：由欧洲生物信息学研究所 (EBI) 维护 [cite: 4020, 4021, 4022]。
* [cite_start]**DDBJ**：由日本 DNA 数据银行维护 [cite: 4033, 4034]。

其他常用数据库：
* [cite_start]**UniProt / Swiss-Prot**：经过专家严格人工校验的高质量蛋白质序列数据库 [cite: 4151, 4152]。
* [cite_start]**Ensembl**：提供基于基因组的注释，其基因分类包括已知蛋白编码基因、预测基因、假基因（死基因）、以及各类非编码 RNA 基因等 [cite: 4130, 4134, 4137, 4140, 4142]。
* [cite_start]**UniGene**：面向基因的转录本聚类数据库，提供转录本在身体何处、发育什么阶段以及丰度如何的信息 [cite: 4051, 4117]。
* [cite_start]**HomoloGene**：收集并整理不同物种间同源基因/蛋白质组的信息 [cite: 4077, 4085, 4119]。

### 3. 必会的 NCBI RefSeq 序列命名规则
[cite_start]RefSeq (Reference Sequence) 提供了高质量、非冗余的专家人工校验序列集 [cite: 4121, 4123][cite_start]。其 Accession Number 前缀具有严格的生物学含义 [cite: 4123]：
* `NM_` 打头：成熟的 **mRNA** 转录本序列。
* `NP_` 打头：由 NM_ 转录本翻译而来的**蛋白质**序列。
* `NR_` 打头：**非编码 RNA** 序列 (non-coding RNA)。
* `NC_` 打头：**基因组序列** (Genomic，例如完整的染色体)。
* [cite_start]*(注：前缀为 `XM_`, `XP_`, `XR_` 的序列通常是自动化流程预测出的，尚未经过人工最终确认 [cite: 4123]。)*
