# 奇门遁甲排盘系统

一个基于 Vue 3 + TypeScript + Vite 的奇门遁甲在线排盘工具，旨在将传统奇门遁甲的复杂算法以现代化的前端技术进行可视化展示，提供便捷的排盘查询与分析功能。

## 主要功能

- **在线排盘**：支持输入年、月、日、时进行精准排盘
- **节气计算**：自动根据时间计算真太阳时与节气，确定局数
- **盘面展示**：清晰展示天盘、地盘、人盘、神盘及九星八门
- **响应式设计**：适配手机与电脑端访问
- **自动部署**：基于 GitHub Pages 的 CI/CD 自动构建与部署

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 |
| 语言 | TypeScript |
| 构建工具 | Vite |
| 部署 | GitHub Pages (GitHub Actions) |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Alan1995v250/qimen-dunjia.git
cd qimen-dunjia
```

### 2. 安装依赖

确保已安装 Node.js（推荐 v16+），然后运行：

```bash
npm install
```

### 3. 本地运行

启动开发服务器：

```bash
npm run dev
```

在浏览器中打开 `http://localhost:5173` 即可预览。

### 4. 打包构建

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中。

## 项目结构

```
qimen-dunjia/
├── .github/workflows/   # GitHub Actions 部署配置
├── .vscode/             # VS Code 编辑器配置
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── assets/          # 图片、样式等
│   ├── components/      # 通用组件
│   ├── utils/           # 核心算法与工具函数
│   └── views/           # 页面视图
├── index.html           # 入口文件
├── package.json         # 项目依赖配置
├── vite.config.ts       # Vite 构建配置
├── tsconfig.json        # TypeScript 总配置
├── tsconfig.app.json    # 应用 TypeScript 配置
├── tsconfig.node.json   # Node 环境 TypeScript 配置
└── .gitignore           # Git 忽略规则
```

## 部署

本项目配置了 GitHub Actions 自动部署到 GitHub Pages。每次推送到 main 分支时，Actions 会自动执行构建并部署。

部署地址：https://alan1995v250.github.io/qimen-dunjia/

## 待办事项

- 增加更多流派的支持（如转盘、飞盘）
- 优化移动端交互体验
- 添加详细的断语分析功能
- 补充单元测试

## 贡献

欢迎提交 Issue 或 Pull Request！如果你发现排盘算法有误或有更好的建议，请随时提交。

## 许可证

本项目基于 MIT 协议开源。

---

> 免责声明：本工具仅供传统文化研究与学习交流使用，请勿用于封建迷信活动。
