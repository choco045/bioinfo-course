# `iris` 数据集分析

---

## 1. `iris` 数据集有几列？每列的数据类型是什么？

`iris` 数据集共有 **5** 列。每列的名称和数据类型如下：

1. `Sepal.Length` ：numeric
2. `Sepal.Width` ：numeric
3. `Petal.Length` ：numeric
4. `Petal.Width` ：numeric
5. `Species`：factor

**完整运行结果：**
```R
> ncol(iris)
[1] 5

> str(iris)
'data.frame':   150 obs. of  5 variables:
 $ Sepal.Length: num  5.1 4.9 4.7 4.6 5 5.4 4.6 5 4.4 4.9 ...
 $ Sepal.Width : num  3.5 3 3.2 3.1 3.6 3.9 3.4 3.4 2.9 3.1 ...
 $ Petal.Length: num  1.4 1.4 1.3 1.5 1.4 1.7 1.4 1.5 1.4 1.5 ...
 $ Petal.Width : num  0.2 0.2 0.2 0.2 0.2 0.4 0.3 0.2 0.2 0.1 ...
 $ Species     : Factor w/ 3 levels "setosa","versicolor",..: 1 1 1 1 1 1 1 1 1 1 ...

> sapply(iris, class)
Sepal.Length  Sepal.Width Petal.Length  Petal.Width      Species
   "numeric"    "numeric"    "numeric"    "numeric"     "factor"
```

---

## 2. 按Species列分组计算 `Sepal.Length` 的均值和标准差，保存为一个csv文件，提供代码和csv文件的内容。

**R 代码：**
```R
# 1. 计算均值和标准差
mean_data <- aggregate(Sepal.Length ~ Species, data = iris, mean)
sd_data <- aggregate(Sepal.Length ~ Species, data = iris, sd)

# 2. 合并数据框
result_data <- data.frame(
  Species = mean_data$Species,
  Mean = mean_data$Sepal.Length,
  SD = sd_data$Sepal.Length
)

# 3. 保存为 CSV 文件 (去除行名和多余的双引号)
write.csv(result_data, file = "iris_sepal_length_stats.csv", row.names = FALSE, quote = FALSE)
```

**查看生成的 `iris_sepal_length_stats.csv` ：**
```R
> cat(readLines("iris_sepal_length_stats.csv"), sep = "\n")
Species,Mean,SD
setosa,5.006,0.352489687213451
versicolor,5.936,0.516171147063863
virginica,6.588,0.635879593274432
```

---

## 3. 对不同Species的Sepal.Width进行One way ANOVA分析，提供代码和输出的结果。

**R 代码：**
```R
# 使用 aov() 函数进行单因素方差分析,使用 summary() 查看分析结果
summary(aov(Sepal.Width ~ Species, data = iris))
```

**输出的结果：**
```text
             Df Sum Sq Mean Sq F value Pr(>F)
Species       2  11.35   5.672   49.16 <2e-16 ***
Residuals   147  16.96   0.115
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1
```

P 值 (`<2e-16`) 远小于 0.05，表明不同Species的Sepal.Width存在极其显著的统计学差异。
