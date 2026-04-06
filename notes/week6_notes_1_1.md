# 第六周笔记：1.2 bedtools与samtools

---

## 简短的overview
测序数据经过初步处理比对到参考基因组后，你会面临两个问题：
1. 怎么查看和管理这些海量的比对数据？（用 `samtools`）
2. 怎么算一算这些数据落在了基因组的哪些特定区域（比如哪些基因、哪些结合位点）上？（用 `bedtools`）

#### 0. 背景知识铺垫
* **基因组区间（Genomic interval）：** 生物信息数据大都可以描述为基因组上的一段区域。我们需要对这些区域进行交集、合并、差集等操作。
* **BED 文件：** 一种常见的存储基因组区域的文件，坐标从 0 开始算。
* **SAM/BAM 文件：** 存放测序 reads 比对结果的文件。SAM 是纯文本（太大），BAM 是二进制压缩版（省空间）。

#### 1. `bedtools` —— 基因组区域的“集合计算器”
笔记介绍了 5 种核心操作：
1.  **求交集 (`intersect`)：** 找 A 文件和 B 文件的重叠区域。
    * `-s`：严格要求在同一条正负链上才算重叠。
    * `-wa` / `-wb`：不仅告诉你哪里重叠了，还把原本完整的区间信息打印出来。
    * `-v`：反向选择，找出 A 里面**没有**和 B 重叠的区域。
2.  **合并 (`merge`)：** 把挨得近或者重叠的区间融合成一个大区间。
    * **大前提：** 输入文件必须先用 `sort` 命令按染色体和起始位置排好序！
    * `-d`：允许合并一定距离内的相邻区间。
3.  **求差集 (`subtract`)：** 从 A 里面把和 B 重合的部分“挖掉”。
4.  **计算覆盖数 (`coverage`/`intersect -c`)：** 统计 B 文件中有多少个元素落在了 A 文件的各个区间里（经常用来算基因表达量或结合强度）。
5.  **全基因组覆盖度 (`genomecov`)：** 从 BAM 文件出发，计算整个基因组上每一个碱基被覆盖了多少次，常输出为 `bedgraph` 格式方便可视化。

#### 2. `samtools` —— 比对文件的“高级管家”
笔记介绍了 4 个最常用的命令，它们通常是连着用的：
1.  **查看与过滤 (`view`)：**
    * 可以把 SAM 转成 BAM（加 `-b` 参数）。
    * 过滤数据：用 `-q 20` 扔掉比对质量差的 reads；用 `-f 4` 或 `-F 4` 根据 Flag 状态（比如是否比对上）来保留或剔除 reads。
2.  **排序 (`sort`)：** 把打乱的比对结果按照基因组的坐标顺序重新排列（后续分析的必需步骤）。
3.  **建索引 (`index`)：** 为排好序的 BAM 文件生成一个 `.bai` 的目录文件，就像书的目录一样，让电脑能瞬间找到特定基因位置的数据。
4.  **统计报告 (`flagstat`)：** 给你一个简单的统计结果，告诉你一共有多少 reads，比对上的占百分之几等宏观质量信息。

---

## 0) 背景

### Genomic interval（基因组区间）的比较
用染色体名称，起始位置坐标，终止位置坐标(还可以包括正负链的信息)，我们可以定义基因组上的一段区域(genomic interval/genomic range)。

生物信息中用到的基因组数据基本上都可以描述成基因组上的一段区域，以及注释到这一段区域的数据。我们在学习linux文本处理的基本命令时介绍的用于基因组注释的gtf/gff文件，就是这样的一个例子。

在很多数据分析的任务中，我们经常需要在不同的genomic intervals之间进行比较，例如：
- 取两组genomic intervals的交集
- 将一组genomic intervals中有重合的区域合并到一起
- 从一组genomic intervals中减去另外一组genomic intervals(差集)
- 统计一组genomic intervals有多少个落在另外一组genomic intervals上
- 对于一组genomic intervals，统计落在基因组每一个位置的genomic intervals的数量（即计算它们基因组上的coverage）

高效的实现上述的一些操作需要依赖特殊的数据结构，例如interval tree等。实现一个interval tree一类的数据结构来可靠的支持上述操作不是一件trivial的事情，但是好在我们并不需要自己实现这些功能，用很多经过长期测试的工具可以直接拿来使用。如果genomic intervals是事先按染色体和start position排过序的，上述的一些操作可以更高效的实现。

和gtf/gff文件类似，**bed文件**格式是一种存储基因组的一段区域，以及相关的信息的另外一种非常常见的文件格式。和gtf/gff文件格式不同，bed文件的坐标是从0开始的开区间。

**bedtools**是由犹他大学Quinlan实验室开发的一套工具，实现了各种在genomic intervals之间进行比较的功能，是一个非常实用的工具。虽然名字叫做bedtools，但是它对于其他文件格式，如bam，vcf等等也提供了支持。

### 二代测序数据处理与sam/bam格式
在传统的二代测序的数据分析中，第一步往往都是把测到的reads mapping回基因组。**sam(Sequence Alignment/Map)** 文件是最早由bwa的作者Heng Li设计的一种记录reads mapping信息的文件格式，后来被广泛接受，得到了更普遍的应用。目前各种mapping的工具的结果基本上都是以bam/sam文件格式作为输出的。

sam是一种纯文本文件，bam文件是压缩过的，二进制版本的sam文件。在真实的生物信息分析中，为了节约存储，我们通常以bam文件的形式存储mapping的结果。

sam文件由header部分和数据部分组成。header部分存储了参考序列，reads排列顺序，mapping所使用的命令等信息。数据部分存储了每一条read mapping结果的详细信息。

**samtools**是最早由Heng Li开发的，用于处理sam/bam文件的一个工具，目前在二代测序的数据分析被极为广泛的使用。除了samtools之外，还有其他很多工具也提供了相似的功能，例如bamtools，GATK中的很多工具。在python和R中也有pysam和Rsamtools。

---

## 1) 示例文件和环境设置

### 1a) 示例文件
- `genes.bed`: E.coli K-12基因在参考基因组NC_000913.3上的位置
- `CsrA.peaks.bed`: GSE102380中提供的，根据clip-seq确定的调控因子CsrA的binding peaks
- `chrom.bed`: 参考基因组NC_000913.3的长度
- `SRR1573434.sampled.bam`: GSE61327中提供的E.coli K-12一个野生型样本用bowtie2 mapping后的结果

### 1b) 环境配置
如果你通过docker运行，并且不想每次都输入完整路径，可以将软件路径加入环境变量。

```bash
# 编辑.bashrc文件配置环境变量
echo 'export PATH=/path/to/bedtools:$PATH' >> ~/.bashrc
# 使环境变量配置立刻生效
source ~/.bashrc
```

---

## 2) bedtools
下面介绍怎样用bedtools实现前面提到的一些对于genomic intervals进行比较的任务：

### 2.1) 取交集 (Intersect)
`bedtools intersect`比较在一组genomic intevals和另外一组(或多组genomic inteval)的重叠情况，然后找它们重叠的区域。
在默认参数下，bedtools多数工具不考虑strand信息，输出gemomic interval的重叠部分(至少有1nt重合就认为存在重叠)。

```bash
# 找出 A_file 和 B_file 重叠的区间，默认只输出重叠的坐标
bedtools intersect -a A_file.bed -b B_file.bed

# 参数：-s 强制要求两个interval不仅位置重叠，还要在同一个strand(正负链)上才算作重叠
bedtools intersect -a A_file.bed -b B_file.bed -s

# 参数：-f 指定重叠比例。例如 -f 0.5 表示重叠部分必须占 A 中区间的至少 50%
bedtools intersect -a A_file.bed -b B_file.bed -f 0.5

# 参数：-wa 输出A文件中与B文件有重叠的完整原始区间
bedtools intersect -a A_file.bed -b B_file.bed -wa

# 参数：-wa -wb 同时输出A文件和B文件中对应重叠的完整原始区间
bedtools intersect -a A_file.bed -b B_file.bed -wa -wb

# 参数：-v 输出A文件中与B文件【没有任何重叠】的区间（类似grep -v的反向选择）
bedtools intersect -a A_file.bed -b B_file.bed -v

# 参数：-wo 在每一行输出的末尾，加上一列统计具体的重叠碱基长度
bedtools intersect -a A_file.bed -b B_file.bed -wo
```

### 2.2) 合并重叠或相邻的区域 (Merge)
有的时候我们会希望把有重合的，或者是相邻的genomic inteval merge到一起。这可以使用`bedtools merge`命令。
**注意：** `bedtools merge`强制要求输入文件必须先按染色体(chromosome)和起始坐标(start position)排序。

```bash
# 步骤1：先使用 sort 命令按染色体名称（第一列）和起始位置（第二列数字）进行排序
sort -k1,1 -k2,2n unmerged.bed > sorted.bed

# 步骤2：执行 merge 操作，默认合并所有有重叠的区间
bedtools merge -i sorted.bed

# 参数：-d (distance) 将距离小于等于指定值的相邻区间也合并起来。例如 -d 10 会将距离在10bp以内的也合并
bedtools merge -i sorted.bed -d 10

# 参数：-c 和 -o 可以灵活对合并后的特征进行统计计算。
# 例如，对第4列（基因名）进行去重(distinct)操作，对第5列（得分）求和(sum)
bedtools merge -i sorted.bed -c 4,5 -o distinct,sum
```

### 2.3) 差集 (Subtract)
使用`bedtools subtract`可以从一组genomic intervals中减去另外一组genomic intervals。

```bash
# 从 A.bed 区间中减去与 B.bed 重叠的区域，输出剩下的那部分 A 区域
bedtools subtract -a A_file.bed -b B_file.bed
```

### 2.4) 计算重叠数 (Coverage/Count)
统计一组genomic intervals有多少个落在另外一组genomic intervals上。可以使用`bedtools intersect`特例，或者专门封装的`bedtools coverage`命令。

```bash
# 结合 -c 参数，可以统计 B 文件中有多少个特征落在了 A 文件的每个区间上
bedtools intersect -a genes.bed -b CsrA.peaks.bed -c

# 直接使用 bedtools coverage，会额外输出：
# 1. 覆盖A的B的数量  2. A被覆盖的总碱基数  3. A的总长度  4. A被覆盖的百分比
bedtools coverage -a genes.bed -b CsrA.peaks.bed
```

从 BAM 文件也可以计算 reads 落在指定区间的数目：
```bash
# 统计 bam 中比对上的 reads 有多少落在了给定的 bed 区间内
bedtools intersect -abam mapped.bam -b target_regions.bed -c
```

### 2.5) 计算全基因组覆盖度 (Genome Coverage)
利用`bedtools genomecov`命令，我们可以方便地从 bam 文件或 bed 文件出发计算出 genome coverage，即算出每个碱基上有多少 reads 覆盖。常输出为 `bedgraph` 格式。

```bash
# -ibam 表示输入为 BAM 文件，-bg 表示输出格式为 bedgraph 格式，以便导入 IGV 进行可视化
bedtools genomecov -ibam sorted_mapped.bam -bg > coverage.bedgraph

# 注意：对于真核生物的 RNA-seq 存在跨内含子的 spliced reads，必须添加 -split 参数，
# 这样跨越的 intron 区域就不会被错误地算作 coverage。
bedtools genomecov -ibam sorted_rnaseq.bam -bg -split > rnaseq_coverage.bedgraph
```

---

## 3) samtools
samtools 用于处理 sam/bam 文件。常用的四个命令如下：

### 3.1) view
`samtools view` 主要功能是格式转换和按条件（flag, 位点, mapping 质量等）过滤读取。

```bash
# 1. BAM 转换为人类可读的 SAM，并用 head 查看前10行
samtools view mapped.bam | head -n 10

# 2. 从 SAM 文件转换为经过压缩的二进制 BAM 文件：-b 代表输出bam格式，-S 兼容旧版输入格式
samtools view -bS mapped.sam > mapped.bam

# 3. 根据 Flag 过滤读取
# -f: 仅保留包含指定 flag 的 reads (例如 4 代表 unmapped)
samtools view -f 4 mapped.bam

# -F: 排除包含指定 flag 的 reads (例如排除 unmapped，即只保留 mapped reads)
samtools view -F 4 mapped.bam

# -q: 根据 MAPQ (mapping quality) 进行过滤，过滤掉比对质量低于 20 的 reads
samtools view -q 20 mapped.bam
```

### 3.2) sort
对 BAM 文件中的 reads 按参考基因组上的坐标进行排序。大部分后续分析工具（如 bedtools, IGV 等）都要求 BAM 文件必须是被排序好的。

```bash
# 将 mapped.bam 按照基因组坐标(coordinates)进行排序，输出文件为 sorted.bam
samtools sort mapped.bam -o sorted.bam
```

### 3.3) index
创建 BAM 文件的索引（`.bai`文件）。这是为了能够快速定位到基因组特定位置提取比对信息。前提是 BAM 文件必须是 sorted 的。

```bash
# 为排序后的 bam 文件建立索引，将在同目录下生成 sorted.bam.bai 文件
samtools index sorted.bam
```

### 3.4) flagstat
快速统计不同 flag 状态下的 reads 数量以及所占比例。

```bash
# 输出文件比对状态的全面汇总报告（例如总reads数，mapped数，paired数等）
samtools flagstat sorted.bam
```
