"""Remove imported date/slide no. placeholders while keeping speaker notes."""
from pathlib import Path
from zipfile import ZipFile
import re
import sys

path=Path(sys.argv[1])
temp=path.with_name(path.name+'.tmp')
pattern=re.compile(r'<p:sp>.*?</p:sp>',re.S)
with ZipFile(path) as src, ZipFile(temp,'w') as dst:
    for entry in src.infolist():
        data=src.read(entry)
        if re.fullmatch(r'ppt/notesSlides/notesSlide\d+[.]xml',entry.filename):
            def keep_shape(m):
                return '' if re.search(r'<p:ph type="(?:dt|sldNum)"',m[0]) else m[0]
            data=pattern.sub(keep_shape,data.decode()).encode()
        dst.writestr(entry,data)
with ZipFile(temp) as z:
    assert z.testzip() is None
temp.replace(path)
