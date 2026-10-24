from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import json, re, hashlib

ROOT=Path(__file__).resolve().parents[2]
SOURCE=Path('/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx')
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
NS={'p':P,'a':A,'r':R}
def xml(e):return E.tostring(e,xml_declaration=True,encoding='UTF-8',standalone=True)
notes=json.loads((ROOT/'製作紀錄/notes.json').read_text())
assert len(notes)==20
with ZipFile(SOURCE) as z:data={n:z.read(n) for n in z.namelist()}
base=E.fromstring(data['ppt/slides/slide2.xml'])
base_rels=E.fromstring(data['ppt/slides/_rels/slide2.xml.rels'])
base_notes=E.fromstring(data['ppt/notesSlides/notesSlide2.xml'])
base_notes_rels=E.fromstring(data['ppt/notesSlides/_rels/notesSlide2.xml.rels'])
source1=E.fromstring(data['ppt/slides/slide1.xml'])
title=deepcopy(source1.xpath('.//p:sp[p:txBody]',namespaces=NS)[0])
title.find('p:nvSpPr/p:cNvPr',NS).set('id','5')
title.find('p:nvSpPr/p:cNvPr',NS).set('name','全片標題')
title.find('.//a:off',NS).attrib.update({'x':'3804761','y':'266700'})
title.find('.//a:ext',NS).attrib.update({'cx':'14097000','cy':'1047750'})
title.find('.//a:pPr',NS).set('algn','l')
title.find('.//a:t',NS).text='比特幣會被量子計算攻破嗎？'
owl=base.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="3"]]',namespaces=NS)[0]
owl_xml=E.tostring(owl)

for n in list(data):
 if re.match(r'ppt/(slides|notesSlides)/(?:_rels/)?(?:slide|notesSlide)\d+\.xml(?:\.rels)?$',n): del data[n]
pres=E.fromstring(data['ppt/presentation.xml'])
slist=pres.find('p:sldIdLst',NS);slist.clear()
pr=E.fromstring(data['ppt/_rels/presentation.xml.rels'])
for e in list(pr):
 if e.get('Type','').endswith('/slide'):pr.remove(e)
content=E.fromstring(data['[Content_Types].xml'])
for e in list(content):
 if re.match(r'/ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml',e.get('PartName','')):content.remove(e)

for i,item in enumerate(notes,1):
 imagepath=ROOT/f'視覺素材/slide_{i:02}.png'
 assert imagepath.exists(),imagepath
 slide=deepcopy(base);tree=slide.find('p:cSld/p:spTree',NS)
 main=slide.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="4"]]',namespaces=NS)[0]
 main.find('p:nvSpPr/p:cNvPr',NS).set('descr',f'第{i}頁主圖')
 rect=main.find('.//a:fillRect',NS)
 rect.attrib.update({'l':'0','t':'0','r':'0','b':'0'})
 old=slide.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="5"]]',namespaces=NS)[0]
 tree.remove(old)
 if i==1:tree.append(deepcopy(title))
 assert E.tostring(slide.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="3"]]',namespaces=NS)[0])==owl_xml
 rels=deepcopy(base_rels)
 for rel in rels:
  if rel.get('Type','').endswith('/notesSlide'):rel.set('Target',f'../notesSlides/notesSlide{i}.xml')
  if rel.get('Id')=='rId5':rel.set('Target',f'../media/quantum-slide-{i:02}.png')
  if rel.get('Id')=='rId6':rels.remove(rel)
 note=deepcopy(base_notes)
 for sp in note.xpath('.//p:sp',namespaces=NS):
  body=sp.find('p:txBody',NS)
  if body is None:continue
  for p in list(body.findall('a:p',NS)):body.remove(p)
  ph=sp.find('p:nvSpPr/p:nvPr/p:ph',NS)
  if ph is not None and ph.get('type')=='body':
   for paragraph in item['notes'].split('\n\n'):
    p=E.SubElement(body,f'{{{A}}}p');run=E.SubElement(p,f'{{{A}}}r')
    E.SubElement(run,f'{{{A}}}rPr',lang='zh-TW')
    E.SubElement(run,f'{{{A}}}t').text=paragraph
  else:E.SubElement(body,f'{{{A}}}p')
 nr=deepcopy(base_notes_rels)
 for rel in nr:
  if rel.get('Type','').endswith('/slide'):rel.set('Target',f'../slides/slide{i}.xml')
 data[f'ppt/slides/slide{i}.xml']=xml(slide)
 data[f'ppt/slides/_rels/slide{i}.xml.rels']=xml(rels)
 data[f'ppt/notesSlides/notesSlide{i}.xml']=xml(note)
 data[f'ppt/notesSlides/_rels/notesSlide{i}.xml.rels']=xml(nr)
 data[f'ppt/media/quantum-slide-{i:02}.png']=imagepath.read_bytes()
 rid=f'rIdQuantumSlide{i}'
 E.SubElement(slist,f'{{{P}}}sldId',id=str(256+i),attrib={f'{{{R}}}id':rid})
 E.SubElement(pr,f'{{{PKG}}}Relationship',Id=rid,Type=R+'/slide',Target=f'slides/slide{i}.xml')
 for part,typ in [(f'/ppt/slides/slide{i}.xml','slide'),(f'/ppt/notesSlides/notesSlide{i}.xml','notesSlide')]:
  E.SubElement(content,f'{{{CT}}}Override',PartName=part,ContentType=f'application/vnd.openxmlformats-officedocument.presentationml.{typ}+xml')
data['ppt/presentation.xml']=xml(pres)
data['ppt/_rels/presentation.xml.rels']=xml(pr)
data['[Content_Types].xml']=xml(content)
out=ROOT/'製作紀錄/build/candidate.pptx'
with ZipFile(out,'w',ZIP_DEFLATED) as z:
 for path,blob in data.items():z.writestr(path,blob)
print(json.dumps({'candidate':str(out),'pages':20,'bytes':out.stat().st_size,'source_owl_unchanged':True},ensure_ascii=False))
