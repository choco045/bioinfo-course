# R


## 一、 R语言是什么？

* 定义与起源：R 语言是一个专门为统计分析而诞生的编程语言 。它由新西兰奥克兰大学（Auckland）的统计系教授 Robert Gentleman 和他的同事 Ross Ihaka 于 1995 年开发。

* 开源性质：两位教授基于 S 语言的源代码编写了这款软件，并将所有源代码公开。因为这两位“R语言之父”的名字首字母都是“R”，所以它被统称为 R 语言。

* 核心哲学：著名计算机科学家 John Chambers 曾用两句话概括了 R 语言的计算逻辑：“存在的所有事物都是一个对象（Object）”；“发生的所有事情都是一次函数调用（Function call）” 。


## 二、 为什么要使用R语言？

* 专业的统计与绘图能力：R 语言非常适合进行生物信息学所需的各类统计分析任务 。同时，原生的 R 语言也拥有出色的科学作图功能。

* **跨平台兼容性**：理想情况下，同一段原生的 R 代码可以在各种操作系统下（如 Linux 的各种发行版、Windows、MacOS 等）完美运行，不过也存在少数特定包（package）只支持特定操作系统的情况 。

* **庞大且开源的扩展包生态**：

  * [CRAN](https://cran.r-project.org/)：你可以在这里找到直接用于解决一般性数据分析任务（如统计绘图、机器学习等）的扩展包（package）。

  * [bioconductor](https://www.bioconductor.org/)：这是一个积累了大量专门针对特定生物信息学问题开发的扩展包（package）的资源库。

* 为了在实际的生物信息数据分析中利用好这些前人实现的R package,我们首先需要熟悉R语言的语法和内置的数据结构。本章中我们将对此进行介绍。

{% hint style="info" %}
**`上机任务`**`：`
`iris`是R语言自带的一个数据集，它默认会作为一个数据框加载到R环境中，请对iris数据做如下分析：
* iris数据集有几列？每列的数据类型是什么?
* 按Species列将数据分成3组，分别计算`Sepal.Length`的均值和标准差，保存为一个csv文件，提供代码和csv文件的内容。
* 对不同Species的Sepal.Width进行One way ANOVA分析，提供代码和输出的结果。
提交文件格式： md（推荐），word, pdf, txt。
{% endhint %}

## 三、 怎么开始使用R语言？

* 前面已经提到，R语言是一个跨平台的编程语言，所以在windows下也可以使用。

* 本教程中方和R语言相关的练习，大家可以在自己的机器上安装相关工具，不一定要使用docker容器(docker容器中已经装好了R环境，但无法使用rstudio这类IDE)。

1. 安装环境与 IDE (integrated development environment集成开发环境)

- Linux 系统安装 R：在 CentOS 下，可以使用命令`yum -y install epel-release`和`yum -y install R`进行安装 ；在 Ubuntu 平台下，可以使用`apt -y install r-base`进行安装 。

- 安装 RStudio：强烈建议在 MacOS 或 Windows 上安装 RStudio 。它是目前最流行的 R 语言集成开发环境（IDE），对代码高亮显示、变量追踪、图片展示以及帮助文档的阅览等都有极好的支持 。

2. 扩展包（Packages）的管理与使用

* 基础包：一些基础的包（如 base, datasets, graphics 等）在打开 R 时就会自动加载完毕 。

* 下载与载入：使用 install.packages() 来下载包 ；使用 library() 函数来将包载入当前的工作环境 。

* 管理与帮助：可以通过 help(package=" ") 查看对应包的帮助文档 ，或者使用 detach("package: ") 从工作环境中删除不再使用的包 。

* 常用包推荐 ：

  - 数据处理：dplyr, tidyr 

  - 文件读取：readr 

  - 字符串处理：stringr 

  - 网页内容提取处理：rvest, xml2, XML 

  - 绘图展示：ggplot2, rgl, plotly, threejs


## 四、 怎么实际应用（核心语法与技巧）？

理解 R 的实际应用，就要回归到“对象（Object）”和“函数调用（Function call）”这两个核心概念。

1. 数据对象（Object）

- 数据类（Data Classes）：主要包含数值型（numeric）、整型（integer）、字符型（character）、复数型（complex）以及逻辑型（logical） 。

- 数据结构/类型（Data Type）：在 R 中常用的数据结构包括向量（Vector）、列表（List）、数组（Array）、矩阵（Matrix）和数据框（Data frame） 。

2. 常用函数分类（Function）

- 工作目录管理：使用 getwd() 查看当前目录，使用 setwd() 设定工作目录 。

- 数据读取与保存：

读取：常用的函数包括 read.table（常搭配参数 header=F, sep="", stringsAsFactors=FALSE）、read.csv()、read.delim()、readLines()，或者使用 readr 包中的 read_delim() 。

保存：可以使用 save() 保存 R 对象，或用 write.table()（例如 write.table(filename, header=T, sep=",")）将数据写入文件 。

- 基础绘图：内置了 hist()、boxplot()、plot()、abline()、persp() 等实用的作图函数 。

- 数据计算：涵盖了算术运算（如 +, -, %% 取余, exp(), sin()）、集合操作（如 c, intersect, union）、数学函数（如 sum, abs, sqrt）和基础统计（如 mean 平均值, sd 标准差, max, min） 。

- 控制结构：支持循环控制流。例如通过 for(i in 1:ncol(x)) 遍历矩阵的列并结合 mean() 计算列均值 。

3. 实战技巧（Tips）

- **数据取子集（Subsetting）** ：

按名称提取：例如 wt_raw_count <- raw_count[c("gene_id", "CD1_1", "CD1_2")] 。

按位置提取：例如 raw_count <- raw_count[, 1:7] 。

按逻辑条件提取：例如通过 x[x<0] 提取出小于 0 的元素 。

- **字符串处理（String Process）** ：

支持正则表达式匹配（如 [0-9], [A-Za-z], \b 等） 。

支持字符串的切割（strsplit(str, "regex")） 。

配合 stringr 包进行子串提取（str_extract）、内容替换（str_replace）以及去除首尾空白（str_trim） 。

## 五、 进阶学习资源

如果您想在统计学和机器学习领域深入挖掘，可以参考 Josh Starmer 主讲的在线频道 “StatQuest”（该频道以通俗易懂的方式讲解了相关的复杂概念），
或者参考哈佛大学的在线课程 “STAT115” 以进一步提升生物信息学分析水平 。
