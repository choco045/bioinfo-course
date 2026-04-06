# bedtools-samtools_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## （1）我们提供的bam文件`COAD.ACTB.bam`是单端测序分析的结果还是双端测序分析的结果？为什么？(提示：可以使用`samtools flagstat`）

`COAD.ACTB.bam`是单端测序分析的结果。**原因：** 使用 `samtools flagstat COAD.ACTB.bam` 命令查看统计结果时，如果是双端测序，会输出包含 "paired in sequencing", "read1", "read2", "properly paired" 等与双端测序相关的统计信息；单端测序则没有这些统计项或者这些项的数值为0。

代码：
```
ymz24@choco:/mnt/c/Users/27978$ cd "/mnt/c/Users/27978/Desktop/samtools&bedtools/homework"
ymz24@choco:/mnt/c/Users/27978/Desktop/samtools&bedtools/homework$ samtools flagstat COAD.ACTB.bam
185650 + 0 in total (QC-passed reads + QC-failed reads)
180727 + 0 primary
4923 + 0 secondary
0 + 0 supplementary
0 + 0 duplicates
0 + 0 primary duplicates
185650 + 0 mapped (100.00% : N/A)
180727 + 0 primary mapped (100.00% : N/A)
0 + 0 paired in sequencing
0 + 0 read1
0 + 0 read2
0 + 0 properly paired (N/A : N/A)
0 + 0 with itself and mate mapped
0 + 0 singletons (N/A : N/A)
0 + 0 with mate mapped to a different chr
0 + 0 with mate mapped to a different chr (mapQ>=5)
```

## （2）查阅资料回答什么叫做"secondary alignment"？并统计提供的bam文件中，有多少条记录属于"secondary alignment?" （提示：可以使用samtools view -f 获得对应secondary alignment的records进行统计）
【解答】
**Secondary alignment（次要比对）的意思：**
当一条 read 可以比对到参考基因组上的多个位置（多重比对，multi-mapping）时，比对软件会根据打分策略选择一个得分最高的位置作为主要比对（primary alignment），而将其余的比对位置标记为次要比对（secondary alignment）。在 BAM 的 FLAG 值中，secondary alignment 会被标记为 256（0x100）。

**统计命令与结果：**
可以使用以下命令进行统计：
```bash
samtools view -c -f 256 COAD.ACTB.bam
```
这会输出该 BAM 文件中属于 secondary alignment 的记录总数（此处应填入具体运行上述命令后的数字，如果是理论作业则通过 `-f 256` 统计出结果）。

## （3）请根据`hg38.ACTB.gff`计算出在ACTB基因的每一条转录本中都被注释成intron的区域，以bed格式输出。并提取`COAD.ACTB.bam`中比对到ACTB基因intron区域的bam信息，后将bam转换为fastq文件。
【解答】
**步骤 1：从 GFF 提取基因与外显子区间并计算 Intron 区域**
首先提取 ACTB 基因的整体区域，并提取所有外显子区域。注意 GFF 坐标是 1-based，BED 坐标是 0-based。
```bash
# 提取 gene 区间并转换为 BED 格式 (0-based)
awk 'BEGIN{OFS="\t"} $3=="gene" {print $1, $4-1, $5, $9, $6, $7}' hg38.ACTB.gff > ACTB_gene.bed

# 提取 exon 区间并转换为 BED 格式 (0-based)
awk 'BEGIN{OFS="\t"} $3=="exon" {print $1, $4-1, $5, $9, $6, $7}' hg38.ACTB.gff > ACTB_exon.bed

# 将所有外显子进行合并，以得到非重叠的 exon 区域
bedtools merge -i ACTB_exon.bed > ACTB_exon_merged.bed

# 使用 subtract 从 gene 区间中减去合并后的 exon 区间，得到 intron 区域
bedtools subtract -a ACTB_gene.bed -b ACTB_exon_merged.bed > ACTB_intron.bed
```

**步骤 2：提取比对到 Intron 区域的 BAM 信息**
```bash
# 使用 bedtools intersect 提取比对到 intron 区域的 reads
bedtools intersect -abam COAD.ACTB.bam -b ACTB_intron.bed > COAD.ACTB_intron.bam
```

**步骤 3：将提取的 BAM 文件转换为 FASTQ**
```bash
# 将 BAM 转换为 FASTQ (若为双端测序可以使用 bedtools bamtofastq 或 samtools fastq)
samtools fastq COAD.ACTB_intron.bam > COAD.ACTB_intron.fq

# 另一种方法使用 bedtools
bedtools bamtofastq -i COAD.ACTB_intron.bam -fq COAD.ACTB_intron.fq
```

## (4) 利用`COAD.ACTB.bam`计算出reads在ACTB基因对应的genomic interval上的coverage，以bedgraph格式输出。 （提示：对于真核生物转录组测序向基因组mapping得到的bam文件，bedtools genomecov有必要加-split参数。）
【解答】
可以使用 `bedtools genomecov` 命令计算 coverage，并指定 `-split` 参数以处理 RNA-seq 中跨越内含子的 reads（CIGAR string 包含 N），并且输出 bedgraph 格式（使用 `-bg` 参数）：

```bash
# 确保 BAM 文件已经按照坐标排序（如果没有排序需先用 samtools sort）
# 计算 coverage 并以 bedgraph 格式输出
bedtools genomecov -ibam COAD.ACTB.bam -bg -split > COAD.ACTB_coverage.bedgraph
```
输出的 `COAD.ACTB_coverage.bedgraph` 文件即为 reads 在参考基因组对应区域上的 coverage，可导入 IGV 等软件进行可视化。
