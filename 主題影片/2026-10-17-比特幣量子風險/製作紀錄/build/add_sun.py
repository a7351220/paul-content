from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
from copy import deepcopy
import json,shutil
root=Path(__file__).resolve().parents[2]
payload=json.loads((root/'製作紀錄/sun-insertion.json').read_text())
P='http://schemas.openxmlformats.org/presentationml/2006/main'; A='http://schemas.openxmlformats.org/drawingml/2006/main'; R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'; K='http://schemas.openxmlformats.org/package/2006/relationships'; C='http://schemas.openxmlformats.org/package/2006/content-types'
ns={'p':P,'a':A,'r':R}
def ser(x): return E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
src=root/'輸出/比特幣會被量子計算攻破嗎.pptx'
backup=root/'_archive/新增孫哥獨立頁前';backup.mkdir(exist_ok=True)
for f in [src,root/'逐字稿.md',root/'製作紀錄/notes.json']: shutil.copy2(f,backup/f.name)
with ZipFile(src) as z:d={n:z.read(n) for n in z.namelist()}
def note(i,text):
 x=E.fromstring(d[f'ppt/notesSlides/notesSlide{i}.xml'])
 for sp in x.xpath('.//p:sp',namespaces=ns):
  ph=sp.find('p:nvSpPr/p:nvPr/p:ph',ns)
  if ph is None or ph.get('type')!='body':continue
  body=sp.find('p:txBody',ns)
  for p in list(body.findall('a:p',ns)):body.remove(p)
  for line in text.split('\n'):
   p=E.SubElement(body,'{'+A+'}p');r=E.SubElement(p,'{'+A+'}r');E.SubElement(r,'{'+A+'}t').text=line
 return ser(x)
for item in payload['restored']:d[f"ppt/notesSlides/notesSlide{item['page_number']}.xml"]=note(item['page_number'],item['notes'])
d['ppt/notesSlides/notesSlide21.xml']=note(13,payload['sun'])
nr=E.fromstring(d['ppt/notesSlides/_rels/notesSlide13.xml.rels'])
for e in nr:
 if e.get('Type','').endswith('/slide'):e.set('Target','../slides/slide21.xml')
d['ppt/notesSlides/_rels/notesSlide21.xml.rels']=ser(nr)
d['ppt/slides/slide21.xml']=d['ppt/slides/slide13.xml']
sr=E.fromstring(d['ppt/slides/_rels/slide13.xml.rels'])
for e in sr:
 if e.get('Type','').endswith('/notesSlide'):e.set('Target','../notesSlides/notesSlide21.xml')
 if e.get('Id')=='rId5':e.set('Target','../media/quantum-sun.png')
d['ppt/slides/_rels/slide21.xml.rels']=ser(sr);d['ppt/media/quantum-sun.png']=(root/'視覺素材/slide_14_sun.png').read_bytes()
pr=E.fromstring(d['ppt/_rels/presentation.xml.rels']);E.SubElement(pr,'{'+K+'}Relationship',Id='rIdSun21',Type=R+'/slide',Target='slides/slide21.xml');d['ppt/_rels/presentation.xml.rels']=ser(pr)
pres=E.fromstring(d['ppt/presentation.xml']);ls=pres.find('p:sldIdLst',ns);ls.insert(13,E.Element('{'+P+'}sldId',id='900',attrib={'{'+R+'}id':'rIdSun21'}));d['ppt/presentation.xml']=ser(pres)
ct=E.fromstring(d['[Content_Types].xml'])
for part,typ in [('slides/slide21','slide'),('notesSlides/notesSlide21','notesSlide')]:E.SubElement(ct,'{'+C+'}Override',PartName='/ppt/'+part+'.xml',ContentType='application/vnd.openxmlformats-officedocument.presentationml.'+typ+'+xml')
d['[Content_Types].xml']=ser(ct)
def save(path,data):
 with ZipFile(path,'w',ZIP_DEFLATED) as z:
  for n,b in data.items():z.writestr(n,b)
save(src,d)
single=deepcopy(d);ls=pres.find('p:sldIdLst',ns)
for e in list(ls):
 if e.get('{'+R+'}id')!='rIdSun21':ls.remove(e)
single['ppt/presentation.xml']=ser(pres)
slide=E.fromstring(single['ppt/slides/slide21.xml']);owl=slide.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="3"]]',namespaces=ns)[0];owl.find('.//a:fillRect',ns).attrib.update({'l':'0','r':'0','t':'0','b':'0'});single['ppt/slides/slide21.xml']=ser(slide)
for e in sr:
 if e.get('Id')=='rId4':e.set('Target','../media/owl-preserved.png')
single['ppt/slides/_rels/slide21.xml.rels']=ser(sr);single['ppt/media/owl-preserved.png']=(root/'製作紀錄/template-owl-preserved.png').read_bytes()
# Keep shared theme and layout parts; remove unused slide relationships and unused media.
for e in list(pr):
 if e.get('Type','').endswith('/slide') and e.get('Id')!='rIdSun21':pr.remove(e)
single['ppt/_rels/presentation.xml.rels']=ser(pr)
import re
for n in list(single):
 if re.match(r'ppt/(slides|notesSlides)/(?:_rels/)?(?:slide|notesSlide)\d+\.xml(?:\.rels)?$',n) and not re.search(r'(?:slide|notesSlide)21\.xml',n):del single[n]
for e in list(ct):
 name=e.get('PartName','')
 if re.match(r'/ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml',name) and not name.endswith('21.xml'):ct.remove(e)
single['[Content_Types].xml']=ser(ct)
used=set()
for n,b in single.items():
 if n.endswith('.rels'):
  for e in E.fromstring(b):
   t=e.get('Target','')
   if '../media/' in t:used.add('ppt/media/'+t.split('../media/')[1])
for n in list(single):
 if n.startswith('ppt/media/') and n not in used:del single[n]
save(root/'製作紀錄/孫哥獨立頁.pptx',single)
notes=[{'page':i+1,'notes':x['notes']} for i,x in enumerate(payload['restored'])];notes.insert(13,{'page':14,'notes':payload['sun']})
for i,x in enumerate(notes,1):x['page']=i
(root/'製作紀錄/notes.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2))
(root/'逐字稿.md').write_text('# 比特幣會被量子計算攻破嗎？\n\n'+'\n\n'.join('**第 '+str(x['page'])+' 頁**\n\n'+x['notes'].strip() for x in notes)+'\n')
print(json.dumps({'pages':21,'new_page':14,'single_slide':str(root/'製作紀錄/孫哥獨立頁.pptx')},ensure_ascii=False))
