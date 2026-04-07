# DNA-seq and Genomic Features_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## 1. 人类基因组的大小以及基本组成是哪些？

由于人类基因组测序与组装技术的不断迭代，基因组的大小和基因总数在不同版本中存在微小差异。以两个较具代表性的参考基因组版本为例：

* **经典参考基因组 (GRCh38.p14)**：泛应用于各大数据库的基准注释。在 Ensembl 数据库的最新统计中，若仅计算主干染色体序列（Primary Assembly，排除备选单倍型），其大小约为 **3.1 Gb**（3,099,750,718 bp）；若包含用于体现人群多态性的备选单倍型序列（alt loci）和补丁，其所有重叠群（contig）的总长度则扩展至 **3.4 Gb**。
* **完整无间隙组装 (T2T-CHM13v1.1)**：这是首个填补了所有着丝粒、端粒和高度重复区域序列的真正完整的人类基因组版本。T2T-CHM13 包含了所有 22 条常染色体和 X 染色体的无间隙组装，其细胞核 DNA 总长度为 3,054,815,472 bp。

为了更直观地展示人类基因组的规模与**基本组成**，下表汇总了基于 Ensembl 数据库最新发布版本与最新 T2T 完整基因组文献的对比数据：

| 统计维度 | Ensembl 数据库统计数据 | T2T-CHM13 最新组装文献数据 |
| :--- | :--- | :--- |
| **总序列长度 (大小)** | 3,099,750,718 bp | 3,054,815,472 bp |
| **总基因数** | 77,197 个 | 63,494 个 |
| ├── **编码基因 (Coding)** | 19,869 个 | 19,969 个 |
| ├── **非编码基因 (Non-coding)**| 42,124 个 | 尚未在文献主表中完全细分出非编码总数 |
| └── **假基因 (Pseudogenes)** | 15,204 个 | / |

<img width="2000" height="1502" alt="image" src="https://github.com/user-attachments/assets/c94cb792-f637-4ca0-bed1-e0a8b6662886" />

人类基因组的基本组成成分如下表所示：

| 基因组组成成分 | 说明 |
| :--- | :--- |
| **Coding regions (蛋白质编码区)** | 真正转录并翻译成蛋白质的序列（外显子为主），约包含两万多个蛋白质编码基因。 |
| **Introns (内含子)** | 存在于基因内部，转录后在 RNA 剪接过程中被去除的非编码区域。 |
| **Repeats and Transposons (重复序列与转座子)** | 包含各种串联重复序列、散在重复序列（如 Alu 元件、LINEs、SINEs 等），被认为是基因组进化中的“跳跃基因”。 |
| **Regulatory Elements (调控元件)** | 包括启动子、增强子、绝缘子等，负责调控基因在何时、何地以及以何种水平表达。 |
| **Others (其他区域)** | 其他非编码区域及未明确功能的结构序列（曾被称为“垃圾 DNA”，但 ENCODE 计划揭示其中广泛存在非编码 RNA 的转录活动）。 |

> **数据出处与时间量化说明：**
> * **Ensembl 数据**：来源于 Ensembl Release 115（2025年9月发布），底层 Assembly 为 GRCh38.p14，Gencode 版本为 GENCODE 49。
> * **T2T-CHM13 数据**：来源于 2022 年 4 月发表于《Science》的文献《The complete sequence of a human genome》。

---

## 2. 基因中的非编码 RNA的最新注释是多少个了？请详细列一下其中的非编码 RNA 的细分类型的数目，并对主要的非编码 RNA 是做什么的用1-2句解释一下。

根据 **GENCODE 数据库（Version 49 最新版）** 统计，目前基因中的非编码 RNA 基因总数约为 **43,462** 个（包含长链非编码 RNA 与各类小非编码 RNA）。

其主要细分类型及其精确注释数目如下表所示：

| 非编码 RNA 细分类型 | 英文简称 | 基因注释数量 (Genes) |
| :--- | :--- | :--- |
| **长链非编码 RNA** | lncRNA | 34,880 |
| **微小 RNA** | miRNA | 1,879 |
| **小核 RNA** | snRNA | 1,901 |
| **核仁小 RNA** | snoRNA | 942 |
| **核糖体 RNA** | rRNA | 47 |
| **其他/杂项非编码 RNA**| misc_RNA | 2,207 |

### 主要非编码 RNA 的功能解释

1. **长链非编码 RNA (lncRNA)**：
   * 长度大于 200 个核苷酸且不具备编码蛋白质能力的转录本。它们可以通过与 DNA、RNA 或蛋白质相互作用，在表观遗传、转录及转录后等多个水平广泛调控基因的表达。

2. **微小 RNA (miRNA)**：
   * 长度约为 20-24 个核苷酸的单链小分子 RNA。主要通过与靶标 mRNA 的 3' 非翻译区 (3'UTR) 互补结合，导致靶标 mRNA 降解或阻遏其翻译过程，是转录后调控的核心分子。

3. **小核 RNA (snRNA)**：
   * 主要存在于细胞核中，是剪接体（Spliceosome）的核心组成成分。其主要作用是识别内含子边界，参与并催化前体 mRNA (pre-mRNA) 的剪接过程，使其成熟。

4. **核仁小 RNA (snoRNA)**：
   * 主要驻留在细胞核仁中，作为引导 RNA 发挥作用。它们负责引导修饰酶到特定靶位点，参与核糖体 RNA (rRNA) 等其他 RNA 分子的化学修饰（如 2'-O-甲基化和假尿嘧啶化）。

5. **核糖体 RNA (rRNA)**：
   * 是细胞内含量最丰富的 RNA，与多种核糖体蛋白共同组装成核糖体。它不仅是核糖体的骨架结构，还具有核酶（Ribozyme）活性，直接催化氨基酸脱水缩合形成肽键，是蛋白质合成（翻译）不可或缺的分子机器。
  
6. **转运 RNA (tRNA)**
   * 在蛋白质合成过程中，负责识别 mRNA 上的密码子，并将相对应的氨基酸搬运到核糖体上。

7. **Piwi-相互作用 RNA (piRNA)**
   * 主要在生殖细胞中高表达，通过与 Piwi 蛋白家族结合形成复合物，沉默转座子的活性，以保护生殖细胞基因组的完整性与稳定性。

> **数据出处与时间量化说明：**
> * 细分数值来源于 **GENCODE Release 49**（当前最新主线版本），数据提取自其官方统计页 (Statistics about the current GENCODE Release)。

<img width="2879" height="1582" alt="image" src="https://github.com/user-attachments/assets/8d5b8ec2-e5b9-4f07-930a-83c6f0967b08" />
<img width="1376" height="812" alt="image" src="https://github.com/user-attachments/assets/a48f9016-3613-45b4-b85e-2fac84373a93" />
<img width="2879" height="1549" alt="image" src="https://github.com/user-attachments/assets/129d7112-b0b2-4690-9aab-48e837b7b4f2" />
<img width="2878" height="1615" alt="image" src="https://github.com/user-attachments/assets/eb09da1d-4e10-4e39-be72-9343555061dd" />
<img width="2877" height="1583" alt="image" src="https://github.com/user-attachments/assets/d3957502-a2b6-4dca-b7fc-bf8f2859c123" />
