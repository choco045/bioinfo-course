
## 0) 背景

### genomic interval的比较

用染色体名称，起始位置坐标，终止位置坐标(还可以包括正负链的信息)，我们可以定义基因组上的一段区域(genomic interval/genomic range)。

生物信息中用到的基因组数据基本上都可以描述成基因组上的一段区域，以及注释到这一段区域的数据。我们在学习linux文本处理的基本命令时介绍的用于基因组注释的gtf/gff文件，就是这样的一个例子。

在很多数据分析的任务中，我们经常需要在不同的genomic intervals之间进行比较，例如：

取两组genomic intervals的交集

将一组genomic intervals中有重合的区域合并到一起

从一组genomic intervals中减去另外一组genomic intervals(差集)

统计一组genomic intervals有多少个落在另外一组genomic intervals上

对于一组genomic intervals，统计落在基因组每一个位置的genomic intervals的数量（即计算它们基因组上的coverage）

...

高效的实现上述的一些操作需要依赖特殊的数据结构，例如interval tree等。实现一个interval tree一类的数据结构来可靠的支持上述操作不是一件trivial的事情，但是好在我们并不需要自己实现这些功能，用很多经过长期测试的工具可以直接拿来使用。

如果genomic intervals是事先按染色体和start position排过序的，上述的一些操作可以更高效的实现。

和gtf/gff文件类似，bed文件格式是一种存储基因组的一段区域，以及相关的信息的另外一种非常常见的文件格式。和gtf/gff文件格式不同，bed文件的坐标是从0开始的开区间。

bed文件格式的具体定义请参考:

https://genome.ucsc.edu/FAQ/FAQformat.html#format1

https://bedtools.readthedocs.io/en/latest/content/general-usage.html

bedtools是由犹他⼤学Quinlan实验室开发的一套工具，实现了各种在genomic intervals之间进行比较的功能，是一个非常实用的工具。虽然名字叫做bedtools，但是它对于其他文件格式，如bam，vcf等等也提供了支持。

有很多其他的工具，如R包GenomicRanges等,也提供了类似的功能，请有兴趣的同学自行了解。

### 二代测序数据处理与sam/bam格式

在mapping一节我们提到，在传统的二代测序的数据分析中，第一步往往都是把测到的reads mapping回基因组。sam(Sequence Alignment/Map)文件是最早由bwa的作者Heng Li设计的一种记录reads mapping信息的文件格式，后来被广泛接受，得到了更普遍的应用。目前各种mapping的工具的结果基本上都是以bam/sam文件格式作为输出的。

sam是一种纯文本文件，bam文件是压缩过的，二进制版本的sam文件。在真实的生物信息分析中，为了节约存储，我们通常以bam文件的形式存储mapping的结果。

sam文件由header部分和数据部分组成。header部分存储了参考序列，reads排列顺序，mapping所使用的命令等信息。数据部分存储了每一条read mapping结果的详细信息。希望具体了解的同学请阅读https://samtools.github.io/hts-specs/SAMv1.pdf

samtools是最早由Heng Li开发的，用于处理sam/bam文件的一个工具，目前在二代测序的数据分析被极为广泛的使用。在后续的维护中，samtools中用到的函数又被封装到了C程序库htslib中，方便开发者使用。

除了samtools之外，还有其他很多工具也提供了相似的功能，例如bamtools，GATK中的很多工具，等等。在脚本语言python和R中，也有相应的package用于解析sam/bam文件，如pysam和Rsamtools。有兴趣的同学可以自行了解。

## 1) 示例文件和环境设置

### 1a) 示例文件

示例文件请从清华云下载。

`genes.bed`: E.coli K-12基因在参考基因组NC_000913.3上的位置

`CsrA.peaks.bed`: GSE102380中提供的，根据clip-seq确定的调控因子CsrA的binding peaks

`chrom.bed`: 参考基因组NC_000913.3的长度

`SRR1573434.sampled.bam`: GSE61327中提供的E.coli K-12一个野生型样本用bowtie2 mapping后的结果

### 1b)环境配置

#### docker

我们还是交互式的进入先前的docker容器:

本节只依赖于`bedtools`和`samtools`两个软件。

容器内已经装好了`samtools`

`bedtools`我们可以下载预编译好的版本:

如果网络状况不好，可以在宿主机从清华云下载预编译的版本，通过共享目录在容器内部访问。

如果不想每次都输bedtools前面的一串路径，可以在`~/.bashrc`中将bedtools所在的目录加入环境变量:

请从清华云下载所需的数据，然后在容器内通过共享目录访问。

## 2) bedtools

我们接下来介绍怎样用bedtools实现前面提到的一些对于genomic intervals进行比较的任务

### 2.1) 取交集

`bedtools intersect`比较在一组genomic intevals和另外一组(或多组genomic inteval)的重叠情况，然后找它们重叠的区域

在默认参数下，bedtools的提供的包括intersect在内的多数工具都不考虑strand的信息，输出gemomic interval的重叠部分(至少有1nt重合就认为存在重叠)

`bedtools intersect`提供了很多可选的参数，来对软件的行为进行更精细的控制，例如:

`-s`: 当两个genomic inteval不仅位置上存在重叠，而且还在同一个strand上时，才认为存在重叠

`-f`: 当两个genomic inteval重叠的比例大于一个给定值时，才认为存在重叠

`-sorted`: `bedtools intersect`对于输入的genomic interval的次序没有强制的要求，但是如果我们的输入已经按染色体和坐标sort过，就可以通过这个参数告知bedtools使用效率更高，但只对sorted过的interval适用的算法。

如上图所示，还有很多参数可以对输出进行控制，例如：

`-wa`：相当于从A文件中过滤出和B文件有重叠的interval。

`-wa -wb`参数：对于每一个overlap，既输出第一个文件的interval的原始坐标，也输出第二个文件的interval的原始坐标。

`-v`：相当于从A文件中过滤出和B文件没有重叠的interval(类似grep的-v参数)。

`-wo`: write overlap，在每一行结果末尾统计这个重叠区域有多长

还有其他很多参数，文档有详细介绍，请自行参考

我们从示例文件出发提供下面几个例子:

### 2.2) 合并重叠或相邻的基因组区域

有的时候我们会希望把有重合的，或者是相邻的genomic inteval merge到一起。这时候就可以用到`bedtools merge`命令。

我们需要注意，`bedtools merge`强制要求输入需要按chromsome和start position排序。对于没有这样sort过的bed文件，可以用gnu sort先进行排序:

`bedtools merge`也提供了很多可选的参数，来对软件的行为进行更精细的控制

`-d`: distance，只要两个interval距离小于d，就进行merge。

`-c`结合`-o`参数: 对于需要merge的intervals，将注释到这些intervals的数据按指定的方式整合后作为结果输出。bedtools为这里所谓“指定的方式”提供了很多选项，如sum, min, max, mean,collapse,distinct,count等等。`-c`后面可以指定多列(逗号隔开)，`-o`后面可以对每一列指定相应的操作。所以`-c`结合`-o`参数可以实现一些非常灵活的功能。

在下面这个例子中，我们把同一个strand上相邻的基因merge到一起，并统计merge后的每一个interval来源于哪几个基因，来源的基因数量，以及所在的strand:

### 2.3) 差集

使用`bedtools subtract`可以从一组genomic intervals中减去另外一组genomic intervals。该命令的很多参数和intersect和merge都非常相似，不再赘述。

我们给出一个计算E.coli K-12 integenic region的例子：

### 2.4) 计算count

不难看出，统计一组genomic intervals有多少个落在另外一组genomic intervals上，实际上是在两组intervals之间做intersection的一个特例。所以这还是可以通过`bedtools intersect`来实现。

在下面这个例子中，我们统计有多少个peaks落在每一个基因上:

针对这一目的，bedtools还专门方封装了一个`bedtools coverage`命令，默认会多输出3列:

bedtools intersect还可以直接从bam文件出发统计有多少个Reads落在每一个指定的interval上面:

### 2.5) 计算genome coverage

对于一组genomic intervals，统计落在基因组每一个位置的genomic intervals的数量（即计算它们基因组上的coverage）

bedgraph格式是bed文件的一种变体(请参考https://genome.ucsc.edu/goldenPath/help/bedgraph.html)，也是genomic coverage的一种常见的存储形式。bedgraph可以直接load到igv上进行可视化。

利用`bedtools genomecov`命令，我们可以方便的从bam文件出发计算出genome coverage:

对于真核生物的RNA-seq，我们通常会加上一个`-split`参数，对于intron spanning reads,不把spanning intron的部分计入coverage中。

需要注意的是，输入的bam文件一定应当是按coordinate sort过的。如果没有sort过，bedtools genomecov并不会报错，但结果会出现问题。对于怎么sort bam文件，我们在samtools一节会详细介绍。

从bed文件出发，也可以计算genome coverage

在mapping一节中，我们用到了一个用perl语言实现的把bam文件里面aligned reads对应的interval转换成bed文件的脚本。这里`bedtools bamtobed`的作用是基本相同的。有些工具只接受bed文件，不接受bam文件，这时bamtobed的转换就能派上用场。当然我们这里只是为了举例，`bedtools genomecov`两种文件格式都可以接受的。

从bed文件出发计算genome coverage还需要提供一个记录每一条染色体长度的文件。之所以从bam文件出发不需要这个输入，是因为bam的header里面就有染色体长度的信息。

## 3) samtools

本章中我们介绍samtools最常用的几个命令:

view

sort

index

flagstat

### 3.1 ) view

view命令的主要功能是在sam和bam文件之间进行转换，以及根据每一个alignment record的flag，位置，指定tag，mapping质量等多种指标对bam文件的alignment record进行filter。它还提供了对bam文件进行sub sampling等功能。

(1) sam/bam文件互相转换

bam文件是二进制文件，如果我们用`head`一类的命令查看，看到的东西会像是一堆乱码。如果我们想查看bam文件数据部分的前几行，正确的做法是`samtools view input.bam | head`。

下面给出了其他一些例子:

(2) sam/bam filtering

bam文件中每一个record的flag用一组二进制数记录了每一个read的mapping状况，例如是否unmapped，mapping到forward strand还是reverse strand；对于paired end reads，当前record对应第一个mate还是第二个mate，于当前alignment的read paired的那条read是否是unmapped，等等。

博德研究所的这个网页对sam/bam文件flag的定义给出了一个非常好的总结，供大家参考。

`samtools view`的`-F`,`-f`和`-G`三个参数允许我们根据flag对bam文件进行各种各样的filtering。

`-f`: INT, only include reads with all of the FLAGs in INT present [0]

`-F`: INT, only include reads with none of the FLAGS in INT present [0]

`-G`: INT, only EXCLUDE reads with all of the FLAGs in INT present [0]

例如:

samtools view还允许根据除了flag之外的多种指标进行filter，例如mapping quality, bam record的tag等等。

### 3.2 ) sort

sort对bam文件中的alignment records进行排序。

有很多工具都要求输入的bam文件根据染色体位置进行排序(例如igv，以及我们前面提到的`bedtools genomecov`)，以便根据位置信息进行对mapping到特定位置的reads进行快速访问。

### 3.3 ) index

index是为了根据基因组的位置对bam文件中mapping到相应位置的alignment records进行快速访问而设计出的一种数据结构。它大致可以理解成基因组上的位置与磁盘相应alignment records所在的chunk对应的offset之间的一个look up table。所以只有当bam文件根据coordinates排序后，才能利用`samtools index`建立这种index。index文件通常有一个`.bai`后缀。

### 3.4 ) flagstat

`flagstat`对不同flag的reads个数以及所占的比例进行统计

## 4) Homework

作业所需文件可从清华云下载

（1）我们提供的bam文件`COAD.ACTB.bam`是单端测序分析的结果还是双端测序分析的结果？为什么？(提示：可以使用`samtools flagstat`）

（2）查阅资料回答什么叫做&quot;secondary alignment&quot;？并统计提供的bam文件中，有多少条记录属于&quot;secondary alignment?&quot; （提示：可以使用samtools view -f 获得对应secondary alignment的records进行统计）

（3）请根据`hg38.ACTB.gff`计算出在ACTB基因的每一条转录本中都被注释成intron的区域，以bed格式输出。并提取`COAD.ACTB.bam`中比对到ACTB基因intron区域的bam信息，后将bam转换为fastq文件。

提示：

写脚本把ACTB在gff中第三列为&quot;gene&quot;的interval放在一个bed文件中，第三列为&quot;exon&quot;的intervals放在另外一个bed文件中，再使用`bedtools subtract`。

请注意bed文件使用的是0-based coordinate，gff文件使用的是1-based coordinate。

鼓励其他实现方法，描述清楚过程即可

(4) 利用`COAD.ACTB.bam`计算出reads在ACTB基因对应的genomic interval上的coverage，以bedgraph格式输出。 （提示：对于真核生物转录组测序向基因组mapping得到的bam文件，bedtools genomecov有必要加-split参数。）
Previous1.1 Genome BrowserNext2.RNA-seq
Last updated 3 years ago

Was this helpful?
