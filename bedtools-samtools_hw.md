# bedtools-samtools_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## （1）我们提供的bam文件`COAD.ACTB.bam`是单端测序分析的结果还是双端测序分析的结果？为什么？

`COAD.ACTB.bam`是**单端测序分析的结果**。

**原因：** 使用 `samtools flagstat` 命令查看统计结果:  
```bash
samtools flagstat COAD.ACTB.bam #快速扫描文件中所有 reads 的 FLAG 值，并统计不同 flag 状态下的 reads 数量以及所占比例
```
如果是双端测序，会输出包含`paired in sequencing`, `read1`, `read2`, `properly paired`等与双端测序相关的统计信息；单端测序则没有这些统计项或者这些项的数值为0，实际输出中`paired in sequencing`以及`properly paired`等所有双端测序相关的统计项全部为 0，这确凿地证明了该 BAM 文件是单端测序的结果。

附完整运行代码：
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

## （2）查阅资料回答什么叫做"secondary alignment"？并统计提供的bam文件中，有多少条记录属于"secondary alignment?" 

**Secondary alignment（次要比对）的意思：**
当一条 read 可以比对到参考基因组上的多个位置（多重比对，multi-mapping）时，比对软件会根据打分策略选择一个得分最高的位置作为主要比对（primary alignment），而将其余的比对位置标记为次要比对（secondary alignment）。在 SAM/BAM 格式的规范中，FLAG 值 256 代表“not primary alignment”（即 secondary alignment）。

**统计命令与结果：**
```bash
samtools view -c -f 256 COAD.ACTB.bam #输出该 BAM 文件中属于 secondary alignment 的记录总数
```
得到COAD.ACTB.bam中有**4923**条记录属于"secondary alignment"。

附完整运行代码：
```
ymz24@choco:/mnt/c/Users/27978/Desktop/samtools&bedtools/homework$ samtools view -c -f 256 COAD.ACTB.bam
4923
```

## （3）请根据`hg38.ACTB.gff`计算出在ACTB基因的每一条转录本中都被注释成intron的区域，以bed格式输出。并提取`COAD.ACTB.bam`中比对到ACTB基因intron区域的bam信息，后将bam转换为fastq文件。

GFF文件中通常不直接包含 "intron" 的注释。因为同一基因可能存在多种剪接变体（转录本），所以“在每一条转录本中都被注释为 intron”即：在基因的全长区域内，刨去所有曾经作为 exon 出现过的区域，剩下的绝对空白区就是严格的 intron。

**1. 从 GFF 提取基因与外显子区间并计算 Intron 区域**
首先提取 ACTB 基因的整体区域，并提取所有 exon 区域。注意 GFF 坐标是 1-based，BED 坐标是 0-based。
```bash
# 1. 提取 gene 区间并转换为 BED 格式 (0-based)
awk -v OFS="\t" '$3=="gene" {
    split($9, a, ";");
    split(a[1], b, "=");
    name = b[2]; #将第9列的基因ID提取出来
    print $1, $4-1, $5, name, $6, $7
}' hg38.ACTB.gff > ACTB_gene.bed

# 2. 提取 exon 区间，按染色体和起始位置排好序，并转换为 BED 格式 (0-based)
awk -v OFS="\t" '$3=="exon" {
    split($9, a, ";");
    split(a[1], b, "=");
    name = b[2]; #将第9列的基因ID提取出来
    print $1, $4-1, $5, name, $6, $7
}' hg38.ACTB.gff | sort -k1,1 -k2,2n > ACTB_exons_sorted.bed

# 3. 将所有外显子进行合并，以得到非重叠的 exon 区域
bedtools merge -i ACTB_exons_sorted.bed > ACTB_exon_merged.bed

# 4. 使用 subtract 从 gene 区间中减去合并后的 exon 区间，得到 intron 区域
bedtools subtract -a ACTB_gene.bed -b ACTB_exon_merged.bed > ACTB_intron.bed
```

**步骤 2：提取比对到 Intron 区域的 BAM 信息**
```bash
# 使用 bedtools intersect 提取比对到 intron 区域的 reads
bedtools intersect -a COAD.ACTB.bam -b ACTB_intron.bed > COAD.ACTB_intron.bam
```

**步骤 3：将提取的 BAM 文件转换为 FASTQ**
```bash
# 将 BAM 转换为 FASTQ
bedtools bamtofastq -i COAD.ACTB_intron.bam -fq COAD.ACTB_intron.fastq
```

结果展示：
```
ymz24@choco:/mnt/c/Users/27978/Desktop/samtools&bedtools/homework$ wc -l COAD.ACTB_intron.fastq
127792 COAD.ACTB_intron.fastq
ymz24@choco:/mnt/c/Users/27978/Desktop/samtools&bedtools/homework$ head -n 4 COAD.ACTB_intron.fastq
@UNC3-RDR300156_8:2:1:1584:8723
CGCCTTTGCCGATCCGCCGCCCGTCCACACCCGCCGCCAGCTCACCATGGATGATGATATCGCCGCCCTCCTCTTC
+
GGGFFEGGGFFGGGFGBGAGFFBDFF=F?FFEDFFBFF?DABEBEEA5BCBB=@B=@?A0A@AC?###########
```

## (4) 利用`COAD.ACTB.bam`计算出reads在ACTB基因对应的genomic interval上的coverage，以bedgraph格式输出。

用 `bedtools genomecov` 命令计算 coverage，`-ibam COAD.ACTB.bam`指定输入文件为 BAM 格式，`-bg`告诉软件输出 bedgraph 格式，指定 `-split` 参数以处理 RNA-seq 中跨越内含子的 reads（CIGAR string 包含 N）。

```bash
# 计算 coverage 并以 bedgraph 格式输出
bedtools genomecov -ibam COAD.ACTB.bam -bg -split > COAD.ACTB_coverage.bedgraph
```

结果展示：
```
ymz24@choco:/mnt/c/Users/27978/Desktop/samtools&bedtools/homework$ head -n 5 COAD.ACTB_coverage.bedgraph
chr7    5045717 5045731 1
chr7    5058689 5058695 1
chr7    5072542 5072543 2
chr7    5072543 5072554 5
chr7    5073147 5073157 1
```

<img width="2879" height="1707" alt="image" src="https://github.com/user-attachments/assets/bd63e8b2-a09f-4e62-8d1a-4824bcedd833" />
