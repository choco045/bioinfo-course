# 1.Mapping

## 我的overview

* 测序 reads：高通量测序会把完整基因组打碎成无数短片段，这些短片段就是reads（比如作业里的THA2.fa），格式是 FASTA（.fa），本质是一串 ATCG 字母。
* 参考基因组：比如酿酒酵母（Yeast）的基因组，已经被完整测序并拼接成一条条染色体（sacCer3是版本号），相当于一张「地图」。
* mapping（比对 / 映射）：把测序得到的 reads，放到参考基因组的对应位置上，找到每条 read 最可能来自基因组的哪个区域。
* 比对工具：bowtie和bwa都是专门做这件事的软件，核心是先给参考基因组建索引，再用高效算法快速比对海量 reads，避免暴力逐碱基对比的低效。
* 输出结果：SAM/BAM格式，存储每条 read 的比对位置、质量、细节等信息，是后续分析的基础。



* Mapping 就是把测序测得的成千上万条短序列（Reads），像拼图一样贴回到已知的参考基因组（Reference Genome）上。
* 二代测序数据种类繁多，分析方法也各有差异。在待分析的物种已有参考基因组的情况下，传统的高通量数据分析流程中通常都会把测序数据mapping回参考基因组(对RNA-seq在有一些情况下有的流程也会考虑向转录组mapping)，再用mapping的结果（通常是一个bam格式的文件）进行后续的分析。

## 0)准备运行环境

进入我们之前使用的docker容器:

```bash
docker exec -it bioinfo_tsinghua /bin/bash
# 进入本节课的工作目录
cd /home/test/mapping
```

## 1) 流程

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvEulZ6EGwv9YRMFw%2Fmapping-pipeline.png?generation=1540298192245996\&alt=media)

## 2) 文件格式

### 2a) fastq文件（输入）

* fastq文件是存储二代测序测出的reads序列的最常见的一种文件格式。
* fastq文件除了read的序列信息之外，还记录了每一个碱基的测序质量信息
* fastq文件中，每四行对应一个read，下面提供了一个简单的例子。
  * 第1行（ID 信息）以"@"开头，"@"后面记录了read id，read id后面还可以空一格，再加上一些相关的描述信息
  * 第2行（碱基序列）记录着read序列
  * 第3行（占位符）以"+"开头，通常包含一些相关的描述信息(如果为空，也需要一个"+"作为占位符)
  * 第4行（质量值）为ASCII码表示的每个碱基的测序质量，长度和第2行相等

```
@EAS54_6_R1_2_1_413_324
CCCTTCTTGTCTTCAGCGTTTCTCC
+
;;3;;;;;;;;;;;;7;;;;;;;88
```

* fastq文件可以很容易的转换成fasta文件，但这一步会丢失测序质量的信息。大部分mapping的软件也支持fasta文件格式作为输入
* 对于双端测序，两个end的reads通常放在两个fastq文件中，在这两个fastq文件中，对应同一个read pair的两个read次序是一致的(例如对于第一个fastq文件中的第43个record对应的read，与它paired的read位于第二个fastq文件的第43个record)。

### 2b) sam文件（输出）

* sam/bam 文件是存储二代测序数据mapping结果的最常见的文件格式, mapping的过程可以简单的理解为一个从fastq文件产生bam文件的过程
* sam文件为纯文本文件，bam文件为压缩后的二进制文件。在实际工作中bam文件更常用(因为比较节约存储)
* sam/bam文件一般由两部分组成: 第一部分称为**header** ，它包含了reference序列的名称及长度，mapping结果的排序方式，mapping使用的软件等信息；第二部分为sam/bam文件的主体，包含了reads mapping的信息，即**Alignment body**（每一行代表一条 Read 比对到了哪个染色体、什么位置）
* 在不考虑multiple alignment(一个read被比对到多个位置)和chimeric alignment(一个read的不同区域被比对到了不同的染色体等)的情况下，一条read mapping的结果通常对应着sam/bam文件主体部分的一行
* sam/bam文件可以包括unmapped reads，也可以不包括unmapped reads
* pair end reads mapping的结果通常存储在一个bam文件中
* sam/bam 文件的具体定义相对比较复杂，对细节感兴趣的同学可以参考<https://samtools.github.io/hts-specs/SAMv1.pdf>
* samtools为我们操纵sam/bam文件提供了很多非常方便的功能，我们将在samtools/bedtools一节进行具体介绍

## 3) unspliced reads mapping

* 在向基因组mapping各个物种的DNA-seq(以及原核生物的RNA-seq)数据，或向转录组mapping各个物种的RNA-seq数据时，一般不需要考虑RNA splicing的问题。
* 对于这样的任务，[bowtie](http://bowtie-bio.sourceforge.net/index.shtml),[bowtie2](http://bowtie-bio.sourceforge.net/bowtie2/index.shtml)和[bwa](http://bio-bwa.sourceforge.net/)是比较常用的工具。
* 我们这里主要介绍[bowtie](http://bowtie-bio.sourceforge.net/index.shtml)的基本使用。

```bash
# 将fasta文件中THA1.fa的reads mapping到酵母基因组上
bowtie -v 2 -m 10 --best --strata BowtieIndex/YeastGenome -f THA1.fa -S THA1.sam
# -v 2: 容错设置。允许这条 Read 在比对时最多容许2个mismatch（2个碱基对不上）
# -m 10: 多重比对过滤。如果一条 Read 能比对到超过 10 个地方，就把它扔掉（为了保证结果的唯一性）。只输出可以map到不超过10个位置的reads mapping的结果
# --best --strata: 最优选择策略。告诉程序只给我看比对质量最好的那个结果。只汇报最好的一个hit,两个参数需要同时指定。
# BowtieIndex/YeastGenome: 酵母的bowtie index,可以从https://bowtie-bio.sourceforge.net/manual.shtml下载，也可以用bowtie-build从基因组文件自己建立。索引文件。就像字典的目录，比对前必须先用参考基因组生成索引。
# -f THA1.fa: 输入为fasta文件，路径为THA1.fa。指定你要比对的序列文件。
# -S THA1.sam: 输出文件名为THA1.sam，格式为sam文件

# 将fastq文件e_coli_1000_1.fq中的reads mapping到大肠杆菌基因组上
bowtie -v 1 -m 10 --best --strata bowtie-src/indexes/e_coli -q e_coli_1000_1.fq -S e_coli_1000_1.sam
# -v 1: 最多容许1个mismatch
# -m 10: 只输出可以map到不超过10个位置的reads mapping的结果
# --best --strata: 同上
# bowtie-src/indexes/e_coli 大肠杆菌的bowtie index,可以从https://bowtie-bio.sourceforge.net/manual.shtml下载，也可以用bowtie-build从基因组文件自己建立
# -q e_coli_1000_1.fq: 输入为fastq文件
# -S e_coli_1000_1.sam: 同上
```

{% hint style="info" %}

* bowtie既可以用来mapping单端测序数据，也可以用来mapping双端测序数据。如果希望了解mapping双端测序的命令，请参考bowtie的文档:<https://bowtie-bio.sourceforge.net/manual.shtml>
* bowtie在mapping中是不考虑insertion和deletion的，而bowtie2和bwa会考虑这些情况。有兴趣了解的同学请参考它们的文档，了解它们的使用方法。
  {% endhint %}


## 4) Genome Browser

see [1.1-genome-browser](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/1.mapping/1.1-genome-browser)


## 5) 延伸阅读

### 5a) 基因组学的常用文件格式

详见 <http://genome.ucsc.edu/FAQ/FAQformat.html>。

### 5b) spliced mapping

* 对于真核生物的RNA-seq数据的处理，我们通常需要考虑RNA splicing的问题。
* 有很多软件是专门针对向真核基因组mapping RNA-seq数据设计的，[hisat2](http://daehwankimlab.github.io/hisat2/)和[STAR](https://github.com/alexdobin/STAR)目前来说是两个非常常用的软件。[tophat](https://ccb.jhu.edu/software/tophat/index.shtml)曾经也是一个流行的工具，但现在用的人已经不多了。
* mapping RNA-seq数据的工具通常还需要提供一个gtf注释文件以获得splicing位点的信息，再向index mapping测序数据，产生bam文件。
* 这里我们也提供了利用[STAR](https://github.com/alexdobin/STAR)软件向拟南芥基因组mapping RNA-seq reads的例子。
* 在docker镜像中下载STAR的release并解压(在宿主机下载后，通过共享目录在docker中使用当然也是可以的):

```bash
wget https://github.com/alexdobin/STAR/archive/refs/tags/2.7.10a.zip
unzip 2.7.10a.zip
```

* 下载所需的数据[STAR.mapping.tar.gz](https://cloud.tsinghua.edu.cn/d/429647f35add41338d1a/)放入容器内的当前工作目录并解压:

```bash
tar xvzf STAR.mapping.tar.gz
```

{% hint style="info" %}

* 为了降低计算开销，供大家学习之用，我们这里使用的数据是从一个拟南芥RNA-seq数据mapping到叶绿体的Reads中sampling出来的，参考基因组和基因组注释也只包含了拟南芥叶绿体的序列。

* 这里提供的是双端测序的数据，单端测序数据的mapping非常类似，请自行参看STAR的文档。大家可以用这里双端测序的一个end(如`ath_1.fastq`)当作单端测序数据进行尝试。
  {% endhint %}

* Step1：建立STAR index（建立索引 (Genome Generate)）

```bash
mkdir tair10.Pt.STARindex
STAR-2.7.10a/bin/Linux_x86_64_static/STAR --runMode genomeGenerate --genomeFastaFiles data/tair10.Pt.fa --sjdbGTFfile data/tair10.Pt.gtf --genomeDir tair10.Pt.STARindex --genomeSAindexNbases 7
# genomeSAindexNbases 是STAR suffix array pre-indexing 的字符串长度, 默认为14
# --runMode genomeGenerate: 明确告诉 STAR 现在是要建索引。
# --genomeFastaFiles: 提供参考基因组的 FASTA 序列。
# --sjdbGTFfile: 非常关键。提供基因注释文件（GTF），告诉 STAR 哪里可能有剪接位点。
# --genomeDir: 指定存放索引的文件夹。
# 对于比较小的基因组(例如我们这里只用到了叶绿体序列，可以理解成一个很小的基因组)一般会设成min(14, log2(GenomeLength)/2 - 1)
```

* Step2：mapping（正式比对 (Align Reads)）

```bash
mkdir output
STAR-2.7.10a/bin/Linux_x86_64_static/STAR --runMode alignReads --genomeDir tair10.Pt.STARindex --readFilesIn data/ath_1.fastq data/ath_2.fastq --outFileNamePrefix output/ath.aligned
# --readFilesIn: 输入双端测序的两个文件。
# --outFileNamePrefix: 设置输出文件的前缀。STAR 会自动生成 .sam 和包含剪接位点信息的 .tab 文件。
```

* 在输出目录中，`output/ath.alignedAligned.out.sam`是mapping产生的sam文件，`output/ath.alignedSJ.out.tab`是splice junction的信息，其余两个是STAR输出的日志文件，包括mapping结果的统计信息等。

{% hint style="info" %}

* 我们这里只介绍了如何用STAR的默认参数进行reads mapping，没有涉及如何结合实际需求调整各种参数。STAR是一个非常灵活的工具，它提供了大量的参数和多种功能，有兴趣的同学请参考文档<https://raw.githubusercontent.com/alexdobin/STAR/master/doc/STARmanual.pdf>
* 我们这里只介绍了bowtie和STAR，也鼓励大家用我们这里提供的数据，用不同的aligner(bowtie2,bwa,hisat2等)进行各种尝试
  {% endhint %}

## 6) Homework

* （1）请阐述bowtie中利用了 BWT 的什么性质提高了运算速度？并通过哪些策略优化了对内存的需求？
* （2）用bowtie将 `THA2.fa` mapping 到 `BowtieIndex/YeastGenome` 上，得到 `THA2.sam`，统计mapping到不同染色体上的reads数量(即统计每条染色体都map上了多少条reads)。
* （3）查阅资料，回答以下问题:
  * （3.1）什么是sam/bam文件中的"CIGAR string"? 它包含了什么信息?
  * （3.2）"soft clip"的含义是什么，在CIGAR string中如何表示？
  * （3.3）什么是reads的mapping quality? 它反映了什么样的信息?
  * （3.4）仅根据sam/bam文件的信息，能否推断出read mapping到的区域对应的参考基因组序列? (提示:参考<https://samtools.github.io/hts-specs/SAMtags.pdf>中对于MD tag的介绍)
* （4）软件安装和资源文件的下载也是生物信息学实践中的重要步骤。请自行安装教程中未涉及的[bwa](https://github.com/lh3/bwa)软件，从[UCSC Genome Browser](https://hgdownload.soe.ucsc.edu/downloads.html)下载Yeast (S. cerevisiae, sacCer3)基因组序列。使用`bwa`对Yeast基因组`sacCer3.fa`建立索引，并利用`bwa`将`THA2.fa`，mapping到Yeast参考基因组上，并进一步转化输出得到`THA2-bwa.sam`文件。

## 7) More Reading

* 如上所述，mapping本身用到的都是一些现成的，高度优化的工具，需要我们自己完成的工作不多。
* 很多情况下我们直接拿到的测序数据在mapping前需要进行对各种adaptor和linker的移除、对质量不好的raw reads的trim和丢弃等data clean和QC工作。这是需要一定的经验的，而且对于不同测序方法产生的数据，预处理的方法也有所不同。这需要我们对产生数据的实验方法有清晰了解，illumina团队把现有的所有二代测序建库技术都收集并整理成标准，免费查看。请参考[Sequence Method Explorer](https://www.illumina.com/science/sequencing-method-explorer.html) (中文版链接为<https://www.illumina.com.cn/science/sequencing-method-explorer.html?langsel=/cn/>)。
* 对于数据的QC和预处理，也有大量工具可以直接使用，最常用的有:
  * [fastqc](https://www.bioinformatics.babraham.ac.uk/projects/fastqc/): 统计多种QC指标，以html的形式进行可视化
  * [cutadapt](https://cutadapt.readthedocs.io/en/stable/): 用于去除adaptor和低质量序列
  * [trim\_galore](https://www.bioinformatics.babraham.ac.uk/projects/trim_galore/):对[cutadapt](https://cutadapt.readthedocs.io/en/stable/)进行了封装，自动识别常见adaptor
  * [fastp](https://github.com/OpenGene/fastp):国人开发的fastq预处理工具
  * [fastx\_toolkit](http://hannonlab.cshl.edu/fastx_toolkit/) 一个比较早期的fastq预处理工具

## 8) Teaching Video

* see Videos in the \*\*\*\* [**Files needed**](https://courses.ncrnalab.org/files)

## Take a break

**Illumina & Affymetrix**

![Illumina](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvEv4rA7I2GCMcz23%2Fillumina.jpg?generation=1540298189570990\&alt=media)

> “Illumina公司的市场数据实在是非常美妙的东西。”拥有个人博客的基因研究人员丹尼尔·麦克阿瑟（Daniel Macarthur）说，“它是如此地纯净，到了令人吃惊的地步。” 当Illumina公司目前的股价净值比高达84倍的时候，高盛仍然建议买入，声称该公司很有可能继续保持其在DNA测序领域里的领导地位。

Illumina毫无疑问是这个时代科技公司的榜样。在生物学仪器制造领域，跟Thermo，Life等拥有几十年历史的公司相比，1998年起源于加州圣地亚哥的Illumina显然还是个年轻小伙。从1999年25个人的规模、130万美元的年营业额，到2013年超过3200人的规模、14.21亿美元的年营业额。

今天，Illumina公司几乎垄断了所有的二代测序（NGS：Next Generation Sequencing）市场。但是，Illumina公司最初是一家生产DNA芯片（microarray chip)的公司，这是一种侦测DNA变异的早期技术。而且，那时的Illumina公司还落后于该市场缔造者Affymetrix公司。

Illumina今天已经赶超了Affymetrix，并将其远远抛之脑后。最主要的原因，在于它从DNA芯片到DNA测序上的成功转型。Illumina公司的成功，很多人归功于其CEO，Jay Flatley，在战略上的敏锐。他很可能称得上是生物科技领域里的最佳CEO。2006年，Flatley说服Illumina公司董事会以6亿美元的价格收购了一家叫Solexa的开发NGS技术的小公司（同类型的NGS技术公司还有454等，因为其技术、成本和市场上的弱势，今天已经很少有人听说了），借此大力押注DNA测序。

如今，illumina在二代测序（NGS：Next Generation Sequencing）乃至整个测序市场占据领导地位。引用illumina官方说法：“世界上90%以上的测序数据都由illumina仪器产生”，不较真的话，这句话确实在某种程度上反应了illumina雄踞NGS市场的现状（下图是illumina 测序产品发布时间线） 。尤其是HiSeq系列测序仪的问世，以通量高，产量大，生产规模著称，能够快速、经济的进行大规模平行测序，在大型全基因组测序，全转录组，全外显子组测序，靶向基因测序方面优势明显。

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvEv69CN0D0_T1u9I%2Fillumina-products.png?generation=1540298188324262\&alt=media)
