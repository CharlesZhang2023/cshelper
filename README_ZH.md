# CS Helper (KnowitCS)

**中文** | [English](./README.md)

这是一个关于 HKUST COMP2211 (Machine Learning) 的交互式学习网站。该项目旨在通过可视化的方式帮助学生理解机器学习中的核心概念，目前项目正在持续更新中。

## 🌟 在线体验

你可以通过以下链接体验该项目：

- **中文版**: [https://knowcs.pinit.eth.link/](https://knowcs.pinit.eth.link/)
- **英文版**: [https://knowitcs.pinit.eth.link/](https://knowitcs.pinit.eth.link/)

## 📚 内容来源与计划

目前，本项目的内容主要参考了 [moyunxiang/COMP2211](https://github.com/moyunxiang/COMP2211/blob/main/COMP2211.md) 的学习笔记。之后会根据Desmond教授的COMP2211授课内逐步更新。

**未来计划：**

- 持续更新更多 COMP2211 相关的可视化模块。
- 本项目的COMP2211部分将会合并 [moyunxiang/COMP2211](https://github.com/moyunxiang/COMP2211/blob/main/COMP2211.md)，作为其互动补充部分。
- COMP2211部分将会以MIT协议开源，共学生们学习参考。

## 🛠️ 技术栈

本项目基于现代前端技术栈构建，注重性能与交互体验：

- **核心框架**: [React](https://react.dev/) (v19) - 用于构建用户界面。
- **构建工具**: [Vite](https://vitejs.dev/) - 提供极速的开发服务器和构建体验。
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/) (v4) - 实用优先的 CSS 框架，快速构建现代 UI。
- **动画引擎**: [Framer Motion](https://www.framer.com/motion/) - 实现流畅的交互动画效果（如梯度下降追踪、矩阵变换）。
- **数学公式**: [KaTeX](https://katex.org/) - 高性能的 LaTeX 公式渲染库。
- **国际化**: [react-i18next](https://react.i18next.com/) - 支持中英文一键切换。
- **图标库**: [Lucide React](https://lucide.dev/) - 简洁美观的图标组件。
- **单文件构建**: `vite-plugin-singlefile` - 将整个应用打包为单个 HTML 文件，便于分发和部署。

## 🚀 本地运行

1. 克隆仓库：

   ```bash
   git clone https://github.com/CharlesZhang2023/cshelper.git
   ```
2. 安装依赖：

   ```bash
   cd cshelper
   npm install
   ```
3. 启动开发服务器：

   ```bash
   npm run dev
   ```
4. 构建项目：

   ```bash
   npm run build
   ```
