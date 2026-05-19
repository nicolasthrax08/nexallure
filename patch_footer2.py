import re

with open("src/components/Footer.jsx", "r") as f:
    content = f.read()

# remove platformLinks definition
start_idx = content.find("const platformLinks")
end_idx = content.find("function navigateAndScroll")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]
    with open("src/components/Footer.jsx", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find blocks")
