import os

cwd = r"c:\Users\keert\NL2SQL\frontend\src"
file_path = os.path.join(cwd, "App.css")
with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith("> "):
        new_lines.append(line[2:])
    elif line.startswith(">"):
        new_lines.append(line[1:])
    else:
        new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("CSS > stripped successfully")
