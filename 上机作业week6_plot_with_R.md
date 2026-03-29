# plot_with_R上机作业

## 基于ggplot2,用violin plot对iris数据集中不同Species的Sepal.Length长度分布进行可视化，并进行如下设置,提交脚本和结果。
* 把图片标题设为"Sepal Length Distribution"，加粗居中(可使用labs函数和theme函数)
* 把y轴范围设为3到9之间(可使用scale_y_continuous函数)
* 三个Species的对应的填充颜色分别设为#C44E52, #55A868和#4C72B0(可使用scale_fill_manual函数)

## R 脚本代码
```R
# 加载必要的库
library(ggplot2)

# 加载内置数据集 iris
data(iris)

# 开始绘图并赋值给变量 p
p <- ggplot(iris, aes(x = Species, y = Sepal.Length, fill = Species)) +
  # 绘制小提琴图
  geom_violin(trim = FALSE) + 
  
  # 设置标题
  labs(title = "Sepal Length Distribution") +
  
  # 设置 y 轴范围
  scale_y_continuous(limits = c(3, 9)) +
  
  # 指定填充颜色
  scale_fill_manual(values = c("setosa" = "#C44E52", 
                               "versicolor" = "#55A868", 
                               "virginica" = "#4C72B0")) +
  
  # 使用经典主题，自定义标题格式
  theme_classic() +
  theme(
    plot.title = element_text(hjust = 0.5, face = "bold", size = 16)  # 所有标题自定义放在这里
  )

# 在 Plots 面板展示图片
print(p)

# 将结果保存为 PDF 文件
ggsave("Sepal_Length_Violin_Plot.pdf", plot = p, width = 7, height = 5)
```
