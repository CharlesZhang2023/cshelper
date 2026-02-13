# CS Helper (KnowitCS)

[中文](./README_ZH.md) | **English**

This is an interactive learning website for HKUST COMP2211 (Machine Learning). The project aims to help students understand core concepts in machine learning through visualization. The project is currently being updated continuously.

## 🌟 Online Demo

You can experience the project via the following links:

- **English Version**: [https://knowitcs.pinit.eth.link/](https://knowitcs.pinit.eth.link/)
- **Chinese Version**: [https://knowcs.pinit.eth.link/](https://knowcs.pinit.eth.link/)

## 📚 Content Source & Roadmap

Currently, the content of this project mainly references the study notes from [moyunxiang/COMP2211](https://github.com/moyunxiang/COMP2211/blob/main/COMP2211.md). It will be gradually updated according to Professor Desmond's lectures.

**Future Plans:**

- Continuously update more COMP2211-related visualization modules.
- The COMP2211 part of this project will be merged into [moyunxiang/COMP2211](https://github.com/moyunxiang/COMP2211/blob/main/COMP2211.md) as its interactive supplement.
- The COMP2211 part will be open-sourced under the MIT license for students to learn and reference.

## 🧩 Visualization Modules

### Kernel Laboratory (Convolution)
Interactive simulation of how convolution kernels (filters) extract features from images.
- **Visualized Process**: Real-time demonstration of the $(I * K)_{x,y}$ operation, showing the Input Image ($I$), Kernel ($K$), and Output Feature Map side-by-side.
- **Interactive Kernels**: Experiment with preset kernels like **Sobel-X/Y** (edge detection), **Laplacian** (second derivative/sudden changes), and **Identity**, or define custom kernels.
- **Educational Insight**: Understand how kernels act as local feature filters to capture spatial patterns.

## 🛠️ Tech Stack

This project is built on a modern frontend tech stack, focusing on performance and interactive experience:

- **Core Framework**: [React](https://react.dev/) (v19) - Used for building user interfaces.
- **Build Tool**: [Vite](https://vitejs.dev/) - Provides extremely fast development server and build experience.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) - Utility-first CSS framework for rapidly building modern UIs.
- **Animation Engine**: [Framer Motion](https://www.framer.com/motion/) - Implements smooth interactive animation effects (e.g., gradient descent tracking, matrix transformation).
- **Math Formulas**: [KaTeX](https://katex.org/) - High-performance LaTeX formula rendering library.
- **Internationalization**: [react-i18next](https://react.i18next.com/) - Supports one-click switching between Chinese and English.
- **Icons**: [Lucide React](https://lucide.dev/) - Clean and beautiful icon components.
- **Single File Build**: `vite-plugin-singlefile` - Packages the entire application into a single HTML file for easy distribution and deployment.

## 🚀 Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/CharlesZhang2023/cshelper.git
   ```

2. Install dependencies:

   ```bash
   cd cshelper
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Build project:

   ```bash
   npm run build
   ```
