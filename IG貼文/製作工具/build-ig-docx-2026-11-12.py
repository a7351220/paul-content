import re, copy, zipfile, io, shutil, sys
from lxml import etree
from PIL import Image

BASE='/workspace/paul-content/IG貼文/'
TPL=BASE+'template-2026-11-09-published.docx'
MD=BASE+'2026-11-12-老黃再爆內部出軌-IG.md'
OUT=BASE+'2026-11-12-老黃再爆內部出軌-IG.docx'
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PR='http://schemas.openxmlformats.org/package/2006/relationships'
q=lambda n:'{%s}%s'%(W,n)

# ---- parse md ----
md=open(MD,encoding='utf-8').read()
secs=re.split(r'^\*\*(.+?)\*\*\s*$',md,flags=re.M)
S={}
for i in range(1,len(secs),2):
    S[secs[i].strip()]=[b.strip() for b in secs[i+1].strip().split('\n\n') if b.strip()]
keys=list(S)
s1,s2,s3,s4=keys[0],keys[1],keys[2],keys[3]
cover=S[s1]; title_lines=cover[0].split('\n'); hook=cover[1]
cap=S['Caption']; src=S['資料來源與配圖說明']
links=[re.match(r'\[(.+?)\]\((.+?)\)',x).groups() for x in src if x.startswith('[')]
credit=[x for x in src if not x.startswith('[')][0]

doc=etree.fromstring(open('/workspace/tpl/word/document.xml','rb').read())
body=doc[0]; P=list(body)
def ts(p): return p.findall('.//'+q('t'))
def setp(p,texts):
    t=ts(p); assert len(t)==len(texts),(len(t),texts)
    for el,x in zip(t,texts): el.text=x
setp(P[0],[s1]); setp(P[1],title_lines); setp(P[2],[hook])
for (li,hi,bi),k in zip([(6,7,9),(11,12,14),(16,17,19)],[s2,s3,s4]):
    setp(P[li],[k]); setp(P[hi],[S[k][0]]); setp(P[bi],S[k][1:3]); assert len(S[k])==3
setp(P[22],[cap[0]])
assert len(cap)==4
for i,x in zip((23,24,25),cap[1:]): setp(P[i],[x])
setp(P[26],['資料來源與配圖說明'])
setp(P[31],[credit])
# hyperlinks: clone P[27] for each link, drop 27-30
rels=etree.fromstring(open('/workspace/tpl/word/_rels/document.xml.rels','rb').read())
for r in list(rels):
    if r.get('Type').endswith('/hyperlink'): rels.remove(r)
    elif r.get('Type').endswith('/image'): r.set('Target',r.get('Target').replace('.png','.jpeg'))
proto=P[27]; anchor=P[31]
for p in P[27:31]: body.remove(p)
for n,(label,url) in enumerate(links):
    rid='rIdL%d'%(n+1)
    e=etree.SubElement(rels,'{%s}Relationship'%PR); e.set('Id',rid)
    e.set('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink')
    e.set('Target',url); e.set('TargetMode','External')
    p=copy.deepcopy(proto); p.find(q('hyperlink')).set('{%s}id'%R,rid); setp(p,[label])
    anchor.addprevious(p)
# paraId uniqueness
W14='{http://schemas.microsoft.com/office/word/2010/wordml}paraId'
for i,p in enumerate(body.iter(q('p'))): p.set(W14,'%08X'%(0x100+i))
# alt names
for dp in doc.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr'):
    dp.set('descr','')

# ---- images ----
def png(im):
    b=io.BytesIO(); im.save(b,'JPEG',quality=90,subsampling=0,optimize=True); return b.getvalue()
def fit(path,size=(1122,1402)):
    im=Image.open(path).convert('RGB'); assert im.size==size,(path,im.size); return im
media={}
media['word/media/image3.png']=png(fit('/workspace/ig-2026-11-12/cover-A.png'))
media['word/media/image4.png']=png(fit('/workspace/ig-2026-11-12/slide3-boardroom.png'))
media['word/media/image2.png']=png(fit('/workspace/ig-2026-11-12/slide4-supply-chain.png'))
shot=Image.open(BASE+'2026-11-12-refs/powell-nvidia-bio-page.png').convert('RGB')
canvas=Image.new('RGB',(1323,1654),'white')
tw=int(1323*0.90); th=round(shot.height*tw/shot.width)
s=shot.resize((tw,th),Image.LANCZOS)
canvas.paste(s,((1323-tw)//2,(1654-th)//2))
canvas.save('/workspace/ig-20261112-build/slide2-canvas.png')
media['word/media/image1.png']=png(canvas)

zin=zipfile.ZipFile(TPL)
zout=zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED)
for it in zin.infolist():
    data=zin.read(it.filename)
    if it.filename=='word/document.xml': data=etree.tostring(doc,xml_declaration=True,encoding='UTF-8',standalone=True)
    elif it.filename=='word/_rels/document.xml.rels': data=etree.tostring(rels,xml_declaration=True,encoding='UTF-8',standalone=True)
    elif it.filename in media:
        zout.writestr(it.filename.replace('.png','.jpeg'),media[it.filename]); continue
    elif it.filename=='[Content_Types].xml':
        t=data.decode()
        if 'Extension="jpeg"' not in t:
            t=t.replace('<Default ','<Default Extension="jpeg" ContentType="image/jpeg"/><Default ',1)
        data=t.encode()
    zout.writestr(it,data)
zout.close()
print('ok',OUT)
