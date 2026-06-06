# Machine Learning Basics

## Brief Introduction

根据预测变量是否已知，机器学习问题通常可以分为两类：

* **Supervised Learning** ( 监督学习): 模型有明确的输入（自变量/特征）和输出（因变量/响应变量）。如果目标变量（要预测的变量）是类别信息（例如正/负），该问题称为分类问题。如果目标变量是连续的（例如身高）则为回归问题。
* **Unsupervised Learning** (无监督学习): 目标变量是未指定的。模型的目的是挖掘样本点之间的关系。常见的无监督学习任务包括降维和聚类。

我们这里主要聚焦于有监督学习，分5个小节介绍在实践中如何解决一个分类问题：

# 1.1 Data Pre-processing

我们在实际中遇到的数据往往需要进行一些预处理才能比较好的用于模型训练。我们这里介绍两类常见的预处理，一是如何处理缺失值，二是如何对数据进行归一化。

## 1) 缺失值的处理

缺失值会使得系统丢失有用信息，表现出更大的的不确定性，进而影响我们数据挖掘的过程。以下罗列了三种处理缺失值的策略:

### 1a) 舍弃缺失值

* 舍弃缺失值过多的样本
* 舍弃缺失值过多的特征

### 1b) 直接使用含缺失值的数据

* 我们也可以把缺失作为特征一种特殊的状态，不进行处理。
* 并不是所有分类器都适合使用这种方法。基于树的模型本身对缺失值有比较高的容忍度；也有些模型不能处理数据有缺失的情况，例如SVM模型。

### 1c) 数据插补

我们还可以用统计方法填补一些缺失的数据，称为"Data Impuation", 包括很多方法：

**(1) 平均值填充**

可以用空缺特征的平均数、中位数、众数、最大值、最小值、固定值等作为填充。

如果空值是数值属性，就使用该属性在其他所有对象的取值的平均值来填充该缺失的属性值。如果空值是非数值属性，就根据统计学中的众数原理，用该属性在其他所有对象出现频率最高的值来补齐该缺失的属性。

**(2) 热卡填充（就近补齐）**

对于一个包含空值的对象，热卡填充法在完整数据中找到一个与它最相似的对象，然后用这个相似对象的值来进行填充。不同的问题选用不同的标准来对相似进行判定。

**(3) K最近邻法**

先根据欧式距离或相关分析来确定距离具有缺失数据样本最近的K个样本，将这K个值加权平均来估计该样本的缺失数据。

**(4) 回归插补**

回归基于完整的数据集，建立回归方程（模型）。对于包含空值的对象，将已知属性值代入方程来估计未知属性值，以此估计值来进行填充。

**(5) EM插补**

在缺失类型为随机缺失的条件下，假设模型对于完整的样本是正确的，那么通过观测数据的边际分布可以对未知参数进行极大似然估计。这种方法也被称为忽略缺失值的极大似然估计。 该方法比删除个案和单值插补更有吸引力，它一个重要前提：适用于大样本。有效样本的数量足够以保证ML估计值是渐近无偏的并服从正态分布。但是这种方法可能会陷入局部极值，收敛速度也不是很快，并且计算很复杂。

**(6) 多重插补**

多值插补的思想来源于贝叶斯估计，认为待插补的值是随机的，它的值来自于已观测到的值。 具体实践上通常是估计出待插补的值，然后再加上不同的噪声，形成多组可选插补值。 多重插补方法分为三个步骤：

* a. 为每个空值产生一套可能的插补值，这些值反映了无响应模型的不确定性；每个值都可以被用来插补数据集中的缺失值，产生若干个完整数据集合。
* b. 每个插补数据集合都用针对完整数据集的统计方法进行统计分析。
* c. 对来自各个插补数据集的结果，根据评分函数进行选择，产生最终的插补值。

## 2) 数据的scaling

### 2a) 是什么?

scaling指的是对于每一个特征，分别用一个线性变换，使得不同特征的数值处于相似的范围，且各个特征都变为不带量纲的量。常见的scaling方法有如下几种:

* standard/z-score scaling: 对每个特征，减去该特征在不同样本中的均值，再除以该特征在不同样本中的标准差。适用于近似正态分布的样本。

$$\text{zscore}(x\_{ij}^{'}) = \frac{x\_{ij} - \mu \_{ij}}{\sigma \_i}$$

* quartile scaling / robust scaling: 用中位数和IQR代替z-score中的样本均值和样本方差来进行scaling。对于有较多离群值的样本，以及与正态分布符合得不好的样本，推荐使用这种方法。

$$\text{robustscale}(x\_{ij}^{'}) = \frac{x\_{ij} - \text{median}*k x*{ik}} {Q\_{0.75}(\mathbf{x}*i) - Q*{0.25}(\mathbf{x}\_i)}$$

* min-max scaling: 对每个特征，把样本的最小值缩放到0，最大值缩放到1。

$$\text{minmax}(x\_{ij}^{'}) = \frac{x\_{ij} - \text{min}*k \mathbf{x}*{ik}} {\text{max}*k x*{ik} - \text{min}*k x*{ik}}$$

* abs-max scaling: 和min-max scaling类似，只不过绝对值缩放到\[0,1],不改变数据的符号。

$$\text{maxabs}(x\_{ij}^{'}) = \frac{x\_{ij}}{\text{max}*k \vert x*{ik} \vert}$$

在实践中，standard/z-score scaling和quartile scaling / robust scaling相对比较常用。另外两种方法非常容易受到离群值的影响，所以使用得相对更少一些。即使使用，也通常会先去除离群值，或对数据进行clipping(把大于/小于某个给定值的数据统一设成这个给定值)。

### 2b) 为什么?

* 不同的特征的量纲可能是不一样的，如果我们使用一个线性模型，就会涉及到不同特征的加和。显然，不同单位的数据是不能相加的，所以我们对每一个模型系数都得有一个附加的解释。我们对数据scaling后，所有特征都不在带有单位，因而可以直接相加，也不用再考虑系数的可解释问题了。
* 对涉及距离计算的模型而言，在实际应用中，不同特征的数值大小不同，会在求距离时造成很大的影响。例如，一个基因的表达量很高，另一个基因的表达量很低，如果不进行数据的归一化，表达量高的基因就会主导距离的计算。
* 最后，对于有一些算法(如逻辑回归，支持向量机，神经网络)，如果有一些特征的数值大小比较大，可能会导致模型不收敛。
* 简单而言，如果我们的模型在训练过程会在一步计算中同时考虑一个以上的特征，或可能存在数值计算上不收敛的问题，对数据进行scaling就是有必要的。
* 在我们常见的模型中，树模型符合这两个要求。所以如果我们使用随机森林等基于树的模型，都可以不进行scaling。对于其他大部分的模型，scaling都是有必要的。

### 2c) 怎么做?

在R语言和python中，我们可以通过调用

| Scaling method           | Python function                      | R function                 |
| ------------------------ | ------------------------------------ | -------------------------- |
| standard/z-score scaling | sklearn.preprocessing.StandardScaler | scale(x,center=T,scale=T)  |
| min-max scaling          | sklearn.preprocessing.MinMaxScaler   | normalize(x, range=c(0,1)) |
| abs-max scaling          | sklearn.preprocessing.MaxAbsScaler   |                            |
| robust scaling           | sklearn.preprocessing.RobustScaler   |                            |

这些变换都非常简单，无非是每个特征分别减去一个数，再除以一个数，你完全可以用`numpy`和R语言其他的函数自己实现。

* python实例

```python
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
iris_dataset = load_iris()
X = iris_dataset['data']
X = StandardScaler().fit_transform(X) # Z score scaling
```

* R实例

```
X <- as.matrix(iris[,1:4])
X <- scale(X, center = T, scale = T)
```

---

# 1.2 Data Visualization & Dimension Reduction

* 我们实际中遇到的数据往往都在高维空间上。在拿到了数据之后，为了对不同样本之间的相似程度有一些直观的认识，最直接的做法就是进行可视化。常见的可视化方法通过降维(dimensional reduction)的方法把高维空间上的样本点投影到二维平面上，使得相似的样本靠得更近，不相似的样本离得更远。
* 数据可视化可以让我们对分类的效果有一个大致的预期。多数降维方法都属于无监督学习的范畴。如果通过无监督的降维可视化，都可以发现发现带有同一个label的样本明显的聚集成一群，这就是一个比较容易的分类问题，我们可以预期一个比较好的分类效果。
* 最常见的用于可视化的降维方法有:
  * PCA (Principal component analysis): 线性降维，除了可视化还可以用来做很多其他分析
  * MDS (Multidimensional scaling, 有时又叫做Principal Coordinates Analysis, PCoA)
  * tSNE (t-distributed stochastic neighbor embedding)
  * UMAP (Uniform Manifold Approximation and Projection)
* 除此之外还有大量的降维方法，有一些降维方法的作用也不限于数据可视化，有兴趣的同学可以自行了解。
* 这些方法前人都已经实现好了现成的工具，我们可以直接拿来使用。我们这里主要介绍如何利用python和R中现有的工具来实现PCA和tSNE。

## 1) 基本原理

### 1a) PCA

* PCA的主要思想是找到k组线性组合，将n维特征投影到k维上，使得新的k维特征彼此正交，并且可以尽可能多的解释数据中的variation。
* 这样得到新的k维特征就被称为k个主成分。k个主成分实际上对应着我们从输入数据估计出的协方差矩阵最大的k个特征值对应的特征向量。
* 目前已经有很多高度优化的数值计算的工具实现了矩阵的特征向量的求解(一般是通过singular vector decomposition一类的方法实现的)，在实践中我们直接调用即可。
* 对于数据可视化，因为我们需要把数据投影到二维平面上，所以只需要考虑前两个主成分。
* 在生物信息学分析中，PCA是样本量不多的bulk RNA-seq转录组的可视化最常用的方法。
* 在python中, `sklearn.decomposition`中的[PCA](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html)类为主成分分析提供了非常方便的接口。
* 原生的R语言自带一个`prcomp`函数，实现了主成分分析的功能。

### 1b) t-SNE

* t-SNE（t-Distribution Stochastic Neighbour Embedding）翻译名为"t-分布随机近邻嵌入"，是一种专门用于可视化的降维方法。
* t-SNE主要的优势就是保持非线性的局部结构的能力，比较适用于样本量较大，样本之间相互关系比较复杂的数据，所以在单细胞转录组的可视化中有大量应用。
* 在python中, `sklearn.manifold`中的[TSNE](https://scikit-learn.org/stable/modules/generated/sklearn.manifold.TSNE.html)类为tSNE提供了非常方便的接口。
* 在R语言中，t-SNE可以用`Rtsne`这个package来实现。Rtsne host在CRAN上，用`install.packages("Rtsne")`即可安装。

## 2) 实例

### 2a) Data

* 我们用iris(鸢尾花)这样一个一个toy dataset来演示如何在python和R语言中用PCA和tSNE进行可视化。sklearn和原生的R语言都自带这样一个示例数据。

### 2b) Python

**加载模块**

```python
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
from matplotlib import pyplot as plt
```

**加载数据**

```python
iris_dataset = load_iris()
X = iris_dataset['data']
y = iris_dataset['target']
names = iris_dataset['target_names']
X = StandardScaler().fit_transform(X) # Z score scaling
```

**利用PCA可视化**

```python
X2d = PCA(2).fit_transform(X)
fig,ax = plt.subplots(figsize=(4.5,4))
for i in range(3):
    plt.scatter(X2d[y==i,0],X2d[y==i,1],label=names[i])
ax.set_xlabel("PC-1")
ax.set_ylabel("PC-2")
plt.legend()
plt.show()
#plt.savefig("PCA-plot.png",bbox_inches="tight")
```

PCA的结果如下

![png](/files/uAHofzrwXA4MJzjR83dM)

**利用tSNE可视化**

```python
X2d = TSNE(2).fit_transform(X)
fig,ax = plt.subplots(figsize=(4.5,4))
for i in range(3):
    plt.scatter(X2d[y==i,0],X2d[y==i,1],label=names[i])
ax.set_xlabel("tSNE-1")
ax.set_ylabel("tSNE-2")
plt.legend()
plt.show()
#plt.savefig("tSNE-plot.png",bbox_inches="tight")
```

t-SNE的结果如下

![png](/files/JEq1XHfUqvAXyLBI2Tcz)

### 2c) Visualization with R

**加载模块**

```r
library("Rtsne")
library("ggplot2")
```

**加载数据**

```r
X <- as.matrix(iris[,1:4])
X <- scale(X, center = T, scale = T)
```

**利用PCA可视化**

```r
pca.res <- prcomp(X, center = F, scale = F, rank. = 2)
iris$PC1 <- pca.res$x[,1]
iris$PC2 <- pca.res$x[,2]
ggplot(iris, aes(x=PC1, y=PC2,color=species)) + geom_point() + theme_bw()
```

PCA的结果如下

![png](/files/aHY0MDOlZqs7sHdM87ie)

**利用tSNE可视化**

```r
tsne.res <- Rtsne(X, dims = 2, check_duplicates = F)
iris$tSNE1 <- tsne.res$Y[,1]
iris$tSNE2 <- tsne.res$Y[,2]
ggplot(iris, aes(x=tSNE1, y=tSNE2,color=species)) + geom_point() + theme_bw()
```

t-SNE的结果如下

![png](/files/UK6zbjWPitvq879uoMyG)

---

# 1.3 Feature Extraction and Selection

我们常说数据和特征决定了机器学习的上限，而模型和算法只是逼近这个上限而已。那特征工程到底是什么呢？

特征工程是从原始数据出发，构造可以直接作为机器学习模型输入的特征的过程。特征工程主要包括:

* Feature Extraction (特征提取）
* Feature Selection（特征选择）

## 1) Feature Extraction

* Feature Extraction (特征提取) 从最初的一组测量数据开始，构建旨在提供信息且非冗余的派生值（特征），通过X，创造新的X'，以促进后续的学习和泛化过程。
* 一个非常简单的例子，现在出一非常简答的二分类问题题，请你使用逻辑回归，设计一个身材分类器。输入数据X:身高和体重 ，标签为Y:身材等级（胖，不胖）。显然，不能单纯的根据体重来判断一个人胖不胖，姚明很重，他胖吗？显然不是。针对这个问题，一个非常经典的特征工程是，BMI指数，BMI=体重/(身高^2)。这样，通过BMI指数，就能非常显然地帮助我们，刻画一个人身材如何。甚至，你可以抛弃原始的体重和身高数据。
* 特征提取是一个降维过程，将原始变量的初始集合降维至更易于管理的组别（特征）进行处理，同时仍然准确、完整地描述原始数据集。
* 特征提取通常需要基于特定领域的专家知识，也可以基于一些自动化的算法。例如在过去传统的图像分类方法中，有一种是利用一个被称为SIFT(Scale-invariant feature transform)的变换去从图像中计算特征，设计这个变换就需要利用很多专家知识；在近年来发展很快的基于深度学习的图像分类算法中，这种特征提取则是在训练神经网络的过程中自动完成的。
* 对NGS而言，原始数据是一些reads的序列，传统的分类器是很难直接从reads中学到有用的信息的。我们前面介绍的很多NGS数据的分析方法都可以理解为一种特征提取。例如计算表达矩阵，就是从测序的原始数据出发，再利用我们已知的相应物种的基因组序列和注释这样一些外部信息，进行特征提取，最后得到的特征就是每个基因的表达量。

## 2) Feature Selection

特征选择指的是，在通过特征提取把特征确定下来之后，我们很多时候并不是把所有的特征都输给机器学习算法，而是只选取一部分特征。特征选择对于无监督学习和有监督学习都是适用的。

* 对于无监督学习，我们希望特征在样本中应当一定的variation。如果一个特征在不同样本中几乎都是一个恒定值，这个特征对于聚类等任务就没有什么用处。
* 对于有监督学习，我们希望选取和样本的label有关的变量，舍弃无关的变量，以此降低过拟合风险，增加模型可解释性，减少计算开销。

我们这里着重讨论有监督问题的特征选择。根据特征选择的形式又可以将特征选择方法分为三类:

* **Filter**
  * 按照一定的统计指标对单个的特征进行评分，设定阈值或者待选择阈值的个数，选择特征
  * 例如，每一个特征t检验,ANOVA等的p值，和目标变量的互信息等等，都可以作为一个排序的指标
* **Embedded**
  * 对于很多机器学习模型而言，训练好模型之后，我们就可以通过一些方式来评估每一个特征对预测结果的贡献，根据贡献的大小就可以设定阈值或者待选择阈值的个数，选择特征
  * 例如，对于logistic回归，我们认为系数绝对数值越大的特征对分类贡献越大；对随机森林，节点平均深度越浅的特征对分类结果贡献越大，等等
* **Wrapper**
  * 选用不同的特征子集训练模型，以交叉验证的效果等为优化目标确定最优的组合
  * 我们一般不可能枚举所有组合，而是会采用一些heuristics，如递归特征消除(recursive feature elinmination, RFE)等

不难看出，在这三种方法中，**Filter**方法并不涉及机器学习模型的训练，只是计算了一些统计指标。后两种都是依赖于机器学习模型的方法。

* python的[sklearn](https://scikit-learn.org) package提供了一个用于特征选择的模块[sklearn.feature\_selection](https://scikit-learn.org/stable/modules/classes.html#module-sklearn.feature_selection)，在文档中也对feature selection专门进行了介绍，请参考<https://scikit-learn.org/stable/modules/feature_selection.html>。
* R [caret](https://cran.r-project.org/web/packages/caret/vignettes/caret.html) package也实现了很多特征选择的方法，文档里也进行了详细的介绍，请参考<https://topepo.github.io/caret/feature-selection-overview.html>。这里提到的"Models with Built-In Feature Selection"就是我们前面提到的"Embedded"方法。
