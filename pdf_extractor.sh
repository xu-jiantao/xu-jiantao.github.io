#!/bin/bash

# =============================================================================
# 超声报告PDF数据结构化提取脚本
# 支持 macOS, Linux, Windows (Git Bash/WSL)
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() { echo -e "${BLUE}[信息]${NC} $1"; }
print_success() { echo -e "${GREEN}[成功]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[警告]${NC} $1"; }
print_error() { echo -e "${RED}[错误]${NC} $1"; }

# 检测操作系统
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    print_info "检测到操作系统: $OS"
}

# 检查Python是否安装
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "未找到Python! 请先安装Python 3.7或更高版本"
        exit 1
    fi

    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    print_success "找到Python: $PYTHON_VERSION"
}

# 检查并安装Python依赖
check_dependencies() {
    print_info "检查Python依赖包..."

    MISSING_PACKAGES=()

    # 检查 PyPDF2
    if ! $PYTHON_CMD -c "import PyPDF2" 2>/dev/null; then
        MISSING_PACKAGES+=("PyPDF2")
    fi

    # 检查 openpyxl
    if ! $PYTHON_CMD -c "import openpyxl" 2>/dev/null; then
        MISSING_PACKAGES+=("openpyxl")
    fi

    if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
        print_warning "缺少以下依赖包: ${MISSING_PACKAGES[*]}"
        read -p "是否自动安装? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "安装依赖包..."

            # 尝试使用 --user 参数安装
            if $PYTHON_CMD -m pip install --user "${MISSING_PACKAGES[@]}" 2>/dev/null; then
                print_success "依赖包安装完成"
            else
                # 如果失败，尝试使用 --break-system-packages (Python 3.11+)
                print_info "尝试使用系统包管理方式安装..."
                if $PYTHON_CMD -m pip install --user --break-system-packages "${MISSING_PACKAGES[@]}" 2>/dev/null; then
                    print_success "依赖包安装完成"
                else
                    print_error "自动安装失败。请手动安装:"
                    echo ""
                    echo "方法1 (推荐): 使用 pipx 或虚拟环境"
                    echo "  python3 -m venv ~/pdf_extract_env"
                    echo "  source ~/pdf_extract_env/bin/activate"
                    echo "  pip install ${MISSING_PACKAGES[*]}"
                    echo ""
                    echo "方法2: 使用 Homebrew"
                    echo "  brew install python@3"
                    echo ""
                    echo "方法3: 强制安装 (不推荐)"
                    echo "  pip3 install --user --break-system-packages ${MISSING_PACKAGES[*]}"
                    exit 1
                fi
            fi
        else
            print_error "请手动安装依赖包后再运行脚本"
            exit 1
        fi
    else
        print_success "所有依赖包已安装"
    fi
}

# 创建Python提取脚本
create_python_script() {
    cat > "$TEMP_SCRIPT" << 'PYTHON_SCRIPT_EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import re
from datetime import datetime
from pathlib import Path

try:
    import PyPDF2
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
except ImportError as e:
    print(f"错误: 缺少必要的Python包 - {e}")
    print("请运行: pip install PyPDF2 openpyxl")
    sys.exit(1)


def extract_text_from_pdf(pdf_path):
    """从PDF文件提取文本"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"读取PDF失败 [{pdf_path}]: {e}")
        return None


def extract_fields(text):
    """使用正则表达式提取所有字段"""

    # 定义所有字段的正则表达式模式
    patterns = {
        # 基础信息
        '检查日期': r'检查\s*日期\s*[：:]\s*(\d{4}[-\s]\d{2}[-\s]\d{2})',
        '检查编号': r'检查\s*编号\s*[：:]\s*(\d+)',
        '机型': r'机型\s*[：:]\s*([^\r\n]+?)(?=\s+送检\s*医师|\s+姓名|\s*[\r\n])',
        '姓名': r'姓名\s*[：:]\s*([^\s]+?)(?=\s+性别)',
        '性别': r'性别\s*[：:]\s*(男|女)',
        '年龄': r'年龄\s*[：:]\s*(\d+)\s*岁?',
        '科别': r'科别\s*[：:]\s*([^\r\n]+?)(?=\s+医嘱\s*号|\s+住院\s*号|\s*[\r\n])',
        '送检医师': r'送检\s*医师\s*[：:]\s*([^\r\n]+?)(?=\s+姓名|\s+科别|\s*[\r\n]|$)',
        '医嘱号': r'医嘱\s*号\s*[：:]\s*([^\r\n]+?)(?=\s+住院\s*号|\s+床\s*号|\s*[\r\n])',
        '住院号': r'住院\s*号\s*[：:]\s*([^\r\n]+?)(?=\s+床\s*号|\s+临床\s*初步\s*诊断|\s*[\r\n])',
        '床号': r'床\s*号\s*[：:]\s*([^\r\n]+?)(?=\s+临床\s*初步\s*诊断|\s+部位|\s*[\r\n])',
        '临床初步诊断': r'临床\s*初步\s*诊断\s*[：:]\s*([^\r\n]+?)(?=\s+部位|\s+录入\s*员|\s*[\r\n])',
        '部位': r'部位\s*[：:]\s*([^\r\n]+?)(?=\s+录入\s*员|\s*[\r\n]|$)',
        '录入员': r'录入\s*员\s*[：:]\s*([^\r\n]+?)(?=\s+超声\s*测值|\s*[\r\n]|$)',

        # 超声测值
        '主动脉瓣环': r'主动脉瓣环\s*[：:]\s*([\d\.-]+)',
        '主动脉窦部': r'主动脉窦部\s*[：:]\s*([\d\.-]+)',
        '窦管交界': r'窦管交界\s*[：:]\s*([\d\.-]+)',
        '升主动脉': r'升主动脉\s*[：:]\s*([\d\.-]+)',
        '左房前后径': r'左房前后径\s*[：:]\s*([\d\.-]+)',
        '室间隔': r'室间隔\s*[：:]\s*([\d\.-]+)',
        '左室舒张末期': r'左室舒张末期\s*[：:]\s*([\d\.-]+)',
        '左室后壁': r'左室后壁\s*[：:]\s*([\d\.-]+)',
        '右室流出道': r'右室流出道\s*[：:]\s*([\d\.-]+)',
        '肺动脉': r'肺动脉\s*[：:]\s*([\d\.-]+)',
        '左房左右径': r'左房左右径\s*[：:]\s*([\d\.-]+)',
        '下腔静脉': r'下腔静脉\s*[：:]\s*([\d\.-]+)',

        # 文本字段
        '２Ｄ及Ｍ型特征': r'[2２]\s*[DＤ]\s*及\s*[MＭ]\s*型特征\s*[：:]\s*([\s\S]+?)(?=\s*彩色\s*及\s*频谱\s*多普勒\s*特征\s*[：:])',
        '彩色及频谱多普勒特征': r'彩色\s*及\s*频谱\s*多普勒\s*特征\s*[：:]\s*([\s\S]+?)(?=\s*左心\s*功能\s*测值\s*[：:])',

        # 瓣口流速
        '二尖瓣': r'瓣口\s*流速\s*\(.*?\)\s*[：:]\s*二尖瓣\s*[：:]\s*([\d\.-]+)',
        '三尖瓣': r'瓣口\s*流速\s*\(.*?\)\s*[：:]\s*.*?三尖瓣\s*[：:]\s*([\d\.-]+)',
        '肺动脉瓣': r'瓣口\s*流速\s*\(.*?\)\s*[：:]\s*.*?肺动脉瓣\s*[：:]\s*([\d\.-]+)',

        # 主动脉瓣详情
        '流速约（m/s）': r'流速\s*约\s*([\d\.-]+)\s*m/s',
        '平均跨瓣压差约（mmHg）': r'平均\s*跨瓣\s*压差\s*约\s*([\d\.-]+)\s*mmHg',
        '反流面积（cm2）': r'反流\s*面积[\s:：]*约?\s*([\d.]+)\s*(?:c?m\s*[²2㎡])',

        # 左心功能
        'EF': r'EF\s*[：:=]?\s*([\d\.-]+)%?',
        'FS': r'FS\s*[：:=]?\s*([\d\.-]+)%?',

        # 二尖瓣口血流
        'E峰': r'E\s*峰\s*[：:]\s*([\d\.-]+)\s*m/s?',
        'A峰': r'A\s*峰\s*[：:]\s*([\d\.-]+)\s*m/s?',
        'E/A': r'E\s*\/\s*A\s*[：:=]?\s*([\d\.-]+)',

        # 组织速度
        '室间隔侧 e＇': r'室间隔\s*侧\s*e\s*[\'＇]\s*[：:]\s*([\d\.-]+)\s*cm/s?',
        '室间隔侧 a＇': r'室间隔\s*侧\s*.*?a\s*[\'＇]\s*[：:]\s*([\d\.-]+)\s*cm/s?',
        '侧壁侧 e＇': r'侧壁\s*侧\s*e\s*[\'＇]\s*[：:]\s*([\d\.-]+)\s*cm/s?',
        '侧壁侧 a＇': r'侧壁\s*侧\s*.*?a\s*[\'＇]\s*[：:]\s*([\d\.-]+)\s*cm/s?',
        '平均E/e＇': r'平均\s*E\s*\/\s*e\s*[\'＇]\s*[：:]\s*([\d\.-]+)',

        # 检查提示
        '检查提示': r'检查\s*提示\s*[：:]\s*([\s\S]+?)(?=\s*超声\s*测值|\s*打印\s*时间\s*[：:]|\s*检查\s*医师\s*[：:])',

        # 底部信息
        '打印时间': r'打印\s*时间\s*[：:]\s*(\d{4}\s*[-\s]\s*\d{2}\s*[-\s]\s*\d{2}\s+[\d\s:]+)',
        '检查医师': r'检查\s*医师\s*[：:]\s*([^\r\n]+?)(?=\s*校对\s*医师|\s*备注|\s*[\r\n]|$)',
        '校对医师': r'校对\s*医师\s*[：:]\s*([^\r\n]+?)(?=\s*备注|\s*[\r\n]|$)',
        '备注': r'备注\s*[：:]\s*([^\r\n]+?)(?=\s*第\s*\d\s*页|$)',
    }

    extracted = {}

    # 提取所有字段
    for field_name, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match and match.group(1):
            value = match.group(1).strip()

            # 对于多行字段保留格式
            if field_name not in ['２Ｄ及Ｍ型特征', '彩色及频谱多普勒特征', '检查提示', '临床初步诊断', '备注']:
                value = re.sub(r'\s+', ' ', value)
            else:
                # 多行字段: 清理但保留换行
                lines = [line.strip() for line in value.split('\n') if line.strip()]
                value = '\n'.join(lines)

            extracted[field_name] = value
        else:
            extracted[field_name] = '未提取'

    return extracted


def process_pdf_folder(folder_path, max_files=None):
    """处理文件夹中的所有PDF文件"""

    folder = Path(folder_path)
    if not folder.exists() or not folder.is_dir():
        print(f"错误: 路径不存在或不是文件夹 - {folder_path}")
        return []

    # 查找所有PDF文件
    pdf_files = list(folder.glob("**/*.pdf"))

    if not pdf_files:
        print("错误: 未找到任何PDF文件")
        return []

    # 限制文件数量
    if max_files and len(pdf_files) > max_files:
        print(f"警告: 找到 {len(pdf_files)} 个文件，将只处理前 {max_files} 个")
        pdf_files = pdf_files[:max_files]

    print(f"找到 {len(pdf_files)} 个PDF文件，开始处理...\n")

    results = []

    for idx, pdf_path in enumerate(pdf_files, 1):
        print(f"[{idx}/{len(pdf_files)}] 处理: {pdf_path.name}")

        text = extract_text_from_pdf(pdf_path)

        if text:
            data = extract_fields(text)
            data['文件名'] = pdf_path.name
            data['状态'] = '成功'
            results.append(data)
            print(f"  ✓ 提取成功")
        else:
            results.append({
                '文件名': pdf_path.name,
                '状态': '失败'
            })
            print(f"  ✗ 提取失败")

    return results


def export_to_excel(data, output_path):
    """将提取的数据导出到Excel"""

    # 定义列顺序
    columns = [
        '检查日期', '检查编号', '机型', '姓名', '性别', '年龄', '科别', '送检医师',
        '医嘱号', '住院号', '床号', '临床初步诊断', '部位', '录入员',
        '主动脉瓣环', '主动脉窦部', '窦管交界', '升主动脉', '左房前后径', '室间隔',
        '左室舒张末期', '左室后壁', '右室流出道', '肺动脉', '左房左右径', '下腔静脉',
        '２Ｄ及Ｍ型特征', '彩色及频谱多普勒特征',
        '二尖瓣', '三尖瓣', '肺动脉瓣',
        '流速约（m/s）', '平均跨瓣压差约（mmHg）', '反流面积（cm2）',
        'EF', 'FS', 'E峰', 'A峰', 'E/A',
        '室间隔侧 e＇', '室间隔侧 a＇', '侧壁侧 e＇', '侧壁侧 a＇', '平均E/e＇',
        '检查提示', '打印时间', '检查医师', '校对医师', '备注', '文件名', '状态'
    ]

    # 创建工作簿
    wb = Workbook()
    ws = wb.active
    ws.title = "提取结果"

    # 写入表头
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")

    for col_idx, column_name in enumerate(columns, 1):
        cell = ws.cell(row=1, column=col_idx, value=column_name)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')

    # 写入数据
    for row_idx, record in enumerate(data, 2):
        for col_idx, column_name in enumerate(columns, 1):
            value = record.get(column_name, '')
            cell = ws.cell(row=row_idx, column=col_idx, value=value)

            # 设置成功/失败的颜色
            if column_name == '状态':
                if value == '成功':
                    cell.font = Font(color="00B050", bold=True)
                elif value == '失败':
                    cell.font = Font(color="FF0000", bold=True)

    # 自动调整列宽
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width

    # 保存文件
    wb.save(output_path)
    print(f"\n✓ Excel文件已保存: {output_path}")


def main():
    if len(sys.argv) < 2:
        print("用法: python script.py <PDF文件夹路径> [最大文件数]")
        sys.exit(1)

    folder_path = sys.argv[1]
    max_files = int(sys.argv[2]) if len(sys.argv) > 2 else None

    # 处理PDF文件
    results = process_pdf_folder(folder_path, max_files)

    if not results:
        print("没有提取到任何数据")
        sys.exit(1)

    # 生成输出文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"超声报告提取结果_{timestamp}.xlsx"

    # 导出到Excel
    export_to_excel(results, output_file)

    print(f"\n处理完成! 共处理 {len(results)} 个文件")
    success_count = sum(1 for r in results if r.get('状态') == '成功')
    print(f"成功: {success_count}, 失败: {len(results) - success_count}")


if __name__ == "__main__":
    main()
PYTHON_SCRIPT_EOF
}

# 主函数
main() {
    echo "================================================"
    echo "  超声报告PDF数据结构化提取工具"
    echo "================================================"
    echo

    # 检测环境
    detect_os
    check_python
    check_dependencies

    # 创建临时Python脚本
    TEMP_SCRIPT=$(mktemp /tmp/pdf_extract_XXXXXX.py)
    create_python_script
    chmod +x "$TEMP_SCRIPT"

    # 获取输入参数
    if [ $# -eq 0 ]; then
        read -p "请输入PDF文件夹路径: " PDF_FOLDER
        read -p "最大处理文件数 (留空处理全部): " MAX_FILES
    else
        PDF_FOLDER="$1"
        MAX_FILES="${2:-}"
    fi

    # 验证文件夹
    if [ ! -d "$PDF_FOLDER" ]; then
        print_error "文件夹不存在: $PDF_FOLDER"
        rm -f "$TEMP_SCRIPT"
        exit 1
    fi

    echo
    print_info "开始处理PDF文件..."
    echo

    # 执行Python脚本
    if [ -n "$MAX_FILES" ]; then
        $PYTHON_CMD "$TEMP_SCRIPT" "$PDF_FOLDER" "$MAX_FILES"
    else
        $PYTHON_CMD "$TEMP_SCRIPT" "$PDF_FOLDER"
    fi

    # 清理临时文件
    rm -f "$TEMP_SCRIPT"

    echo
    print_success "所有操作完成!"
}

# 运行主函数
main "$@"

#输入命令：./pdf_extractor.sh /Users/xjt/Downloads/学习档案
