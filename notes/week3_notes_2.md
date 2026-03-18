# 1.3. Linux Bash

在介绍 bash 之前，需要先介绍 Linux 系统的 **shell**。这里的 shell（壳）是相对于内核（kernel）来说的。shell 可以理解为系统下的一个命令解析器。就 Linux 操作系统的常规使用而言（包括生物信息数据分析），我们极少需要直接和 Linux 的内核进行交互，绝大部分情况下都是在通过 shell 和操作系统打交道。

Linux 系统上有很多种 Shell。首个 shell，即 Bourne Shell，于 1978 年在 V7（AT&T 的第 7 版）UNIX 上推出。后来，又演变出 C shell、bash 等不同版本的 shell。  

- shell 可以通过**交互式（interactive）** 的方式使用，即我们在终端中输入一个命令，shell 将这个命令解释给操作系统，操作系统执行命令，这是我们前面介绍 Linux 基本操作时的使用方式。

- shell 也可以通过**非交互式（non-interactive）** 的方式使用，即我们将需要执行的命令通过一个文本文件提供给 shell，shell 根据这个文本文件执行相应的命令。这个文本文件就是 **shell 脚本**。有时我们对程序的调用会比较复杂，并且会反复使用（例如执行一个生物信息分析的流程），还可能涉及到循环、条件判断等操作。这时我们不可能每次还一行行地在终端中输入命令，而通常会使用 shell 脚本。我们本节主要就来学习怎样写一些简单的 shell 脚本。

**bash**，全称为 Bourne-Again Shell。它是一个为 GNU 项目编写的 Unix shell。bash 是许多 Linux 系统的默认 Shell，这也是我们介绍它主要的原因。

---

## 1) bash examples

### (1) example 1: run a bash script

```bash
touch bash.sh  #新建文件bash.sh
chmod u+x bash.sh  #为该文件添加可执行权限
```

- 编辑 `bash.sh`，内容如下：

**提示**：用 vim 编辑脚本：`vim bash.sh`，然后按 `i` 进入 insert（写入）模式，即可对文档进行编辑。

```bash
#!/bin/bash
echo "hello bash" 
exit 0
```

保存并退出：`:wq`

**说明**：

- `#!/bin/bash`：脚本解释器的声明语句，它告诉操作系统用 `/bin/bash` 这个解释器去运行我们的脚本。**必须写在文件的第一行**。
- `echo "hello bash"`：表示在终端输出“hello bash”。
- `exit 0`：表示返回 0。在 Linux 中，通常来说返回值 0 表示执行成功，其他表示失败。bash 脚本执行成功默认就会返回 0，所以这里的 `exit 0` 是可以省略的。

- 执行 bash 脚本：

```bash
# method 1: 人为指定解释器
bash bash.sh
```
> 工作原理：
你调用了bash这个可执行程序（shell解释器）。 把bash.sh作为参数传给它，让它读取并逐行解释执行脚本里的内容。  
优点：  
✅ 不需要脚本有可执行权限：哪怕文件权限是 rw-r--r--，也能跑。  
✅ 不需要写 Shebang 行：脚本第一行有没有 #!/bin/bash 都无所谓，因为你已经手动指定了解释器。  
✅ 灵活切换解释器：想换用 sh 或 zsh 执行，直接改命令为 sh bash.sh 即可。

```bash
# method 2: 使用脚本内指定的解释器（脚本第一行的 #!/bin/bash 已经告诉操作系统使用 /bin/bash 这个解释器）
# 这种方法需要脚本文件有可执行的权限，这是我们前面执行命令 chmod u+x bash.sh 的目的所在
./bash.sh
```
> 工作原理：  
Shebang（也叫「释伴」/「哈希爆炸」）是一个特殊的文件开头标记，格式为 #! 后跟解释器的绝对路径，作用是告诉操作系统「用哪个程序来执行这个脚本文件」。  
系统发现你要执行一个文件，先看它的第一行#!/bin/bash, 告诉操作系统：「请用 /bin/bash 这个程序来执行我」  
调用 /bin/bash，并把这个脚本文件作为参数传给它，本质和方法 1 一样。文件必须有可执行权限。  
必须用 ./ 前缀：告诉系统「要执行的文件在当前目录」，避免系统去 PATH 环境变量的目录里找同名命令。  
优点：  
✅ 更贴近正式程序的用法：像系统命令一样直接运行，更规范。  
✅ 自解释：脚本自己声明了用什么解释器，别人一看就知道。  
适用场景：正式部署、长期使用的脚本，需要封装成可执行程序。  

在终端输出“hello bash”即运行成功。

### (2) example 2: define a variable

在终端中输入以下命令，创建测试文件 `a1.txt`, `b1.txt`, ..., `e1.txt`：

```bash
echo -e 'a1\n1' > a1.txt
echo -e 'b1\n2' > b1.txt
echo -e 'c1\n3' > c1.txt
echo -e 'd1\n4' > d1.txt
echo -e 'e1\n5' > e1.txt
```

`echo -e`：`echo`是输出文本的命令，`-e`参数表示识别转义字符（比如\n代表换行）。  
`'a1\n1'`：字符串；\n：转义字符（换行符），是整个字符串的核心；在 bash 中，单引号是强引用，会把里面的内容原样保留（除了单引号本身），告诉系统：里面的内容不要解析，直接当作纯文本传递给命令。  
`> 文件名`：是重定向符号，把echo输出的内容写入到指定文件中（如果文件不存在则创建，存在则覆盖）。  
最终效果：创建 5 个 txt 文件，每个文件有两行内容（比如 a1.txt 第一行是 a1，第二行是 1；b1.txt 第一行是 b1，第二行是 2，以此类推）。

新建一个 `read.sh` 脚本，复制以下内容，理解每一步的操作：

```bash
#!/bin/bash

# 定义文件名变量：把文件名（如 a1.txt）赋值给变量 file1/file2 等。
# bash 中=是赋值操作符，注意=号两边不能有空格
file1=a1.txt
file2=b1.txt
file3=c1.txt
file4=d1.txt
file5=e1.txt

# 对文件进行操作

## 显示 a1.txt 第一行
head -n 1 ${file1}  # $ 是 bash 的变量引用符，作用是取出变量里存储的值，没有$就只是普通字符串；${变量名} 和 $变量名 基础功能等价，但 ${变量名} 能明确变量边界，避免和后续字符混淆；

## 将 b1.txt 的内容输出到终端
# 定义变量时用 变量名=值（= 两边无空格），注意在 bash 中引用一个已经定义的变量需要用 $variable 或 ${variable}，否则 bash 会将其解释为一个字符串
cat ${file2}

## 将 c1.txt 的最后的内容输出
tail ${file3}

## 将 d1.txt 和 e1.txt 合并，然后输出到新的文件中 f1.txt
cat ${file4} ${file5} > f1.txt  #读取d1.txt和e1.txt的内容（按顺序合并），把合并后的内容写入 f1.txt（如果 f1.txt 不存在则创建，存在则覆盖）。
```

在终端中输入以下命令，执行 `read.sh` 脚本：

```bash
bash read.sh
```

或者

```bash
chmod u+x read.sh
./read.sh
```

> 我们以交互式的方式使用终端时，也可以用这里介绍的方式自定义一些变量。在实际工作中，一般比较简单的、而且不会重复使用的命令，才会在终端中直接运行，所以在交互式的环境中很少会自定义变量。  
bash 提供了不少**内建变量**，例如 `$PWD` 是当前目录，`$HOME` 是家目录等等，在自定义变量时，最好避免和这些变量重名。  
引用自定义变量时，`$variable` 和 `${variable}` 在我们上面的例子中含义是一样的。`${...}` 在 bash 中被称为**参数名扩展（Shell Parameter Expansion）**，它还支持一些更复杂的操作，如对字符串去除前缀/后缀、取子串；对列表取特定元素等等，有兴趣的同学请参考 [GNU 的文档](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html)。

---

## 2) if...else...

### 基本格式

**单个条件判断**

```bash
if condition
then 
... 
fi  #用fi（if 的倒写）表示条件判断结束（bash 的语法规则）
```

也可以写成：

```bash
if condition; then 
... 
fi
```

**对不符合条件的情况执行另一种操作**

```bash
if condition; then
...
else
... 
fi
```

**多个条件判断**

```bash
if condition1; then
... 
elif condition2; then
...
else
...
fi
```

以下列举了一些常见的条件判断语句，条件判断一般写在方括号内，前后都要有空格！[ --- ]（参见下面的示例）：

| 表达形式               | 说明                         |
| ---------------------- | ---------------------------- |
| `-d file`              | 判断是否为目录               |
| `-f file`              | 判断是否为文件（判断存在）           |
| `-w file`              | 判断是否有写的权限           |
| `-x file`              | 判断是否有执行的权限         |
| `number1 -eq number2`  | number1 等于 number2         |
| `number1 -gt number2`  | number1 大于 number2         |
| `number1 -lt number2`  | number1 小于 number2         |

### 示例

**示例 1：判断文件是否存在**

判断文件 `test.sh` 是否存在，存在则输出“file exist”；没有则输出“file not exist”。

```bash
#!/bin/bash

if [ -f test.txt ]; then
    echo "file exist"
else
    echo "file not exist"
fi

exit 0   # 可以省略
```

**示例 2：根据用户输入判断数值**

提示用户输入值。若输入的值小于 0，则输出“negtive number”；若等于 0，则输出“number zero”；否则输出“positive number”。

```bash
#!/bin/bash

# 提示用户输入一个值
echo -n "please input a number:"

# read 命令：读取用户输入，保存到变量num中
read num

if [ "$num" -lt "0" ]; then
    echo "negtive number"
elif [ "$num" -gt "0" ]; then
    echo "positive number"
else
    echo "number zero"
fi

exit 0
```

---

## 3) for loop

bash 中的for循环是遍历型循环，核心作用是：依次取出列表中的每一个值，赋值给循环变量，然后执行循环体（do...done 之间）的代码。

### 基本格式

```bash
for variable in aa bb cc dd  
do  
    echo $variable
done
# 这里 bash 会用空格作为分隔符，把 "aa bb cc dd" 解释成一个列表，包含 "aa","bb","cc","dd" 四个变量
# variable 会依次取这四个值，执行代码块中的命令
```

### 示例 1：输入当前文件夹的一级子目录中文件的名字

```bash
#!/bin/bash

# 将 ls 的结果保存到变量 CUR_DIR 中
CUR_DIR=`ls`

# 显示 ls 的结果
echo $CUR_DIR

for val in $CUR_DIR
do
    # 若 val 是文件，则输出该文件名
    if [ -f $val ]; then
        echo "FILE: $val"
    fi
done

exit 0
```

> `ls`：命令替换（Command Substitution），意思是 “先执行ls命令，把执行结果（字符串）赋值给变量CUR_DIR”；  
等价写法（更推荐）：CUR_DIR=$(ls)，$(...)是命令替换的现代写法，比反引号`更易读、不易出错。

> for val in $CUR_DIR：遍历CUR_DIR中的每一个元素（即每个文件 / 目录名），依次赋值给val；  
if [ -f $val ]：判断当前val是否是普通文件（-f是文件判断条件）；
执行逻辑：
取第一个元素→判断是否是文件→是则输出FILE: 文件名，否则跳过；
取第二个元素→重复判断；
直到所有元素遍历完。


### 示例 2：shuffle（打乱）一个序列

```bash
#!/bin/bash

# shuffle a sequence
# input sequence
s="CGAUGCUAGCUAGCUAGUC"

# start index
si=0  #序列的起始索引（bash 字符串索引从 0 开始，第一个字符是索引 0）
L=${#s}           #变量扩展，返回length of the sequence
# end index
ei=$(($L-1))  #算术扩展，执行算术计算L-1，赋值给ei（序列最后一个字符的索引）
shuffled=""  #定义空字符串，用来存储打乱后的序列。

for i in `seq $si $ei | shuf`; do
    # seq generate integers range from $si to $ei（seq $si $ei生成 “有序的索引列表”（0,1,2,...,17）—— 对应字符串每个字符的位置）
    # shuf command randomize the order of these integers（shuf 只能打乱按行分隔的文本/空格分隔的列表，无法直接操作连续的字符串。）
    # `seq $si $ei | shuf`：命令替换。这个命令作为一个整体，先执行seq生成序列，再用shuf打乱，最终得到一个随机的整数列表；for再依次取出shuf打乱后的每个随机索引
    shuffled=$shuffled${s:$i:1}
    # ${s:$i:1}: ${字符串:起始索引:长度}，意思是 “从s的第i个位置开始，取 1 个字符”。variable expansion
    # $shuffled${s:$i:1}: 字符串拼接，把每次取到的字符追加到shuffled末尾
done
echo "original sequence: $s"
echo "shuffled sequence: $shuffled"
```

**说明**：

- 两个`操作符之间的代码在程序执行的过程中会被替换成这段代码执行的结果，这被称为 **Command Substitution**。除此之外，`$(...)` 操作符是实现 Command Substitution 的另一种常用方式，大家可以尝试。
- `${#s}` 这里我们用到了前边提到的 shell variable expansion，`${#variable}` 可以返回一个字符串的长度。
- 在取一个字符串某个位置的字符时，我们用 `${s:$i:1}` 来获得一个字符串位置 `$i` 的字符，这也是一个 shell variable expansion。
- `$((...))` 执行算术操作，并将结果作为变量返回，可以用它来将计算结果赋给一个新的变量。
- 在 bash 脚本中，连接两个字符串不需要单独的操作符，直接将两个变量写在一起即可，例如连接 `$s1` 和 `$s2` 用 `s=$s1$s2` 就可以实现。

我们提供的这个 shuffle 序列的例子只是供大家学习 bash 脚本之用，在实际工作中用 Python 等可以有更方便的实现，也有现成的工具实现了这样的功能，如 [meme 提供的 fasta-shuffle-letters](https://meme-suite.org/meme/doc/fasta-shuffle-letters.html)。

---

## 4) break and continue

### 基本格式

- `break` 命令允许跳出循环。
- `continue` 命令类似于 `break` 命令，只有一点重要差别：它不会跳出循环，只是跳过这个循环步。

### 示例 1：使用 break

从 0 开始逐步递增，当数值等于 5 时停止。bash 脚本内容如下：

```bash
#!/bin/bash

# 设置起始值为 0
val=0

while true
do
    if [ "$val" -eq "5" ]; then
        # 如果 val=5，则跳出循环
        break
    else
        # 输出数值
        echo "val=$val"
        # 将数值加 1
        ((val++))
    fi
done

exit 0
```

**说明**：在 bash 脚本中，双括号 `(())` 和 `$(())` 一样用来定义算术操作，区别在于它不会将结果返回，而是直接对变量值进行修改。  
$(()) 是算术扩展，核心逻辑是：「我给你一个算术表达式，你算出结果，把结果作为字符串返回给我」  
(()) 是算术命令，只修改已有变量，本身不产生任何返回值（执行后没有输出）。  
例如 `((val++))` 会将变量 `$val` 的数值加 1。其他语言里常见的写法，如 `((val+=1))` 或 `((val=val+1))` 也都是可以的。  
例如
```bash
val=5
# $(()) 计算 5+3，返回结果 8，赋值给 new_val
new_val=$((val + 3))

echo "val = $val"    # 输出 val = 5（val 没被修改）
echo "new_val = $new_val"  # 输出 new_val = 8（拿到了计算结果）
```

### 示例 2：使用 continue

从 0 开始逐步递增到 10：当数值为 5 时，将数值递增 2；否则，输出数值。

```bash
#!/bin/bash

# 设置起始值为 0
val=0

while [ "$val" -le "10" ]
do
    if [ "$val" -eq "5" ]; then
        # 如果 val=5，则将数值加 2
        ((val=$val+2))
        continue
    else
        # 输出数值
        echo "val=$val"
        # 将数值加 1
        ((val++))
    fi
done

exit 0
```

**注意**：continue 只跳过 “当前次循环”，循环本身不终止。

---

## 5) More Reading

- 《鸟哥的Linux私房菜-基础学习篇》第 11 章 认识与学习 bash；第 12 章 正则表达式与文件格式化处理；第 13 章 学习 shell script。

---

## 6) Homework

参考和学习本章内容，写出一个 bash 脚本，可以使它自动读取一个文件夹（例如 `bash_homework/`）的内容，将该文件夹下**文件的名字**输出到 `filenames.txt`，**子文件夹的名字**输出到 `dirname.txt`。

**提示和要求**：
- 下载 `bash_homework.zip` 并解压（可以从链接 Files Needed 的 Files 路径下的相应文件夹中下载）。
- 将 **bash 脚本**、`filename.txt`、`dirname.txt` 写到同一个文件中上交。
- 文件格式：md（推荐）、word、pdf、txt。

---

## 7) References

- [https://www.cnblogs.com/skywang12345/archive/2013/05/30/3106570.html](https://www.cnblogs.com/skywang12345/archive/2013/05/30/3106570.html)
```
```
