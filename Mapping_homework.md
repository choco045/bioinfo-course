# Mapping_homework_姚茗子 

## （1）阐述bowtie中利用了 BWT 的什么性质提高了运算速度，并通过哪些策略优化了对内存的需求。
* **BWT 提高运算速度的性质**：
    * 范围查找 (Range Search)：BWT 配合 FM-index 将复杂的全基因组字符串匹配问题，转化为了在索引区间内的简单字符计数操作。
    * 实现从 Read 末尾向前的反向搜索，每增加一个碱基仅需常数次跳转。
    * 通过 LF 映射（Last-to-First）快速定位 read 在基因组中的所有可能位置，时间复杂度从暴力比对的`O(n*m)` 降到`O(m)` （n 是基因组长度，m 是 read 长度），使得**在该索引上查找序列的时间复杂度与基因组长度无关，仅与 Read 长度相关**。
* **优化对内存需求的策略**：通过 Checkpoint 机制和辅助数组，平衡了搜索速度与内存占用，使得在普通个人电脑上也能处理人类基因组。
    * **位压缩存储**：每个碱基只用 2 bits（A=00, T=01, C=10, G=11）存储，而不是 1 字节（8 bits），大幅减少内存占用。
    * **分块加载与计算**：Bowtie 不会一次性将整个后缀数组（Suffix Array）存入内存，而是只存储部分采样点，通过辅助数组（如 Occ 数组）在运行时计算出缺失的信息，从而以极小的计算开销换取了巨大的内存节省。
    * **内存映射（mmap）**：将索引文件映射到虚拟内存空间，由操作系统根据计算需求动态加载数据块，这有效解决了物理内存不足以一次性承载大型基因组索引的问题。

---

## （2）用bowtie将`THA2.fa mapping`到`BowtieIndex/YeastGenome`上，得到`THA2.sam`，统计mapping到不同染色体上的reads数量(即统计每条染色体都map上了多少条reads)。
**1. 执行比对：**
```bash
bowtie -v 2 -m 10 --best --strata BowtieIndex/YeastGenome -f THA2.fa -S THA2.sam
```
结果：
```
# reads processed: 1250
# reads with at least one reported alignment: 1158 (92.64%)
# reads that failed to align: 77 (6.16%)
# reads with alignments suppressed due to -m: 15 (1.20%)
Reported 1158 alignments to 1 output stream(s)
```

**2. 统计每条染色体的 reads 数量：**
```bash
grep -v "^@" THA2.sam | cut -f 3 | grep -v "\*" | sort | uniq -c
```
结果：
```
     18 chrI
     51 chrII
     15 chrIII
    194 chrIV
     25 chrIX
     12 chrmt
     33 chrV
     17 chrVI
    125 chrVII
     68 chrVIII
     71 chrX
     56 chrXI
    169 chrXII
     67 chrXIII
     58 chrXIV
    101 chrXV
     78 chrXVI
```

---

## （3）解答题
* **（3.1）什么是sam/bam文件中的"CIGAR string"? 它包含了什么信息?**
    * CIGAR string 全称 Concise Idiosyncratic Gapped Alignment Report。它记录了 Read 相对于参考基因组的比对状态（匹配、插入、缺失、剪切等）。
    * 示例：`50M3I2D`, 其中`50M`：50 个碱基匹配 / 错配；`3I`：read 上有 3 个插入（参考基因组没有这 3 个碱基）；`2D`：参考基因组上有 2 个删除（read 上没有这 2 个碱基）
* **（3.2）"soft clip"的含义是什么，在CIGAR string中如何表示？**
    * 含义：Read 两端的序列由于质量差或接头污染无法比对，被软件在统计比对位置时忽略。但这部分碱基仍然保留在 SAM 的序列（SEQ）中，Hard clip（H）则会直接删除未比对的末端碱基。
    * 在 CIGAR 中用 `S` 表示，比如`10S40M`，其中前 10 个碱基是 soft clip，后 40 个碱基正常比对。
* **（3.3）什么是reads的mapping quality? 它反映了什么样的信息?**
    * MAPQ 是一个 0-60 的数值（Phred 质量值），表示这条 read 比对到当前位置的置信度。衡量比对结果的可靠性。计算公式通常为 $-10 \log_{10} P$（P 为比对错误的概率），数值越高表示比对位置越唯一。
    * 含义：
        * 0：完全不确定，可能比对到多个位置
        * 30：错误比对概率是 1/1000
        * 60：几乎确定是正确比对
    * 用途：后续分析（比如变异检测）会过滤低 MAPQ 的 reads，减少假阳性。
* **（3.4）仅根据sam/bam文件的信息，能否推断出read mapping到的区域对应的参考基因组序列?**
    * 能。需要结合 SEQ（Read 序列）、CIGAR 字符串和 MD tag。
    * `MD` tag 作用：描述 read 和参考基因组的错配、删除位置，不需要原始参考基因组就能重建比对区域的序列。比如MD:Z:10A5^AC6，即前 10 个碱基完全匹配参考基因组；第 11 个碱基：参考为 A，read 中为其他碱基（错配）之后 5 个碱基完全匹配；随后参考基因组有 2 个碱基 AC 缺失（read 中无对应碱基）；最后 6 个碱基完全匹配。
    * 推断逻辑：
        * 对于 Soft clipped (S) 的部分，其原始序列已存在于 SEQ 列中，无需推断。
        * 对于 Match (M) 区域，若 MD tag 显示匹配，则参考序列等同于 SEQ；若显示错配，则根据 MD tag 记录的碱基替换 SEQ 中的碱基。
        * 对于 Deletion (D) 区域，Read 中缺失该片段，必须通过 MD tag 中记录的碱基（如 ^AC）来补全参考序列。

---

## （4）安装教程中未涉及的[bwa](https://github.com/lh3/bwa)软件，从[UCSC Genome Browser](https://hgdownload.soe.ucsc.edu/downloads.html)下载Yeast (S. cerevisiae, sacCer3)基因组序列。使用`bwa`对Yeast基因组`sacCer3.fa`建立索引，并利用`bwa`将`THA2.fa`，mapping到Yeast参考基因组上，并进一步转化输出得到`THA2-bwa.sam`文件。
**1. 安装bwa：**
* 进入https://github.com/lh3/bwa，Download ZIP。
* 解压文件夹后，将系统内文件夹复制至容器内，实际操作命令如下：
```bash
docker cp C:\Users\27978\Downloads\bwa-master bioinfo_tsinghua:/home/test/mapping
```
* 以 root 身份进入容器，进入下载路径，编译软件，即可开始使用
```bash
docker exec -it -u root bioinfo_tsinghua bash
cd /home/test/mapping/bwa-master
make
```

**2. 下载基因组：**
* 在 UCSC Genome Browser 页面中，找到 "Other genomes" 选项并点击，找到 Yeast (S. cerevisiae, sacCer3) 基因组序列，选择的版本是 sacCer3 (Apr. 2011)。
* 点击Genome sequence files and select annotations (2bit, GTF, GC-content, etc)，在 sacCer3.fa.gz 上点击右键，选择“复制链接地址”，得到链接 https://hgdownload.soe.ucsc.edu/goldenPath/sacCer3/bigZips/sacCer3.fa.gz 。
* 运行以下命令：
```bash
cd /home/test/mapping
wget https://hgdownload.soe.ucsc.edu/goldenPath/sacCer3/bigZips/sacCer3.fa.gz
gunzip sacCer3.fa.gz
```

**3. 建立索引：**
```bash
./bwa index ../sacCer3.fa
```
输出：
```
[bwa_index] Pack FASTA... 0.10 sec
[bwa_index] Construct BWT for the packed sequence...
[bwa_index] 5.05 seconds elapse.
[bwa_index] Update BWT... 0.07 sec
[bwa_index] Pack forward-only FASTA... 0.03 sec
[bwa_index] Construct SA from BWT and Occ... 7.89 sec
[main] Version: 0.7.19-r1273
[main] CMD: ./bwa index ../sacCer3.fa
[main] Real time: 12.596 sec; CPU: 13.140 sec
```

**4. 执行比对并输出为 SAM：**
```bash
./bwa mem ../sacCer3.fa ../THA2.fa > ../THA2-bwa.sam
```
输出：
```
[M::bwa_idx_load_from_disk] read 0 ALT contigs
[M::process] read 1250 sequences (31877 bp)...
[M::mem_process_seqs] Processed 1250 reads in 0.030 CPU sec, 0.044 real sec
[main] Version: 0.7.19-r1273
[main] CMD: ./bwa mem ../sacCer3.fa ../THA2.fa
[main] Real time: 0.161 sec; CPU: 0.093 sec
```

**5. 查看 SAM 文件前几行:**
```bash
cd ../ #回到上一级的mapping文件夹
head -n 10 THA2-bwa.sam
```
输出：
```
@HD     VN:1.5  SO:unsorted     GO:query
@SQ     SN:chrI LN:230218
@SQ     SN:chrII        LN:813184
@SQ     SN:chrIII       LN:316620
@SQ     SN:chrIV        LN:1531933
@SQ     SN:chrIX        LN:439888
@SQ     SN:chrV LN:576874
@SQ     SN:chrVI        LN:270161
@SQ     SN:chrVII       LN:1090940
@SQ     SN:chrVIII      LN:562643
```

**6. 统计比对reads数量：**
```bash
grep -v "^@" THA2-bwa.sam | wc -l
```
输出：
```
1250
```
