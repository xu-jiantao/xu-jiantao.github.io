#!/bin/bash

#================================================================
# 超声报告 PDF 数据提取脚本 (增强版 v3)
#
# 描述:
#   此脚本可批量处理文件夹内的PDF超声报告，提取详细的结构化
#   数据。v3版本优化了正则表达式，能更精确地处理单行内含多个
#   字段的复杂布局，并使用更稳定的方法提取多行文本块。
#
# 前提条件:
#   需要安装 poppler-utils (提供 pdftotext 命令)。
#   - Ubuntu/Debian: sudo apt-get install poppler-utils
#   - CentOS/Fedora: sudo yum install poppler-utils
#   - macOS (Homebrew): brew install poppler
#
# 使用方法:
#   1. 将此脚本保存为 extract_reports_v2.sh
#   2. 给予执行权限: chmod +x extract_reports_v2.sh
#   3. 运行并指定PDF文件夹路径:
#      ./extract_reports_v2.sh /path/to/your/pdf_folder
#
#================================================================

# --- 配置 ---
# 检查输入参数
if [ -z "$1" ]; then
  echo "错误: 请提供一个包含PDF文件的文件夹路径。"
  echo "用法: $0 <文件夹路径>"
  exit 1
fi

INPUT_DIR="$1"
OUTPUT_CSV="超声报告提取结果_详细版.csv"
echo "--- 超声报告提取程序 (v3) ---"
echo "PDF 来源文件夹: $INPUT_DIR"
echo "结果将保存到: $OUTPUT_CSV"
echo "---------------------------------"

# --- 初始化CSV文件并写入表头 ---
# 定义所有需要提取的字段作为CSV表头
HEADER="检查日期,检查编号,机型,姓名,性别,年龄,科别,送检医师,医嘱号,住院号,床号,临床初步诊断,部位,检查所见,检查提示,打印时间,检查医师,录入员,备注,文件名,状态"
echo "$HEADER" > "$OUTPUT_CSV"

# --- 核心处理逻辑 ---
# 递归查找输入目录下的所有 .pdf 文件
find "$INPUT_DIR" -type f \( -name "*.pdf" -o -name "*.PDF" \) | while read -r pdf_file; do

  filename=$(basename "$pdf_file")
  echo "正在处理: $filename"

  # 使用 pdftotext 从 PDF 提取文本，-layout 选项有助于保持原始布局
  full_text=$(pdftotext -layout "$pdf_file" -)

  # 检查文本是否提取成功
  if [ -z "$full_text" ]; then
    echo "  -> 失败: 无法从PDF中提取文本或文件为空。"
    # 构造一个失败记录行
    error_line=$(printf ',%.0s' {1..18}) # 18个空字段
    echo "$error_line\"$filename\",\"失败\"" >> "$OUTPUT_CSV"
    continue # 继续处理下一个文件
  fi

  # --- 使用更精确的正则表达式提取各个字段 ---
  # 通过定义清晰的停止边界 (如 lookahead 或更具体的模式) 来避免贪婪匹配

  check_date=$(echo "$full_text" | grep -oP '检查日期\s*[：:]\s*\K\d{4}[-\s]\d{2}[-\s]\d{2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -n 1)
  check_id=$(echo "$full_text" | grep -oP '检查编号\s*[：:]\s*\K\S+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  model_type=$(echo "$full_text" | grep -oP '机型\s*[：:]\s*\K.*?(?=\s+送检医师|\s+姓名|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  patient_name=$(echo "$full_text" | grep -oP '姓名\s*[：:]\s*\K\S+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  gender=$(echo "$full_text" | grep -oP '性别\s*[：:]\s*\K(男|女)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  age=$(echo "$full_text" | grep -oP '年龄\s*[：:]\s*\K\d+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  department=$(echo "$full_text" | grep -oP '科别\s*[：:]\s*\K.*?(?=\s+机型|\s+送检医师|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  attending_doctor=$(echo "$full_text" | grep -oP '送检医师\s*[：:]\s*\K[^\r\n]+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  order_num=$(echo "$full_text" | grep -oP '医嘱号\s*[：:]\s*\K.*?(?=\s+门诊号|\s+住院号|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  # 兼容"住院号"和"门诊号"
  hospital_id=$(echo "$full_text" | grep -oP '(住院号|门诊号)\s*[：:]\s*\K.*?(?=\s+床号|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  bed_num=$(echo "$full_text" | grep -oP '床号\s*[：:]\s*\K[^\r\n]+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  clinical_diagnosis=$(echo "$full_text" | grep -oP '临床初步诊断\s*[：:]\s*\K.*?(?=\s+部位|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  location_part=$(echo "$full_text" | grep -oP '部位\s*[：:]\s*\K[^\r\n]+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  print_time=$(echo "$full_text" | grep -oP '打印时间\s*[：:]\s*\K\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  report_doctor=$(echo "$full_text" | grep -oP '(检查医师|校对医师)\s*[：:]\s*\K.*?(?=\s+录入员|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  recorder=$(echo "$full_text" | grep -oP '录入员\s*[：:]\s*\K.*?(?=\s+签名|$)' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)
  notes=$(echo "$full_text" | grep -oP '备注\s*[：:]\s*\K[^\r\n]+' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'| head -n 1)

  # --- 使用 awk 提取多行字段，更稳定 ---
  findings=$(echo "$full_text" | awk '/检查所见\s*[：:]/{f=1; sub(/.*检查所见\s*[：:]\s*/,"");} /检查提示\s*[：:]/{f=0} f' | tr '\n' ' ' | sed 's/"/""/g; s/^[[:space:]]*//;s/[[:space:]]*$//')
  suggestions=$(echo "$full_text" | awk '/检查提示\s*[：:]/{f=1; sub(/.*检查提示\s*[：:]\s*/,"");} /打印时间\s*[：:]|备注\s*[：:]|签名\s*[：:]/{f=0} f' | tr '\n' ' ' | sed 's/"/""/g; s/^[[:space:]]*//;s/[[:space:]]*$//')

  # 为所有可能为空的字段设置默认值 "未提取"
  : ${check_date:="未提取"}
  : ${check_id:="未提取"}
  : ${model_type:="未提取"}
  : ${patient_name:="未提取"}
  : ${gender:="未提取"}
  : ${age:="未提取"}
  : ${department:="未提取"}
  : ${attending_doctor:="未提取"}
  : ${order_num:="未提取"}
  : ${hospital_id:="未提取"}
  : ${bed_num:="未提取"}
  : ${clinical_diagnosis:="未提取"}
  : ${location_part:="未提取"}
  : ${findings:="未提取"}
  : ${suggestions:="未提取"}
  : ${print_time:="未提取"}
  : ${report_doctor:="未提取"}
  : ${recorder:="未提取"}
  : ${notes:="未提取"}

  # --- 将提取的所有数据按顺序写入CSV文件 ---
  # 所有字段都用双引号包裹，以确保数据的完整性
  echo "\"$check_date\",\"$check_id\",\"$model_type\",\"$patient_name\",\"$gender\",\"$age\",\"$department\",\"$attending_doctor\",\"$order_num\",\"$hospital_id\",\"$bed_num\",\"$clinical_diagnosis\",\"$location_part\",\"$findings\",\"$suggestions\",\"$print_time\",\"$report_doctor\",\"$recorder\",\"$notes\",\"$filename\",\"成功\"" >> "$OUTPUT_CSV"

done

echo "---------------------------------"
echo "处理完成！"
echo "结果已保存在 $OUTPUT_CSV 文件中。您现在可以用Excel或任何表格软件打开它。"