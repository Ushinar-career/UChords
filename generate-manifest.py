# generate-manifest.py
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SW_FILE = os.path.join(BASE_DIR, "service-worker.js")

files = []

for root, _, filenames in os.walk(STATIC_DIR):
    for filename in filenames:
        full_path = os.path.join(root, filename)
        rel_path = os.path.relpath(full_path, BASE_DIR).replace("\\", "/")
        files.append(rel_path)

formatted_list = "[\n" + ",\n".join(f'  "{f}"' for f in files) + "\n]"

with open(SW_FILE, "r", encoding="utf-8") as f:
    sw_content = f.read()

start = sw_content.find("const urlsToCache")
end = sw_content.find("];", start) + 2
new_array = f"const urlsToCache = {formatted_list};"
sw_content = sw_content[:start] + new_array + sw_content[end:]

with open(SW_FILE, "w", encoding="utf-8") as f:
    f.write(sw_content)

print(f"✅ Updated service-worker.js with {len(files)} files.")
