# 2.2.Plot with R

{% embed url="<https://r-graph-gallery.com/>" %} <mark style="color:orange;">**Very Useful Wesite for R Graph （**</mark><mark style="color:red;">R语言绘图的案例</mark><mark style="color:orange;">**）**</mark>
{% endembed %}

***

本章我们介绍如何使用 R 进行数据可视化。

R语言对于科学作图提供了强大的支持。在R语言中主要存在两套作图系统，一套是R语言原生的Base图形系统，一套是基于R包grid中实现的图形语法进行作图的一系列工具，后者相对而言更加灵活方便。

> 在grid中实现的主要是一些非常底层的作图函数，从使用者的角度来说需要直接调用的情况并不多。[ggplot2](https://ggplot2.tidyverse.org/)和[lattice](https://cran.r-project.org/web/packages/lattice/index.html)两个R包对grid中的函数进行了很好的封装，是实际工作中非常常用的工具。

{% hint style="info" %}
**`上机任务`**`：`

首先，请选择性练习下面各章的 plot 方法。

接着，基于ggplot2,用violin plot对iris数据集中不同Species的Sepal.Length长度分布进行可视化，并进行如下设置。画violin plot时可参考 [2a](#2a-basic-violin-plot))，对作图进行配置还可以参考本节的 [1d)](#customize-boxplot) 和[7](#volcano-plot))。 提交脚本和结果。

* 把图片标题设为"Sepal Length Distribution"，加粗居中(可使用labs函数和theme函数)
* 把y轴范围设为3到9之间(可使用scale\_y\_continuous函数)
* 三个Species的对应的填充颜色分别设为#C44E52, #55A868和#4C72B0(可使用scale\_fill\_manual函数)

> **请在**<mark style="color:red;">**上机前**</mark>**配置好如下两种方案中的至少一种**：
>
> * [Method 1](#plot-in-rstudio). 在自己电脑使用 Rstudio 来画图，优点是使用方便，交互性强。
> * [Method 2](#method-2-use-r-in-docker). 如果实在没有配置好rstudio，也可以在Docker 容器中用命令行的方式来画图，优点是无需额外的安装和配置，docker images的下载链接如[附表](https://book.ncrnalab.org/teaching/appendix/appendix-iv.-teaching#teaching-docker)所示。
>   {% endhint %}

## Method 1: Use Rstudio <a href="#plot-in-rstudio" id="plot-in-rstudio"></a>

本方案需要先按照我们上节课介绍的方法配置好R语言和rstudio，并加载一个我们提供的文件:

* (1) 安装 R: <https://www.r-project.org/>
* (2) 安装 RStudio：<https://www.rstudio.com/>
* (3) 下载并解压[lulab-plot-master.zip](https://cloud.tsinghua.edu.cn/d/ad22768345664924b202/?p=%2FFiles%2FPART_I%2F3.R\&mode=list), 双击其中的 `lulab-plot.Rproj`。主要的代码都包含在一些R markdown文件中。

> R markdown是一种markdown文件的扩展，rstudio可以加载R markdown文件，运行R markdown中的R代码，并将输入输出内嵌在文件中进行展示。

* (4) 安装需要的package:
* (5) 打开 `.Rmd` 文件

用Rstudio打开`all.Rmd`文件, 即可阅读教程，并执行相关代码。

> 如果你更喜欢每个文件仅包含一节的内容（一种 plot 类型），可以先打开`index.Rmd`，安装需要的 packages，然后依次打开每一节对应的 `.Rmd` 文件（动画展了第1、2小节对应的 `1.box-plots.Rmd` 和 `2.violin-plots.Rmd`）

## Method 2: Use R in Docker

如果你在使用方案一时遇到了问题，也可以用我们提供的 Docker（里面已经预装好了 R 语言和需要的 packages）。

### (a) Use R in a Docker container <a href="#r-in-container" id="r-in-container"></a>

首先进入容器：

```bash
docker exec -it bioinfo_tsinghua bash
```

本章的操作均在 `/home/test/plot/` 下进行:

```bash
cd /home/test/plot/
```

进入容器后，输入`R`回车进入R的交互式环境：

```bash
R
```

在实际画图时，依次将下文给出的 R 代码复制到 Terminal 中运行。

### (b) load data, install & library packages

#### Prepare output directory

* 在R语言中也提供了操作文件系统的函数，例如可以用`dir.create`建立一个新的目录

```r
dir.create('output')
```

#### Load data

* 用`read.table`函数将表格数据读取到数据框中(上一节中我们已对`read.table`函数进行了介绍)

```r
# Read the input files
# “header=T” means that the data has a title, and sep="\t" is used as the separator
data <-read.table("input/box_plots_mtcars.txt",header=T,sep="\t")
df <- data[, c("mpg", "cyl", "wt")]

df2 <-read.table("input/histogram_plots.txt",header=T,sep="\t")

df3 <- read.table("input/volcano_plots.txt", header=T)

df4 <- read.table("input/manhattan_plots_gwasResults.txt",header=T,sep="\t")

df5 <-read.table("input/heatmaps.txt",header=T,sep="\t")

# Covert data into matrix format
# nrow(df5) and ncol(df5) return the number of rows and columns of matrix df5 respectively.
dm <- data.matrix(df5[1:nrow(df5),2:ncol(df5)])

# Get the row names
row.names(dm) <- df5[,1]

df6 <- read.table("input/ballon_plots_GO.txt", header=T, sep="\t")

df7 <- read.table("input/box_plots_David_GO.txt",header=T,sep="\t")
df7 <- df7[1:10,]
```

#### Install R packages

Docker 中已经装好所需要的 R 包，如果你是在自己电脑上运行，则需要安装 ggplot2, qqman, gplots, pheatmap, scales, reshape2, RColorBrewer 和 plotrix（使用 `install.packages()`, 如 `install.packages('ggplot2')`）。

#### Import R packages

```r
library(ggplot2) # R语言中最常用的基于grid的可视化工具

# 另外两个比较常见的作图package
library(gplots) 
library(plotrix)

library(qqman) # 用于GWAS数据可视化

library(pheatmap) #用于绘制热图,ComplexHeatmap也是另外一个常用的package

library(scales) # map numeric value to color
library(RColorBrewer) #提供常见的配色方案

# reshape data in R
library(reshape2) 
library(plyr) 
```

### (c) Save & view the plot

这里我们介绍保存作图结果的两种方式:

1. 在作图代码前加上`pdf("path-to-save.pdf")`，代码后加上`dev.off()`。这样R语言会将图片保存到路径`path-to-save.pdf`中。如果想保存成pdf之外的其他格式，可将pdf()换成png()等相应的函数。这种方式对于原生R语言的作图结果和ggplot2的作图结果都是适用的。以下给出了一个简单的例子:

```r
# 指定输出pdf，路径为output/1.1.Basic_boxplot.pdf，高度宽度均为3
pdf("output/1.1.Basic_boxplot.pdf", height = 3, width = 3)
# ggplot从数据框df中读取作图所需的数据
# aes(x=cyl, y=mpg)告诉ggplot2将数据框中的cyl列作为x轴，mpg列作为y轴
ggplot(df, aes(x=cyl, y=mpg))+ # 加号在ggplot中意思是在当前的ggplot对象上进行修改
# draw the boxplot and fill it with gray
  geom_boxplot(fill="gray")+
# Use the labs function to set the title and modify x and y
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg")+
# Set the theme style
  theme_classic()
# Save the plot
dev.off()
```

1. 使用`ggplot2`中的`ggsave`函数，它只适用于保存ggplot2以及基于ggplot2的一些package的作图结果

```r
# Begin to plot
p <- ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_boxplot(fill="gray")+
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg")+
  theme_classic()
# Sava as pdf
ggsave("output/1.1.Basic_boxplot.pdf", plot=p, height = 3, width = 3)
```

完成作图后，可以将作图结果复制到共享目录中，在宿主机上进行查看

## 1) Box plots <a href="#box-plot" id="box-plot"></a>

### 1a) Basic box plot

* 在箱线图(box plot)中，我们按某个离散变量对数据进行分组展示，即x轴为类别变量，y轴通常为连续变量

```r
# ggplot2通过数据类型是否为factor类型确定一个变量是不是类别变量，用因子的次序确定可视化结果中数据排布的次序
# 所以如果希望作为x轴的变量不是factor类型，需要进行手动转换
df$cyl <- as.factor(df$cyl)
head(df)
```

```
###                    mpg cyl    wt
### Mazda RX4         21.0   6 2.620
### Mazda RX4 Wag     21.0   6 2.875
### Datsun 710        22.8   4 2.320
### Hornet 4 Drive    21.4   6 3.215
### Hornet Sportabout 18.7   8 3.440
### Valiant           18.1   6 3.460
```

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_boxplot(fill="gray")+
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg")+
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgQxyNRFgMlGiTL%2F1.1.Basic_boxplot.png?generation=1540298206203947\&alt=media)

### 1b) Change continuous color by groups

```r
ggplot(df, aes(x=cyl, y=mpg, fill=cyl)) +  # fill=cyl: 用颜色表示cyl一列的数值
  geom_boxplot()+
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg") +
  scale_fill_brewer(palette="Blues") +  # palette="Blues": 定义了一种数值到颜色的对应关系，数值越大蓝色的颜色越深
  theme_bw()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgSnT7uGIuAZuwg%2F1.2.Customized_boxplot.png?generation=1540298206010422\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-box-plot-quick-start-guide-r-software-and-data-visualization>

### 1c) Grouped boxplots

* lattice和ggplot2一样，也是一个比较常用的package，大家有兴趣可自行了解

```r
#Read the data table
data=read.csv("boxplot_example.csv")
###################
#I.Prepare the data
#1.Normalize the data, etc
for (i in 12:17){
    data[,i]=log(data[,i]+1e-3) # log some expression values
}
for (i in 9:17) {
    maxValue=max(data[,i])  #scale the data into 0-1
    minValue=min(data[,i])
    range=maxValue-minValue
    data[,i]=(data[,i]-minValue)/range
}
data$X8.Identity=data$X8.Identity/100

#2.Make the new matrix for boxplot: cleaning the data table
library("reshape")
m=melt(data[,c(2,7:12,14:17)], id=1)# remove some columns not to show and reshape the matrix into 3 columns for boxplot drawing in bwplot
colnames(m)=c("Type","Feature","Normalized_Value")  #define the new column names

#3.Clean the names of each type and each feature
#Merge sub-types of different elements
m[,1]=sub ("ncRNA_selected","RNAI", m[,1])
m[,1]=sub ("ncRNA_3019","RNAII", m[,1])
m[,1]=sub ("exon_CCDS","CDS", m[,1])
m[,1]=sub ("five_prime_UTR","UTR", m[,1])
m[,1]=sub ("three_prime_UTR","UTR", m[,1])
m[,1]=sub ("ancestral_repeat","AP", m[,1])
#Rename the feature
m[,2]=sub('X7.GC','01.GC Content',m[,2])
m[,2]=sub('X8.Identity','02.DNA Conservation',m[,2])
m[,2]=sub('X9.z_score','03.RNA Struc. Free Energy',m[,2])
m[,2]=sub('X10.SCI','04.RNA Struc. Cons.',m[,2])
m[,2]=sub('X11.tblastx_score','05.Protein Conservation',m[,2])
m[,2]=sub('X12.polyA_RNAseq_MAX','06.PolyA+ RNA-seq',m[,2])
m[,2]=sub('X14.small_RNAseq_MAX','07.Small RNA-seq',m[,2])
m[,2]=sub('X15.Array_totalRNA_MAX','08.Total RNA Array',m[,2])
m[,2]=sub('X16.Array_polyA_MAX','09.PolyA+ RNA Array',m[,2])
m[,2]=sub('X17.Array_nonpolyA_MAX','10.PolyA- RNA Array',m[,2])

###########################
#Making Boxplot
library("lattice")
png("boxplot.png",width=1500,height=500) # pdf is recommended for most cases, or png for figure with huge amount of data points
#pdf("boxplot.pdf") 
attach(m)
bwplot(Normalized_Value ~ Type|Feature,fill=c("green","red","yellow","blue","light blue"),layout=c(10,1))
dev.off()
```

> * downlood input: [boxplot\_example.csv](https://github.com/urluzhi/scripts/blob/master/Rscript/R_plot/boxplot_example.csv)
> * download above [R script](https://github.com/urluzhi/scripts/blob/master/Rscript/R_plot/boxplot.R)

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-M7u64nLxu8SbgaEIxR7%2F-M7uP_zU46PP9-fvIJvT%2Fboxplot.png?alt=media\&token=fdfa616d-3f2b-4d35-a4ed-7359936c6aaf)

### 1d) Boxplot with statistical test <a href="#customize-boxplot" id="customize-boxplot"></a>

* ggplot2支持很多个性化的配置，可以进行非常复杂的可视化
* 有很多package对ggplot2进行了封装，如:
  * [ggpubr](https://rpkgs.datanovia.com/ggpubr/index.html)通过封装ggplot2可以简化一些作图的实现，并实现了一些排版和统计检验的注释功能
  * [ggsci](https://cloud.r-project.org/web/packages/ggsci/index.html)收集整理了很多常见的配色方案
  * [ggtree](https://guangchuangyu.github.io/software/ggtree/)实现了系统发生树的作图
  * ...
* 基于这样的package，可以用少量代码实现比较复杂的功能，大家可以根据具体的需求选择使用
* 以下代码对箱线图进行了大量个性化的设置，并利用[ggpubr](https://rpkgs.datanovia.com/ggpubr/index.html)中的`stat_compare_means`函数标注了组件均值差异的显著性
  * `geom_boxplot`: 作箱线图
  * `geom_point`: 展示出每个点的数值(对类别变量x轴的位置引入一定的随机性，避免点的重合，方便展示y轴每个点的分布)
  * `scale_fill_brewer`: 使用RColorBrewer的配色
  * `theme_bw`: 白色背景，其他设置可参考<https://ggplot2-book.org/polishing.html>
  * `theme`: 对各种各样的属性进行配置，可结合具体需求进行调整
    * `panel.grid=element_blank()`: 不绘制网格
    * `panel.border=element_blank()`: 不添加边框
    * `axis.line = element_line(size=1, colour = "black")`: 设置坐标轴颜色和粗细
    * `legend.title = element_text(face="bold", color="black",family = "Arial", size=24)`:设置图注标题属性，文本格式都可以通过`element_text`函数设置
    * ...
    * 更多的设置请参考<https://ggplot2.tidyverse.org/reference/theme.html>
  * `stat_compare_means`: ggpubr提供的函数，用于标注统计显著性，输入为需要进行的两两比较列表
  * `labs`: 设置坐标轴标题等

```r
library(ggplot2)
library(ggpubr)
data(iris)
print(levels(iris$Species))
comparisons <- list(c("versicolor","setosa"),c("virginica","versicolor"),c("virginica","setosa"))
ggplot(iris,aes(x=Species,y=Sepal.Length,fill=Species))+geom_boxplot(alpha = 1, size = 1, position = position_dodge(1.1),outlier.size=0,outlier.alpha = 0)+
  geom_point(size = 1, position = position_jitterdodge(dodge.width=0.3,jitter.width = 0.3))+
  scale_fill_brewer(palette="Blues") +
  theme_bw()+
  theme(legend.position="right",
    panel.grid=element_blank(),
    panel.border=element_blank(),
    axis.line = element_line(size=1, colour = "black"),
    legend.title = element_text(face="bold", color="black",family = "Arial", size=24),
    legend.text= element_text(face="bold", color="black",family = "Arial", size=24),
    plot.title = element_text(hjust = 0.5,size=24,face="bold"),
    axis.text.x = element_text(face="bold", color="black", size=24,angle = 45,hjust = 1),
    axis.text.y = element_text(face="bold",  color="black", size=24),
    axis.title.x = element_text(face="bold", color="black", size=24),
    axis.title.y = element_text(face="bold",color="black", size=24))+
stat_compare_means(comparisons = comparisons,
                   method = "wilcox.test",
                   method.args = list(alternative = "greater"),
                   label = "p.signif"
)+labs(x="",title="Boxplot and statistical test", face="bold")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2Fsync%2F21da32855f85b409f9f04b839b82fddbdf3a607b.png?generation=1629519513297267\&alt=media)

## 2) Violin plots <a href="#violin-plot" id="violin-plot"></a>

和箱线图一样，Violin plots 中横轴为类别变量，纵轴为连续变量

### 2a) Basic violin plot

```r
df$cyl <- as.factor(df$cyl)
head(df)
```

```
###                    mpg cyl    wt
### Mazda RX4         21.0   6 2.620
### Mazda RX4 Wag     21.0   6 2.875
### Datsun 710        22.8   4 2.320
### Hornet 4 Drive    21.4   6 3.215
### Hornet Sportabout 18.7   8 3.440
### Valiant           18.1   6 3.460
```

```r
ggplot(df, aes(x=cyl, y=mpg)) +
 geom_violin(trim=FALSE) +
 labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgYaakK8E8VtCEQ%2F2.1.Basic_violinplot.png?generation=1540298205964799\&alt=media)

### 2b) Add summary statistics on a violin plot

#### (2b.1) Add median and quartile

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_violin(trim=FALSE) +
  labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg") +
  stat_summary(fun.y=mean, geom="point", shape=23, size=2, color="red")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHg_MyoHRFJ2qt6t%2F2.2.1.Add_median_and_quartile1_violinplot.png?generation=1540298207104362\&alt=media)

or

```r
 ggplot(df, aes(x=cyl, y=mpg)) + 
   geom_violin(trim=FALSE) +
   labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg") +
   geom_boxplot(width=0.1)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgbaaiHRr2xNFAZ%2F2.2.1.Add_median_and_quartile2_violinplot.png?generation=1540298207212260\&alt=media)

#### (2b.2) Add mean and standard deviation

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_violin(trim=FALSE) +
  labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg") +
  stat_summary(fun.data="mean_sdl", fun.args = list(mult = 1), geom="crossbar", width=0.1 )
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgdVrV6dVHdr9ij%2F2.2.2.Add_mean_and_sd_violinplot1.png?generation=1540298206304397\&alt=media)

or

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_violin(trim=FALSE) +
  labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg") +
  stat_summary(fun.data=mean_sdl, fun.args = list(mult = 1), geom="pointrange", color="red")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgfHbBzeI-EK5Ea%2F2.2.2.Add_mean_and_sd_violinplot2.png?generation=1540298205958558\&alt=media)

### 2c) Change violin plot fill colors

```r
ggplot(df, aes(x=cyl, y=mpg, fill=cyl)) + 
  geom_violin(trim=FALSE) +
  geom_boxplot(width=0.1, fill="white") +
  labs(title="Plot of mpg per cyl", x="Cyl", y = "Mpg") +
  scale_fill_brewer(palette="Blues") + 
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHghYrDUE5B0jAaf%2F2.3.Customized_violinplot.png?generation=1540298206171486\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-violin-plot-quick-start-guide-r-software-and-data-visualization>

## 3) Histogram plots <a href="#histogram-plot" id="histogram-plot"></a>

### 3a) Basic histogram plot

```r
head(df2)
```

```
###   sex weight
### 1   F     49
### 2   F     56
### 3   F     60
### 4   F     43
### 5   F     57
### 6   F     58
```

```r
ggplot(df2, aes(x=weight)) + geom_histogram(binwidth=1)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgjcR6nlyZambWD%2F3.1.Basic_histogramplot.png?generation=1540298205976658\&alt=media)

### 3b) Add mean line on a histogram plot

```r
ggplot(df2, aes(x=weight)) + 
  geom_histogram(binwidth=1, color="black", fill="white") +
  geom_vline(aes(xintercept=mean(weight)),color="black", linetype="dashed", size=0.5)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHglJk2osann295S%2F3.2.Add_meanline_histogramplot.png?generation=1540298205946240\&alt=media)

### 3c) Change histogram plot fill colors

```r
##Use the plyr package to calculate the average weight of each group :
mu <- ddply(df2, "sex", summarise, grp.mean=mean(weight))
head(mu)
```

```
###   sex grp.mean
### 1   F    54.70
### 2   M    65.36
```

```r
##draw the plot
ggplot(df2, aes(x=weight, color=sex)) +
  geom_histogram(binwidth=1, fill="white", position="dodge")+
  geom_vline(data=mu, aes(xintercept=grp.mean, color=sex), linetype="dashed") +
  scale_color_brewer(palette="Paired") + 
  theme_classic()+
  theme(legend.position="top")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgnqIPX8urOFgTE%2F3.3.Customized_histogramplot.png?generation=1540298206087433\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-histogram-plot-quick-start-guide-r-software-and-data-visualization>

## 4) Density plots <a href="#density-plot" id="density-plot"></a>

### 4a) Basic density

```r
head(df2)
```

```
###   sex weight
### 1   F     49
### 2   F     56
### 3   F     60
### 4   F     43
### 5   F     57
### 6   F     58
```

```r
ggplot(df2, aes(x=weight)) + 
  geom_density()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgppHje3cpbdfkI%2F4.1.Basic_densityplot.png?generation=1540298205975642\&alt=media)

### 4b) Add mean line on a density plot

```r
ggplot(df2, aes(x=weight)) +
  geom_density() +
  geom_vline(aes(xintercept=mean(weight)), color="black", linetype="dashed", size=0.5)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgrXmbbjxDseAQY%2F4.2.Add_meanline_densityplot.png?generation=1540298206043028\&alt=media)

### 4c) Change density plot fill colors

```r
##Use the plyr package plyr to calculate the average weight of each group :
mu <- ddply(df2, "sex", summarise, grp.mean=mean(weight))
head(mu)
```

```
###   sex grp.mean
### 1   F    54.70
### 2   M    65.36
```

draw the plot

### 4d) Change fill colors

```r
ggplot(df2, aes(x=weight, fill=sex)) +
  geom_density(alpha=0.7)+
  geom_vline(data=mu, aes(xintercept=grp.mean, color=sex), linetype="dashed")+
  labs(title="Weight density curve",x="Weight(kg)", y = "Density") + 
  scale_color_brewer(palette="Paired") +
  scale_fill_brewer(palette="Blues") +
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgtgE2UOCE_tWOc%2F4.3.1.Customized_histogramplot1.png?generation=1540298206033726\&alt=media)

### 4e) Change line colors

```r
ggplot(df2, aes(x=weight, color=sex)) +
  geom_density()+
  geom_vline(data=mu, aes(xintercept=grp.mean, color=sex), linetype="dashed")+
  labs(title="Weight density curve",x="Weight(kg)", y = "Density") + 
  scale_color_brewer(palette="Paired") +
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgv5bhx1hBmugGs%2F4.3.2.Customized_histogramplot2.png?generation=1540298205989888\&alt=media)

### 4f) Combine histogram and density plots

```r
ggplot(df2, aes(x=weight, color=sex, fill=sex)) + 
  geom_histogram(binwidth=1, aes(y=..density..), alpha=0.5, position="identity") +
  geom_density(alpha=.2) +
  labs(title="Weight density curve",x="Weight(kg)", y = "Density") + 
  scale_color_brewer(palette="Paired") +
  scale_fill_brewer(palette="Blues") +
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgxMm3VY4lCunRA%2F4.3.3.Customized_histogramplot3.png?generation=1540298206033620\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-density-plot-quick-start-guide-r-software-and-data-visualization>

## 5) Dot plots <a href="#dot-plot" id="dot-plot"></a>

### 5a) Basic dot plots

```r
df$cyl <- as.factor(df$cyl) #我们这里同样希望ggplot2把x轴当作类别变量
head(df)
```

```
###                    mpg cyl    wt
### Mazda RX4         21.0   6 2.620
### Mazda RX4 Wag     21.0   6 2.875
### Datsun 710        22.8   4 2.320
### Hornet 4 Drive    21.4   6 3.215
### Hornet Sportabout 18.7   8 3.440
### Valiant           18.1   6 3.460
```

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_dotplot(binaxis='y', stackdir='center', binwidth=1)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgz4VksGvL06mqo%2F5.1.Basic_dotplot.png?generation=1540298206151735\&alt=media)

### 5b) Add mean and standard deviation

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_dotplot(binaxis='y', stackdir='center', binwidth=1) + 
  stat_summary(fun.data="mean_sdl", fun.args = list(mult=1), geom="crossbar", width=0.5)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHh0fGFeqSb9euQ1%2F5.2.Add_mean_and_sd1_dotplot.png?generation=1540298206027483\&alt=media)

or

```r
ggplot(df, aes(x=cyl, y=mpg)) + 
  geom_dotplot(binaxis='y', stackdir='center', binwidth=1) + 
  stat_summary(fun.data="mean_sdl", fun.args = list(mult=1), geom="pointrange", color="red")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHh2UEY_b_aLMacj%2F5.2.Add_mean_and_sd2_dotplot.png?generation=1540298206014069\&alt=media)

### 5c) Change dot colors

```r
ggplot(df, aes(x=cyl, y=mpg, fill=cyl, shape=cyl)) + 
  geom_dotplot(binaxis='y', stackdir='center', binwidth=1, dotsize=0.8) + 
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg") +
  #stat_summary(fun.data="mean_sdl", fun.args = list(mult=1), geom="crossbar", width=0.5) +
  scale_fill_brewer(palette="Blues") +
  #scale_color_brewer(palette="Blues") +
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHh4zxvzgRJ6cgEi%2F5.3.Customized_dotplot.png?generation=1540298206017006\&alt=media)

### 5d) Change dot colors, shapes and align types

```r
ggplot(df, aes(x=cyl, y=mpg, color=cyl, shape=cyl)) + 
  geom_jitter(position=position_jitter(0.1), cex=2)+
  labs(title="Plot of mpg per cyl",x="Cyl", y = "Mpg") + 
  scale_color_brewer(palette="Blues") + 
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHh6beG8wSv-8yX4%2F5.4.Customized_dotplot.png?generation=1540298206550919\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-dot-plot-quick-start-guide-r-software-and-data-visualization>

## 6) Scatter plots <a href="#scatter-plot" id="scatter-plot"></a>

### 6a) Basic scatter plots

```r
df$cyl <- as.factor(df$cyl)
head(df)
```

```
###                    mpg cyl    wt
### Mazda RX4         21.0   6 2.620
### Mazda RX4 Wag     21.0   6 2.875
### Datsun 710        22.8   4 2.320
### Hornet 4 Drive    21.4   6 3.215
### Hornet Sportabout 18.7   8 3.440
### Valiant           18.1   6 3.460
```

```r
ggplot(df, aes(x=wt, y=mpg)) + 
  geom_point(size=1.5)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHh8v286NrMRMkpm%2F6.1.Basic_scatterplot.png?generation=1540298205997627\&alt=media)

### 6b) Add regression lines and change the point colors, shapes and sizes

```r
ggplot(df, aes(x=wt, y=mpg, color=cyl, shape=cyl)) +
  geom_point(size=1.5) + 
  geom_smooth(method=lm, se=FALSE, fullrange=TRUE) +
  theme_classic()
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhAx9QIQNWUVpB_%2F6.2.Customized_scatterplot.png?generation=1540298205991294\&alt=media)

Reference: <http://www.sthda.com/english/wiki/ggplot2-scatter-plots-quick-start-guide-r-software-and-data-visualization>

### 6c) Scatter plot with statistical test

```r
data(cars)
ggscatter(cars, x = "speed", y = "dist", 
          add = "reg.line", conf.int = TRUE, 
          cor.coef = TRUE, cor.coeff.args = list(method = "spearman", label.x = 15, label.y = 0.05,label.sep = "\n",size = 8))+
  theme(legend.position="right",
    panel.grid=element_blank(),
    legend.title = element_text(face="bold", color="black",family = "Arial", size=20),
    legend.text= element_text(face="bold", color="black",family = "Arial", size=20),
    plot.title = element_text(hjust = 0.5,size=24,face="bold"),
    axis.text.x = element_text(face="bold", color="black", size=20),
    axis.text.y = element_text(face="bold",  color="black", size=20),
    axis.title.x = element_text(face="bold", color="black", size=24),
    axis.title.y = element_text(face="bold",color="black", size=24))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2Fsync%2F1d671fedff80a50def144aa2da2e28a0370c3da6.png?generation=1629519516329669\&alt=media)

### 6d) Multiple correlation plot

```r
data(iris)
library(Hmisc)
library(corrplot)
res2 <- rcorr(as.matrix(iris[c("Sepal.Width","Petal.Length","Petal.Width")]))
corrplot(corr = res2$r,tl.col="black",type="lower", order="original",tl.pos = "d",tl.cex=1.2,
         p.mat = res2$P, sig.level = 0.05,insig = "blank")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2Fsync%2F9ca9df444a8481cd37702d72cdf742e87b0a1584.png?generation=1629519515201204\&alt=media)

## 7) Volcano plots <a href="#volcano-plot" id="volcano-plot"></a>

用如[2.3](https://book.ncrnalab.org/teaching/part-iii.-ngs-data-analyses/2.rna-seq/2.3.differential_expression_with_deseq2-edger)介绍的方法进行差异表达分析，得到的结果可以用来作火山图

```r
head(df3)
```

```
###      Gene log2FoldChange    pvalue      padj
### 1    DOK6         0.5100 1.861e-08 0.0003053
### 2    TBX5        -2.1290 5.655e-08 0.0004191
### 3 SLC32A1         0.9003 7.664e-08 0.0004191
### 4  IFITM1        -1.6870 3.735e-06 0.0068090
### 5   NUP93         0.3659 3.373e-06 0.0068090
### 6 EMILIN2         1.5340 2.976e-06 0.0068090
```

```r
# 把基因归为上调，不变，下调三类，用因子表示，放在threshold一列，用于定义颜色
df3$threshold <- as.factor(ifelse(df3$padj < 0.05 & abs(df3$log2FoldChange) >=1,ifelse(df3$log2FoldChange > 1 ,'Up','Down'),'Not'))
ggplot(data=df3, aes(x=log2FoldChange, y =-log10(padj), color=threshold,fill=threshold)) +
  scale_color_manual(values=c("blue", "grey","red"))+ #手动指定三类基因的颜色
  geom_point(size=1) +
  xlim(c(-3, 3)) +
  theme_bw(base_size = 12, base_family = "Times") +
  geom_vline(xintercept=c(-1,1),lty=4,col="grey",lwd=0.6)+
  geom_hline(yintercept = -log10(0.05),lty=4,col="grey",lwd=0.6)+
  theme(legend.position="right",
  panel.grid=element_blank(),
        legend.title = element_blank(),
        legend.text= element_text(face="bold", color="black",family = "Times", size=8),
        plot.title = element_text(hjust = 0.5),
        axis.text.x = element_text(face="bold", color="black", size=12),
        axis.text.y = element_text(face="bold",  color="black", size=12),
        axis.title.x = element_text(face="bold", color="black", size=12),
        axis.title.y = element_text(face="bold",color="black", size=12))+
  labs(x="log2FoldChange",y="-log10 (adjusted p-value)",title="Volcano plot of DEG", face="bold")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhCiuEvgORQMTK9%2F7.Customized_volcanoplot.png?generation=1540298206084173\&alt=media)

## 8) Manhattan plots <a href="#manhattan-plot" id="manhattan-plot"></a>

```r
head(df4)
```

```
###   SNP CHR BP         P
### 1 rs1   1  1 0.9148060
### 2 rs2   1  2 0.9370754
### 3 rs3   1  3 0.2861395
### 4 rs4   1  4 0.8304476
### 5 rs5   1  5 0.6417455
### 6 rs6   1  6 0.5190959
```

```r
manhattan(df4, main = "GWAS results", ylim = c(0, 8),
    cex = 0.5, cex.axis=0.8, col=c("dodgerblue4","deepskyblue"),
          #suggestiveline = F, genomewideline = F, #remove the suggestive and genome-wide significance lines
          chrlabs = as.character(c(1:22)))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhEXdpRJqEbOFTm%2F8.Customized_manhattannplot.png?generation=1540298206824875\&alt=media)

## 9) Heatmaps <a href="#heatmap-plot" id="heatmap-plot"></a>

* Heatmap是可视化基因表达的常见方法
* 我们这里提供gplots package提供的heatmap.2函数和pheatmap package提供的pheatmap函数，以及ggplot2的scale\_fill\_gradient三个例子
* [ComplexHeatmap](https://jokergoo.github.io/ComplexHeatmap-reference/book/)也是一个很常见的工具，推荐大家了解

### 9a) gplots package: `heatmap.2()`

```r
head(dm)
```

```
###       Control1      Tumor2 Control3     Tumor4 Control5     Tumor1
### Gene1 3.646058 -0.98990248 2.210404 -0.2063050 2.859744  1.3304284
### Gene2 4.271172 -1.16217765 2.734119 -2.4782173 3.752013  0.0255639
### Gene3 3.530448  1.11451101 1.635485 -0.4241215 3.701427  1.2263312
### Gene4 3.061122 -1.18791027 4.331229  0.8733314 2.349352  0.4825479
### Gene5 1.956817  0.25431042 1.984438  1.2713845 1.685917  1.4554739
### Gene6 2.000919  0.06015972 4.480901  0.9780682 3.063475 -0.4222994
###       Control2     Tumor3 Control4     Tumor5
### Gene1 2.690376  0.6135943 2.470413  0.5158246
### Gene2 4.471795  1.6516242 2.735508 -0.5837784
### Gene3 3.588787 -0.6349656 1.999844  0.1417349
### Gene4 1.854433 -1.2237684 1.154377 -0.9301261
### Gene5 2.445830  0.3316909 2.715163  0.1866400
### Gene6 3.585366  1.0689000 2.563422  1.3465830
```

```r
##to draw high expression value in red, we use colorRampPalette instead of redblue in heatmap.2
##colorRampPalette is a function in the RColorBrewer package
cr <- colorRampPalette(c("blue","white","red"))
heatmap.2(dm,
          scale="row", #scale the rows, scale each gene's expression value
          key=T, keysize=1.1, 
          cexCol=0.9,cexRow=0.8,
          col=cr(1000),
          ColSideColors=c(rep(c("blue","red"),5)),
          density.info="none",trace="none",
          #dendrogram='none', #if you want to remove dendrogram 
          Colv = T,Rowv = T) #clusters by both row and col
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhGBg4MUmcChFNt%2F9.1.Customized_heatmap.png?generation=1540298214177802\&alt=media)

### 9b) pheatmap package: pheatmap()

```r
# pheatmap的annotation_col和annotation_row可以传入数据框，用于行和列的注释
# annotation_col行数和矩阵列数相同，annotation_row行数和矩阵行数相同，它们都可以包含多列，用于标记不同的注释信息
annotation_col = data.frame(CellType = factor(rep(c("Control", "Tumor"), 5)), Time = 1:5)
# annotation_col(annotation_row)的行名应与矩阵的列（行）名一致
rownames(annotation_col) = colnames(dm)
annotation_row = data.frame(GeneClass = factor(rep(c("Path1", "Path2", "Path3"), c(10, 4, 6))))
rownames(annotation_row) = paste("Gene", 1:20, sep = "")
# pheatmap接受一个列表用于设置annotation_col和annotation_row的颜色
ann_colors = list(Time = c("white", "springgreen4"), 
                  CellType = c(Control = "#7FBC41", Tumor = "#DE77AE"),
                  GeneClass = c(Path1 = "#807DBA", Path2 = "#9E9AC8", Path3 = "#BCBDDC"))
# draw the heatmap
pheatmap(dm, 
         cutree_col = 2, cutree_row = 3, #break up the heatmap by clusters you define
         cluster_rows=TRUE, show_rownames=TRUE, cluster_cols=TRUE, #by default, pheatmap clusters by both row and col
         annotation_col = annotation_col, annotation_row = annotation_row,annotation_colors = ann_colors)
# pheatmap默认会对行和列聚类，如果不想聚类，可以把cluster_rows和cluster_cols设成False
# 其他常用参数包括颜色的设置等，例如color = colorRampPalette(rev(brewer.pal(n = 7, name ="RdBu")))(100)
# 具体可参考https://www.rdocumentation.org/packages/pheatmap/versions/1.0.12/topics/pheatmap
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhI8ggwPnrgNur5%2F9.2.Customized_heatmap.png?generation=1540298206165478\&alt=media)

### 9c) ggplot2 package

```r
##9.3.1.cluster by row and col
##cluster and re-order rows
rowclust = hclust(dist(dm))
reordered = dm[rowclust$order,]
##cluster and re-order columns
colclust = hclust(dist(t(dm)))
##9.3.2.scale each row value in [0,1]
dm.reordered = reordered[, colclust$order]
dm.reordered=apply(dm.reordered,1,rescale) #rescale is a function in the scales package
dm.reordered=t(dm.reordered) #transposed matrix
##9.3.3.save col and row names before changing the matrix format
col_name=colnames(dm.reordered) 
row_name=rownames(dm.reordered) 
##9.3.4.change data format for geom_title 
colnames(dm.reordered)=1:ncol(dm.reordered)
rownames(dm.reordered)=1:nrow(dm.reordered)
dm.reordered=melt(dm.reordered) #melt is a function in the reshape2 package
head(dm.reordered)
##9.3.5.draw the heatmap
ggplot(dm.reordered, aes(Var2, Var1)) + 
  geom_tile(aes(fill = value), color = "white") + 
  scale_fill_gradient(low = "white", high = "steelblue") +
  theme_grey(base_size = 10) + 
  labs(x = "", y = "") + 
  scale_x_continuous(expand = c(0, 0),labels=col_name,breaks=1:length(col_name)) + 
  scale_y_continuous(expand = c(0, 0),labels=row_name,breaks=1:length(row_name))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhKdzdmm6UpyuOi%2F9.3.Customized_heatmap.png?generation=1540298206322547\&alt=media)

## 10) Ballon plots <a href="#ballon-plot" id="ballon-plot"></a>

### 10a) basic ballon plots

```r
head(df6)
```

```
###                    Biological.process Fold.enrichment X.log10.Pvalue. col
### 1    Small molecule metabolic process             1.0              16   1
### 2   Single-organism catabolic process             1.5              12   1
### 3           Oxoacid metabolic process             2.0              23   1
### 4 Small molecule biosynthetic process             2.5               6   1
### 5   Carboxylic acid metabolic process             2.7              24   1
### 6      Organic acid metabolic process             2.7              25   1
```

```r
ggplot(df6, aes(x=Fold.enrichment, y=Biological.process)) +
  geom_point(aes(size = X.log10.Pvalue.)) +
  scale_x_continuous(limits=c(0,7),breaks=0:7) +
  scale_size(breaks=c(1,5,10,15,20,25)) +
  theme_light() +
  theme(panel.border=element_rect(fill='transparent', color='black', size=1),
        plot.title = element_text(color="black", size=14, hjust=0.5, face="bold", lineheight=1),
        axis.title.x = element_text(color="black", size=12, face="bold"),
        axis.title.y = element_text(color="black", size=12, vjust=1.5, face="bold"),
        axis.text.x = element_text(size=12,color="black",face="bold"),
        axis.text.y = element_text(size=12,color="black",face="bold"),
        legend.text = element_text(color="black", size=10, hjust=-2),
        legend.position="bottom") +
  labs(x="Fold Enrichment",y="Biological Process",size="-log10(Pvalue)", title="GO Enrichment",face="bold")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhMoZ9xigb4E8y3%2F10.1.Basic_ballonplot.png?generation=1540298206184216\&alt=media)

### 10b) change the dot colors

```r
ggplot(df6, aes(x=col, y=Biological.process,color=X.log10.Pvalue.)) +
  geom_point(aes(size = Fold.enrichment)) +
  scale_x_discrete(limits=c("1")) +
  scale_size(breaks=c(1,2,4,6)) +
  scale_color_gradient(low="#fcbba1", high="#a50f15") +
  theme_classic() +
  theme(panel.border=element_rect(fill='transparent', color='black', size=1),
        plot.title = element_text(color="black", size=14, hjust=0.5, face="bold", lineheight=1),
        axis.title.x = element_blank(),
        axis.title.y = element_text(color="black", size=12, face="bold"),
        axis.text.x = element_blank(),
        axis.ticks = element_blank(),
        axis.text.y = element_text(size=12,color="black",face="bold"),
        legend.text = element_text(color="black", size=10)) +
  labs(y="Biological Process",size="Fold Enrichment", color="-Log10(Pvalue)",title="GO Enrichment",face="bold")
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhORumPkpAdOU5f%2F10.2.Customized_ballonplot.png?generation=1540298206087017\&alt=media)

## 11) Vennpie plots <a href="#vennpie-plot" id="vennpie-plot"></a>

The vennpie plot is the combination of a venn diagram and a pie chart.

```r
##11.1.data input (number of reads mapped to each category)
total=100
rRNA=5
mtRNA=7
intergenic=48 
introns=12
exons=30
upstream=3
downstream=6
not_near_genes=40

rest=total-rRNA-mtRNA
genic=rest-intergenic
introns_and_exons=introns+exons-genic


##11.2 draw the plot
## parameter for pie chart
iniR=0.2 # initial radius
colors=list(NO='white',total='black',mtRNA='#e5f5e0',rRNA='#a1d99b',
            genic='#3182bd',intergenic='#fec44f',introns='#fc9272',
            exons='#9ecae1',upstream='#ffeda0',downstream='#fee0d2',
            not_near_genes='#d95f0e')

## from outer circle to inner circle
##0 circle: blank
pie(1, radius=iniR, init.angle=90, col=c('white'), border = NA, labels='')
##4 circle: show genic:exons and intergenic:downstream
floating.pie(0,0,
             c(exons, genic-exons+not_near_genes, downstream, mtRNA+rRNA+intergenic-not_near_genes-downstream),
             radius=5*iniR, 
             startpos=pi/2, 
             col=as.character(colors[c('exons','NO','downstream','NO')]),
             border=NA)
##3 circle: show genic:introns and intergenic:not_near_genes | upstream
floating.pie(0,0,
             c(genic-introns, introns, not_near_genes, intergenic-upstream-not_near_genes, upstream, mtRNA+rRNA),
             radius=4*iniR,
             startpos=pi/2, 
             col=as.character(colors[c('NO','introns','not_near_genes','NO','upstream','NO')]),
             border=NA)
##2 circle: divide the rest into genic and intergenic
floating.pie(0,0,
             c(genic, intergenic, mtRNA+rRNA),
             radius=3*iniR, 
             startpos=pi/2, 
             col=as.character(colors[c('genic','intergenic','NO')]),
             border=NA)
##1 circle: for rRNA+mtRNA+rest
floating.pie(0,0, 
             c(rest, rRNA,mtRNA), 
             radius=2*iniR, 
             startpos=pi/2, 
             col=as.character(colors[c('NO','rRNA','mtRNA')]), 
             border = NA)
legend(0, 6*iniR, gsub("_"," ",names(colors)[-1]), 
       col=as.character(colors[-1]), 
       pch=19, bty='n', ncol=2)

### or, in one column with reads count and %
##names=gsub("_"," ",names(colors)[-1])
##values = sapply(names(colors)[-1], get)
##percent=format(100*values/total, digits=2, trim=T)
##values = format(values, big.mark=",", scientific=FALSE, trim=T)
##cl=as.character(colors[-1])
##pchs=rep(19, length(cl)); pchs[1]=1;
##legend(0, 5*iniR, paste(names," (",values,", ", percent,"%)", sep=""), 
##       col=cl, pch=pchs,bty='n', ncol=1, cex=0.6)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHhQu_dh3ftX803_%2F11.Customized_vennpieplot.png?generation=1540298206840196\&alt=media)

Reference: <http://onetipperday.sterding.com/2014/09/vennpier-combination-of-venn-diagram.html>

## 12) Colored Bar plot for GO results <a href="#goplot" id="goplot"></a>

```r
df7$Term <- sapply(strsplit(as.vector(df7$Term),'~'),'[',2)
head(df7)
```

```
#          Category                                                         Term Count       X.      PValue
#1 GOTERM_BP_DIRECT                               chemical synaptic transmission     6 4.651163 0.003873106
#2 GOTERM_BP_DIRECT                                                cell motility     3 2.325581 0.007016402
#3 GOTERM_BP_DIRECT negative regulation of intrinsic apoptotic signaling pathway     3 2.325581 0.011455205
#4 GOTERM_BP_DIRECT                protein N-linked glycosylation via asparagine     3 2.325581 0.014940498
#5 GOTERM_BP_DIRECT            positive regulation of androgen receptor activity     2 1.550388 0.017976476
#6 GOTERM_BP_DIRECT                               photoreceptor cell maintenance     3 2.325581 0.024198625
#                                                                                                                   Genes
#1 ENSMUSG00000032360, ENSMUSG00000020882, ENSMUSG00000000766, ENSMUSG00000020745, ENSMUSG00000029763, ENSMUSG00000066392
#2                                                             ENSMUSG00000022665, ENSMUSG00000043850, ENSMUSG00000031078
#3                                                             ENSMUSG00000095567, ENSMUSG00000036199, ENSMUSG00000030421
#4                                                             ENSMUSG00000031232, ENSMUSG00000028277, ENSMUSG00000024172
#5                                                                                 ENSMUSG00000038722, ENSMUSG00000028964
#6                                                             ENSMUSG00000037493, ENSMUSG00000043850, ENSMUSG00000020212
#  List.Total Pop.Hits Pop.Total Fold.Enrichment Bonferroni Benjamini       FDR
#1        110      172     18082        5.734249  0.8975036 0.8975036  5.554012
#2        110       21     18082       23.483117  0.9839676 0.8733810  9.848665
#3        110       27     18082       18.264646  0.9988443 0.8950571 15.604073
#4        110       31     18082       15.907918  0.9998546 0.8901964 19.881092
#5        110        3     18082      109.587879  0.9999763 0.8811197 23.441198
#6        110       40     18082       12.328636  0.9999994 0.9089683 30.281607
```

```r
ggplot(df7) + geom_bar(stat="identity", width=0.6, aes(Term,Fold.Enrichment, fill=-1*log10(PValue)),colour="#1d2a33") + 
  coord_flip() +
  scale_fill_gradient(low="#e8f3f7",high="#236eba")+
  labs(fill=expression(-log10_Pvalue), x="GO Terms",y="foldEnrichment", title="GO Biological Process") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5))  +
  theme(axis.title.x =element_text(size=16), 
  axis.title.y=element_text(size=14)) +
  theme(axis.text.y = element_text(size = 10,face="bold"),
  axis.text.x = element_text(size = 12,face="bold"))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgUEoOaZfy4pNTc%2F1.3.Customized_boxplot2.png?generation=1540298207574935\&alt=media)

```r
ggplot(df7) + geom_bar(stat="identity", width=0.6, aes(Term,Fold.Enrichment, fill=-1*log10(PValue)),colour="#1d2a33") + 
  coord_flip() +
  scale_fill_gradient(low="#feff2b",high="#fe0100")+
  labs(fill=expression(-log10_Pvalue), x="GO Terms",y="foldEnrichment", title="GO Biological Process") +
  theme_bw() +
  theme(plot.title = element_text(hjust = 0.5))  +
  theme(axis.title.x =element_text(size=16), 
  axis.title.y=element_text(size=14)) +
  theme(axis.text.y = element_text(size = 10,face="bold"),
  axis.text.x = element_text(size = 12,face="bold"))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2F-LPVv7obRlTivTDgBNhr%2F-LPVvHgWv8ye6yzXqYJL%2F1.4.Customized_boxplot3.png?generation=1540298206096514\&alt=media)

## 13) Combined barplot

```r
library(reshape2)
#build example matrix
mat <- as.data.frame(list(c(100,10,1),c(3,6,100)))
colnames(mat) <- c("a","b")
rownames(mat) <- c("gene1","gene2","gene3")
plot <- melt(mat)
plot$gene <- rep(c("gene1","gene2","gene3"),ncol(mat))
colnames(plot) <- c("sample","value","gene")

#barplot
library(ggpubr)
plot_a <- plot[plot$sample=="a",]
plot_b <- plot[plot$sample=="b",]
barplot_theme <- function(){
  theme(
    plot.margin = unit(x=c(10,5,0,5),units="pt"),
    legend.position="null",
    panel.grid=element_blank(),
    panel.border=element_blank(),
    axis.line.y = element_line(color = "black",size = 1.5),
    axis.ticks.y = element_line(color = "black",size = 1.5),
    axis.ticks.x = element_blank(),
    legend.title = element_text(face="bold", color="black",family = "Arial", size=20),
    legend.text= element_text(face="bold", color="black",family = "Arial", size=20),
    plot.title = element_text(hjust = 0.5,size=24,face="bold"),
    axis.text.x = element_blank(),
    #axis.text.x = element_text(face="bold", color="black", size=20, angle = 90,hjust = 0,vjust = 0.5),
    axis.text.y = element_text(face="bold",  color="black", size=18, angle = 90,hjust=0.5),
    axis.title.x = element_text(face="bold", color="black", size=24),
    axis.title.y = element_text(face="bold",color="black", size=24))
}
p_a <- ggplot(plot_a,aes(x=gene,y=value,fill=sample))+geom_bar(stat = "identity",color = "black",size = 1.2)+
  theme_bw()+
  xlab("")+
  ylab("value: a")+
  barplot_theme()+
  scale_fill_manual(values=c("blue"))

p_b <- ggplot(plot_b,aes(x=gene,y=value,fill=sample))+geom_bar(stat = "identity",color = "black", size= 1.2)+
  theme_bw()+
  scale_y_reverse()+
  xlab("")+
  ylab("value: b")+
  barplot_theme()+
  scale_fill_manual(values = c("red"))

#plot combination
ggarrange(p_a, p_b,
          ncol = 1, nrow = 2,heights = 5,align = c("v"))
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2Fsync%2Fc252e61ee5495a98666e7b908a981af79e6708d9.png?generation=1629519515534289\&alt=media)

## 14) Stacked barplot

```r
#build example matrix
fraction <- as.data.frame(list(c(0.2,0.3,0.5),c(0.1,0.7,0.2),c(0.8,0.1,0.1)))
colnames(fraction) <- c("a","b","c")
rownames(fraction) <- c("componentA","componentB","componentC")
fraction
stackplot <- melt(fraction)
stackplot$component <- rep(c("componentA","componentB","componentC"),ncol(fraction))
colnames(stackplot) <- c("sample","fraction","component")

#stackplot
ggplot(stackplot,aes(x=sample,y=fraction*100,fill = component)) + geom_bar(stat = "identity", width=0.5, col='black') +
  theme_bw()+
  theme(#legend.position="bottom",
    legend.position="right",
    panel.grid=element_blank(),
    legend.title = element_text(face="bold", color="black",family = "Arial", size=20),
    legend.text= element_text(face="bold", color="black",family = "Arial", size=20),
    plot.title = element_text(hjust = 0.5,size=24,face="bold"),
    axis.text.x = element_text(face="bold", color="black", size=20,angle = 90,hjust = 1,vjust =0.5),
    axis.text.y = element_text(face="bold",  color="black", size=20),
    axis.title.x = element_text(face="bold", color="black", size=24),
    axis.title.y = element_text(face="bold",color="black", size=24))+
  ylab("Fraction(%)")+
  xlab("")+
  #geom_vline(aes(xintercept=6.5))+
  scale_y_continuous(breaks = c(0,25,50,75,100),labels = c("0","25","50","75","100"),expand = c(0,0),limits = c(0,103))
scale_fill_aaas(alpha = 1)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LPVsf5VZbQ7h14X29qW%2Fsync%2Ff9b4a360b1a844e69a8abb5e1fd67ba710134929.png?generation=1629519512277985\&alt=media)

## 15) Radar plot

```
#prepare library
library(ggradar)
library(ggplot2)

#build plot data
test<-as.tibble(t(data.frame(A=c(0.4,0.3,0.2,0.05,0.05,0),B=c(0.02,0,0.25,0.1,0.55,0.08))))
test$group <- c("group A","group B")

#plot
ggradar(test[,c(ncol(test),order(test[1,-ncol(test)],decreasing = TRUE))],grid.min = 0,grid.mid = 0.3, grid.max = 0.6,
        plot.extent.x.sf = 1, plot.extent.y.sf = 1.2,
        values.radar = c("", "30%", "60%"),
        group.point.size = 2,
        group.line.width = 1)
```

![](https://4115668567-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-LPVsf5VZbQ7h14X29qW%2Fuploads%2Fgit-blob-39e145904e50af839858679f7c2ad59ed2cc42cd%2F15.Radar_plot.png?alt=media)

## 16) More Reading <a href="#plot-more" id="plot-more"></a>

* [Guide to Great Beautiful Graphics in R](http://www.sthda.com/english/wiki/ggplot2-essentials)
* [Top 50 ggplot2 Visualizations - The Master List (With Full R Code)](http://r-statistics.co/Top50-Ggplot2-Visualizations-MasterList-R-Code.html)
* [Color Scheme Suggestion](http://colorbrewer2.org/)
* [More Data Visualizations](https://krzjoa.github.io/awesome-r-dataviz/#/)
