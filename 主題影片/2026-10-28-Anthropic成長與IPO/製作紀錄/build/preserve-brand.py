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
for i in range(1,29):
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
data['ppt/media/paul-owl-original.png']=(root/'owl-original.png').read_bytes()
with ZipFile(root/'brand-preserved.pptx','w',ZIP_DEFLATED) as z:
 for n,b in data.items():z.writestr(n,b)
print('Original owl custom shape, fill, image bytes and crop retained on all 28 slides.')
