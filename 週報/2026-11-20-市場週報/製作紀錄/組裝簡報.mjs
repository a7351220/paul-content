import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';

const root = path.resolve(import.meta.dirname, '..');
const workspace = path.resolve(root, '../..');
const template = path.join(workspace, '.agents/skills/market-video-story/assets/template.pptx');
const slides = JSON.parse(await fs.readFile(path.join(root,'製作紀錄/逐頁口白.json'),'utf8'));
if (slides.length !== 31 || slides.some((slide,index)=>slide.index !== index+1 || !slide.notes)) {
  throw Error('Expected 31 slides with notes');
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(template));
const inspect = async () => (await presentation.inspect({kind:'slide,shape,textbox,image',maxChars:300000}))
  .ndjson.split('\n').filter(Boolean).map(JSON.parse);
let objects = await inspect();
presentation.delete([objects.find(o=>o.kind==='slide' && o.slideIndex===1).id]);
objects = await inspect();
presentation.delete(objects.filter(o=>o.name==='AutoShape 4').map(o=>o.id));

const templatePage = presentation.slides.items[0];
for (let i=1; i<slides.length; i++) templatePage.duplicate().moveTo(i);
objects = await inspect();

const titleStyle = {typeface:'可画榜书',fontSize:56,color:'#0C1B2F',alignment:'left',verticalAlignment:'middle'};
const topics = [...new Set(slides.slice(1,-1).map(s=>s.title))];
for (const [index,record] of slides.entries()) {
  const slide = presentation.slides.items[index];
  const find = name => objects.find(o=>o.slideIndex===index && o.name===name);
  const owl = presentation.resolve(find('Freeform 5').id);
  const ratio = owl.position.height / owl.position.width;
  owl.position = {left:1640,top:35,width:220,height:220*ratio};
  const title = presentation.resolve(find('TextBox 6').id);
  title.position = {left:60,top:43,width:1490,height:94};
  title.text = record.title;
  title.text.style = titleStyle;
  title.text.insets = 0;
  const agendaShape = find('TextBox 7');
  if (index===0) {
    const agenda = presentation.resolve(agendaShape.id);
    agenda.position = {left:110,top:250,width:1320,height:470};
    agenda.text = topics.join('\n');
    agenda.text.style = {...titleStyle,fontSize:52,verticalAlignment:'top'};
  } else {
    presentation.delete([agendaShape.id]);
    const imageName = `圖-${String(record.index).padStart(2,'0')}.jpg`;
    const bytes = await fs.readFile(path.join(root,'視覺素材',imageName));
    slide.images.add({
      blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),
      contentType:'image/jpeg',
      alt:`第 ${record.index} 頁｜${record.title}`,
      fit:'contain',
      position:{left:60,top:157,width:1380,height:776.25}
    });
  }
  slide.speakerNotes.text = record.notes;
  slide.speakerNotes.setVisible(true);
}
const output = path.join(root,'輸出/2026-11-20市場週報-31頁.pptx');
await (await PresentationFile.exportPptx(presentation)).save(output);
execFileSync('python3', [path.join(import.meta.dirname, '清理備註預留字.py'), output]);
const preview = path.join(root,'.build/preview');
await fs.mkdir(preview,{recursive:true});
for (let i=0; i<slides.length; i++) {
  const blob = await presentation.export({slide:presentation.slides.items[i],format:'png',scale:0.5});
  await fs.writeFile(path.join(preview,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log(output);
