# `iris` 数据集分析

### 1. `iris` 数据集有几列？每列的数据类型是什么？

**解答：**
`iris` 数据集共有 **5** 列。每列的名称和数据类型如下：

* `Sepal.Length` (花萼长度)：数值型 (`numeric`)
* `Sepal.Width` (花萼宽度)：数值型 (`numeric`)
* `Petal.Length` (花瓣长度)：数值型 (`numeric`)
* `Petal.Width` (花瓣宽度)：数值型 (`numeric`)
* `Species` (鸢尾花种类)：因子型 (`factor`)，包含 3 个分类水平 (setosa, versicolor, virginica)

*(你可以通过在 R 中运行 `ncol(iris)` 和 `str(iris)` 或 `sapply(iris, class)` 来验证这些信息。)*

---

### 2. 按 `Species` 列分组计算 `Sepal.Length` 的均值和标准差，并保存为 CSV

**R 代码：**
```R
# 1. 计算均值
mean_data <- aggregate(Sepal.Length ~ Species, data = iris, FUN = mean)

# 2. 计算标准差
sd_data <- aggregate(Sepal.Length ~ Species, data = iris, FUN = sd)

# 3. 合并数据框
result_data <- merge(mean_data, sd_data, by = "Species")
colnames(result_data) <- c("Species", "Mean", "SD")

# 4. 保存为 CSV 文件 (去除行名和多余的双引号)
write.csv(result_data, file = "iris_sepal_length_stats.csv", row.names = FALSE, quote = FALSE)
```

**生成的 `iris_sepal_length_stats.csv` 文件内容如下：**
```csv
Species,Mean,SD
setosa,5.006,0.352489687213451
versicolor,5.936,0.516171147063863
virginica,6.588,0.635879593274432
```

---

### 3. 对不同 `Species` 的 `Sepal.Width` 进行 One way ANOVA 分析

**R 代码：**
```R
# 使用 aov() 函数进行单因素方差分析
anova_result <- aov(Sepal.Width ~ Species, data = iris)

# 使用 summary() 查看分析结果
summary(anova_result)
```

**输出的结果：**
```text
             Df Sum Sq Mean Sq F value Pr(>F)    
Species       2  11.35   5.672   49.16 <2e-16 ***
Residuals   147  16.96   0.115                   
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1
```

**结果简述：** P 值 (`<2e-16`) 远小于 0.05，表明不同种类 (Species) 鸢尾花的萼片宽度 (Sepal.Width) 存在极其显著的统计学差异。
