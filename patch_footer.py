import re

with open("src/components/Footer.jsx", "r") as f:
    content = f.read()

pattern = r"\s*\{\/\*\s*Col 2 — Platform\s*\*\/\}\s*<div>.*?</div>\s*</div>"
# Let's be more precise
start_idx = content.find("{/* Col 2 — Platform */}")
end_idx = content.find("{/* Col 3 — Legal */}")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    with open("src/components/Footer.jsx", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find blocks")
