import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import pandas as pd
from pdf2image import convert_from_path
import base64
from io import BytesIO
from openai import OpenAI


class UltrasoundReportExtractor:
    """超声报告智能提取器 - 使用本地DeepSeek模型"""

    def __init__(self,
                 api_base: str = "http://localhost:11434",
                 model_name: str = "deepseek-chat"):
        """
        初始化提取器

        Args:
            api_base: 本地DeepSeek API地址
            model_name: 模型名称
        """
        self.client = OpenAI(
            api_key="dummy-key",  # 本地模型不需要真实key
            base_url=api_base
        )
        self.model_name = model_name

        # 定义需要提取的字段结构
        self.fields_template = {
            "基础信息": [
                "检查日期", "检查编号", "机型", "姓名", "性别", "年龄",
                "科别", "送检医师", "医嘱号", "住院号", "床号",
                "临床初步诊断", "部位", "录入员"
            ],
            "超声测值": [
                "主动脉瓣环", "主动脉窦部", "窦管交界", "升主动脉",
                "左房前后径", "室间隔", "左室舒张末期", "左室后壁",
                "右室流出道", "肺动脉", "左房左右径", "下腔静脉"
            ],
            "形态特征": [
                "２Ｄ及Ｍ型特征", "彩色及频谱多普勒特征"
            ],
            "瓣口流速": [
                "二尖瓣", "三尖瓣", "肺动脉瓣"
            ],
            "主动脉瓣详情": [
                "流速约（m/s）", "平均跨瓣压差约（mmHg）", "反流面积（cm2）"
            ],
            "左心功能": [
                "EF", "FS"
            ],
            "二尖瓣口血流": [
                "E峰", "A峰", "E/A"
            ],
            "组织速度": [
                "室间隔侧 e＇", "室间隔侧 a＇",
                "侧壁侧 e＇", "侧壁侧 a＇", "平均E/e＇"
            ],
            "检查结论": [
                "检查提示"
            ],
            "其他信息": [
                "打印时间", "检查医师", "备注"
            ]
        }

    def pdf_to_images(self, pdf_path: str) -> List[bytes]:
        """
        将PDF转换为图片

        Args:
            pdf_path: PDF文件路径

        Returns:
            图片字节列表
        """
        try:
            # 转换PDF为图片(300 DPI保证清晰度)
            images = convert_from_path(pdf_path, dpi=300)

            image_bytes_list = []
            for img in images:
                # 转换为字节流
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                image_bytes_list.append(buffer.getvalue())

            return image_bytes_list
        except Exception as e:
            print(f"PDF转图片失败 {pdf_path}: {str(e)}")
            return []

    def encode_image(self, image_bytes: bytes) -> str:
        """将图片编码为base64"""
        return base64.b64encode(image_bytes).decode('utf-8')

    def extract_with_llm(self, image_bytes_list: List[bytes]) -> Dict[str, str]:
        """
        使用LLM从图片中提取信息

        Args:
            image_bytes_list: 图片字节列表

        Returns:
            提取的字段字典
        """
        # 构建提示词
        prompt = self._build_extraction_prompt()

        # 准备消息内容
        message_content = [
            {"type": "text", "text": prompt}
        ]

        # 添加所有页面图片
        for img_bytes in image_bytes_list:
            base64_image = self.encode_image(img_bytes)
            message_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{base64_image}"
                }
            })

        try:
            # 调用本地DeepSeek模型
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": message_content
                    }
                ],
                temperature=0.1,  # 低温度保证稳定性
                max_tokens=4000
            )

            # 解析返回的JSON
            result_text = response.choices[0].message.content

            # 提取JSON部分(可能包含markdown标记)
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]

            extracted_data = json.loads(result_text.strip())
            return extracted_data

        except Exception as e:
            print(f"LLM提取失败: {str(e)}")
            return {}

    def _build_extraction_prompt(self) -> str:
        """构建提取提示词"""
        fields_list = []
        for category, fields in self.fields_template.items():
            fields_list.extend(fields)

        prompt = f"""你是一个专业的医疗报告数据提取助手。请仔细阅读这份超声心动图检查报告的所有页面，并按照以下JSON格式提取信息。

**重要规则:**
1. 严格按照字段名称提取，不要更改字段名
2. 如果某个字段在报告中找不到，请填写"未提取"
3. 数值型字段只提取数字，不要带单位
4. 日期格式统一为 YYYY-MM-DD
5. 文本型字段保持原文，但去除多余空格和换行
6. 返回标准JSON格式，不要添加任何其他文字

需要提取的字段：
{json.dumps(self.fields_template, ensure_ascii=False, indent=2)}

请返回如下格式的JSON（所有字段都要包含）：
{{
    "检查日期": "...",
    "检查编号": "...",
    "姓名": "...",
    ...所有字段...
}}"""

        return prompt

    def process_single_pdf(self, pdf_path: str) -> Dict[str, str]:
        """
        处理单个PDF文件

        Args:
            pdf_path: PDF文件路径

        Returns:
            提取结果字典
        """
        print(f"正在处理: {os.path.basename(pdf_path)}")

        result = {
            "文件名": os.path.basename(pdf_path),
            "状态": "失败"
        }

        try:
            # 1. PDF转图片
            print("  - 转换PDF为图片...")
            image_bytes_list = self.pdf_to_images(pdf_path)

            if not image_bytes_list:
                result["错误信息"] = "PDF转换失败"
                return result

            print(f"  - 成功转换为 {len(image_bytes_list)} 页图片")

            # 2. 使用LLM提取
            print("  - 调用DeepSeek模型提取信息...")
            extracted_data = self.extract_with_llm(image_bytes_list)

            if extracted_data:
                result.update(extracted_data)
                result["状态"] = "成功"
                print("  ✓ 提取完成")
            else:
                result["错误信息"] = "LLM提取失败"
                print("  ✗ 提取失败")

        except Exception as e:
            result["错误信息"] = str(e)
            print(f"  ✗ 处理出错: {str(e)}")

        return result

    def process_folder(self,
                       folder_path: str,
                       output_excel: Optional[str] = None,
                       max_files: Optional[int] = None) -> pd.DataFrame:
        """
        批量处理文件夹中的PDF

        Args:
            folder_path: PDF文件夹路径
            output_excel: 输出Excel文件路径(可选)
            max_files: 最大处理文件数(可选,用于测试)

        Returns:
            结果DataFrame
        """
        # 获取所有PDF文件
        pdf_files = list(Path(folder_path).glob("*.pdf"))

        if max_files:
            pdf_files = pdf_files[:max_files]

        print(f"找到 {len(pdf_files)} 个PDF文件")

        # 处理每个文件
        all_results = []
        for i, pdf_path in enumerate(pdf_files, 1):
            print(f"\n[{i}/{len(pdf_files)}] ", end="")
            result = self.process_single_pdf(str(pdf_path))
            all_results.append(result)

        # 转换为DataFrame
        df = pd.DataFrame(all_results)

        # 按照预定义顺序排列列
        all_fields = []
        for fields in self.fields_template.values():
            all_fields.extend(fields)
        all_fields.extend(["文件名", "状态", "错误信息"])

        # 确保所有列都存在
        for field in all_fields:
            if field not in df.columns:
                df[field] = "未提取"

        # 重新排列列顺序
        df = df[all_fields]

        # 导出Excel
        if output_excel is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_excel = f"超声报告提取结果_{timestamp}.xlsx"

        df.to_excel(output_excel, index=False)
        print(f"\n✓ 结果已导出到: {output_excel}")

        # 统计信息
        success_count = (df["状态"] == "成功").sum()
        print(f"\n处理完成: 成功 {success_count}/{len(df)} 个文件")

        return df


def main():
    """主函数 - 示例用法"""

    # ========== 配置区域 ==========

    # 1. 本地DeepSeek模型配置
    API_BASE = "http://localhost:11434"  # 根据你的实际端口调整
    MODEL_NAME = "deepseek-chat"  # 根据你的模型名称调整

    # 2. PDF文件夹路径
    PDF_FOLDER = "/Users/xjt/Downloads/学习档案"  # 修改为你的PDF文件夹路径

    # 3. 输出Excel文件名(可选,不指定则自动生成带时间戳的文件名)
    OUTPUT_EXCEL = None

    # 4. 最大处理文件数(可选,用于测试,None表示处理全部)
    MAX_FILES = None  # 例如: MAX_FILES = 5 只处理前5个文件

    # ========== 执行提取 ==========

    print("=" * 60)
    print("超声报告PDF智能提取系统 (DeepSeek版)")
    print("=" * 60)

    # 创建提取器
    extractor = UltrasoundReportExtractor(
        api_base=API_BASE,
        model_name=MODEL_NAME
    )

    # 批量处理
    df = extractor.process_folder(
        folder_path=PDF_FOLDER,
        output_excel=OUTPUT_EXCEL,
        max_files=MAX_FILES
    )

    print("\n" + "=" * 60)
    print("提取完成!")
    print("=" * 60)


if __name__ == "__main__":
    main()