#!/bin/bash

# VSCode Extension 发布脚本

echo "🚀 NoteIM Extension 发布工具"
echo "================================"
echo ""

# 检查 vsce 是否安装
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce 未安装"
    echo "📦 正在安装 vsce..."
    npm install -g @vscode/vsce
    if [ $? -ne 0 ]; then
        echo "❌ 安装失败"
        exit 1
    fi
    echo "✅ vsce 安装成功"
fi

# 显示当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 当前版本: v$CURRENT_VERSION"
echo ""

# 选择操作
echo "请选择操作："
echo "1) 打包 (vsce package)"
echo "2) 发布 (vsce publish)"
echo "3) 打包并发布"
echo "4) 查看包含的文件 (vsce ls)"
echo "5) 退出"
echo ""
read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 正在打包..."
        vsce package
        if [ $? -eq 0 ]; then
            echo "✅ 打包成功！"
            echo "📁 文件: markdown-$CURRENT_VERSION.vsix"
        else
            echo "❌ 打包失败"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "🚀 正在发布到 Marketplace..."
        vsce publish
        if [ $? -eq 0 ]; then
            echo "✅ 发布成功！"
            echo "🔗 https://marketplace.visualstudio.com/items?itemName=starkwang.noteim-uploader"
        else
            echo "❌ 发布失败"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo "📦 正在打包..."
        vsce package
        if [ $? -ne 0 ]; then
            echo "❌ 打包失败"
            exit 1
        fi
        echo "✅ 打包成功！"
        echo ""
        echo "🚀 正在发布到 Marketplace..."
        vsce publish
        if [ $? -eq 0 ]; then
            echo "✅ 发布成功！"
            echo "🔗 https://marketplace.visualstudio.com/items?itemName=starkwang.noteim-uploader"
        else
            echo "❌ 发布失败"
            exit 1
        fi
        ;;
    4)
        echo ""
        echo "📋 将要打包的文件列表："
        echo "================================"
        vsce ls
        ;;
    5)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "✨ 完成！"
