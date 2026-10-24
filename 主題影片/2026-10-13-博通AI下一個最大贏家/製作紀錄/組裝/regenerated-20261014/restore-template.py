from pathlib import Path
import zipfile,xml.etree.ElementTree as E,copy,hashlib,posixpath
root=Path('/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家')
b=root/'.build/regenerated-20261014'
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in ns.items():E.register_namespace(k,v)
source=zipfile.ZipFile('/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx')
template=E.fromstring(source.read('ppt/slides/slide2.xml'))
owl=next(sp for sp in template.findall('./p:cSld/p:spTree/p:sp',ns) if sp.find('.//a:off',ns) is not None and sp.find('.//a:off',ns).get('x')=='1091566')
brand_hash=hashlib.sha256((root/'素材/品牌貓頭鷹.png').read_bytes()).hexdigest()
with zipfile.ZipFile(b/'integrated-before-template.pptx') as src,zipfile.ZipFile(b/'integrated-candidate.pptx','w',zipfile.ZIP_DEFLATED) as out:
 for info in src.infolist():
  data=src.read(info.filename)
  if info.filename.startswith('ppt/slides/slide') and info.filename.endswith('.xml'):
   filename=info.filename
   slide=E.fromstring(data);tree=slide.find('./p:cSld/p:spTree',ns)
   rels=E.fromstring(src.read('ppt/slides/_rels/'+Path(filename).name+'.rels'))
   rm={r.get('Id'):r.get('Target') for r in rels}
   for pic in list(tree.findall('./p:pic',ns)):
    blip=pic.find('.//a:blip',ns);rid=blip.get('{'+ns['r']+'}embed')
    target=posixpath.normpath(posixpath.join('ppt/slides',rm[rid])).lstrip('/')
    if hashlib.sha256(src.read(target)).hexdigest()!=brand_hash:continue
    replacement=copy.deepcopy(owl)
    cnv=replacement.find('./p:nvSpPr/p:cNvPr',ns)
    cnv.set('id',pic.find('./p:nvPicPr/p:cNvPr',ns).get('id'));cnv.set('name','Original template owl')
    replacement.find('.//a:blip',ns).set('{'+ns['r']+'}embed',rid)
    at=list(tree).index(pic);tree.remove(pic);tree.insert(at,replacement)
   data=E.tostring(slide,encoding='utf-8',xml_declaration=True)
  out.writestr(info,data)
print('Restored exact original owl template object on 20 slides')

