from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import json,shutil
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/'來源原圖';OUT=ROOT/'視覺素材'
W,H=1680,945;NAVY='#0C1B2F';ORANGE='#B75A38';PAPER='#F5F2E9'
FONT='/System/Library/Fonts/STHeiti Medium.ttc'
def font(n):return ImageFont.truetype(FONT,n)
def canvas():return Image.new('RGB',(W,H),PAPER)
def put(c,file,box,crop=None):
 im=Image.open(SRC/file).convert('RGB')
 if crop:im=im.crop(crop)
 im=ImageOps.contain(im,(box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
 c.paste(im,(box[0]+(box[2]-box[0]-im.width)//2,box[1]+(box[3]-box[1]-im.height)//2))
def texts(c,lines,x,y,size=62):
 d=ImageDraw.Draw(c)
 for i,t in enumerate(lines):d.text((x,y+i*int(size*1.5)),t,font=font(size),fill=NAVY if i%2==0 else ORANGE)
def credit(c,text):ImageDraw.Draw(c).text((45,900),text,font=font(24),fill=NAVY)
def save(c,n):c.save(OUT/f'slide_{n:02}.png')
c=canvas();put(c,'nvidia-jensen-huang-official.jpg',(40,25,860,880));texts(c,['承認婚外情','董事會啟動調查','國會要求說明'],920,220,63);credit(c,'人物照片：NVIDIA Newsroom');save(c,1)
c=canvas();put(c,'culper-post9-jensen-alice-photo.png',(25,25,1080,880));texts(c,['Alice Huang','Megaspeed','前主管'],1120,255,53);credit(c,'Culper 公開串文附件；原圖保留照片說明，情報關係仍屬調查指控');save(c,2)
c=canvas();put(c,'house-press-release-letter.png',(30,35,1650,880),(190,850,2900,1900));credit(c,'美國眾議院外交事務委員會：對已公開報導的情報關係提出關切｜2026.11.05');save(c,3)
c=canvas();put(c,'nvidia-board-statement.png',(30,35,1650,875),(180,480,3040,1370));credit(c,'NVIDIA 董事會聲明｜2026.11.08｜原文節錄');save(c,4)
c=canvas();put(c,'mega-datacenter-index-1.jpg',(35,20,850,885));texts(c,['Megaspeed'],925,210,84);texts(c,['GPU 雲端服務','採購設備','提供算力'],955,440,60);credit(c,'Megaspeed 官方網站與原站圖片');save(c,5)
c=canvas();put(c,'bis-oct-2022-export-controls.png',(30,35,1650,875),(300,45,2850,1530));credit(c,'美國商務部 BIS 原始公告｜2022.10.07');save(c,8)
c=canvas();put(c,'culper-x-thread.png',(30,25,1030,880),(870,60,2040,1430));texts(c,['2026年5月','Culper Research','公開做空輝達'],1070,260,51);credit(c,'Culper 原始公開貼文；顯示日期為台北時間5月14日');save(c,11)
c=canvas();put(c,'house-letter-page-1.png',(25,15,920,885));texts(c,['3位委員會主席','聯合要求說明','公司安全機制'],960,230,61);credit(c,'美國眾議院正式信件｜2026.11.04｜11/18為要求安排日期');save(c,20)
c=canvas();put(c,'trump-interview-x-video-still.jpg',(30,45,1650,875));credit(c,'川普接受記者提問之影片畫面｜原影片Fox News／Acyn，經指定貼文轉載');save(c,21)
c=canvas();put(c,'reuters-market-report.png',(30,65,1650,560),(100,500,3000,1070));texts(c,['NVDA  −9.3%','2026年11月5日'],150,605,80);credit(c,'Reuters 當日市場報導｜跌勢先於11/8董事會宣布調查');save(c,23)
c=canvas();put(c,'ornn-b200-chart.png',(20,20,1660,875),(0,145,3180,1800));credit(c,'Ornn OCPI-B200 原始價格圖｜截至2026.11.08｜USD／GPU-hour');save(c,24)
c=canvas();put(c,'cna-openai-funding.png',(30,45,1650,475),(310,950,2800,1230));texts(c,['首批 110億美元','估值約 1.25兆美元'],150,535,77);credit(c,'CNA／Reuters｜2026.11.06完成首批融資；整輪尚未全數完成');save(c,26)
c=canvas();put(c,'culper-20pct.jpg',(30,25,1050,875));texts(c,['客戶關係','設備去向','出口條件'],1120,235,63);credit(c,'資料照片／報導截圖：Culper公開串文附件，保留原圖片與來源標示');save(c,28)
# Copy generated final assets without modifying their pixels.
gen=Path('/Users/xieminghua/.codex/generated_images/01a1c05e-8d56-77c2-ad21-5d1f96786dcf')
extra={7:'7e5911ce-c587-4474-b522-57cbbc6985bd',27:'100535ac-f32d-4e05-8280-ff0808fccfae',29:'5c571a73-225e-435d-8f72-1c8f9f427895'}
for n,id in extra.items():shutil.copy2(gen/f'exec-{id}.png',OUT/f'slide_{n:02}.png')
slides=json.loads((ROOT/'製作紀錄/slides.json').read_text());slides[6]['type']='generated';slides[6]['brief']=['客戶資料／設備用途／出貨紀錄','Inspection desk with customer folder, checklist, serial records, and magnifier.']
slides[3]['title']='白宮與董事會，如何回應'
for s in slides:assert (ROOT/s['image']).is_file(),s['index']
(ROOT/'製作紀錄/slides.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2))
print('29 main images ready')
