# Bioinformatics Week 1 (2.25-3.1)  
**上课日期**：2026年2月26日  
**主要内容**：课程导论 + 大数据驱动的生物学 + 准备工作（Github/Markdown/Docker）

## 评分组成
- 课堂互动问题：20%  
- 当堂和课后作业（7-9次）：80% *（建议和反馈：+5-10%; 每次的加分后总分不超过满分10分）*  
- 经验分享Presentation：1次（教师3分 + 学生互评7分）  
- 加分题  
  
## 答疑时间
- 每节课的开始：**教师**关于上一周讲课内容部分的答疑；  
- 每节课的课后半小时：**助教**关于作业和上机的答疑；  
- 需要其他单独时间沟通的也可以email（注意不要用微信）约教师或者助教。  

## Peer Learning
- 2-5人小组，集体讨论但独立完成作业；3-5人小组做一次经验分享PPT（Linux/R/NGS/AI Tool）。  

## 参考资料
- **主教材**：上课讲义PPT + 《Bioinformatics Tutorial》（实践教程）
- **工具书**：《鸟哥的Linux私房菜》、《Quick R》、《Bioinformatics Data Skills》（进阶）
- **在线资源**：Google, Wikipedia, 论坛（知乎, Seqanswers, Biostars），AI助手（智谱清言, ChatGPT, DeepSeek）

---

## 课程内容：Big Data-driven Science  

### 1. 4 steps of Bioinformatics
1. **Information**：获取生物/医学数据（序列、图像、表达谱等）。
2. **Analysis**：数据清洗、特征提取（降维、统计检验等）。
3. **Modeling**：构建概率模型与计算算法（机器学习、深度学习）。
4. **Question**：回答生物学/医学问题（知识发现）。

> 这实际上是“4th Paradigm”——**4 steps of Bioinformatics**的体现。

### 2. 数据类型  
- **DNA-seq**：基因组、突变（SNP/INDEL/CNV/SV）  
- **RNA-seq**：表达谱、可变剪接、RNA调控  
- **Epigenetics**：DNA甲基化、组蛋白修饰（ChIP-seq）、染色质开放性  
- **Interactome**：蛋白-DNA（ChIP-seq）、蛋白-RNA（CLIP-seq）、RNA-RNA/DNA（GRID-seq等）  

### 3. 从数据到模型
- 传统模型：线性回归 → 逻辑回归（分类）  
- 神经网络 → 深度学习（多层感知机、CNN、RNN、Transformer）  
- 语言视角：将生物序列视为“生命的语言”（ATCG对应字母），用NLP方法建模。  

### 4. 算法vs.模型
- 算法 (Algorithm)：***怎么做*** 指的是解决问题的具体计算步骤和方法。  
> 例如，在序列比对中，Needleman-Wunsch是一种基于动态规划的算法，它规定了如何填充矩阵、如何回溯找到最佳匹配的具体步骤。  
> 维特比算法（Viterbi）是HMM中求解最可能隐藏状态路径的算法；梯度下降是训练神经网络参数的算法。

- 模型 (Model)：***是什么*** 指的是对数据或系统的抽象表示，包含了假设和参数。  
> 例如，用于RNA结构预测的SCFG（随机上下文无关文法）是一种模型，它定义了RNA序列生成的“语法规则”和概率参数。  
> 在机器学习中，逻辑回归是一个模型，梯度下降是训练该模型的算法。  
> HMM是一个模型，它包含状态转移概率和发射概率；线性回归模型 \(y = wx + b\) 包含权重 \(w\) 和偏置 \(b\)。

**关系**：同一个模型可以用不同算法求解（如HMM的最优路径可用维特比或近似算法）；同一个算法也可用于不同模型（如EM算法可用于HMM和混合高斯模型）。  

---

## Getting Started：环境与工具

### 1. 文档记录：GitHub + Markdown
- **GitHub**：托管代码，管理版本，实现Social Coding。
- **Markdown**：轻量级标记语言，用于写README、笔记、网页。
  - 语法：标题 `#`，强调 `*` `**`，列表 `-`，代码块 ```。
  - 推荐用Markdown记录每个项目的README.md。
> 父文件夹 → 子文件夹：直接写`子文件夹/文件名`；  
> 子文件夹 → 父文件夹：写`../文件名`。`../`是相对链接的核心符号，代表回到上一级目录。

### 2. 备份工作
- 基础：清华云、商业云、系统自带备份（Time Machine / Windows备份）。
- 进阶：Linux下自动备份脚本，Git同步。

### 3. 实践教程（Bioinformatics Tutorial）
- 基于Docker的独立环境，每章在独立目录操作。
- 教学材料（文件、视频、docker images）见Appendix IV。

### 4. 编程技能规划
- **Weeks 1-4**：Linux（bash）
- **Weeks 5-16**：R（统计、绘图）
- **Weeks 11-16**：Python（可选，机器学习/深度学习）

---

## Run jobs in a Docker
- Docker：linux的轻量级虚拟机
- 镜像(image)和容器(container)是docker的两个比较重要的概念。image可以理解成是一个用于创建虚拟机的模板，而container相当于是一个根据image创建出的虚拟机
- 用docker run新建一个名为 bioinfo_tsinghua 的 container
  * ```docker exec -it bioinfo_tsinghua bash```  
  * `docker exec`用于在一个正在运行的_container_中执行命令；`-it`: 交互(interactive, -i)式的运行_container_中的bash命令，并在terminal中显示输入输出(-t)  
  * 之后即可运行_container_中提供的各种Linux命令；输入`exit`即可回到Power shell。
  > 每次使用_container_时要检查docker程序是否运行了，否则请双击docker程序图标运行docker程序  

---

**附录**：
- 一家小私有公司为何能在20世纪末赶上“人类基因组计划”？（数据驱动+技术创新+竞争加速）
- 鸡兔同笼问题（5只兔子9只鸡 中小学用不同算法解同一模型）

[back to bioinfo学习计划](../README.md)
