# Practice Guide
**用Linux的一些简单命令查看GTF/GFF基因组注释文件的基本信息，并学会对文件中数据进行提取，利用提取到的数据计算需要的信息（例如计算基因的总长度等）**

## gff/gtf文件格式和tab分隔符
gff/gtf文件是用于基因组注释的两种比较常见的文件格式。

这两种文件格式非常相似，都是由9列组成，每一列的内容都比较相似，在第9列的写法上有一些小的差别。

### 9列数据的含义
- seqname: 序列/染色体名称
- source: 基因注释的来源
- feature: 特征的类型，在不同的注释文件中有所差异
- start: 起始位置坐标(从1开始，闭区间)
- end: 终止位置坐标(从1开始，闭区间)
- score: A floating point value
- strand: + for forward strand, - for reverse strand
- frame: '0', '1' 或 '2'. '0' indicates that the first base of the feature is the first base of a codon, '1' that the second base is the first base of a codon, and so on..
- attribute: 附加的注释信息，由一系列键值对组成，如基因ID，基因名，基因类型，特征之间的层次关系(如转录本所属的基因，外显子所属的转录本)等等

> 如果某一列的信息不存在，可用'.'填充

- e.g. (来源于ensembl plant的拟南芥基因组注释):
- GFF(general feature format)
```
1	araport11	gene	3631	5899	.	+	.	ID=gene:AT1G01010;Name=NAC001;biotype=protein_coding;description=NAC domain-containing protein 1 [Source:UniProtKB/Swiss-Prot%3BAcc:Q0WV96];gene_id=AT1G01010;logic_name=araport11
1	araport11	mRNA	3631	5899	.	+	.	ID=transcript:AT1G01010.1;Parent=gene:AT1G01010;biotype=protein_coding;transcript_id=AT1G01010.1
1	araport11	five_prime_UTR	3631	3759	.	+	.	Parent=transcript:AT1G01010.1
1	araport11	exon	3631	3913	.	+	.	Parent=transcript:AT1G01010.1;Name=AT1G01010.1.exon1;constitutive=1;ensembl_end_phase=1;ensembl_phase=-1;exon_id=AT1G01010.1.exon1;rank=1
1	araport11	CDS	3760	3913	.	+	0	ID=CDS:AT1G01010.1;Parent=transcript:AT1G01010.1;protein_id=AT1G01010.1
```

GTF(gene transfer format)
```
1	araport11	gene	3631	5899	.	+	.	gene_id "AT1G01010"; gene_name "NAC001"; gene_source "araport11"; gene_biotype "protein_coding";
1	araport11	transcript	3631	5899	.	+	.	gene_id "AT1G01010"; transcript_id "AT1G01010.1"; gene_name "NAC001"; gene_source "araport11"; gene_biotype "protein_coding"; transcript_source "araport11"; transcript_biotype "protein_coding";
1	araport11	exon	3631	3913	.	+	.	gene_id "AT1G01010"; transcript_id "AT1G01010.1"; exon_number "1"; gene_name "NAC001"; gene_source "araport11"; gene_biotype "protein_coding"; transcript_source "araport11"; transcript_biotype "protein_coding"; exon_id "AT1G01010.1.exon1";
1	araport11	CDS	3760	3913	.	+	0	gene_id "AT1G01010"; transcript_id "AT1G01010.1"; exon_number "1"; gene_name "NAC001"; gene_source "araport11"; gene_biotype "protein_coding"; transcript_source "araport11"; transcript_biotype "protein_coding"; protein_id "AT1G01010.1";
1	araport11	start_codon	3760	3762	.	+	0	gene_id "AT1G01010"; transcript_id "AT1G01010.1"; exon_number "1"; gene_name "NAC001"; gene_source "araport11"; gene_biotype "protein_coding"; transcript_source "araport11"; transcript_biotype "protein_coding";
```

> Tips： 生物信息中的很多数据都是以表格的形式呈现的，也就是说有清晰的行列之分。列和列之间一般用tab分隔符(键盘上的tab按键）分开，而不是一个空格键分开。

## linux命令练习
1. Linux命令行格式通常写法

**命令_（空格）选项（空格）_参数1 参数2...**

```bash
mv -f folder1 folder2    #实际使用时将folder1替换为需要移动的文件夹，folder2替换为希望移动到的位置。
```

> 注意：命令、选项、参数之间一定要用空格来区分！

2. 两种表达方式：短格式 vs 长格式
  - 短格式的命令选项：用一个 - 和一个单个英文字母表示, 如 -a。
  - 长格式的命令选项：用两个 - 和一个英文单词表示, 如 --help。

即`ls -h`与`ls --help`或者`ls -a`与`ls --all`所起的作用都是相同的。

3. `cd`——进入工作目录

```bash
cd           #cd后面为空时，进入默认家目录    
cd ~/linux   #工作目录名称，这里为本章工作目录 ~/linux，TAB键可进行名称自动补全，推荐经常使用
```

一般的程序后面都要输入文件位置和名称，告知程序输入和输出是什么：

./filename 指当前目录下的文件 ../filename 指上一级目录下的文件 ../../filename 指上两级目录下的文件.

4. "`|`"是管道命令操作符，它可以将左边命令传出的正确输出信息（standard output）作为右边命令的标准输入（standard input）。

5. 建议在对`*.gtf`文件执行的一些命令行Inputs末尾加上`| head -n`或者`| tail -n`，然后Outputs会自动显示文件前n行或者后n行；否则，屏幕会被刷屏。

6. 星字符：*可以代表任何字符，称之为wildcard。

**重点和难点：**

`awk`，`cat`，`cut`，`grep`，`wc`其参数的用法是本章学习的，也是主要的homework之一。

---

# Linux 命令行教程：GTF 文件处理

## step0. 准备：解压缩`.gtf`文件
```bash
cd ~/linux
gunzip 1.gtf.gz
ls  # check if 1.gtf.gz has been unzipped to 1.gtf
```

## step1. 查看文件基本信息
尝试输入以下命令，分别查看 `1.gtf` 文件的开头、结尾、文件的大小、行数等基本信息。

```bash
cat 1.gtf | head  #显示1.gtf文件前10行
cat 1.gtf | tail  #显示1.gtf文件后10行
cat 1.gtf | head -15  #显示1.gtf文件前15行(输入值15可以用其他整数替代)

ls -lh 1.gtf  #显示1.gtf文件的大小
wc -l 1.gtf  #统计1.gtf文件行数

#用grep -v排除comment line(以#开头的部分)以及长度为0的空白行
# '^'匹配行首，'$'匹配行尾
# '^#'匹配行首为'#'的行
# 如果'^$'可以匹配到某一行，则表示该行为空行(行首紧接着行尾，之间没有其他字符)
grep -v "^#" 1.gtf | grep -v '^$' | wc -l 

# 过滤空白空行(除了换行符还可能包括空白字符，如空格和制表符的行)，显示前10行结果
# '\s'匹配空白字符，'*'表示这样的字符会出现0次到多次
# '^\s*$'表示在一行的开始和结束之间只有0到多个空白字符
cat 1.gtf | awk '$0!~/^\s*$/{print}' | head -10
grep -v '^\s*$' 1.gtf | head -10
```

---

> `awk '$0!~/^\s*$/{print}'` 是一个用于过滤文本行的命令，它会删除所有空行或只包含空白字符（空格、制表符等）的行，并输出剩余的行。
  - `awk` 命令通常由**模式**（pattern）和**动作**（action）组成，格式为：
  ```
  awk 'pattern { action }' 文件名
  ```

  - 对于输入的每一行，如果该行匹配 `pattern`，就执行 `{ action }`。
  - 如果省略 `pattern`，则每一行都执行 `action`。
  - 如果省略 `{ action }`，默认动作是 `{ print }`，即打印整行。
  - `$0!~/正则/` 的意思是：如果当前行**不匹配**给定的正则表达式，则条件为真。
    - `$0` — 当前行的全部内容
    - `~` 表示“匹配”后面的正则表达式。
    - `!~` 表示“**不匹配**”后面的正则表达式
  - `/^\s*$/` — 正则表达式，用于匹配那些**全是空白字符的行**。
    - `^`：匹配行的开头。
    - `\s`：匹配任何空白字符，包括空格、制表符等（在 `awk` 中，`\s` 是 POSIX 字符类，需要 `awk` 支持，通常 GNU awk 支持）。
    - `*`：表示前面的字符（`\s`）出现**零次或多次**，即可以有零个或多个空白字符。
    - `$`：匹配行的结尾。
  - 合起来，`^\s*$` 匹配从行首到行尾只有空白字符（或完全没有字符）的行。例如：
    - 完全空行（`\n`）也匹配（因为 `\s*` 可以匹配零个空白）。  
    - 只包含几个空格的行也匹配。  
    - 只包含制表符的行也匹配。
  - `{print}` 是 `awk` 的打印动作，默认打印当前行（即 `$0`）。由于前面有条件 `$0!~/^\s*$/`，所以只有**不匹配**空行/空白行的行才会被执行 `print`。
  - `awk '$0!~/^\s*$/{print}'` 会逐行读取输入，如果当前行**不是**空白行或仅空白字符的行，就打印该行。这相当于一个**过滤空白行**的命令。
  - 等效写法  
    - 可以省略 `{print}`，因为它是默认动作：`awk '$0!~/^\s*$/'` 效果相同。  
    - 也可以用其他方式实现相同功能，例如 `grep -v '^\s*$'`。

---

## step2. 数据提取
首次尝试，先复制以下命令，分别提取 `1.gtf` 文件的特定列、行等数据信息；观察输出结果，然后建议尝试修改以下命令中的参数，进行更多的练习。

### step2.1 筛选特定的列
```bash
#选取1-3列的数据（以下两种命令都可以）
# awk的默认行分隔符为空格" "和制表符"\t"
# awk将每一行按分隔符分割成列后，第1,2,3列的数值可通过$1,$2,$3获取 ($0代表整行的内容)
cat 1.gtf | awk ' { print $1, $2, $3 } ' | head
# cut的默认分隔符为"\t"
cat 1.gtf | cut -f 1,2,3 | head

#例如我只需要GTF文件的第1,34,5列也就是chr,feature,start,end。
cut -f 1,3,4,5 1.gtf | head
```

---

> `cut` 是一个用于从文本文件或标准输入中**截取**特定列（字段）、字符或字节的命令。它的“几种”通常指根据不同的切割方式，主要选项如下：
  1. **按字段（列）切割 `-f`**（最常用）
  - `-f` 指定要提取的字段（列），默认字段分隔符为 **制表符（Tab）**。
  - 常与 `-d` 一起使用，指定自定义分隔符。
  **示例：**
```bash
# 提取以制表符分隔的第1和第3列
cut -f 1,3 file.txt
# 提取以逗号分隔的第2到第5列（范围）
cut -d ',' -f 2-5 file.csv
# 提取第1列及之后的所有列
cut -f 1- file.txt
```
  2. **按字符位置切割 `-c`**
  - `-c` 指定要提取的字符位置（每个字符算一个位置，包括空格和制表符）。
  - 适合固定宽度的文本文件。
  **示例：**
```bash
# 提取每行的第1到第5个字符
cut -c 1-5 file.txt

# 提取第1,3,5个字符
cut -c 1,3,5 file.txt
```
  3. **按字节位置切割 `-b`**
  - `-b` 与 `-c` 类似，但以**字节**为单位（在 ASCII 字符集下与 `-c` 相同，但在多字节字符（如中文）下会有差异）。
  - 较少用，一般处理二进制文件或特定编码时考虑。
  **示例：**
```bash
# 提取每行的前10个字节
cut -b 1-10 file.txt
```
  4. **指定分隔符 `-d`**
  - `-d` 后面跟分隔符，用于与 `-f` 配合。默认分隔符为制表符（Tab）。
  - 分隔符可以是单个字符，如 `-d ':'`。
  **示例：**
```bash
# 以冒号分隔，提取第1和第7字段（常用于/etc/passwd）
cut -d ':' -f 1,7 /etc/passwd
```
  5. **补充选项**
  - `--complement`：反向选择，即输出**没有被** `-f/-c/-b` 选中的部分。
  - `--output-delimiter`：指定输出时使用的分隔符（默认与输入相同）。
  **示例：**
```bash
# 输出除了第1列之外的所有列，并用空格分隔
cut -f 1 --complement --output-delimiter=' ' file.txt
```

---

### step2.2 筛选特定的行
```bash
# 假设我们想要提取第三列是gene的行,并且只显示第1，3，9这几列信息。
# awk对于每一行都按默认行分隔符分隔成列,对于第3列等于"gene"的行，打印出1, 3, 9列
cat 1.gtf | awk '$3 =="gene" { print $1, $3, $9 } ' | head
```

## step3. 提取和计算特定的 feature
这一阶段是在学会 step2 的基础上，进一步的学习。首次尝试，先复制以下命令，观察输出结果，然后建议尝试修改以下命令中的参数，进行更多的练习。

### step3.1 提取并统计 feature 类型
```bash
grep -v '^#' 1.gtf | awk '{print $3}'| sort | uniq -c  #提取并计数有多少类feature
```

### step3.2 计算特定 feature 特征长度
```bash
# 第5列的数值减去第4列的数值后+1，即得到特征feature的长度
# gff/gtf文件的坐标从1开始，范围为闭区间 (我们之后会遇到的bed文件坐标从0开始，范围左闭右开)
cat 1.gtf | awk ' { print $3, $5-$4 + 1 } ' | head 

#计算所有CDS的总长度
cat 1.gtf | awk 'BEGIN{size=0;}$3 =="CDS"{ len=$5-$4 + 1; size += len; print "Size:", size } ' | tail -n 1
#或者用awk只在最后输出统计的结果:
cat 1.gtf | awk 'BEGIN{L=0;}$3 =="CDS"{L+=$5-$4 + 1;}END{print L;}'
#或者利用awk自动初始化的特性:
cat 1.gtf | awk '$3 =="CDS"{L+=$5-$4 + 1;}END{print L;}'
```

1. 基础命令（逐步累加并输出中间结果）
```bash
cat 1.gtf | awk 'BEGIN{size=0;} $3=="CDS"{ len=$5-$4+1; size+=len; print "Size:", size }' | tail -n 1
```
  - **`BEGIN{size=0;}`**：在处理第一行前初始化累加器 `size` 为 0。
  - **`$3=="CDS"`**：筛选第三列为 `"CDS"` 的行（GTF 特征类型）。
  - **`len=$5-$4+1`**：计算当前 CDS 的长度（结束 - 开始 + 1，因为 GTF 坐标闭区间）。
  - **`size+=len`**：累加到 `size` 中。
  - **`print "Size:", size`**：每处理一个 CDS 就输出一次当前累加值。
  - **`tail -n 1`**：只保留最后一行（即最终总长度）。

2. 优化版（只在最后输出一次结果，更高效）
```bash
cat 1.gtf | awk 'BEGIN{L=0;}$3 =="CDS"{L+=$5-$4 + 1;}END{c}'
```
  - **`$3=="CDS"{L+=$5-$4 + 1;}`**：累加所有 CDS 长度，不输出中间值。
  - **`END{print L;}`**：文件处理完后输出总长度。

3. 直接从文件读取（避免 `cat`）
```bash
awk '$3=="CDS"{ total += $5 - $4 + 1 } END{ print total }' 1.gtf
```

4. 添加条件
```bash
awk '$3=="CDS" && $1=="I"{ total += $5 - $4 + 1 } END{ print "Chr1 CDS total:", total }' 1.gtf
```
  - 增加 `&& $1=="I"` 条件，只处理第一列为 `I` 的行。

5. 关键点总结
  - **`BEGIN` 块**：用于初始化变量，只在程序开始时执行一次。
  - **变量生命周期**：`total` 在 `BEGIN` 中初始化后，在整个处理过程中持续存在，每次匹配行都会更新。
  - **`END` 块**：在所有行处理完后执行，适合输出最终统计结果。
  - **GTF 坐标**：第4列（起始）、第5列（结束），长度计算公式 `$5-$4+1`。

```bash
#计算1号染色体cds的平均长度
# awk既可从pipe中读取输入，也可从文件中读取输入
awk 'BEGIN  {s = 0;line = 0;}$3 =="CDS" && $1 =="I"{ s += $5-$4+1;line += 1}END {print "mean="s/line}' 1.gtf
```

> **awk 补充说明**  
> awk本身就是一种编程语言，由于语言本身的特性，它很容易用少量的代码实现比较复杂的操作，但是一旦代码过长，可读性就会变得相对比较差，所以在命令行中使用是比较常见的做法。  
> 一个完整的 awk 命令类似我们计算1号染色体 cds 的平均长度的例子，可以写成如下的形式:  
> `awk 'BEGIN {...}condition 1{ ...}condition 2{...}condition 3{...}END{...}'`  
> - `BEGIN` 代码块的执行是独立于输入内容的，我们可以用它来定义一些自定义变量，或者修改默认输入行分隔符(FS)和输出行分隔符(OFS)等内建变量。  
>   例如如果我们希望 awk 把逗号作为输入分隔符，分号作为输出分隔符，我们可以写成:  
>   `awk 'BEGIN {FS=",";OFS=";";}{print $1,$2,$3;}'`  
> - 中间的主代码块可以有很多个，它真正对输入内容进行操作。对于输入的每一行，如果满足代码块前定义的条件，就对该行执行代码块的内容。  
>   对于每一行，awk 会顺次考虑每一个主代码块。例如如果第一行符合 condition 1，awk 执行 condition 1 后的代码块之后，还会再判断第一行是否符合 condition 2, condition 3... 而并不会直接跳到下一行  
>   如果我们希望 awk 只对符合条件的第一个代码块执行操作，我们需要使用 next 语句跳过后续的代码块:  
>   `awk 'BEGIN {...}condition 1{ ...;next;}condition 2{...;next;}condition 3{...}END{...}'`  
> - `END` 代码块的执行是独立于输入内容的，我们可以用它来输出一些统计的结果。  
>   在最简单的例子中，如在输入分隔符为 "\t" 打印每行的 1,2,3 列时，BEGIN, END 都可以省略，只需要一个无条件的主代码块:  
>   `awk '{print $1,$2,$3;}'`  
> awk的简便性得益于大量针对表格数据处理设计的内建变量和内建操作，甚至有时变量都不需要初始化(但这一定程度上也降低了代码的可读性)。  
> 对于第一次接触 linux 的同学，awk的学习曲线相对其他命令可能会比较陡峭，如果不能很好的理解也可以暂时忽略。如果希望对 awk 进行更深入的了解，请自行参阅它的文档。

### step3.3 分离并提取基因名字
```bash
# 从gtf文件中分离提取基因名字，并计算其长度
# split时awk的一个内建的函数，由于根据指定分隔符分割字符串。它接受输入字符串，输出列表和分隔符三个参数
# 这里x是输出的列表，在awk中并不需要事先声明
# awk的列表下标是从1开始的
# gsub也是awk的一个内建函数，用于替换
# gsub("\"", "", name)是为了去除name中的引号。`"`在awk中本身是一个特殊字符。`\`为转义符号，`\"`告诉awk把这里的"当作普通字符看待
cat 1.gtf | awk '$3 == "gene"{split($10,x,";");name = x[1];gsub("\"", "", name);print name,$5-$4+1}' | head
```

## step4. 提取数据并存入新文件
这一阶段主要是学会提取数据并存入新文件，例如，寻找长度最长的 3 个 exon, 汇报其长度。  
这里介绍两种方法。  
第一种是直接提取并计算最长 3 个 exon, 汇报其长度，存入 .txt 文件；  
第二种方法是写一个可执行文件 `run.sh`，寻找长度最长的 3 个 exon，汇报其长度。

### step4.1 提取数据存入 txt 文件示范
我们使用输出重定向操作符 `>` 将默认会打印到终端屏幕上的内容存入一个磁盘文件 `1.txt` 中。
```bash
grep exon 1.gtf | awk '{print $5-$4+1}' | sort -n | tail -3 > 1.txt
```
如果 `1.txt` 是一个原本存在的文件，输出重定向操作符 `>` 输出的内容会覆盖原有文件。  
如果我们希望在重定向的文件存在时，将输出内容追加到该文件中，而不是覆盖原有文件，可使用 `>>` 操作符。  
然后输入命令 `less 1.txt` 或者 `vi 1.txt` 则可进入 vi 一般模式界面显示输出结果。  
vim 简单使用教程详见 Tips，此时,在英文输入法状态下按 `:q` 或 `:wq` 可以退回到终端 shell 窗口。  
在输入 `less` 查看文件时，也可以使用 `q` 退出查看模式。  
将 `1.txt` 拷贝到 `/home/test/share`，就可以在宿主机的共享目录查看 `1.txt` 文件。

### step4.2 可执行文件编辑示范
第一步，输入命令，进入 vi 编辑界面。
```bash
vi run.sh
```
第二步，按 `i` 键切换至 insert 模式后，写下 `run.sh` 的文件内容如下：
```bash
#!/bin/bash   
grep exon *.gtf | awk '{print $5-$4+1}' | sort -n | tail -3
```
第一行的 `#!/bin/bash` 告诉操作系统用 `/bin/bash` 作为解释器来运行脚本  
第三步，按 `Esc` 或 `ctrl+[` 切回普通模式，输入 `:wq` 退出 vi 编辑器，在命令行后键入：
```bash
#赋予脚本可执行的权限
chmod u+x run.sh
#运行脚本
./run.sh
```
由于我们加上了 `#!/bin/bash` 一行，操作系统会用 `/bin/bash` 来运行脚本。如果没有给 `run.sh` 可执行的权限，运行 `./run.sh` 会提示 permission denied。但是如果手动指定解释器，使用 `bash run.sh`，也是可以正常运行的。  
输出与 `1.txt` 的内容一致。

