import os


def collect_code_files(root_dir, extensions):
    """
    遍历指定目录，收集所有具有指定扩展名的文件路径。

    :param root_dir: 要遍历的根目录
    :param extensions: 要匹配的文件扩展名列表，例如 ['.jsx', '.css']
    :return: 符合条件的文件路径列表
    """
    matched_files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if any(filename.lower().endswith(ext) for ext in extensions):
                matched_files.append(os.path.join(dirpath, filename))
    return matched_files


def sort_files_by_first_letter(file_paths):
    """
    按照文件名首字母顺序对文件路径进行排序。

    :param file_paths: 文件路径列表
    :return: 排序后的文件路径列表
    """
    return sorted(file_paths, key=lambda x: os.path.basename(x).lower())


def aggregate_files(file_paths, output_file):
    """
    读取所有文件内容并汇总到一个输出文件中。
    每个文件的第一行是文件名和后缀。

    :param file_paths: 要读取的文件路径列表
    :param output_file: 输出的汇总文件路径
    """
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in file_paths:
            filename = os.path.basename(file_path)
            outfile.write(f'{filename}\n')  # 写入文件名和后缀作为第一行
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(content)
                    outfile.write('\n\n')  # 文件之间添加空行分隔
            except Exception as e:
                outfile.write(f'// 无法读取文件: {e}\n\n')


def main():
    # 当前目录
    current_dir = os.getcwd()

    # 要收集的文件扩展名
    extensions = ['.html']  # 可以根据需要添加更多扩展名，例如 '.js', '.html' 等

    # 输出文件名
    output_filename = '我的网站代码.txt'
    output_file_path = os.path.join(current_dir, output_filename)

    # 收集文件
    files_to_aggregate = collect_code_files(current_dir, extensions)

    if not files_to_aggregate:
        print("未找到匹配的文件。")
        return

    # 按照文件名首字母排序
    sorted_files = sort_files_by_first_letter(files_to_aggregate)

    # 汇总文件内容
    aggregate_files(sorted_files, output_file_path)

    print(f"汇总完成，文件已保存为 {output_file_path}")


if __name__ == '__main__':
    main()
