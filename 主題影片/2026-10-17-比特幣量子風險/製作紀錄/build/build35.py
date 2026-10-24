from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from copy import deepcopy
from lxml import etree as E
import json,re,shutil
r=Path(__file__).resolve().parents[2];data=json.loads((r/'製作紀錄/35頁同步資料.json').read_text());pages=data['pages'];newnums=[p[0] for p in data['plan']]
P='http://schemas.openxmlformats.org/presentationml/2006/main';A='http://schemas.openxmlformats.org/drawingml/2006/main';R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';K='http://schemas.openxmlformats.org/package/2006/relationships';C='http://schemas.openxmlformats.org/package/2006/content-types';ns={'p':P,'a':A,'r':R}
def ser(x):return E.tostring(x,xml_declaration=True,encoding='UTF-8',standalone=True)
src=r/'輸出/比特幣會被量子計算攻破嗎.pptx'
with ZipFile(src) as z:base={n:z.read(n) for n in z.namelist()}
oldnums=[1,2,3,5,7,8,10,12,13,15,17,19,20,22,24,26,28,30,32,34]
oldimgs=[r/f'視覺素材/slide_{i:02}.png' for i in range(1,14)]+[r/'視覺素材/slide_14_sun.png']+[r/f'視覺素材/slide_{i:02}.png' for i in [14,15,16,17,19,20]]
imgmap=dict(zip(oldnums,oldimgs));imgmap.update({n:r/f'視覺素材/35頁版/slide_{n:02}.png' for n in newnums})
def build(nums,out):
 d=deepcopy(base)
 for n in list(d):
  if re.match(r'ppt/(slides|notesSlides)/(?:_rels/)?(?:slide|notesSlide)\d+\.xml(?:\.rels)?$',n):del d[n]
 pres=E.fromstring(d['ppt/presentation.xml']);sl=pres.find('p:sldIdLst',ns);sl.clear();pr=E.fromstring(d['ppt/_rels/presentation.xml.rels']);ct=E.fromstring(d['[Content_Types].xml'])
 for e in list(pr):
  if e.get('Type','').endswith('/slide'):pr.remove(e)
 for e in list(ct):
  if re.match(r'/ppt/(slides/slide|notesSlides/notesSlide)\d+\.xml',e.get('PartName','')):ct.remove(e)
 for i,n in enumerate(nums,1):
  slide=E.fromstring(base['ppt/slides/slide1.xml' if n==1 else 'ppt/slides/slide13.xml']);rels=E.fromstring(base['ppt/slides/_rels/slide13.xml.rels'])
  owl=slide.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@id="3"]]',namespaces=ns)[0];owl.find('.//a:fillRect',ns).attrib.update({'l':'0','t':'0','r':'0','b':'0'})
  for e in rels:
   if e.get('Type','').endswith('/notesSlide'):e.set('Target',f'../notesSlides/notesSlide{i}.xml')
   if e.get('Id')=='rId4':e.set('Target','../media/owl-preserved.png')
   if e.get('Id')=='rId5':e.set('Target',f'../media/final35-{n:02}.png')
  note=E.fromstring(base['ppt/notesSlides/notesSlide13.xml'])
  for sp in note.xpath('.//p:sp',namespaces=ns):
   ph=sp.find('p:nvSpPr/p:nvPr/p:ph',ns)
   if ph is None or ph.get('type')!='body':continue
   body=sp.find('p:txBody',ns)
   for p in list(body.findall('a:p',ns)):body.remove(p)
   for line in pages[n-1]['notes'].split('\n'):
    p=E.SubElement(body,'{'+A+'}p');rr=E.SubElement(p,'{'+A+'}r');E.SubElement(rr,'{'+A+'}t').text=line
  nr=E.fromstring(base['ppt/notesSlides/_rels/notesSlide13.xml.rels'])
  for e in nr:
   if e.get('Type','').endswith('/slide'):e.set('Target',f'../slides/slide{i}.xml')
  for name,x in [(f'ppt/slides/slide{i}.xml',slide),(f'ppt/slides/_rels/slide{i}.xml.rels',rels),(f'ppt/notesSlides/notesSlide{i}.xml',note),(f'ppt/notesSlides/_rels/notesSlide{i}.xml.rels',nr)]:d[name]=ser(x)
  d[f'ppt/media/final35-{n:02}.png']=imgmap[n].read_bytes()
  rid=f'rIdFinal35_{i}';E.SubElement(sl,'{'+P+'}sldId',id=str(1000+i),attrib={'{'+R+'}id':rid});E.SubElement(pr,'{'+K+'}Relationship',Id=rid,Type=R+'/slide',Target=f'slides/slide{i}.xml')
  for part,typ in [(f'slides/slide{i}','slide'),(f'notesSlides/notesSlide{i}','notesSlide')]:E.SubElement(ct,'{'+C+'}Override',PartName='/ppt/'+part+'.xml',ContentType='application/vnd.openxmlformats-officedocument.presentationml.'+typ+'+xml')
 d['ppt/presentation.xml']=ser(pres);d['ppt/_rels/presentation.xml.rels']=ser(pr);d['[Content_Types].xml']=ser(ct);d['ppt/media/owl-preserved.png']=(r/'製作紀錄/template-owl-preserved.png').read_bytes()
 used=set()
 for name,b in d.items():
  if name.endswith('.rels'):
   for e in E.fromstring(b):
    t=e.get('Target','')
    if '../media/' in t:used.add('ppt/media/'+t.split('../media/')[1])
 for name in list(d):
  if name.startswith('ppt/media/') and name not in used:del d[name]
 with ZipFile(out,'w',ZIP_DEFLATED) as z:
  for name,b in d.items():z.writestr(name,b)
 print(str(out))
if __name__=='__main__':
 build(newnums,r/'製作紀錄/新增15頁.pptx');build(list(range(1,36)),r/'輸出/比特幣量子風險_35頁.pptx')
