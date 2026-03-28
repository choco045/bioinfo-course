# R basics

## 目录

1. 环境与准备

    - 如何交互式或通过脚本运行R语言

    - 如何安装CRAN和Bioconductor的R包 (如 `ggplot2`, `DESeq2`)

2. R语言数据类型与结构

    - 基础数据类型：数值 (`numeric`)、布尔值 (`logical`)、字符 (`character`)、因子 (`factor`)

    - 核心数据结构：向量 (`Vector`)、矩阵 (`Matrix`)、列表 (`List`)、数据框 (`Data frame`)

3. 常用操作与统计示例

    - 表格数据的读取与保存 (`read.csv`, `write.table`等)

    - 基础统计函数的应用 (均值 `mean`、标准差 `sd`、T检验 `t.test`、方差分析 `aov`)

    - 数据分组聚合计算 (`aggregate`)

---

简要实操举例：

## 任务一：构建患者信息数据集 (数据结构创建)
* **操作逻辑**：
    1. 首先使用 `c()` 函数将同类型的数据拼接成一维的**向量** (Vector)。对于分类变量，使用 `factor()` 进行处理。
    2. 然后使用 `data.frame()` 函数，将长度相同的多个向量，像拼接表格的列一样，组装成二维的**数据框** (Data frame)。
```R
# 1. 创建各个变量的向量
age = c(25, 42, 58)
group = factor(c("A", "B", "A"))
recovered = c(TRUE, FALSE, TRUE)

# 2. 组装成数据框
patient_data = data.frame(age, group, recovered)

# 3. 打印查看结果
patient_data
```

## 任务二：数据的导出与导入 (表格文件读写)
* **操作逻辑**：
    1. 使用 `write.csv()` 将 R 环境中的数据框持久化保存为本地的 `.csv` 文件。添加 `quote=F` 参数可以避免导出的文本带有多余的双引号。*(进阶小提示：如果导出时不想带有最左侧的 1,2,3 行号，可以再加上 `row.names=FALSE` 参数)*。
    2. 使用 `read.csv()` 将本地的表格文件加载回 R，并赋值给新的变量以便后续分析。
* **实操代码**：
```R
# 1. 导出数据框到本地 CSV 文件
write.csv(patient_data, "patients.csv", quote=F)

# 2. 从本地读取 CSV 文件到 R 环境
imported_data = read.csv("patients.csv")

# 3. 查看导入的数据
imported_data
```

## 任务三：内置数据集探索与基础统计 (描述性统计与假设检验)
* **操作逻辑**：
    1. **数据概览**：使用 `head()` 快速查看数据框的前几行，了解有哪些变量。
    2. **向量提取与统计**：使用 `$` 符号提取数据框中的特定列（提取出来即为向量），然后套用 `mean()` 和 `sd()` 计算均值和标准差。
    3. **假设检验 (T检验)**：使用 `t.test()` 比较两组数据是否存在显著差异。最推荐使用“公式法” (`因变量 ~ 分组变量, data = 数据集`)，代码最简洁易读。
    4. **分组聚合**：使用 `aggregate()` 函数，按照指定的分组变量，对目标变量进行批量的统计计算（如求组内均值）。
* **实操代码**：
```R
# 1. 查看 mtcars 数据集的前几行
head(mtcars)

# 2. 提取 mpg 列并进行基础统计
mtcars$mpg
mean(mtcars$mpg) # 计算平均值
sd(mtcars$mpg)   # 计算标准差

# 3. 执行独立样本 T 检验 (探究不同发动机类型 vs 对 mpg 的影响)
# 推荐使用公式法：t.test(因变量 ~ 分组变量, data = 数据集)
t.test(mpg ~ vs, data = mtcars) 

# 4. 分组聚合计算 (按 vs 分组，计算各组的 mpg 平均值)
aggregate(mpg ~ vs, mtcars, mean)
```

---

## 完整细节basics

### 1c) Use R

* 和bash一样，我们可以交互式的使用R，也可以把代码组织到一个脚本中
* 在linux终端中输入`R`或点击windows GUI的图标即可进入交互式的R环境
* 我们也可以把R代码写到一个脚本中，例如在文本文件`hello.R`中输入以下内容:

```
#!/usr/bin/env Rscript
print("hello R !")
```

* 输入`chmod u+x hello.R`给文件可执行权限
* 用`./hello.R`运行
* `#!/usr/bin/env Rscript`告诉操作系统使用Rscript作为解释器执行脚本，手动指定解释器，如用`Rscript hello.R`运行也是可以的

### 1d) Install R packages

* 进入交互式的R环境
* 对于[CRAN](https://cran.r-project.org/)收录的R package，我们可以用`install.packages`命令安装

```r
> install.packages("ggplot2")
```

* 对于[bioconductor](https://www.bioconductor.org/)收录的R package，我们需要先用`install.packages`命令安装bioconductor的包管理工具[BiocManager](https://cran.r-project.org/web/packages/BiocManager/vignettes/BiocManager.html)，再用`BiocManager::install`进行安装。
* 我们提供了一个用BiocManager package安装`DESeq2`这个bioconductor package(DESeq2是RNA-seq counts数据差异表达分析最常用的工具之一)。

```r
# 如果未安装BiocManager，需要首先安装
if (!require("BiocManager", quietly = TRUE))
install.packages("BiocManager")
#利用BiocManager安装bioconductor的package
BiocManager::install("DESeq2")
```

## 2) Data type

### 2a) Basic data types

R语言最基本的数据类型包括 numeric(数值), logical(布尔值), character(字符), factor(因子)等。在R语言中,箭头`<-`和等号`=`都可作为赋值运算符。我们可以用`class`函数获得一个R语言对象的数据类型。R语言提供了各种数据类型之间相互转换的函数。

* numeric (数值变量）

```r
> x = 10.5 # assign a decimal value to x, x <- 10.5 also work
> x
[1] 10.5
> class(x) # print the class name of x
[1] "numeric"
> is.numeric(x) # check whether x is a numeric variable
[1] TRUE
> is.integer(x)
[1] FALSE

> y = as.integer(3)
> y 
[1] 3
> class(y) # print the class name of y
[1] "integer"
> is.numeric(y) # integer is a special numeric variable
[1] TRUE
```

{% hint style="info" %}
和多数编程语言不同，"."在R语言中不是一个特殊符号，可以在变量名和函数名中使用
{% endhint %}

* logical （布尔变量）

```r
> x = 1; y = 2 
> z = x > y # is x larger than y?
> z # print the logical value
[1] FALSE
> class(z) # print the class name of z
[1] "logical"
> as.integer(z)
[1] 0
```

* character（字符变量）

```r
> x = as.character(10.5)
> x # print the character string
[1] "10.5"
> class(x) # print the class name of x
[1] "character"
```

* factor (因子)

factor是R语言中比较独特的数据类型，它是专门用来编码类别变量(categorical variable)，方便类别变量的统计分析,我们之后还会专门介绍。

```r
> x <- as.factor("a")
> x
[1] a
Levels: a
```

### 2b) Vector

* R语言的数组用于存储一组类型相同的变量
* R语言中数组的下标是从1开始的

```r
> c(2, 3, 5) # c()可以理解为一个用于concatenate(连接)的函数，它可以将数值连接成一个向量
[1] 2 3 5
# 方括号是位置提示，表示输出结果在新向量里的位置。
> n = c(2, 3, 5)
> s = c("aa", "bb", "cc", "dd", "ee")
> c(n, s)　# c()既可以用来将单个的变量连接成数组，也可以用来将多个数组连成一个数组
[1] "2" "3" "5" "aa" "bb" "cc" "dd" "ee"　#数组要求元素类型相同，如果需要连接的数组类型不同c()会自动进行类型转换

> s = c("aa", "bb", "cc", "dd", "ee")

# 可以用方括号[]获取数组的元素
> s[3]　# the index starts from 1
[1] "cc"

#如果定义的数组中存在不同的数据类型，R语言会自动进行类型转换
> c("aa", "bb", "cc", "dd", 2)
[1] "aa" "bb" "cc" "dd" "2" 
```

* 由因子组成的数组

```r
# 因子可以理解成有次序的一组离散变量，"Levels: a b c"表明了三个因子的次序
> x <- factor(c("a","a","b","b","b","c"))
> x
[1] a a b b b c
Levels: a b c

# 因子可以被转换为对应相应次序的整数
> as.integer(x)
[1] 1 1 2 2 2 3

# 因子的次序默认按字母表确定，也可以人为指定
> x <- factor(c("a","a","b","b","b","c"),levels=c("b","c","a"))
> x
[1] a a b b b c
Levels: b c a
#获取因子的levels
> levels(x)
[1] "b" "c" "a"
```

### 2c) Matrix

* R中的matrix即为二维的数组，它和一维数组一样，存储相同类型的变量

```r
> B = matrix(
+ c(2, 4, 3, 1, 5, 7),
+ nrow=3,
+ ncol=2)

> B # B has 3 rows and 2 columns
     [,1] [,2]
[1,]    2    1
[2,]    4    5
[3,]    3    7
```

### 2d) List

* R语言中的列表(list)可以用来存储一组任意类型的变量(变量类型不一定要相同)

```r
> n = c(2, 3, 5)
> s = c("aa", "bb", "cc", "dd", "ee")
> b = c(TRUE, FALSE, TRUE, FALSE, FALSE)
> x = list(n, s, b, 3) # x contains copies of n, s, b

> x
[[1]]
[1] 2 3 5

[[2]]
[1] "aa" "bb" "cc" "dd" "ee"

[[3]]
[1]  TRUE FALSE  TRUE FALSE FALSE

[[4]]
[1] 3

# 可以用双方括号[[]]获取列的元素
> x[[1]]
[1] 2 3 5

# 可以用字符串给列表元素命名 
> names(x) <- c("A","B","C","D")

> names(x)
[1] "A" "B" "C" "D"

# 可以用以下两种方式访问有命名的列表元素
> x[["A"]]
[1] 2 3 5

> x$A
[1] 2 3 5
```

### 2e) Data frame

* 我们在统计分析所用到的数据在很多情况下都可以整理成每行对应单个样本，每列对应各个样本特定属性的形式，这类数据常常被称为表格数据(tabular data)
* 数据框(data frame)主要针对这类数据的存储，可以说是R语言中最常用的一种数据类型
* 数据框可以理解成一种特殊的列表。这个列表中的元素都是一些长度相同的数组。每一个数组对应着所有样本的特定属性，数组的长度对应样本的数量

```r
> n = c(2, 3, 5)
> s = c("aa", "bb", "cc")
> b = c(TRUE, FALSE, TRUE)
> df = data.frame(n, s, b) # df is a data frame
> df
  n  s     b
1 2 aa  TRUE
2 3 bb FALSE
3 5 cc  TRUE

# 获取列名
> colnames(df)
[1] "n" "s" "b"
# 或
> names(df)
[1] "n" "s" "b"


# 访问特定列
# 用于访问列表元素的两种方法同样适用于数据框
> df$n
[1] 2 3 5
> df[["n"]]
[1] 2 3 5
```

## 3) Examples

### 3a) Read and write table

* 如前所述，原生的R语言提供了很多针对表格数据处理的函数，其中就包括表格的输入输出
* `mtcars`是R语言自带的一个数据集，以数据框的形式在R环境中默认加载，我们这里用它来作为学习表格读写的例子。我们可以输入`head(mtcars)`查看前几行:

```r
> head(mtcars)
                   mpg cyl disp  hp drat    wt  qsec vs am gear carb
Mazda RX4         21.0   6  160 110 3.90 2.620 16.46  0  1    4    4
Mazda RX4 Wag     21.0   6  160 110 3.90 2.875 17.02  0  1    4    4
Datsun 710        22.8   4  108  93 3.85 2.320 18.61  1  1    4    1
Hornet 4 Drive    21.4   6  258 110 3.08 3.215 19.44  1  0    3    1
Hornet Sportabout 18.7   8  360 175 3.15 3.440 17.02  0  0    3    2
Valiant           18.1   6  225 105 2.76 3.460 20.22  1  0    3    1
```

* 用`write.csv`或`write.table`可以将数据框以文件的形式写入磁盘

```r
# write.csv输出用逗号作为分隔符的csv(Comma-Separated Values)文件
write.csv(mtcars,"mtcars.csv")
# write.csv默认会给输出的字符串加上双引号，如果不想加可以指定quote=F
write.csv(mtcars,"mtcars.csv",quote=F)
# 用write.table除了逗号还可以指定不同的分隔符(默认为制表符"\t")
write.table(mtcars,"mtcars.txt",quote=F,sep=";") # 用";"作为分隔符
```

* 用`read.csv`或`read.table`可以从磁盘中读取表格文件

```r
my.table <- read.csv("mtcars.csv")
my.table2 <- read.table("mtcars.txt",sep=";")
```

{% hint style="info" %}
R语言中read.csv和read.table通常默认会把表格中的字符串读取成factor类型，如果不希望将字符串转变为因子，需要人为指定参数`stringsAsFactors=FALSE`
{% endhint %}

### 3b) Statistic functions

* R语言提供了大量用于统计分析的函数，可以很方便的计算各种统计量，实现各种统计检验，我们这里提供了三个简单的例子
* 计算均值和标准差

```r
#计算mtcars数据集"mpg"一列的均值
> mean(mtcars$mpg)
[1] 20.09062
#计算mtcars数据集"mpg"一列的标准差
> sd(mtcars$mpg)
[1] 6.026948
```

* t检验:

t 检验是一种假设检验方法，用来判断两组数据的均值是否存在显著差异，本质是看 “两组均值的差别” 是不是大到不能用 “随机抽样误差” 来解释。（原假设 H0​：两组均值没有显著差异（μ0​=μ1​））

简单举例：
```r
t.test(mpg ~ vs, data = mtcars) #t.test(因变量 ~ 分组变量, data = 数据集)
t.test(mtcars$mpg[mtcars$vs==0], mtcars$mpg[mtcars$vs==1]) #t.test(组1, 组2)
```

```r
x=c(5.6,7.9,8.9,19.5,20.5,39.5)
y=c(6.5,8.3,9.1,17.9,29.4,22.8)

# unpaired two tail t test
t.test(x,y,alternative="two.sided")

# unpaired single tail t test for alternative hypothesis mean(x) < mean(y)
t.test(x,y,alternative="less")

# paired single tail t test
t.test(x,y,altrenative="less",paired=TRUE) 
```

* One way ANOVA:

```r
# 生成示例数据集
# 从均值为1,0,-0.5,标准差均为1的3个正态分布中各生成20个样本
R <- c(rnorm(20)+1,rnorm(20),rnorm(20)-0.5)
# 用因子类型定义分组
D <- as.factor(c(rep("A",20),rep("B",20),rep("C",20)))
# 将数据放到一个数据框中
table <- data.frame(R=R,D=D)
# 用one way anova检验A,B,C三组之间是否存在差异
summary(aov(R~D,data=table))
            Df Sum Sq Mean Sq F value   Pr(>F)    
D            2  16.65   8.323   8.417 0.000627 ***
Residuals   57  56.36   0.989                     
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1
```

{% hint style="info" %}
我们上面用到的`R ~ D`在R语言中被称为公式(formula)，在统计分析和作图中都有广泛的应用。`R ~ D`是一个最简单的公式，"\~"符号左边是因变量，右边是自变量。有兴趣深入了解的同学可参考<https://www.datacamp.com/tutorial/r-formula-tutorial>
{% endhint %}

### 3c) aggregate

* 在原生R语言中，`aggregate`函数可以根据数据框的特定列进行分组计算
* `aggregate(要计算的列 ~ 分组列, data = 数据集, 要算的函数)`

```r
# 在mtcars数据集中，按"vs"列分组，计算"mpg"列的均值
> aggregate(mpg ~ vs, mtcars, mean)
  vs      mpg
1  0 16.61667
2  1 24.5571

# this approach also work
> aggregate(mtcars$mpg,by=list(vs=mtcars$vs),mean)
  vs        x
1  0 16.61667
2  1 24.55714
```

> R package [dplyr](https://dplyr.tidyverse.org/)基于自己定义的一套语法，提供了比较方便的操纵数据框的功能(筛选，分组计算等等)，有兴趣的同学可以自行了解

### 3d) More R Examples

* [Plot with R](https://book.ncrnalab.org/teaching/part-i.-programming-skills/2.r/2.2.plots-with-r)
* [Zhi John Lu's Github](https://github.com/urluzhi/scripts/tree/master/Rscript)

## 4) More Reading and Practice

### 4a) Basic

* 《Bioinformatics Data Skills》
  * A Rapid Introduction to the R Language
* [Quick R](https://www.statmethods.net) 可以从如下章节开始 :
  * Learning R
  * R Interface
  * Data Input
  * Statistics

### 4b) Advanced

* 《Bioinformatics Data Skills》
  * Working with Range Data
* [Quick R](https://www.statmethods.net) more chapters
* ["生信分析人员如何系统入门R"](https://mp.weixin.qq.com/s/xOT4QGQsBMwu6R38AE9Y6A) by *biotrainee*

## 5) References

* <http://sape.inf.usi.ch/quick-reference/ggplot2>
* <https://www.analyticsvidhya.com/blog/2015/07/guide-data-visualization-r/>

## Take a break

**R，Robert, 23andMe**

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvIAq96zMkuIeKuk6%2F4-23andme.png?generation=1540298192874626\&alt=media)

> R语言是从S统计绘图语言演变而来。S语言上世纪70年代诞生于AT\&T贝尔实验室，基于S语言开发的商业软件S-Plus，可以方便的编写函数、建立模型，具有良好的扩展性，在国外学术界应用很广。但是由于商业性特征，其软件价格昂贵。

1995年由新西兰Auckland大学统计系教授Robert Gentleman和他的同事Ross Ihaka，基于S语言的源代码，编写了一能执行S语言的软件，并将该软件的源代码全部公开，这就是R软件，因为主要编写的两位科学家名字首字母都是R，因此其命令统称为R语言。他们就是“R语言之父”。

有趣的是，两位“R语言之父”此后发展轨迹并不相似。 Ross于2017 年退休，此前一直担任新西兰Auckland大学统计学副教授。 Robert则从Auckland统计学教授慢慢变成了生物信息学家。2001年，Robert开始研究Bioconductor项目，以促进生物信息学和计算生物学开源工具的开发。2009年，Robert加入Genentech生物技术公司，担任生物信息学和计算生物学高级主管，同年他编写了一本书《R programming for bioinformatics》。2015年，Robert 加入23andMe，担任计算生物学副总裁，如今他专注于探索23andMe数据库中的人类遗传和性状数据如何用于鉴定新的疾病治疗方法。

23andMe公司由Linda Avey，Paul Cusenza和Anne Wojcicki于2006 年创立，旨在为个人消费者提供基因测试及相应服务，以正常人类细胞中的23对染色体命名，23andMe是第一家为提供祖源分析的常染色体DNA检测的公司。

23andMe基于唾液的直接面向消费者（DTC）的基因检测业务在2008 年被时代杂志评为“年度发明” 。2013年11月，因为基因检测报告中遗传疾病预测未得到充分临床经验验证等争议问题，FDA命令23andMe停止在美国销售其唾液收集试剂盒和个人基因组服务（PGS）。此后，23andMe开始扩宽海外市场，并停止提供健康相关的基因报告。经过几年的市场调研，23andMe验证了部分健康相关基因检测的准确性。2017年4月，FDA批准了其公司包括迟发性阿尔茨海默病，帕金森病等在内的10项基因检测申请。2018年3月，FDA批准了与乳腺癌相关的基因突变检测申请。

目前，国内主流的基因检测产品Wegen和23魔方都学习了23andMe的经验，甚至说模仿了23andMe的产品。
