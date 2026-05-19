with open("src/components/Nav.jsx", "r") as f:
    content = f.read()

content = content.replace("SIGN IN", "{t.nav_signin}")

with open("src/components/Nav.jsx", "w") as f:
    f.write(content)

print("Patched successfully")
