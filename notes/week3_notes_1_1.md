# 1.Blast

## 1) 简介

* 同源搜索是生物信息最基本的分析之一。blast在很多年来都是用来实现这一任务的一个很受欢迎的工具。
* 在本节中，我们将学习如何利用网页版和本地版的blast进行蛋白和核酸的同源搜索。

## 2) 文件格式

* fasta文件是存储生物序列最常见的一种文件格式。下面就展示了一个包含一条蛋白质序列的fasta文件的内容:

```
>gi|47115317|emb|CAG28618.1| VIM [Homo sapiens]
MSTRSVSSSSYRRMFGGPGTASRPSSSRSYVTTSTRTYSLGSALRPSTSRSLYASSPGGVYATRSSAVRL
```

* 一个fasta文件可以包含多条序列。在fasta文件中，以">"开头的行记录了序列id等相关的信息，这一行之后直到下一个以">"开头的行之前，记录着该序列id对应的序列数据。
* 一条序列可以横跨多行，但是在这种情况下每行包含序列的最大长度通常是固定的。（就不会很难看。如每行最多70个）

```
>AALT01209640.1:567:377
AUCGCUUCUCGGCCUUUUGGCUAAGAUCAUGUGUAGUAUCUGUUCUUAUCAGUUUAAUAUCUGAUACGUC
CUCUAUCAGAGGACAAUAUAUUAAAUGGAUUUUUGGAAUUAGGAGUUGGAAUAGGAGCUUGCUCCGUCCA
CUCCACGCAUCGACCUGGUAUUGCAGUACUUCCAGGAACGGUGCACCCCCU
>AAFR03033875.1:20528:20718
AUCGCUUCUCGGCCUUUUGGCUAAGAUCAAGUGUAGUAUCUGUUCUUAUCAGUUUAAUAUCUGAUACGUC
CUCUAUCCGAGGACAAUAUAUUAAAUGGAUUUUUGAAACAGGGAGUCGGAAUAGGAGCUUGCUCCGUCCA
CUCCACGCAUCGACCUGGUAUUGCAGUACUUCCAGGAACGGUGCACUUCCC
```

### 2a) Inputs

| Format | Description                     | Notes                    |
| ------ | ------------------------------- | ------------------------ |
| fasta  | contains gene name and sequence | gene name start with `>` |

### 2b) Outputs

| Format | Description               | Notes |
| ------ | ------------------------- | ----- |
| blastp | query aligned to database | -     |

## 3) Blast in *Terminal*

### 3a) Prepare

#### Step 1: 进入到docker容器

docker images的下载链接如[附表](https://book.ncrnalab.org/teaching/appendix/appendix-iv.-teaching#teaching-docker)所示

```bash
docker exec -it bioinfo_tsinghua bash
```

#### Step 2: 进入到工作目录

以下步骤均在 `/home/test/blast/` 下进行

```bash
cd /home/test/blast/
```

#### Step 3: 准备一个输出目录

```bash
mkdir output
```

### 3b) Pairwise sequence alignment

#### Protein sequence alignment

利用 `blastp` 进行蛋白质比对

```bash
blastp  -query protein/VIM.fasta  -subject protein/NMD.fasta   -out output/blastp
```

`VIM.fasta` 与 `NMD.fasta` 分别是金属beta酶家族的两个蛋白的序列。

{% hint style="info" %}

* 蛋白的同源搜索通常比基于核酸的序列搜索更灵敏。
* query和subject都是fasta文件，可以包含多个序列
* 如果不提供`-out`参数,blastn会将结果输出到终端屏幕上。
* blastp可以指定输出的格式，如果不需要输出序列具体通过哪种方式比对到一起，只需要输出对每个hit对应query和subject的区域，以及显著性等信息，可以指定`-outfmt 6`参数。
* blastp有大量可选的参数，大家有兴趣可以通过`blastn -help`自行了解。
  {% endhint %}

#### DNA sequence alignment

利用 `blastn` 进行核酸序列比对

```bash
blastn -query dna/H1N1-HA.fasta -subject dna/H7N9-HA.fasta -out output/blastn
```

`H1N1-HA.fasta` 与 `H7N9-HA.fasta` 是两种流感病毒的序列。

### 3c) Align a sequence to a remote database

我们也可以在命令行搜索ncbi的远程数据库。在网络环境不好的时候容易报错，可以跳过。

#### 用蛋白序列在pdb数据库远程进行同源搜索

```bash
blastp  -query protein/VIM.fasta  -db pdb -remote -out output/blastp_remote
```

#### 用核酸序列在nt数据库远程进行同源搜索

```bash
blastn  -query dna/H1N1-HA.fasta  -db nt -remote -out output/blastn_remote
```

### 3d) Align a sequence to a local database

例如：在yeast基因组序列中搜索Yeast.fasta序列

#### Step 1: 建立blast的数据库

```bash
makeblastdb -dbtype nucl -in dna/YeastGenome.fa -out database/YeastGenome
```

* `-dbtype`: 待建库的类型(核酸:`nucl`,蛋白:`prot`)
* `-in`: 待建库的序列文件
* `-out`: 数据库前缀

#### Step 2: 比对

```bash
blastn -query dna/Yeast.fasta -db database/YeastGenome -out output/Yeast.blastn
```

## 4) Tips/Utilities for blast in *Terminal*

### 4a) View the results

你可以利用 `more`, `less`等命令或者利用`vi`等文本编辑工具查看结果文件。

### 4b) A better view of fasta file

```bash
less -S dna/H1N1-HA.fasta  # chop long lines rather than wrap them (记得按 q 退出）
```

### 4c) install blast (including blastn, blastp, etc)

> **Note: Docker 中已经装好**

#### 安装方式1-自动安装（推荐方式）

Ubuntu 自动安装软件方法： `sudo apt-get install ncbi-blast+`

> 这里 blast 由 `ncbi-blast+` 提供

#### 安装方式2-手动安装

[Download link](ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/LATEST/)

寻找类似如下文件：

* 32位计算机（老机器）安装文件：如 `ncbi-blast-2.2.28+-ia32-linux.tar.gz`
* 64位机器安装文件： 如 `ncbi-blast-2.2.28+-x64-linux.tar.gz`

> 可以通过 `uname -a` 查看机器类型是64还是32位

## 5) Blast online

首先，进入NCBI官网在线[BLAST](https://blast.ncbi.nlm.nih.gov/Blast.cgi)，显示如下图所示界面，选择一种序列比对类型，然后根据提示进行序列比对。

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfiFw7_w5LpdbR5%2Fblastweb.png?generation=1540298184195545\&alt=media)

### 5a) Input sequence

Input the following sequences:

```
MSTRSVSSSSYRRMFGGPGTASRPSSSRSYVTTSTRTYSLGSALRPSTSRSLYASSPGGVYATRSSAVRL
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfktIJLTR6IhcnY%2Fblastweb2.png?generation=1540298184173034\&alt=media)

### 5b) Select database

Select "Non-redundant Protein Sequences (nr)"

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfmQOp8DdKXBp1T%2Fblastweb3.png?generation=1540298184180396\&alt=media)

### 5c) Select algorithm

Select "blastp"

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfozvYqcvpanY8v%2Fblastweb4.png?generation=1540298184259217\&alt=media)

### 5d) Output results

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfqUxebwCk2Bh2s%2Fblastweb5.png?generation=1540298184096139\&alt=media)

### 5e) Output table

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfsm1rzvrgrG6Df%2Fblastweb6.png?generation=1540298184179789\&alt=media)

### 5f) Alignment details

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfuhSj2Y6n78JS1%2Fblastweb7.png?generation=1540298184221099\&alt=media)

## 6) Homework

对于序列`MSTRSVSSSSYRRMFGGPGTASRPSSSRSYVTTSTRTYSLGSALRPSTSRSLYASSPGGVYATRSSAVRL`:

1\) 请使用网页版的 blastp, 将上面的蛋白序列只与 mouse protein database 进行比对， 设置输出结果最多保留10个， E 值最大为 0.5。将操作过程和结果截图，并解释一下 E value和 P value 的实际意义。

2\) 请使用 Bash 脚本编程：将上面的蛋白序列随机打乱生成10个， 然后对这10个序列两两之间进行 blast 比对，输出并解释结果。（请上传bash脚本，注意做好重要code的注释；同时上传一个结果文件用来示例程序输出的结果以及你对这些结果的解释。）

> **注：** blast的网站会提供多个mouse的databases，可以任选1个进行比对；也可以重复几次，每次选一个不同的database看看不同的输出结果，可以在作业中比较和讨论一下输出结果不同的原因。

3）解释blast 中除了动态规划（dynamic programming）还利用了什么方法来提高速度，为什么可以提高速度。

4）我们常见的PAM250有如下图所示的两种（一种对称、一种不对称），请阅读一下 "Symmetry of the PAM matrices" @ [wikipedia](https://en.wikipedia.org/wiki/Point_accepted_mutation#Symmetry_of_the_PAM_matrices)，再利用Google/wikipedia等工具查阅更多资料，然后总结和解释一下这两种（对称和不对称）PAM250不一样的原因及其在应用上的不同。

> PAM matrices are also used as a scoring matrix when comparing DNA sequences or protein sequences to judge the quality of the alignment. This form of scoring system is utilized by a wide range of alignment software including [BLAST](https://en.wikipedia.org/wiki/BLAST). — wikipedia

[对称的PAM250](https://en.wikipedia.org/wiki/Point_accepted_mutation#An_example_-_PAM250):

![对称的PAM250](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LqEVVbDNOMSCDAHVHn4%2F-LpX87W7Ta_rUF45LOv-%2FPAM250-1.png?generation=1570070730789688\&alt=media)

[不对称的PAM250](http://www.deduveinstitute.be/~opperd/private/pam250.html):

![不对称的PAM250](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LqEVVbDNOMSCDAHVHn4%2F-LpX87W5XGh3OQm8vBOZ%2FPAM250-2.png?generation=1570070730810243\&alt=media)

> Figure 83. Atlas of Protein Sequence and Structure, Suppl 3, 1978, M.O. Dayhoff, ed. National Biomedical Research Foundation, 1979

## 7) Teaching Videos

* see Videos in the \*\*\*\* [**Files needed**](https://courses.ncrnalab.org/files)

## Have a break

**Jim Kent**

![Jim Kent](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvFfw7xAWjzML_nuw%2Fjim.png?generation=1540298184008318\&alt=media)

Jim Kent 1960年生于夏威夷，在旧金山长大。

Kent的编程生涯始于23岁，1983年Kent开始在Island Graphic Inc工作。当时Kent为Amiga家用电脑编写了一个能够结合3D渐变效果与2D简单动画的软件。

1985年他干脆自己开了一家软件公司 Dancing Flame, 将之前自己写的动画程序创建成为一个汇集各种动画和绘画功能的程序Cyber Paint，为CAD-3D开发提供便利。这是是第一个允许用户跨时间制作压缩视频的软件。之后他还开发了软件Autodesk Animator用于个人电脑中，可以为各种视频游戏创作艺术作品。\
2000年Kent在攻读加州大学圣克鲁兹生物学博士学位，此时人类基因组计划进行到后期，他写出了GigAssembler, 帮助人类基因组项目能够拼装和发布人类基因组序列。

在GigAssembler之后，Kent继续编写BLAT（BLAST-like alignment tool）和参与维护UCSC Genome Browser 来帮助分析重要的基因组数据。目前，Kent仍然在UCSC工作，主要是在网络工具上帮助理解人类基因组。他帮助维护和升级浏览器，并致力于比较基因组学， Parasol，UCSC kilocluster的运营和ENCODE项目。
