from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as E
import copy,json
root=Path(__file__).resolve().parent
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for prefix,uri in ns.items():E.register_namespace(prefix,uri)
rel='http://schemas.openxmlformats.org/package/2006/relationships'
source=E.parse(root/'owl-original-shape.xml').getroot();box=json.loads((root/'layout-contract.json').read_text())['owl']
with ZipFile(root/'draft.pptx') as z:data={i.filename:z.read(i.filename) for i in z.infolist()}
for i in range(1,27):
 name=f'ppt/slides/slide{i}.xml';tree=E.fromstring(data[name]);sp=tree.find('p:cSld/p:spTree',ns)
 removed=0
 for shape in list(sp):
  pr=shape.find('.//p:cNvPr',ns)
  xf0=shape.find('.//a:xfrm',ns)
  off=xf0.find('a:off',ns) if xf0 is not None else None
  if off is not None and off.get('x')==str(round(box['left']*9525)) and off.get('y')==str(round(box['top']*9525)):sp.remove(shape);removed+=1
 assert removed==1,(i,removed)
 brand=copy.deepcopy(source);pr=brand.find('.//p:cNvPr',ns);pr.set('id',str(max(int(x.get('id')) for x in tree.findall('.//p:cNvPr',ns))+1));pr.set('name','保羅貓頭鷹原始物件');pr.set('descr','原版貓頭鷹；右上品牌，右下錄影區留白')
 xf=brand.find('.//a:xfrm',ns);xf.find('a:off',ns).attrib.update({'x':str(round(box['left']*9525)),'y':str(round(box['top']*9525))});xf.find('a:ext',ns).attrib.update({'cx':str(round(box['width']*9525)),'cy':str(round(box['height']*9525))})
 brand.find('.//a:blip',ns).set('{'+ns['r']+'}embed','rIdPreservedOwl');sp.append(brand)
 data[name]=E.tostring(tree,encoding='utf-8',xml_declaration=True)
 rp=f'ppt/slides/_rels/slide{i}.xml.rels';rt=E.fromstring(data[rp]);E.SubElement(rt,'{'+rel+'}Relationship',{'Id':'rIdPreservedOwl','Type':ns['r']+'/image','Target':'../media/paul-owl-original.png'});data[rp]=E.tostring(rt,encoding='utf-8',xml_declaration=True)
# Reuse the original template text objects, retaining font and paragraph settings.
items=json.loads((root.parent/'slides.json').read_text())
title_source=E.parse(root/'title-template.xml').getroot()
agenda_source=E.parse(root/'agenda-template.xml').getroot()
for i in range(1,27):
 name=f'ppt/slides/slide{i}.xml';tree=E.fromstring(data[name]);sp=tree.find('p:cSld/p:spTree',ns)
 for shape in list(sp):
  xf=shape.find('.//a:xfrm',ns)
  off=xf.find('a:off',ns) if xf is not None else None
  if off is not None and off.get('x')==str(60*9525) and off.get('y')==str(45*9525):sp.remove(shape)
 shape=copy.deepcopy(title_source)
 shape.find('.//p:cNvPr',ns).set('id',str(max(int(x.get('id')) for x in tree.findall('.//p:cNvPr',ns))+1))
 shape.find('.//p:cNvPr',ns).set('name','範本原生標題')
 xf=shape.find('.//a:xfrm',ns);xf.find('a:off',ns).attrib.update(x=str(60*9525),y=str(45*9525));xf.find('a:ext',ns).attrib.update(cx=str(1380*9525),cy=str(92*9525))
 shape.find('.//a:t',ns).text=items[i-1]['title'];shape.find('.//a:pPr',ns).set('algn','l');sp.append(shape)
 if i==1:
  for sh in list(sp):
   xf=sh.find('.//a:xfrm',ns);off=xf.find('a:off',ns) if xf is not None else None
   if off is not None and off.get('x')==str(70*9525) and off.get('y')==str(300*9525):sp.remove(sh)
  ag=copy.deepcopy(agenda_source);ag.find('.//p:cNvPr',ns).set('id',str(max(int(x.get('id')) for x in tree.findall('.//p:cNvPr',ns))+1))
  xf=ag.find('.//a:xfrm',ns);xf.find('a:off',ns).attrib.update(x=str(70*9525),y=str(300*9525));xf.find('a:ext',ns).attrib.update(cx=str(1370*9525),cy=str(500*9525))
  body=ag.find('p:txBody',ns);ps=body.findall('a:p',ns)
  for para,txt in zip(ps,['幣安被駭，AI 攻防戰升級','HYPE 搶進傳統金融市場','AI 財報，市場追問錢在哪']):para.find('.//a:t',ns).text=txt
  for j,para in enumerate(ps[:3],1):para.find('.//a:buAutoNum',ns).set('startAt',str(j))
  body.remove(ps[3]);sp.append(ag)
 data[name]=E.tostring(tree,encoding='utf-8',xml_declaration=True)
data['ppt/media/paul-owl-original.png']=(root/'owl-original.png').read_bytes()
with ZipFile(root/'brand-preserved.pptx','w',ZIP_DEFLATED) as z:
 for n,b in data.items():z.writestr(n,b)
print('Original owl custom shape, fill, image bytes and crop retained on all 26 slides.')
