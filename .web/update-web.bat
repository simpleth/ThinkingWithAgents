@echo off
REM Web 知识库更新脚本 (Windows 版本)
REM 由 pre-commit hook 调用

set PROJECT_ROOT=%~dp0..
set WEB_DIR=%PROJECT_ROOT%\.web

echo =========================================
echo 🔄 更新 Web 知识库...
echo =========================================

REM 1. 生成数据
echo 📊 生成索引数据...
python "%WEB_DIR%\generate.py"

REM 2. 安装依赖 (如果需要)
if not exist "%WEB_DIR%\node_modules" (
    echo 📦 安装 npm 依赖...
    cd /d "%WEB_DIR%"
    npm install
)

REM 3. 构建
echo 🏗️  构建前端...
cd /d "%WEB_DIR%"
npm run build

echo ✅ Web 知识库更新完成！
echo ℹ️  如需部署到 GitHub Pages，请运行: .web\deploy.bat
