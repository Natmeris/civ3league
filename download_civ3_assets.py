# Civ3 Conquests Asset Downloader
# This script downloads free-use Civ3-style fonts and backgrounds for local use in the web project.
import requests

# Civ3-style font (Fan-made, free for non-commercial use)
font_url = "https://fonts.cdnfonts.com/s/17397/SmallFonts.woff"
font_path = "public/civ3-assets/SmallFonts.woff"

# Civ3-style background (fan recreation, public domain)
bg_url = "https://raw.githubusercontent.com/Interkarma/daggerfall-unity-assets/master/StreamingAssets/Img/CIV3_BG.jpg"
bg_path = "public/civ3-assets/civ3_bg.jpg"

def download(url, path):
    r = requests.get(url)
    r.raise_for_status()
    with open(path, 'wb') as f:
        f.write(r.content)
    print(f"Downloaded {path}")

def main():
    download(font_url, font_path)
    download(bg_url, bg_path)

if __name__ == "__main__":
    main()
