import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const base='/Users/xieminghua/Documents/保羅內容/週報/2026-10-23-市場週報';
const p=await PresentationFile.importPptx(await FileBlob.load(base+'/.製圖暫存/single-template.pptx'));
const s=p.slides.items[0];
console.log((await p.inspect({kind:'slide,shape,image',maxChars:4000})).ndjson);
function text(name,value,left,top,width,height,size,color='#0C1B2F'){
 const sh=s.shapes.add({name,geometry:'textbox',position:{left,top,width,height},fill:'none',line:{fill:'none',width:0}});sh.text=value;sh.text.style={fontFamily:'Noto Sans TC',fontSize:size,bold:true,color};return sh;
}
text('topic','黃金被賣、ETF 大筆贖回，巨鯨卻加碼！',400,28,1480,100,52);
text('chart-key','巨鯨持倉 303萬 BTC　月增速度創2月以來最快',440,150,1400,65,42,'#B75A38');
const bytes=await fs.readFile(base+'/素材/真實數據圖/techflow-03.png');
s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:'CryptoQuant原始圖：巨鯨持倉與30日增幅；2026年1月至10月；排除交易所與礦池',fit:'contain',position:{left:440,top:230,width:1400,height:789}});
const script=await fs.readFile(base+'/逐字稿.txt','utf8');s.speakerNotes.text=script.split('第7頁｜')[1].split('第8頁｜')[0].split('\n').slice(2).join('\n').trim();
await fs.writeFile(base+'/製圖預覽/第07頁-真實數據圖試版.png',new Uint8Array(await (await p.export({slide:s,format:'png',scale:1})).arrayBuffer()));
await (await PresentationFile.exportPptx(p)).save(base+'/.製圖暫存/sample-draft.pptx');
console.log('RENDERED');
