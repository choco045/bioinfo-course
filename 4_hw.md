# 2.Machine Learning with R_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## 1) qPCR 数据集二分类分析：用 R 完成数据预处理、PCA 可视化、数据集划分、模型选择/特征选择/调参、AUROC 计算和 ROC 曲线绘制。

**R代码：**

```r
# 环境准备
library(caret)
library(randomForest)
library(pROC)
library(ggplot2)

# 读取 qPCR 数据
qpcr <- read.csv("qPCR_data.csv", stringsAsFactors = FALSE, check.names = FALSE)

# 第 1 列为样本 id
sample_id <- qpcr[[1]]

# 第 2-12 列为 11 个基因表达量特征
x.raw <- qpcr[, 2:12]

# 第 13 列为样本标签，使用 factor() 将其转换为分类变量，并指定 levels ：NC 为健康人，HCC 为肝癌病人
y <- factor(qpcr[[13]], levels = c("NC", "HCC"))

# 确保所有特征为数值型，避免字符型数字影响后续计算
x.raw <- as.data.frame(lapply(x.raw, as.numeric))

# 用每个特征的中位数补全缺失值
for (j in seq_along(x.raw)) {
  x.raw[is.na(x.raw[[j]]), j] <- median(x.raw[[j]], na.rm = TRUE)
}

# 对特征做 Z-score scaling，scale() 函数执行的是标准化（减去均值，除以标准差）
x <- scale(x.raw, center = TRUE, scale = TRUE)

# PCA 可视化（降维，打包成数据框）
pca <- prcomp(x, center = FALSE, scale. = FALSE)
pca.df <- data.frame(
  sample_id = sample_id,
  PC1 = pca$x[, 1],
  PC2 = pca$x[, 2],
  label = y
)

# 绘图与保存
p.pca <- ggplot(pca.df, aes(PC1, PC2, color = label)) +
  geom_point(size = 2.6, alpha = 0.85) +
  theme_bw() +
  labs(title = "PCA of qPCR data", color = "Group")
ggsave("qPCR_PCA_R.png", p.pca, width = 5, height = 4, dpi = 300)

# 划分数据集：80% 训练，20% 测试；按类别分层抽样。
set.seed(666)
train.idx <- createDataPartition(y, p = 0.8, list = FALSE)
x.train <- x[train.idx, ]
x.test <- x[-train.idx, ]
y.train <- y[train.idx]
y.test <- y[-train.idx]

# 用随机森林做 RFE 特征选择；评价指标为 ROC。
ctrl.rfe <- rfeControl(functions = rfFuncs, method = "cv", number = 5)
rfFuncs$summary <- twoClassSummary
rfe.fit <- rfe(x.train, y.train, sizes = 1:ncol(x.train), rfeControl = ctrl.rfe, metric = "ROC")
selected.features <- predictors(rfe.fit)
print(selected.features)

# 在选中特征上搜索随机森林 mtry。
ctrl.train <- trainControl(
  method = "cv",
  number = 5,
  summaryFunction = twoClassSummary,
  classProbs = TRUE,
  savePredictions = "final"
)

tune.grid <- expand.grid(mtry = seq_len(length(selected.features)))

rf.fit <- train(
  x.train[, selected.features, drop = FALSE],
  y.train,
  method = "rf",
  metric = "ROC",
  tuneGrid = tune.grid,
  ntree = 500,
  trControl = ctrl.train
)

print(rf.fit$bestTune)

# 在预留测试集上预测 HCC 概率。
pred.prob <- predict(
  rf.fit,
  newdata = x.test[, selected.features, drop = FALSE],
  type = "prob"
)[, "HCC"]

# 计算 ROC 和 AUROC；levels 指定 NC 为阴性、HCC 为阳性。
roc.obj <- roc(response = y.test, predictor = pred.prob, levels = c("NC", "HCC"))
auc.value <- auc(roc.obj)
print(auc.value)

# 保存 ROC 曲线。
png("qPCR_ROC_R.png", width = 1200, height = 1000, res = 180)
plot(roc.obj, print.auc = TRUE, col = "#2563EB", lwd = 2, main = "ROC curve of qPCR test data")
abline(a = 0, b = 1, lty = 2, col = "gray60")
dev.off()
```

**数据可视化结果：**
-
-
-
-
-
-
-
-
-

**ROC曲线：**
-
-
-
-
-
-
-
-
-
**结果分析：**
通过 PCA 可视化发现，NC 和 HCC 两组样本存在一定程度的重叠，说明该 qPCR 数据集在特征空间中线性可分性有限。基于随机森林的 RFE 特征选择共筛选出 2 个关键特征（miR.122, SNORD3B），最终模型在测试集上的 AUROC 为 0.72。该结果符合数据本身的分布特征，模型具有一定的分类预测能力，且因特征数量精简，模型具有较好的泛化稳定性。

## 2) 随机森林中树的数量是不是一个需要通过交叉验证调整的超参数，为什么？什么是随机森林的 OOB error？它和 bootstrapping 有什么关系？

1. **随机森林中树的数量是超参数**。因为它是在训练前人为设定的模型配置，不是从数据中自动学习得到的参数，例如 R 中的 `ntree` 或 scikit-learn 中的 `n_estimators`。不过它通常不需要像 `mtry`、最大树深、最小叶节点数那样精细地通过交叉验证寻找最优值。原因是树的数量增加时，随机森林的方差一般会下降或趋于稳定，通常不会因为树太多而明显过拟合；代价主要是训练和预测时间增加。因此实践中常把树的数量设为足够大，例如 500 或 1000，再重点调节其他更影响偏差-方差平衡的参数。

2. OOB error (out-of-bag error) 是用每棵树没有抽到的样本来估计模型泛化误差。随机森林训练每棵树时会对训练集做 bootstrap 抽样，也就是有放回抽样。一次 bootstrap 后，大约 63.2% 的样本会至少出现一次，剩下约 36.8% 的样本没有进入这棵树的训练集，这些未被抽中的样本就是该树的 OOB 样本。对某个样本，可以收集所有没有训练过它的树的预测结果并投票，得到该样本的 OOB 预测；把所有样本的 OOB 预测和真实标签比较，就得到 OOB error。它本质上是随机森林内部利用 bootstrap 机制产生的近似验证误差，常可作为不额外划分验证集时的性能估计。
