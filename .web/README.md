# Web 知识库可视化

本模块提供项目知识的前端可视化界面，通过 GitHub Pages 分享。

## 文件说明

| 文件 | 说明 |
|------|------|
| `src/` | React 前端源码 |
| `public/` | 静态资源 |
| `public/data/index.json` | 动态生成的索引数据 |
| `public/docs/` | 复制的 Markdown 文档 |
| `generate.py` | 数据生成脚本 |
| `update-web.sh` | Web 知识库更新脚本（由 pre-commit hook 调用） |
| `vite.config.js` | Vite 配置 |
| `package.json` | 依赖定义 |

## 使用方式

### 本地开发
```bash
cd .web
npm install
npm run dev
```

### 手动生成数据
```bash
cd .web
python generate.py
```

运行后会自动更新：
- `public/data/index.json` - 动态索引（分类颜色/图标）
- `public/docs/` - 复制的 Markdown 文档

### 构建生产版本
```bash
cd .web
npm run build
```

## Git Hook

pre-commit hook 会自动调用此模块的 `update-web.sh` 脚本。

## GitHub Pages

通过 `.github/workflows/pages.yml` 自动部署。
