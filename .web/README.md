# Web 知识库可视化

本模块提供项目知识的前端可视化界面，通过 GitHub Pages 分享。

---

## 📋 完整自动化流程

项目已配置好完整的自动化流程，无需手动部署！

### 🔄 自动化触发方式

| 方式 | 说明 |
|------|------|
| **Git 提交** | `git commit` 时自动生成数据 + 构建 |
| **推送到 master** | GitHub Actions 自动部署到 GitHub Pages |
| **手动触发** | 可在 GitHub Actions 页面手动触发部署 |

### 🚀 推荐使用流程

```bash
# 1. 修改文章内容或代码
# 2. 正常提交（会自动生成数据 + 构建）
git add .
git commit -m "[feat] 更新某篇文章"

# 3. 推送到远程
git push

# ✅ GitHub Actions 自动部署！
```

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `src/` | React 前端源码 |
| `public/` | 静态资源 |
| `public/data/index.json` | 动态生成的索引数据 |
| `public/docs/` | 复制的 Markdown 文档 |
| `generate.py` | 数据生成脚本 |
| `update-web.sh` / `update-web.bat` | Web 知识库更新脚本（由 pre-commit hook 调用） |
| `deploy.sh` / `deploy.bat` | 一键部署脚本 |
| `vite.config.js` | Vite 配置 |
| `package.json` | 依赖定义 |
| `.github/workflows/pages.yml` | GitHub Actions 自动部署配置 |

---

## 💻 本地开发

```bash
cd .web
npm install
npm run dev
```

访问：http://localhost:5173/

---

## 🔧 手动操作（不推荐）

### 手动生成数据
```bash
cd .web
python generate.py
```

运行后会自动更新：
- `public/data/index.json` - 动态索引（分类颜色/图标）
- `public/docs/` - 复制的 Markdown 文档

### 手动构建
```bash
cd .web
npm run build
```

### 手动部署（不推荐，推荐用 GitHub Actions）
```bash
# Windows
.web\deploy.bat

# Linux/Mac
.web/deploy.sh
```

---

## ❓ 常见问题

### Q: 为什么频繁登录 GitHub？
A: **已解决！** 我们现在通过 GitHub Actions 自动部署，不需要本地使用 `gh-pages` 工具。推送到 master 分支后，GitHub Actions 会自动完成部署，完全不需要手动登录！

### Q: GitHub Pages 多久生效？
A: 通常 1-5 分钟，请稍等后访问：https://simpleth.github.io/ThinkingWithAgents/

### Q: URL 格式为什么带 #？
A: 使用 HashRouter 模式，更兼容 GitHub Pages，刷新页面不会 404。

