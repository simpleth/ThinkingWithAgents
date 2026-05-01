@echo off
REM Web 知识库一键部署脚本 (Windows 版本)
REM 执行完整流程：生成数据 -> 构建 -> 部署到 GitHub Pages

set PROJECT_ROOT=%~dp0..
set WEB_DIR=%PROJECT_ROOT%\.web

echo =========================================
echo 🚀 部署 Web 知识库到 GitHub Pages...
echo =========================================

REM 1. 更新数据和构建
echo 📦 更新数据和构建...
call "%WEB_DIR%\update-web.bat"

REM 2. 部署到 GitHub Pages
echo 🌐 部署到 GitHub Pages...
cd /d "%WEB_DIR%"
npm run deploy

echo.
echo =========================================
echo ✅ 部署完成！
echo 🌐 访问地址：https://simpleth.github.io/ThinkingWithAgents/
echo ℹ️  GitHub Pages 可能需要 1-5 分钟才能完全生效
echo =========================================
