# 1.Blast

## 1) 简介

* 同源搜索是生物信息最基本的分析之一。blast在很多年来都是用来实现这一任务的一个很受欢迎的工具。
* 在本节中，我们将学习如何利用网页版和本地版的blast进行蛋白和核酸的同源搜索。
* **BLAST 的本质是一种启发式算法（Heuristic Algorithm）。它的核心诉求是：通过牺牲寻找绝对最优解的数学保证，来换取计算速度的指数级提升。 它基于一个基本的生物学前提：具有同源关系的序列之间，必然存在高度保守的短序列片段。**
* BLAST 的执行过程可以精确划分为三个阶段：**打字（Seeding）、寻找邻近词（Neighborhood Words）、以及延伸（Extension）** 。
  * **第一步：提取短序列字（Seeding）算法**  
    首先扫描用户输入的查询序列（Query Sequence），将其拆分为所有可能的、长度为 $W$ 的重叠短序列（称为 Words 或 k-tuples）。  
    对于蛋白质序列，默认的字长设定为 W=3。对于核酸（DNA）序列，默认的字长设定为 W=11。如果查询蛋白质序列为 PQGEFG，当 $W=3$ 时，提取出的Words集合为：PQG, QGE, GEF, EFG。
  * **第二步：构建高分邻近词表（Scoring and Neighborhood Words Formulation）**   
    这是 BLAST 考虑生物进化（突变）的关键步骤。由于基因在进化中会发生替换，算法不能只寻找完全相同的 Words。  
    BLAST 会利用替换矩阵（Substitution Matrix，如 PAM250 或 BLOSUM62），将第一步提取出的每一个 Word 与所有可能的 $W$ 长度序列进行比对打分。  
    算法设定一个阈值 $T$。只有当比对得分 $\ge T$ 的那些序列，才会被保留并加入“邻近词表”。这一步将查询序列转换成了一个包含大量高分近义序列的集合，极大地缩小了后续在数据库中的搜索范围。
  * **第三步：数据库扫描与双向延伸（Scanning and Extension）**  
    这是算法寻找最终局部比对结果的阶段。  
    扫描命中（Hit Detection）：算法在目标数据库中进行精确的快速匹配，寻找第二步生成的“邻近词表”中的序列。一旦在数据库序列中找到完全匹配的片段，该位置即被标记为一个 Hit（命中点）。  
    无空位延伸（Ungapped Extension）：以 Hit 为中心，算法开始向该序列的左、右两侧逐个碱基（或氨基酸）进行延伸比对，并累加得分。  
    终止条件（Drop-off Score）：在延伸过程中，如果遇到错配，累加得分会下降。算法会记录历史最高得分。当当前的累加得分低于历史最高得分达到一个预设的阈值 $X$（Drop-off value） 时，延伸立即停止。生成 HSP：延伸停止后，截取下来的得分最高的序列片段，被称为**HSP（High-scoring Segment Pair**，高分片段对）。
* **统计学显著性评估算法**
找出 HSP 后，必须通过统计学模型来评估这个匹配是否仅仅是由于数据库过于庞大而产生的随机重合。
  * **计算比特得分（Bit Score, \(S'\)）**：利用公式将HSP的原始得分\(S\)标准化，以消除不同替换矩阵带来的量纲差异：  
$$S' = \frac{\lambda S - \ln K}{\ln 2}$$  
（其中\(\lambda\)和\(K\)是与所用打分系统和序列背景组合相关的统计参数）。 

  * **计算期望值（E-value, \(E\)）**：E-value表示在大小为\(N\)的数据库中，纯粹出于随机概率，能够找到得分等于或大于\(S\)的比对结果的预期数量。  
$$E = m \cdot n \cdot 2^{-S'}$$  
（其中\(m\)是数据库的总有效长度，\(n\)是查询序列的有效长度）。E-value越趋近于0，说明该比对结果在生物学上的同源可信度越高。

  * **零假设与P-value**：在进行任何序列比对时，算法都会预先设立一个零假设（Null Hypothesis, \(H_0\)）：这两条被比对的序列之间没有任何进化上的同源关系，它们之间计算出的匹配得分（Score），完全是由于字母的随机排列组合“碰巧”产生的。基于这个零假设，P-value的严格数学定义是：在零假设成立的前提下，观察到当前比对得分\(S\)（或比\(S\)更极端/更高的得分）的概率。用数学语言表达即为：  
$$P\text{-val}(S) = P(x \ge S)$$  
  推论：P-value越小（越接近于0），说明“纯靠随机几率获得这么高分”的可能性就越微乎其微。当这个概率小到一定程度（通常以0.05或0.01为显著性阈值），我们在统计学上就有充足的理由拒绝零假设，从而得出结论：这两条序列的相似性不是随机发生的，它们具有真实的生物学同源关系。
  * 对比：
    * P-value（概率值）：适用场景：描述的是**一次特定的两两序列比对（Pairwise Alignment）** 中，出现该得分的概率。取值范围严格限定在 $[0, 1]$ 之间，因为它是一个概率值。
    * E-value（期望值，Expectation Value）：适用场景：这是对**多重假设检验（Multiple Testing）** 的校正。在实际操作中，你不是只比对两条序列，而是拿一条查询序列（Query）去庞大的数据库（包含成千上万条序列）中比对。即使单次比对随机产生高分的 P-value 很小，但当你尝试了百万次之后，总会“碰巧”撞上几个高分。
    * 数学关系：E-value 是基于 P-value 乘以搜索空间大小计算得出的预期命中次数。$$E = N \cdot P\text{-val}(S) = \frac{N}{2^{S'}}$$ (其中 $N$ 是搜索空间的大小，即查询序列长度 $n$ 乘以数据库总长度 $m$)。取值范围：$[0, +\infty)$。如果 $E=10$，表示在当前数据库大小下，纯靠随机几率你预计会找到 10 个具有同等得分的匹配结果；如果 $E = 10^{-5}$，表示纯靠随机你几乎不可能找到这样的匹配。


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

### 3b) Pairwise（成对） sequence alignment（双序列比对）

#### Protein sequence alignment

利用 `blastp` 进行蛋白质比对

```bash
blastp  -query protein/VIM.fasta  -subject protein/NMD.fasta   -out output/blastp
```

`VIM.fasta` 与 `NMD.fasta` 分别是金属beta酶家族的两个蛋白的序列。

- `blastp` : 这是程序的名字。结尾的 p 代表 protein（蛋白质）。如果你要比对的是氨基酸序列，就必须用这个。

- `-query protein/VIM.fasta` : `-query` 后面接的是你的“提问序列”（路径）。想象你在查字典，这就是你要查的那个单词。

- `-subject protein/NMD.fasta` : `-subject` 后面接的是“目标序列”（路径）。这是你用来对比的参照物。

- `-out output/blastp` : `-out` 后面是你给结果文件起的名字。如果不写这一段，结果会直接刷屏显示在黑框框里，不方便保存。

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

- `blastn` : 结尾的 n 代表 nucleotide（核苷酸/DNA）。原理同上：这里是拿 H1N1 流感病毒的基因和 H7N9 的基因做对比。

### 3c) Align a sequence to a remote database

我们也可以在命令行搜索ncbi的远程数据库。在网络环境不好的时候容易报错，可以跳过。

#### 用蛋白序列在pdb数据库远程进行同源搜索

```bash
blastp  -query protein/VIM.fasta  -db pdb -remote -out output/blastp_remote
```

- `-db pdb` : `-db` 代表 database（数据库）。pdb 是一个专门存放蛋白质结构的国际数据库。
- `-remote` : 这个参数非常关键！它告诉电脑：“不要在我这台破电脑里找，去 NCBI 的云端服务器找”。
- 注意：这需要联网，而且如果 NCBI 服务器人多，可能会报错或很慢。

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
* `makeblastdb` : 意思是“制造一个 Blast 数据库”。
* `-dbtype`: 待建库的类型(核酸:`nucl`,蛋白:`prot`); `-dbtype nucl` : 告诉程序你要建的是核酸库（nucleotide）。
* `-in`: 待建库的序列文件; `-in dna/YeastGenome.fa` : 输入用来当数据库的原始文件（这里是酵母基因组）。
* `-out`: 数据库前缀; `-out database/YeastGenome` : 给生成的数据库取个前缀名。

#### Step 2: 比对

```bash
blastn -query dna/Yeast.fasta -db database/YeastGenome -out output/Yeast.blastn
```

## 4) Tips/Utilities for blast in *Terminal*

### 4a) View the results

比对完了，你会发现 output/ 文件夹下多了一些文件。

你可以利用 `more`, `less`等命令或者利用`vi`等文本编辑工具查看结果文件。

### 4b) A better view of fasta file

less -S 文件名: 这是 Linux 里查看长文本的神器。  
-S 的作用是：如果一行太长，它不会自动换行乱成一团，而是让你通过左右方向键滑动查看，非常整齐。  
退出请按键盘上的 q  

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

Select "Non-redundant Protein Sequences (nr)" (这是最全的数据库，包含了几乎所有已知的蛋白序列。)

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


### 如何写函数
```
函数的名字() {
    # 这里面写你要执行的命令
    echo "正在执行任务..."
    命令1
    命令2
}
```

local 是 Bash 中用于在函数内声明局部变量的关键字。当一个变量用 local 声明后，它的作用域仅限于该函数内部，不会影响函数外部的同名变量。



## 6) Homework

对于序列`MSTRSVSSSSYRRMFGGPGTASRPSSSRSYVTTSTRTYSLGSALRPSTSRSLYASSPGGVYATRSSAVRL`:

1\) 请使用网页版的 blastp, 将上面的蛋白序列只与 mouse protein database 进行比对， 设置输出结果最多保留10个， E 值最大为 0.5。将操作过程和结果截图，并解释一下 E value和 P value 的实际意义。

2\) 请使用 Bash 脚本编程：将上面的蛋白序列随机打乱生成10个， 然后对这10个序列两两之间进行 blast 比对，输出并解释结果。（请上传bash脚本，注意做好重要code的注释；同时上传一个结果文件用来示例程序输出的结果以及你对这些结果的解释。）

> **注：** blast的网站会提供多个mouse的databases，可以任选1个进行比对；也可以重复几次，每次选一个不同的database看看不同的输出结果，可以在作业中比较和讨论一下输出结果不同的原因。

```bash
#!/bin/bash

# 定义原始序列
original_seq="MSTRSVSSSSYRRMFGGPGTASRPSSSRSYVTTSTRTYSLGSALRPSTSRSLYASSPGGVYATRSSAVRL"

# 定义函数：打乱字符串
shuffle_seq() {
    local seq="$1"
    local si=0  # start index
    local L=${#seq}  # 序列长度
    local ei=$(($L-1))  # end index
    local shuffled=""
    # 生成从 0 到 L-1 的整数，随机排序后依次取字符
    for i in $(seq $si $ei | shuf); do
        shuffled="${shuffled}${seq:$i:1}"
    done
    echo "$shuffled"
}

# 创建文件夹存放序列
mkdir -p blast_sequences
cd blast_sequences

# 生成10条随机打乱的序列，每条保存为独立的 FASTA 文件
for i in {1..10}; do
    shuffled=$(shuffle_seq "$original_seq")
    echo ">shuffled_sequence_$i" > "sequence_$i.fasta"
    echo "$shuffled" >> "sequence_$i.fasta"
done

echo "已生成10条随机打乱序列，保存在 blast_sequences/ 目录下"

# 双重循环，对所有 i<j 的序列对进行两两比对，结果汇总到一个文件
result_file="blast_results.txt"
> "$result_file"
for i in {1..10}; do
    for j in $(seq $((i+1)) 10); do
        echo "正在比对序列 $i 和序列 $j ..."
        blastp -query "sequence_$i.fasta" -subject "sequence_$j.fasta" -outfmt 6 >> "$result_file"
    done
done

exit 0
```

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
