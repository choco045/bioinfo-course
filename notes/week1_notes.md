# Bioinformatics Week 1 (2.25-3.1)  
**上课日期**：2026年2月26日  
**主要内容**：课程导论 + 大数据驱动的生物学 + 准备工作（Github/Markdown/Docker）

## 评分组成
- 课堂互动问题：20%  
- 当堂和课后作业（7-9次）：80% *（建议和反馈：+5-10%; 每次的加分后总分不超过满分10分）*  
- 经验分享Presentation：1次（教师3分 + 学生互评7分）  
- 加分题（额外）  
  
## 答疑时间
- 每节课的开始：**教师**关于上一周讲课内容部分的答疑；  
- 每节课的课后半小时：**助教**关于作业和上机的答疑时间；  
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
- 算法 (Algorithm)：*怎么做* 指的是解决问题的具体计算步骤和方法。例如，在序列比对中，Needleman-Wunsch 是一种基于动态规划的算法，它规定了如何填充矩阵、如何回溯找到最佳匹配的具体步骤。
- 模型 (Model)：*是什么* 指的是对数据或系统的抽象表示，包含了假设和参数。例如，用于RNA结构预测的SCFG（随机上下文无关文法） 是一种模型，它定义了RNA序列生成的“语法规则”和概率参数。在机器学习中，逻辑回归是一个模型，梯度下降是训练该模型的算法。

---

## Getting Started：环境与工具

### 1. 文档记录：GitHub + Markdown
- **GitHub**：托管代码，管理版本，实现Social Coding。
- **Markdown**：轻量级标记语言，用于写README、笔记、网页。
  - 语法：标题 `#`，强调 `*` `**`，列表 `-`，代码块 ```。
  - 推荐用Markdown记录每个项目的README.md。

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

## 五、核心概念：算法 vs. 模型

> 这是第一节课需要重点理解的区别，来自机器学习领域。

- **模型 (Model)**：是对数据生成机制或决策边界的**抽象表示**，通常包含一组**参数**。  
  例如：HMM是一个模型，它包含状态转移概率和发射概率；线性回归模型 \(y = wx + b\) 包含权重 \(w\) 和偏置 \(b\)。

- **算法 (Algorithm)**：是求解模型参数或进行预测的**具体计算步骤**。  
  例如：维特比算法（Viterbi）是HMM中求解最可能隐藏状态路径的算法；梯度下降是训练神经网络参数的算法。

**关系**：同一个模型可以用不同算法求解（如HMM的最优路径可用维特比或近似算法）；同一个算法也可用于不同模型（如EM算法可用于HMM和混合高斯模型）。

**在生物信息学中的应用**：
- 基因预测：HMM模型 + 维特比算法（预测外显子/内含子）
- RNA二级结构：SCFG模型 + CYK算法（最小自由能结构）
- 蛋白质结构：Transformer模型 + 自注意力机制算法

---

## 六、本学期个人学习计划（量化）

根据教学日历和自身基础，制定如下计划（每周投入约5-8小时）：

### 第1周（2.26-3.4）
- [x] 注册GitHub，创建repo，写好README.md。
- [x] 学习Markdown语法，完成课堂笔记网页（即本文档）。
- [x] 安装Docker，运行Tutorial中的示例，完成Setup作业。
- [x] 阅读《Bioinformatics Data Skills》第1-2章（Setup & Git）。

### 第2-4周：Linux突击
- 每天练习Linux命令1小时，完成Tutorial中所有Linux作业（基础、实践、Bash）。
- 第4周前能独立编写简单的Shell脚本处理文件（批量重命名、循环运行命令）。

### 第5-8周：R语言与RNA-seq分析
- 完成Tutorial中R基础、绘图、差异表达分析。
- 重点掌握ggplot2，能够复现文献中的火山图、热图。
- 阅读《R数据科学》相关章节，练习tidyverse。

### 第9-12周：ChIP-seq、CLIP-seq与网络分析
- 学习MACS2峰值 calling，了解motif发现（HOMER/MEME）。
- 完成Tutorial中GO/KEGG/GSEA作业。
- 准备小组经验分享（主题待定，可能是RNA调控分析）。

### 第13-16周：机器学习与AI
- 学习机器学习基础（StatQuest视频+《机器学习》周志华第1-2章、11章）。
- 用R或Python实践分类模型（逻辑回归、随机森林、SVM），完成Tutorial中ML部分。
- 理解Transformer原理，阅读AlphaFold相关综述。

### 学期末
- 完成加分题（如dsRNA Code分析），整理所有代码到GitHub。
- 归档优秀分享PPT至清华云（经作者同意）。

> 注：每周三上课前预习讲义，课后及时复习并完成作业；遇到问题先搜索，再问助教/老师。

---

## 七、第一周作业（对应图片要求）

1. **注册GitHub**，创建repo，写好README.md，尝试用Git管理代码并同步。
2. **开始定期备份**工作（本地+云端）。
3. **用Markdown写个人GitHub Page**，内容包括：
   - 本堂课笔记（已在上文完成）。
   - **算法与模型的区别**（见第五节）。
   - 本学期的生物信息学学习计划（见第六节）。
4. 格式要求：层次清晰，使用标题、列表、代码块等突出重点；内容充实无空话。

---

**附录**：第一节课思考题（来自课件）
- 一家小私有公司为何能在20世纪末赶上“人类基因组计划”？（答案：数据驱动+技术创新+竞争加速）
- 鸡兔同笼问题的小学与中学解法对比，体会不同模型/算法的差异。

*笔记结束*
