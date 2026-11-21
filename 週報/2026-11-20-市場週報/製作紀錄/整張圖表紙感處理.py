"""Paper/ink treatment of original raster charts. Text and plot pixels are retained."""
from pathlib import Path
from PIL import Image, ImageOps
from functools import lru_cache
import random

ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/'研究資料/原圖'
CANDIDATES=ROOT/'.build/整張圖表'
CANDIDATES.mkdir(parents=True,exist_ok=True)
ITEMS={
  10:('paul-w47-v2-sil.jpg','dark'),
  12:('paul-w47-v2-goldchina.jpg','dark'),
  15:('mara-cryptoquant.jpg','light'),
  19:('detrick.jpg','light'),
  20:('vix.jpg','light'),
  22:('goldman.jpg','light'),
  23:('bofa.jpg','light'),
}
INK=(14,28,48)
RUST=(161,70,39)
PAPER=(250,244,225)

def mix(x,y,w):
    return tuple(round(a+(b-a)*w) for a,b in zip(x,y))

@lru_cache(maxsize=65536)
def pigment(r,g,b,dark):
    l=(r*0.2126+g*0.7152+b*0.0722)/255
    if dark:l=1-l
    # A pale paper response keeps the original curves, labels and ticks readable.
    strength=(1-l)**.84
    accent=r>g+20 and r>b+24 or dark and r>b+48 and g>b+35
    ink=RUST if accent else (68,102,125) if b>r+18 and g>r+9 else INK
    return mix(PAPER,ink,strength)

def restyle(path,mode):
    src=Image.open(path).convert('RGB')
    # Work at the original chart geometry. Scale only once after color mapping.
    src.thumbnail((2200,1240),Image.Resampling.LANCZOS)
    source=src.copy()
    source.putdata([pigment(*rgb,mode=='dark') for rgb in src.get_flattened_data()])
    cropped=ImageOps.contain(source,(1570,876),Image.Resampling.LANCZOS)
    rn=random.Random(55)
    canvas=Image.new('RGB',(1600,900),PAPER)
    canvas.paste(cropped,((canvas.width-cropped.width)//2,(canvas.height-cropped.height)//2))
    pixels=canvas.load()
    for y in range(canvas.height):
        for x in range(canvas.width):
            n=rn.randrange(-4,4)
            pixels[x,y]=tuple(max(0,min(255,i+n)) for i in pixels[x,y])
    return canvas

if __name__=='__main__':
    for number,(name,mode) in ITEMS.items():
        im=restyle(SOURCES/name,mode)
        im.save(CANDIDATES/f'圖-{number:02}.jpg',quality=95,subsampling=0,optimize=True)
