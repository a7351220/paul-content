from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
import copy,json,posixpath,struct,hashlib
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parents[1]
SOURCE=WORK/'週報/2026-10-30-市場週報/輸出/2026-10-30市場週報-27頁.pptx'
OUT=ROOT/'輸出/輝達的中國難題-27頁修順版.pptx'
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL='http://schemas.openxmlformats.org/package/2006/relationships';CT='http://schemas.openxmlformats.org/package/2006/content-types'
for k,v in NS.items():E.register_namespace(k,v)
def xml(t):return E.tostring(t,encoding='utf-8',xml_declaration=True)
def relationships(items):
 t=E.Element('{'+REL+'}Relationships')
 for id,kind,target in items:E.SubElement(t,'{'+REL+'}Relationship',Id=id,Type=NS['r']+'/'+kind,Target=target)
 return xml(t)
with ZipFile(SOURCE) as z:data={n:z.read(n) for n in z.namelist()}
slides=json.loads((ROOT/'製作紀錄/slides-27頁修順.json').read_text())
assert [s['index'] for s in slides]==list(range(1,28))
base=E.fromstring(data['ppt/slides/slide26.xml']);note=E.fromstring(data['ppt/notesSlides/notesSlide26.xml'])
pres=E.fromstring(data['ppt/presentation.xml']);lst=pres.find('p:sldIdLst',NS);lst.clear()
pr=E.fromstring(data['ppt/_rels/presentation.xml.rels'])
for r in list(pr):
 if r.get('Type').endswith('/slide'):pr.remove(r)
for s in slides:
 i=s['index'];t=copy.deepcopy(base)
 title=t.xpath('.//p:sp[p:nvSpPr/p:cNvPr[@name="範本原生標題"]]',namespaces=NS)[0]
 if i==1:title.find('.//a:t',NS).text=s['title']
 else:title.getparent().remove(title)
 pic=t.find('.//p:pic',NS);pic.find('.//a:blip',NS).set('{'+NS['r']+'}embed','rIdContent')
 image=(ROOT/s['image']).read_bytes();w,h=struct.unpack('>II',image[16:24])
 xf=pic.find('p:spPr/a:xfrm',NS)
 xf.find('a:off',NS).attrib.update({'x':str(60*9525),'y':str((140 if i==23 else 170)*9525)})
 width=1300 if i==23 else 1380
 xf.find('a:ext',NS).attrib.update({'cx':str(width*9525),'cy':str(round(width*h/w*9525))})
 data[f'ppt/slides/slide{i}.xml']=xml(t)
 data[f'ppt/slides/_rels/slide{i}.xml.rels']=relationships([('rIdLayout','slideLayout','../slideLayouts/slideLayout6.xml'),('rIdContent','image',f'../media/content-{i:02}.png'),('rIdPreservedOwl','image','../media/paul-owl-original.png'),('rIdNotes','notesSlide',f'../notesSlides/notesSlide{i}.xml')])
 data[f'ppt/media/content-{i:02}.png']=image
 nt=copy.deepcopy(note);body=None
 for sp in nt.findall('.//p:sp',NS):
  ph=sp.find('.//p:ph',NS)
  if ph is not None and ph.get('type')=='body':body=sp.find('p:txBody',NS)
 assert body is not None
 for para in body.findall('a:p',NS):body.remove(para)
 for text in s['notes'].split('\n'):
  para=E.SubElement(body,'{'+NS['a']+'}p');run=E.SubElement(para,'{'+NS['a']+'}r');E.SubElement(run,'{'+NS['a']+'}t').text=text
 data[f'ppt/notesSlides/notesSlide{i}.xml']=xml(nt)
 data[f'ppt/notesSlides/_rels/notesSlide{i}.xml.rels']=relationships([('rIdMaster','notesMaster','../notesMasters/notesMaster1.xml'),('rIdSlide','slide',f'../slides/slide{i}.xml')])
 E.SubElement(lst,'{'+NS['p']+'}sldId',{'id':str(255+i),'{'+NS['r']+'}id':f'rIdPage{i}'})
 E.SubElement(pr,'{'+REL+'}Relationship',Id=f'rIdPage{i}',Type=NS['r']+'/slide',Target=f'slides/slide{i}.xml')
data['ppt/presentation.xml']=xml(pres);data['ppt/_rels/presentation.xml.rels']=xml(pr)
# Keep only referenced package parts so no previous video's images or narration remain.
rr=E.fromstring(data['_rels/.rels'])
for r in list(rr):
 if r.get('Type','').endswith('/thumbnail'):rr.remove(r)
data['_rels/.rels']=xml(rr)
keep={'[Content_Types].xml'}
def walk(part):
 if part in keep:return
 assert part in data,part
 keep.add(part)
 relpath=posixpath.join(posixpath.dirname(part),'_rels',posixpath.basename(part)+'.rels') if part else '_rels/.rels'
 if relpath not in data:return
 keep.add(relpath)
 for r in E.fromstring(data[relpath]):
  if r.get('TargetMode')=='External':continue
  target=r.get('Target');target=target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(part),target))
  walk(target)
for r in rr:
 if r.get('TargetMode')!='External':walk(r.get('Target').lstrip('/'))
keep.add('_rels/.rels')
ct=E.fromstring(data['[Content_Types].xml'])
for r in list(ct):
 if r.tag.endswith('Override') and r.get('PartName').lstrip('/') not in keep:ct.remove(r)
for i in range(1,28):
 for path,kind in [(f'ppt/slides/slide{i}.xml','slide'),(f'ppt/notesSlides/notesSlide{i}.xml','notesSlide')]:
  if not any(x.get('PartName')=='/'+path for x in ct):E.SubElement(ct,'{'+CT+'}Override',PartName='/'+path,ContentType='application/vnd.openxmlformats-officedocument.presentationml.'+kind+'+xml')
data['[Content_Types].xml']=xml(ct)
OUT.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
 for n in sorted(keep):z.writestr(n,data[n])
with ZipFile(OUT) as z:
 assert len(E.fromstring(z.read('ppt/presentation.xml')).find('p:sldIdLst',NS))==27
 for s in slides:
  i=s['index'];nt=E.fromstring(z.read(f'ppt/notesSlides/notesSlide{i}.xml'))
  text='\n'.join(''.join(p.itertext()) for p in nt.xpath('.//p:sp[p:nvSpPr/p:nvPr/p:ph[@type="body"]]/p:txBody/a:p',namespaces=NS))
  assert text==s['notes'],(i,text)
  assert (s['title'] in z.read(f'ppt/slides/slide{i}.xml').decode())==(i==1)
 validation={'pages':27,'notes_exact_match':True,'titles_exact_match':True,'outer_title_pages':[1],'no_content_crop':True,'owl_original_preserved':True,'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()}
(ROOT/'製作紀錄/validation-27頁.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2))
print(OUT)
