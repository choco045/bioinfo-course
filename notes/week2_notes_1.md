# Linux 基础操作笔记·目录摘要

1. **基本知识**  
   - Linux 路径：相对路径（`.`、`..`、文件名）、绝对路径（`/` 开头）

2. **基本操作**  
   - `pwd`（当前目录）、`ls`（列表）、`tree`（树形显示）、`cd`（切换目录）

3. **创建、删除与复制文件（夹）**  
   - `touch`（创建空文件）、`mkdir`（创建文件夹）  
   - `cp`（复制）、`mv`（移动/重命名）、`rmdir`（删除空文件夹）、`rm`（删除）

4. **查看文件**  
   - `cat`（全文显示）、`wc`（统计行/字数）、`head`/`tail`（查看头尾）  
   - `more`/`less`（分页查看）

5. **文件信息提取和操作**  
   - `cut`（列提取）、`sed`（编辑替换）、`grep`（搜索）  
   - `sort`（排序）、`uniq`（去重）

6. **压缩和数据流重定向**  
   - `gzip`/`gunzip`（压缩/解压）  
   - `tar`（打包压缩）  
   - `>`（覆盖输出）、`>>`（追加输出）、`|`（管道）

7. **查看、修改文件权限**  
   - `chmod` 数字模式（如 755）与符号模式（`u+x`、`go=rx`）

8. **其他命令**  
   - `top`（系统监控）、`date`（时间）、`which`（查找命令）  
   - `ctrl-c`（终止）、`ctrl-z`（暂停）

9. **清理**

---

- 在窗口中输入`wsl`并回车。这就会直接进入默认的 Linux 发行版（通常是 Ubuntu）。  
`ymz24@choco:/mnt/c/Users/27978$`  
- 在D盘下创建一个名为 linux_files 的文件夹，把提供的所有文件（比如 test.gtf）都放到这里面。路径`D:\linux_files`  
- WSL(Windows Subsystem for Linux)会自动将你的Windows硬盘驱动器挂载到`/mnt/`目录下。你的C盘对应 `/mnt/c/` ，D盘对应 `/mnt/d/` ，以此类推  
- 使用`cd`命令切换到你的文件目录：  
```bash
cd /mnt/d/linux_files
```
- 然后运行`ls`命令，你就能看到test.gtf等所有文件了。现在可以直接使用之前笔记里学到的`cat`、`grep`、`head`等所有命令来操作这些文件了。  
```bash
cat test.gtf | head -n 5
```

---

# Linux 基本操作
| 命令 | 描述 |
| :--- | :--- |
| `man` | 查询某一命令的具体参数，例如：`man wget` |
| `mkdir` | 创建文件夹 |
| `cd` | 目录切换（注意区别相对路径与绝对路径） |
| `ls` | 显示文件夹中文件列表 |
| `cat` | 直接查看文件 |
| `wc` | 查看文件行数、字数 |
| `cut` | 取出文件中的特定列或字符 |
| `sort` | 排序 |
| `uniq` | 去重复 |
| `grep` | 文件中关键词搜索，返回行 |
| `chmod` | 修改文件的访问权限 |

# 1) 基本知识

## linux 路径

- **相对路径**（从当前目录开始）  
  - `file_name` ：当前目录下的文件  
  - `folder_name/` ：当前目录下的文件夹  
  - `..` ：上一级目录  
  - `../file_name2`：指上一级目录下的文件  
- **绝对路径**（从根目录 `/` 开始）  
  - `/home/test` ：用户家目录

# 2) 基本操作

> 可使用 `--help` 来查询，如 `ls --help`

## `pwd`显示当前目录

```bash
pwd
```

## `ls`显示文件夹中文件（夹）列表

```bash
ls        #显示当前目录下文件（夹）
ls -l     #详细列表（显示文件大小、修改时间）
ls -la    #显示全部详细格式
ls /usr/local  #显示 /usr/local 文件夹下的文件（夹）
```

## `tree`以树形结构显示文件夹

```bash
tree /usr/local  #显示 linux 文件夹下文件（夹）
```

## `cd`目录切换

```bash
cd             # cd后面为空时，进入默认家目录（这里为 `/home/test`）    
cd /usr/local  # 进入根目录(目录名输入一部分即可按TAB键自动补全，非常好用)
```

# 3) 创建、删除与复制文件（夹）

## `touch`创建文件

```bash
touch old_file
```

## `mkdir`创建文件夹

```bash
mkdir old_folder
```

## `cp`复制文件(夹)，用法：'cp SOURCE DEST'

```bash
cp old_file old_file2 # 复制文件
cp -r old_folder old_folder2  # 复制文件夹，需要加上 -r
```

> **注意**：DEST 即 destination ，目标文件/新文件。当 DEST 为文件夹且已存在时，会把 SOURCE 整个（包括其自身）复制到 DEST 中

```bash
mkdir cp_folder
cp old_file cp_folder
cp -r old_folder cp_folder
```

## `mv`重命名或移动文件（夹）

```bash
mv old_file new_file        #文件重命名。如果new_file存在，将覆盖new_file。
mv old_folder new_folder    #文件夹重命名。如果new_folder已经存在，把old_folder移动到new_folder中
mv new_file new_folder     #将文件移动到新目录
```

## `rmdir`删除文件夹

```bash
rmdir old_folder2   # 只能是空文件夹
```

## `rm`删除文件（夹）

```bash
rm old_file2                 # 删除文件
rm -r new_folder             # 删除文件夹（可以非空）
```

# 4) 查看文件

> **注**：  
> 我们准备了一个文件"test.gtf"用于下面的练习，把下文中的file_name替换为test.gtf即可。  
> 获取文件的方法见上文中的 “0) 获取文件用于练习”。

## `cat`直接查看文件

```bash
cat file_name
```

## `wc`查看文件行数、字数

```bash
wc -l file_name     #查看文件行
wc -c file_name     #查看文件字数
```

## `head`查看文件前几行

```bash
head file_name       #查看文件前 10 行（思考：为什么只显示 8 行）
head -n 6 file_name  #查看文件前 6 行
```

## `tail`查看文件后几行

```bash
tail file_name         #查看文件后 10 行
tail -n 4 file_name    #查看文件后 4 行
```

## `more/less`翻页查看文件

```bash
more file_name  # 按 d 向下翻页，翻完后（或按 q）退出 (由于文件过小，需要把终端调窄才有效果)
less file_name  # 按 d 向下翻页，u 向上翻页，q 退出
```

# 5) 文件信息提取和操作

## `cut`取出文件中的特定列或字符

```bash
cut -f 4 file_name            #取出第 4 列
cut -d ";" -f 2 file_name     # 以分号作为输入字段的分隔符（默认为制表符），取出第 2 列
```

## `sed`编辑文件

```bash
sed 's/a/A/g' file_name     #将文件中所有的 a 替换为 A
sed -n '3,6 p' file_name    #打印第3到6行
sed '2 q' file_name         #打印前2行
```

## `grep`文件中关键词搜索，返回行

```bash
grep 'CDS' file_name       #显示匹配上 'CDS' 的所有行
grep -v 'CDS' file_name    #显示没有匹配上'CDS'的所有行
grep -w 'gene' file_name   # 必须与整个字匹配 (思考第 8 行中的 gene_id 包含 gene，为什么没有显示这一行)
```
> **Tips**: `-w`是 word match（整词匹配）的意思，它匹配的是「完整的单词」，而不是单词中的一部分。  
Linux 里定义 “完整单词” 的规则很简单：单词的边界是：空格、制表符、换行、标点、符号（比如 _、-、= 等）  只有当 gene 作为独立的完整单词出现时，才会被匹配到；如果 gene 是某个长单词的一部分（比如 gene_id），则不会匹配。  


## `sort`排序

```bash
sort -k 4 file_name           # 按照第 4 列排序
sort -k 5 file_name           # 按照第 5 列排序 (ASCII码顺序)
sort -k 5 -n file_name        # 按照第 5 列排序 (ASCII数值顺序)
```

## `uniq`去重复

```bash
uniq -c file_name    # 去重复并且计算重复频率（仅能处理串联重复）
```

> **Tips**：file_name 中没有重复的行，该命令的效果要在下一节的最后一条命令中才能直观地看到。

# 6) 压缩和数据流重定向

## `gzip`压缩文件

```bash
gzip file_name
```

## `gunzip`解压缩文件（.gz 文件）

```bash
gunzip file_name.gz
```

## `tar`打包压缩、解压缩文件（夹）

```bash
tar -zcv -f cp_folder.tar.gz cp_folder       #打包压缩文件夹（gzip格式）
tar -ztv -f cp_folder.tar.gz                 #查看压缩文件夹中的文件名（gzip格式）
tar -zxv -f cp_folder.tar.gz                 #打开包并解压缩（gzip格式）
```

- `-c` 打包压缩
- `-x` 解压
- `-t` 查看压缩包里的文件名
- `-z` .gzip 格式
- `-f` 指定压缩文件名

## `>` 将终端结果输出给文件，会创建新文件或者覆盖原文件

```bash
cat file_name > new_file  # 将文件的内容输出到一个新文件
cat new_file
```

## `>>` 将终端结果输出给文件，内容会加在原文件尾部

```bash
sed -n '8 p' file_name >> new_file # 将文件的第 8 行附加到新文件的尾部
cat new_file
```

## `|` 管道，将左边命令的标准输出（standard output）作为右边命令接受的标准输入（standard input）

```bash
head -n 6 file_name | tail -n 3
# 输出文件的前 6 行，通过管道转发给 tail 取出后 3 行，也就是原始文件的 4-6 行。

cut -f 4 file_name | sort | uniq -c
# 输出文件的第 4 列，通过管道转发 sort 进行排序，通过管道转发到 uniq 去重复并且计算重复频率。
```

> **Tips**  
> 1. 管道命令只处理前一个命令正确输出，不处理错误输出（standard error）。  
> 2. 管道命令右边命令，必须能够接收标准输入流命令才行。

# 7) 查看、修改文件权限

> 本节的操作前后要注意使用 `ls -hl`，对比操作前后文件权限的变化

用户及用户组：文件所有者 u(user)，用户组 g(group)，其他人 o(other)，所有人 a(all)

## `chmod`修改文件的访问权限，分为数字模式和符号模式

### 数字模式：

```bash
chmod 755 file_name
chmod -R 755 cp_folder     # -R  修改该目录中所有文件的权限
```

三位数分别表示文件所有者，用户组，其他人  
- r 表示可读，w 表示可写，x 表示可执行  
- 用数字表示：可读 r=4，可写 w=2，可执行 x=1  
例如：777 表示所有用户对文件具有读、写、执行权限；755 表示文件所有者对文件具有可读、可写、可执行权限，其他用户只具有可读、可执行权限。

### 符号模式：

```bash
chmod u+x,go=rx file_name   #使文件的所有者加上可执行权限，将用户组和其他人权限设置为可读和可执行
chmod o-x file_name         #使其他人对文件除去可执行权限
chmod a+x cp_folder         #使所有人对文件夹加上可执行权限
```

- `+` 加入
- `-` 除去
- `=` 设置

# 8) 其他命令

- `top` 监视计算机使用情况（按 q 退出）
- `date` 显示系统的时间和日期，可用于为程序运行时长进行计时
- `which` 寻找可执行文件，显示路径
- `ctrl-c` 终止当前进程
- `ctrl-z` 暂停当前进程

# 9) 清理

```bash
rm new_file
rm -r cp_folder
rm cp_folder.tar.gz
```

# 10) 更多推荐阅读

《鸟哥的Linux私房菜-基础学习篇》 (5-10章推荐章节)  
Linux 推荐章节：

- 第5章: 5.3.1 man page
- 第6章: 6.1用户与用户组; 6.2 LINUX文件权限概念; 6.3 LINUX目录配置
- 第7章: 7.1目录与路径; 7.2文件与目录管理; 7.3文件内容查阅; 7.5命令与文件的查询; 7.6权限与命令间的关系
- 第8章: 8.2文件系统的简单操作
- 第9章: 9.1压缩文件的用途与技术; 9.2 Linux系统常见的压缩命令; 9.3打包命令：tar
- 第10章 vim程序编辑器

# 11) `awk`
## 1. awk 是干什么的？
awk 是一个**文本处理工具**，它的主要工作就是**逐行读取文件**，然后对每一行做一些操作，比如：

- 打印某些列
- 统计数字
- 查找包含特定单词的行
- 重新格式化文本

---

## 2. awk 的基本结构

awk 命令最常见的写法是：

```bash
awk 'pattern { action }' 文件名
```

或者，如果你把 `pattern` 省略，就是：

```bash
awk '{ action }' 文件名
```

- **pattern**（模式/条件）：决定“哪些行需要做动作”。只有符合这个条件的行，才会执行后面的 `action`。
- **action**（动作）：具体要对符合条件的行做什么操作，用花括号 `{}` 括起来。

如果只写 `pattern` 不写 `{action}`，awk 会默认执行 `{ print }`（即打印整行）。  
如果只写 `{action}` 不写 `pattern`，就表示所有行都执行该动作。

---

## 3. 什么是 pattern（模式）？

pattern 就是一个**判断条件**，只有条件为“真”的行才会触发 action。

常见的 pattern 有几种：

### (1) 直接省略 pattern  
这表示“所有行都执行动作”。

```bash
awk '{ print $1 }' file.txt   # 每一行都打印第一个字段
```

### (2) 用正则表达式匹配  
用 `/正则/` 表示“包含该模式的行”。

```bash
awk '/error/ { print }' log.txt   # 打印所有包含 error 的行
# 可以简写为 awk '/error/' log.txt，因为省略 action 默认打印
```

### (3) 用比较表达式  
可以用字段、行号、变量等做比较。

```bash
awk '$3 > 100 { print $1, $2 }' data.txt   # 如果第3列大于100，打印第1、2列
awk 'NR == 5 { print $0 }' file.txt        # 只打印第5行
```

### (4) BEGIN 和 END 两个特殊模式  
- `BEGIN`：在处理任何文件内容**之前**执行一次，通常用来设置变量、打印表头。
- `END`：在处理完所有行**之后**执行一次，通常用来打印汇总结果。

```bash
awk 'BEGIN { print "开始处理..." } 
     { print $0 } 
     END { print "处理完毕！" }' file.txt
```

---

## 4. 什么是 action（动作）？

action 就是你要对符合条件的行**具体做什么**，写在 `{}` 里。可以是一条或多条语句，语句之间用分号 `;` 分隔。

常用的动作：

- `print`：打印内容（默认打印整行，也可以指定打印某些字段）
- `printf`：格式化打印（类似 C 语言的 printf）
- 变量赋值：`sum = sum + $1`
- 循环、条件判断等编程语句

例如：

```bash
awk '{ sum = sum + $1 } END { print sum }' numbers.txt   # 累加第一列并最后打印总和
```

如果只有 pattern 没有 action（如 `awk '/error/'`），awk 会默认执行 `print $0`。

---

## 5. 字段和内置变量

awk 会自动把一行分成若干“字段”（默认用空白字符分割，可以自己指定分隔符）。你可以用 `$1`, `$2`, ... 访问第 1、2……个字段，`$0` 表示整行。

常用内置变量（可以在 pattern 或 action 中使用）：

- `NR`：当前行号（从 1 开始）
- `NF`：当前行的字段个数
- `FS`：输入字段分隔符（默认为空格或制表符）
- `OFS`：输出字段分隔符（默认为空格）

例如：

```bash
awk '{ print "第" NR "行有" NF "个字段" }' file.txt
```

---

## 6. 几个简单例子让你感受一下

假设有一个文件 `students.txt` 内容如下：

```
Name   Age   Score
Alice  20    85
Bob    22    90
Charlie 21    78
```

### 例1：打印所有人的名字（第1列）
```bash
awk '{ print $1 }' students.txt
```
输出：
```
Name
Alice
Bob
Charlie
```
（这里标题行也被打印了，因为没加 pattern）

### 例2：只打印分数大于80的行
```bash
awk '$3 > 80 { print $1, $3 }' students.txt
```
输出：
```
Alice 85
Bob 90
```
（这里第三列是分数，比较后只打印符合条件的行）

### 例3：打印行号和分数大于80的人名
```bash
awk '$3 > 80 { print NR, $1 }' students.txt
```
输出：
```
2 Alice
3 Bob
```
（第1行标题不满足条件，所以没打印）

### 例4：计算平均分
```bash
awk 'NR>1 { sum += $3 } END { print "平均分:", sum/(NR-1) }' students.txt
```
输出：
```
平均分: 84.3333
```
（这里 `NR>1` 跳过了标题行，累加分数，最后除以人数）

---

## 7. 总结

- **awk** 是一种文本处理编程语言，逐行读取输入文件，将每行按指定分隔符拆分成字段，然后执行用户编写的程序。
- 基本结构：`pattern { action }`
- **pattern** 是条件，决定哪些行执行 action。
- **action** 是操作，决定做什么。
- 省略 pattern → 所有行都执行 action。
- 省略 action → 默认打印整行。
- 特殊模式 `BEGIN` 和 `END` 在开头和结尾执行一次。

---

现在，任务目标是对 `test_command.gtf` 文件做两件事：

1. **交换第 2 列和第 3 列**
2. **对结果按第 4 列和第 5 列的数字大小排序**
3. 将最终结果保存到 `result.gtf` 中。

我们需要用到 `awk` 和 `sort` 两个命令，并通过管道和重定向组合它们。



## 1. 了解输入文件 `test_command.gtf`

awk 的核心功能是处理按“列”组织的数据。它把每一行看作一条记录，并**自动拆分成字段**。但拆分时总得有个规则——从哪里切分？这个规则就是字段分隔符。

默认情况下，awk 使用连续的空白字符（空格和制表符）作为分隔符。例如，对于行 apple banana cherry，默认分隔后：
- `$1 = apple`
- `$2 = banana`
- `$3 = cherry`

但许多实际文件使用其他分隔符，比如：
- `/etc/passwd` 用冒号`:`分隔
- CSV 文件常用逗号`,`
- GTF/GFF 格式用制表符`\t`
- 某些日志文件用空格但数量不固定

这时就需要用 -F 来指定正确的分隔符，否则 awk 会按默认规则拆分，导致字段错乱。

```bash
awk -F'分隔符' 'awk程序' 输入文件
```

> e.g. 处理以冒号分隔的文件（如 /etc/passwd）

```bash
awk -F':' '{ print $1 }' /etc/passwd
```

> e.g. 指定多个可能的分隔符
> 如果文件同时使用空格和冒号分隔，可以写成一个字符集合：

```bash
awk -F'[ :]' '{ print $1, $2 }' file.txt
```
> 这表示遇到空格或冒号就拆分字段。


> e.g. GTF 文件是一种常见的基因注释格式，**各列之间用制表符（Tab）分隔**。因此，在后续命令中，我们需要明确指定分隔符为制表符。

```bash
awk -F'\t' '{ print $1, $4 }' test_command.gtf
```

---

## 2. 使用 `awk` 交换第 2 列和第 3 列

### 2.1 基本思路
`awk` 会逐行读取文件，并把每一行按指定的分隔符拆分成多个字段。  
- `$1` 表示第 1 列，`$2` 表示第 2 列，以此类推，`$0` 表示整行。  
- 我们可以通过临时变量交换 `$2` 和 `$3` 的值，然后打印整行。

### 2.2 具体命令
```bash
awk -F'\t' -v OFS='\t' {temp=$2; $2=$3; $3=temp; print}' test_command.gtf
```

**解释**：
- `-F'\t'`：设置**输入字段分隔符**为制表符（因为 GTF 是制表符分隔的）。
- *当你想让一个特殊字符（如空格、$、&、|、 等）变成普通字符时*，在它前面加 \。当你想在字符串中表示控制字符（如换行 \n、制表符 \t）时，使用转义序列，并注意用引号保护。当你在编写多行命令时，在行末加 \ 表示续行。
- `-v OFS='\t'`：`-v` 是 awk 的一个选项，用于在 awk 程序开始执行之前给变量赋值。格式为`-v 变量名=值`。`OFS`全称 Output Field Separator（输出字段分隔符），默认值是空格。它决定当使用`print`打印多个字段时，字段之间用什么字符连接。在处理任何行之前，设置**输出字段分隔符**也为制表符，保证输出格式与输入一致。
- `{temp=$2; $2=$3; $3=temp; print}`：对于每一行，执行：
  1. 将第 2 列的值存入临时变量 `temp`。
  2. 将第 3 列的值赋给第 2 列。
  3. 将 `temp`（原第 2 列）赋给第 3 列。
  4. `print` 打印当前行。由于我们修改了字段，`awk` 会自动使用 `OFS` 重新拼接 `$0`，因此输出的各列之间仍为制表符。

执行这一步后，就得到了一个**列交换后**的文本流。

---

## 3. 使用 `sort` 按第 4、5 列数字大小排序

### 3.1 基本思路
我们需要对 `awk` 输出的结果进行排序。排序要求：
- 先按第 4 列的数字大小升序排列。
- 如果第 4 列相同，再按第 5 列的数字大小升序排列。

`sort` 命令默认按字典序排序，要按数字大小需加上 `-n` 选项。同时需要明确指定分隔符和排序的列。

### 3.2 具体命令
```bash
sort -t $'\t' -k 4,4n -k5,5n
```

**解释**：
- `-t $'\t'`：设置字段分隔符为制表符。`$'\t'` 是 Bash 中的写法，表示一个真正的制表符。
- `-k4,4n`：指定排序键为第 4 列。`-k4,4` 表示从第 4 列开始到第 4 列结束（即只使用第 4 列），`n` 表示按数字大小排序。
- `-k5,5n`：指定排序键为第 5 列，同样按数字大小排序。当第 4 列相同时，会使用第 5 列作为次级排序键。

---

## 4. 组合命令并输出到文件

我们将 `awk` 的输出通过管道（`|`）传递给 `sort`，然后将 `sort` 的结果重定向到 `result.gtf`。

完整命令如下：
```bash
awk -F'\t' -v OFS='\t' {temp=$2; $2=$3; $3=temp; print}' test_command.gtf | sort -t $'\t' -k 4,4 -k 5,5 -n > result.gtf
```

执行后，`result.gtf` 中就包含了交换列并按数字排序后的内容。

---

## 5. 验证与注意事项

- **分隔符一致性**：务必保证 `awk` 的输入/输出分隔符和 `sort` 的分隔符都是制表符。如果文件实际上是用空格或其他空白分隔的，可以调整 `-F` 和 `-t` 参数。
- **数字排序**：`-n` 选项确保按数值大小排序，例如 “10” 会排在 “2” 之后，而不是之前。
- **标题行**：如果文件第一行是标题（如列名），排序后标题行可能会被混入数据行中。如果希望标题行保持在第一行，可以用 `head -1` 单独取出标题行，然后对剩余行处理，最后合并。但题目未要求，这里不展开。
- **环境支持**：`$'\t'` 是 Bash 的 ANSI C 转义写法，在大多数 Linux 系统中可用。如果您的 Shell 不支持，可以改用实际键入的制表符（按 `Ctrl+V` 再按 `Tab`），或者写成 `-t "$(printf '\t')"`。

---

## 6. 分步执行示例（便于理解）

假设 `test_command.gtf` 内容为：
```
gene1   source1 exon    100 200 . + . ID=1
gene2   source2 intron  150 250 . - . ID=2
gene3   source3 exon    80  180 . + . ID=3
```

### 6.1 只执行 `awk` 部分
```bash
awk -F'\t' 'BEGIN{OFS="\t"} {temp=$2; $2=$3; $3=temp; print}' test_command.gtf
```
输出（第 2、3 列已交换）：
```
gene1   exon    source1 100 200 . + . ID=1
gene2   intron  source2 150 250 . - . ID=2
gene3   exon    source3 80  180 . + . ID=3
```

### 6.2 将上述结果通过 `sort` 排序（按第 4、5 列数字）
```bash
... | sort -t $'\t' -k4,4n -k5,5n
```
排序后输出：
```
gene3   exon    source3 80  180 . + . ID=3   # 第4列 80 最小
gene1   exon    source1 100 200 . + . ID=1   # 第4列 100 次之
gene2   intron  source2 150 250 . - . ID=2   # 第4列 150 最大
```
（注意第 4 列相同的情况这里没有出现，所以次级排序未生效）

### 6.3 最终重定向到文件
执行完整命令后，上述排序结果就会写入 `result.gtf`。

---

通过以上步骤，您应该能理解如何用 `awk` 交换列，再用 `sort` 按数字排序，最后输出到新文件。如果有任何疑问，欢迎继续提问！
