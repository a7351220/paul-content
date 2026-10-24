import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const p=Presentation.create({slideSize:{width:1480,height:826}});
const s=p.slides.add();s.background.fill='#F4F3EB';
s.charts.add('bar',{
position:{left:60,top:70,width:980,height:650},
categories:['第三季','第四季預估'],
series:[{name:'億美元',values:[167,217],fill:{type:'solid',color:'#F4F3EB',pattern:{type:'upwardDiagonal',color:'#0C1B2F'}},line:{style:'solid',fill:'#0C1B2F',width:3},points:[{idx:1,fill:{type:'solid',color:'#F4F3EB',pattern:{type:'upwardDiagonal',color:'#B75A38'}},line:{style:'solid',fill:'#B75A38',width:3}}]}],
hasLegend:false,barOptions:{direction:'column',grouping:'clustered',gapWidth:140},
chartFill:'none',plotAreaFill:'none',chartLine:{style:'solid',fill:'none',width:0},
xAxis:{textStyle:{fontSize:35,fill:'#0C1B2F'},line:{style:'solid',fill:'#0C1B2F',width:2},majorGridlines:null},
yAxis:{min:0,max:260,visible:false,majorGridlines:null},
dataLabels:{showValue:true,position:'outEnd',textStyle:{fontSize:65,fill:'#0C1B2F'}}
});
const b=await p.export({slide:s,format:'png',scale:1});
await fs.writeFile('chart-test.png',new Uint8Array(await b.arrayBuffer()));
await(await PresentationFile.exportPptx(p)).save('chart-test.pptx');
