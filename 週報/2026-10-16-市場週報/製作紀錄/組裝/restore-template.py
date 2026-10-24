from pathlib import Path
import zipfile,xml.etree.ElementTree as E,copy,json,posixpath

root=Path('/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報')
source=Path('/Users/xieminghua/Documents/保羅內容/週報/2026-10-09-市場週報/輸出/市場週報-固定格式重製版-固定開場.pptx')
original=root/'輸出/2026-10-16-市場週報-紙感墨線.pptx'
out=root/'.build/template-restored.pptx'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL='http://schemas.openxmlformats.org/package/2006/relationships'
ns={'p':P,'a':A,'r':R}
for prefix,uri in ns.items():E.register_namespace(prefix,uri)
slides=json.loads((root/'.build/slides.json').read_text())
def xml(data):return E.tostring(data,encoding='utf-8',xml_declaration=True)
with zipfile.ZipFile(source) as z:
 first=E.fromstring(z.read('ppt/slides/slide1.xml'))
 second=E.fromstring(z.read('ppt/slides/slide2.xml'))
 first_tree=first.find('p:cSld/p:spTree',ns)
 second_tree=second.find('p:cSld/p:spTree',ns)
 source_brand=next(s for s in first_tree if s.find('.//a:blip',ns) is not None)
 source_title=next(s for s in second_tree if s.findall('.//a:t',ns))
 rid=source_brand.find('.//a:blip',ns).get('{'+R+'}embed')
 sr=E.fromstring(z.read('ppt/slides/_rels/slide1.xml.rels'))
 target=next(r.get('Target') for r in sr if r.get('Id')==rid)
 brand_path=posixpath.normpath(posixpath.join('ppt/slides',target)).lstrip('/')
 brand_bytes=z.read(brand_path)

with zipfile.ZipFile(original) as z:data={n:z.read(n) for n in z.namelist()}
brand_target='ppt/media/original-weekly-brand.png'
data[brand_target]=brand_bytes
for i,row in enumerate(slides,1):
 name=f'ppt/slides/slide{i}.xml'
 tree=E.fromstring(data[name]);c=tree.find('p:cSld',ns);old=c.find('p:spTree',ns)
 relname=f'ppt/slides/_rels/slide{i}.xml.rels';rels=E.fromstring(data[relname])
 brand_rid='rIdOriginalWeeklyBrand'
 E.SubElement(rels,'{'+REL+'}Relationship',{'Id':brand_rid,'Type':R+'/image','Target':'../media/original-weekly-brand.png'})
 if i==1:
  c.remove(old);sp=copy.deepcopy(first_tree);c.append(sp)
  body=[s for s in sp if s.findall('.//a:t',ns)]
  assert len(body)==5
  titles=[slides[j]['title'] for j in [1,6,10,14]]
  for j,(shape,title) in enumerate(zip(body[1:],titles),1):
   text_nodes=shape.findall('.//a:t',ns);text_nodes[0].text=f'{j}. {title}'
   for t in text_nodes[1:]:t.text=''
  for b in sp.findall('.//a:blip',ns):b.set('{'+R+'}embed',brand_rid)
 else:
  sp=old
  for shape in list(sp):
   texts=[t.text or '' for t in shape.findall('.//a:t',ns)]
   off=shape.find('.//a:xfrm/a:off',ns)
   is_brand=off is not None and abs(int(off.get('x','0'))-1091566)<20 and abs(int(off.get('y','0'))-6463917)<20
   if is_brand or ''.join(texts)==row['title']:sp.remove(shape)
  brand=copy.deepcopy(source_brand);brand.find('.//p:cNvPr',ns).set('id','92');brand.find('.//a:blip',ns).set('{'+R+'}embed',brand_rid)
  sp.append(brand)
  title=copy.deepcopy(source_title);title.find('.//p:cNvPr',ns).set('id','93')
  text_nodes=title.findall('.//a:t',ns);text_nodes[0].text=row['title']
  for t in text_nodes[1:]:t.text=''
  sp.append(title)
 data[name]=xml(tree);data[relname]=xml(rels)

with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for n,b in data.items():z.writestr(n,b)
print(out)
print('原版大綱文字樣式、19頁分類標題及20頁原始品牌物件已恢復。')
