from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import xml.etree.ElementTree as E
import copy,re,json
r=Path('/Users/xieminghua/Documents/保羅內容/週報/2026-10-23-市場週報')
source=Path('/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報/輸出/2026-10-16-市場週報-原範本修正版.pptx')
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for pre,uri in ns.items():E.register_namespace(pre,uri)
script=(r/'逐字稿.txt').read_text(); chunks=re.split(r'^第(\d+)頁｜([^\n]+)\n',script,flags=re.M);pages=[{'slide':int(chunks[i]),'title':chunks[i+1],'notes':chunks[i+2].strip()} for i in range(1,len(chunks),3)];assert len(pages)==31
(r/'製作紀錄/notes-31.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
ag=['1. 黃金快破底，ETF 撤資時巨鯨卻加碼！','2. SpaceX 財報爆買，SemiAnalysis 又講鬼故事！','3. Meta 財報亮眼，250億美元重罰砸下！','4. PHP 全球警報，資安股逆勢大漲！']
with ZipFile(source) as z:
 data={n:z.read(n) for n in z.namelist()}
agenda=E.fromstring(data['ppt/slides/slide1.xml']);ts=agenda.findall('.//a:t',ns)
for t,value in zip(ts,['本日大綱']+ag):t.text=value
blank=E.fromstring(data['ppt/slides/slide2.xml']);tree=blank.find('p:cSld/p:spTree',ns)
for child in list(tree):
 if child.tag==f"{{{ns['p']}}}pic":tree.remove(child)
 # keep only background/brand and native topic title
 elif child.tag==f"{{{ns['p']}}}sp" and child.find('p:txBody',ns) is None:
  off=child.find('p:spPr/a:xfrm/a:off',ns)
  if off is not None and int(off.get('x','0'))>3000000:tree.remove(child)
rel_ns='http://schemas.openxmlformats.org/package/2006/relationships'
content_ns='http://schemas.openxmlformats.org/package/2006/content-types'
def cleanrels(name):
 x=E.fromstring(data[name])
 for child in list(x):
  if child.get('Type','').endswith('/notesSlide'):x.remove(child)
 return x
for i,page in enumerate(pages,1):
 x=copy.deepcopy(agenda if i==1 else blank)
 if i>1:
  ts=x.findall('.//a:t',ns);assert len(ts)==1;ts[0].text=page['title']
 data[f'ppt/slides/slide{i}.xml']=E.tostring(x,encoding='utf-8',xml_declaration=True)
 data[f'ppt/slides/_rels/slide{i}.xml.rels']=E.tostring(cleanrels('ppt/slides/_rels/slide1.xml.rels' if i==1 else 'ppt/slides/_rels/slide2.xml.rels'),encoding='utf-8',xml_declaration=True)
x=E.fromstring(data['ppt/presentation.xml']);ls=x.find('p:sldIdLst',ns);ls.clear()
for i in range(1,32):E.SubElement(ls,f"{{{ns['p']}}}sldId",{'id':str(255+i),f"{{{ns['r']}}}id":f'rIdWeekly{i}'})
data['ppt/presentation.xml']=E.tostring(x,encoding='utf-8',xml_declaration=True)
x=E.fromstring(data['ppt/_rels/presentation.xml.rels'])
for child in list(x):
 if child.get('Type','').endswith('/slide'):x.remove(child)
for i in range(1,32):E.SubElement(x,f'{{{rel_ns}}}Relationship',{'Id':f'rIdWeekly{i}','Type':ns['r']+'/slide','Target':f'slides/slide{i}.xml'})
data['ppt/_rels/presentation.xml.rels']=E.tostring(x,encoding='utf-8',xml_declaration=True)
x=E.fromstring(data['[Content_Types].xml']);existing={v.get('PartName') for v in x}
for i in range(1,32):
 name=f'/ppt/slides/slide{i}.xml'
 if name not in existing:E.SubElement(x,f'{{{content_ns}}}Override',{'PartName':name,'ContentType':'application/vnd.openxmlformats-officedocument.presentationml.slide+xml'})
E.register_namespace('',content_ns)
data['[Content_Types].xml']=E.tostring(x,encoding='utf-8',xml_declaration=True)
with ZipFile(r/'.製圖暫存/template-31.pptx','w',ZIP_DEFLATED) as out:
 for name,b in data.items():out.writestr(name,b)
print('31頁範本，原生大綱與主題標題保留可画榜书；31頁口白已存。')
