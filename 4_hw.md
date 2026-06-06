# 2.Machine Learning with R_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## 8.1) qPCR 数据集二分类分析：请用 R 完成数据预处理、PCA 可视化、数据集划分、模型选择/特征选择/调参、AUROC 计算和 ROC 曲线绘制

解答如下。这里选择随机森林作为分类器，用 `caret::rfe` 做递归特征消除，用 5 折交叉验证搜索 `mtry`，最后在预留 20% 测试集上计算 AUROC 并保存 PCA 图和 ROC 曲线。

```r
# 加载建模、评估和绘图所需包。
library(caret)
library(randomForest)
library(pROC)
library(ggplot2)

# 读取 qPCR 数据；假设 qPCR_data.csv 和脚本位于同一工作目录。
qpcr <- read.csv("qPCR_data.csv", stringsAsFactors = FALSE, check.names = FALSE)

# 第 1 列为样本 id。
sample_id <- qpcr[[1]]

# 第 2-12 列为 11 个基因表达量特征。
x.raw <- qpcr[, 2:12]

# 第 13 列为样本标签：NC 为健康人，HCC 为肝癌病人。
y <- factor(qpcr[[13]], levels = c("NC", "HCC"))

# 确保所有特征为数值型，避免字符型数字影响后续计算。
x.raw <- as.data.frame(lapply(x.raw, as.numeric))

# 用每个特征的中位数补全缺失值；中位数对异常值更稳健。
for (j in seq_along(x.raw)) {
  x.raw[is.na(x.raw[[j]]), j] <- median(x.raw[[j]], na.rm = TRUE)
}

# 对特征做 Z-score scaling。
x <- scale(x.raw, center = TRUE, scale = TRUE)

# PCA 可视化。
pca <- prcomp(x, center = FALSE, scale. = FALSE)
pca.df <- data.frame(
  sample_id = sample_id,
  PC1 = pca$x[, 1],
  PC2 = pca$x[, 2],
  label = y
)

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
ctrl.rfe <- rfeControl(
  functions = rfFuncs,
  method = "cv",
  number = 5
)
rfFuncs$summary <- twoClassSummary

rfe.fit <- rfe(
  x.train,
  y.train,
  sizes = 1:ncol(x.train),
  rfeControl = ctrl.rfe,
  metric = "ROC"
)

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

tune.grid <- expand.grid(
  mtry = seq_len(length(selected.features))
)

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

文字解释：代码先用中位数补全 11 个基因表达量中的缺失值，再做 Z-score 标准化，避免表达量尺度差异影响模型。PCA 图用于观察 NC 与 HCC 是否在前两个主成分上有分离趋势。训练/测试集采用 8:2 分层划分，测试集不参与特征选择和调参。模型部分用随机森林递归特征消除选择特征，再用交叉验证搜索 `mtry`，最终报告测试集 AUROC 并保存 ROC 曲线。

## 8.2) 请回答：随机森林中树的数量是不是一个需要通过交叉验证调整的超参数？为什么？什么是随机森林的 OOB error？它和 bootstrapping 有什么关系？

随机森林中树的数量是超参数，因为它是在训练前人为设定的模型配置，例如 R 中的 `ntree` 或 scikit-learn 中的 `n_estimators`。不过它通常不需要像 `mtry`、最大树深、最小叶节点数那样精细地通过交叉验证寻找最优值。原因是树的数量增加时，随机森林的方差一般会下降或趋于稳定，通常不会因为树太多而明显过拟合；代价主要是训练和预测时间增加。因此实践中常把树的数量设为足够大，例如 500 或 1000，再重点调节其他更影响偏差-方差平衡的参数。

OOB error 是 out-of-bag error，即用每棵树没有抽到的样本来估计模型泛化误差。随机森林训练每棵树时会对训练集做 bootstrap 抽样，也就是有放回抽样。一次 bootstrap 后，大约 63.2% 的样本会至少出现一次，剩下约 36.8% 的样本没有进入这棵树的训练集，这些未被抽中的样本就是该树的 OOB 样本。对某个样本，可以收集所有没有训练过它的树的预测结果并投票，得到该样本的 OOB 预测；把所有样本的 OOB 预测和真实标签比较，就得到 OOB error。它本质上是随机森林内部利用 bootstrap 机制产生的近似验证误差，常可作为不额外划分验证集时的性能估计。

# 3.Machine Learning with Python_hw

**姓名：** 姚茗子  
**学号：** 2024030045

---

## 7.1) qPCR 数据集二分类分析：请完成数据预处理、PCA 可视化、数据集划分、模型选择/调参/特征选择、AUROC 计算和 ROC 曲线绘制

解答如下。这里使用 Python 的 logistic regression 作为分类器，用 `RFECV` 做递归特征消除，用 `GridSearchCV` 搜索正则化强度 `C`，并在预留 20% 测试集上评估 AUROC。

```python
# 导入数据处理、可视化和机器学习包。
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_selection import RFECV
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_curve, auc, RocCurveDisplay

# 读取 qPCR 数据；假设 qPCR_data.csv 和脚本位于同一工作目录。
data = pd.read_csv("qPCR_data.csv")

# 第 1 列为 sample id。
sample_id = data.iloc[:, 0]

# 第 2-12 列为 11 个基因表达量特征。
X_raw = data.iloc[:, 1:12].apply(pd.to_numeric, errors="coerce")

# 第 13 列为标签；NC 记为 0，HCC 记为 1。
y = data.iloc[:, 12].map({"NC": 0, "HCC": 1}).to_numpy()

# 用中位数补全缺失值。
imputer = SimpleImputer(strategy="median")
X_imputed = imputer.fit_transform(X_raw)

# 对特征做 Z-score 标准化。
scaler = StandardScaler()
X = scaler.fit_transform(X_imputed)

# PCA 可视化。
pca = PCA(n_components=2, random_state=666)
X_pca = pca.fit_transform(X)

plt.figure(figsize=(5, 4))
for label_value, label_name, color in [(0, "NC", "#64748B"), (1, "HCC", "#DC2626")]:
    idx = y == label_value
    plt.scatter(X_pca[idx, 0], X_pca[idx, 1], label=label_name, s=28, alpha=0.85, color=color)
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0] * 100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1] * 100:.1f}%)")
plt.title("PCA of qPCR data")
plt.legend()
plt.tight_layout()
plt.savefig("qPCR_PCA_python.png", dpi=300)
plt.close()

# 划分数据集：20% 作为最终测试集；stratify=y 保持类别比例。
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=666,
    stratify=y
)

# 定义 logistic regression 分类器。
base_lr = LogisticRegression(
    penalty="l2",
    solver="liblinear",
    max_iter=5000,
    random_state=666
)

# RFECV 在训练集内部用交叉验证选择特征数量。
selector = RFECV(
    estimator=base_lr,
    step=1,
    min_features_to_select=1,
    cv=5,
    scoring="roc_auc"
)
selector.fit(X_train, y_train)

selected_features = X_raw.columns[selector.support_].tolist()
print("Selected features:", selected_features)

# 在被选中特征上搜索 logistic regression 的 C。
param_grid = {"C": [0.01, 0.1, 1, 10, 100]}
clf = GridSearchCV(
    LogisticRegression(
        penalty="l2",
        solver="liblinear",
        max_iter=5000,
        random_state=666
    ),
    param_grid=param_grid,
    cv=5,
    scoring="roc_auc",
    refit=True
)

clf.fit(X_train[:, selector.support_], y_train)
print("Best parameter:", clf.best_params_)

# 在预留测试集上预测 HCC 概率。
y_score = clf.predict_proba(X_test[:, selector.support_])[:, 1]

# 计算 ROC 曲线和 AUROC。
fpr, tpr, thresholds = roc_curve(y_test, y_score)
auroc = auc(fpr, tpr)
print(f"Test AUROC: {auroc:.4f}")

# 绘制并保存 ROC 曲线。
plt.figure(figsize=(5, 4))
plt.plot(fpr, tpr, color="#2563EB", lw=2, label=f"Test AUROC = {auroc:.4f}")
plt.plot([0, 1], [0, 1], "--", color="gray", label="Random chance")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC curve of qPCR test data")
plt.legend(loc="lower right")
plt.tight_layout()
plt.savefig("qPCR_ROC_python.png", dpi=300)
plt.close()
```

文字解释：该流程先把 11 个基因表达量转为数值型，用中位数补全缺失值，再进行标准化。PCA 图保存为 `qPCR_PCA_python.png`，用于直观观察 NC 和 HCC 的分布。训练/测试集按 8:2 分层划分，测试集只用于最终评估。模型使用 logistic regression，先在训练集上通过 RFECV 选择特征，再用 GridSearchCV 搜索正则化强度 `C`。最后在预留测试集上计算 AUROC，并保存 ROC 曲线为 `qPCR_ROC_python.png`。

## 7.2) 随机森林是生物信息经常使用的分类器。请回答：随机森林中树的数量是不是一个超参数？为什么？什么是 OOB error？它和 bootstrapping 有什么关系？

随机森林中树的数量是超参数，因为它不是从数据中自动学习得到的参数，而是在训练前由使用者设定。Python 的 scikit-learn 中对应 `n_estimators`，R 的 randomForest 包中对应 `ntree`。树的数量越多，集成结果通常越稳定，随机误差越小；但达到一定数量后，性能提升会变得很小，主要增加计算成本。因此它是超参数，但在实际调参中通常设为足够大，然后更重点地调整每次分裂候选特征数、树深、叶节点最小样本数等参数。

OOB error 是随机森林利用 out-of-bag 样本估计得到的误差。每棵树训练时都从原训练集进行 bootstrap 有放回抽样，因此一部分样本会被重复抽中，另一部分样本不会被抽中。对某棵树来说，没有被抽中的样本就是这棵树的 OOB 样本。因为这棵树没有见过这些 OOB 样本，所以可以用它们来做近似验证。把每个样本在所有“没有训练过它”的树上的预测结果汇总，再与真实标签比较，就得到 OOB error。它和 bootstrapping 的关系非常直接：OOB 样本正是 bootstrap 抽样时自然留下的未抽中样本，OOB error 则是利用这些样本形成的内部泛化误差估计。
