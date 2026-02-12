#!/bin/bash

# 生成 Tauri 所需的图标文件
# 需要安装 ImageMagick: brew install imagemagick

# 检查 ImageMagick 是否安装
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick 未安装"
    echo "请运行: brew install imagemagick"
    exit 1
fi

# 创建图标目录
mkdir -p src-tauri/icons

# 如果有 .icns 文件，从中提取 PNG
if [ -f "src/assets/icons/milkup.icns" ]; then
    echo "🎨 从 .icns 文件生成 PNG 图标..."
    
    # 使用 sips (macOS 自带工具) 转换
    sips -s format png src/assets/icons/milkup.icns --out src-tauri/icons/temp.png 2>/dev/null
    
    if [ -f "src-tauri/icons/temp.png" ]; then
        # 生成不同尺寸
        convert src-tauri/icons/temp.png -resize 32x32 src-tauri/icons/32x32.png
        convert src-tauri/icons/temp.png -resize 128x128 src-tauri/icons/128x128.png
        convert src-tauri/icons/temp.png -resize 256x256 src-tauri/icons/128x128@2x.png
        rm src-tauri/icons/temp.png
        echo "✅ PNG 图标生成完成"
    else
        echo "⚠️  无法从 .icns 提取图片，将创建占位符"
        create_placeholder
    fi
else
    echo "⚠️  未找到 .icns 文件，将创建占位符"
    create_placeholder
fi

create_placeholder() {
    # 创建简单的占位符图标
    convert -size 32x32 xc:#4A90E2 -pointsize 20 -fill white -gravity center -annotate +0+0 "M" src-tauri/icons/32x32.png
    convert -size 128x128 xc:#4A90E2 -pointsize 80 -fill white -gravity center -annotate +0+0 "M" src-tauri/icons/128x128.png
    convert -size 256x256 xc:#4A90E2 -pointsize 160 -fill white -gravity center -annotate +0+0 "M" src-tauri/icons/128x128@2x.png
    echo "✅ 占位符图标创建完成"
}

echo "🎉 图标生成完成！"
echo "生成的文件:"
ls -lh src-tauri/icons/
