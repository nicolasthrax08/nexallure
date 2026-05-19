import re

with open("src/i18n.js", "r") as f:
    content = f.read()

# We can find EN, ZH, TW blocks.
# Let's replace by specific language block or just use replace based on the language
blocks = content.split("ZH: {")
en_block = blocks[0]
zh_tw_blocks = blocks[1].split("TW: {")
zh_block = zh_tw_blocks[0]
tw_block = zh_tw_blocks[1]

en_block = re.sub(r"(nav_market_guide:\s*'[^']+',?)", r"\1\n    nav_signin: 'Sign In',", en_block)
zh_block = re.sub(r"(nav_market_guide:\s*'[^']+',?)", r"\1\n    nav_signin: '登录',", zh_block)
tw_block = re.sub(r"(nav_market_guide:\s*'[^']+',?)", r"\1\n    nav_signin: '登入',", tw_block)

new_content = en_block + "ZH: {" + zh_block + "TW: {" + tw_block

with open("src/i18n.js", "w") as f:
    f.write(new_content)

print("Patched successfully")
