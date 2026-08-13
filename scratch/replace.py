import os, re
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            # Replace lang === 'ar' or lang === "ar"
            new_content = re.sub(r'lang\s*===\s*[\'"]ar[\'"]', "lang?.startsWith('ar')", content)
            new_content = re.sub(r'language\s*===\s*[\'"]ar[\'"]', "language?.startsWith('ar')", new_content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print('Updated', path)
