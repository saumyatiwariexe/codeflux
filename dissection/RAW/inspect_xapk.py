import zipfile
import os

xapk = '/mnt/c/Saumya_workspace/codeflux/dissection/RAW/LPU+Touch_23.45_APKPure.xapk'
outdir = '/mnt/c/Saumya_workspace/codeflux/dissection/RAW/xapk_unpacked'
os.makedirs(outdir, exist_ok=True)

with zipfile.ZipFile(xapk, 'r') as z:
    names = z.namelist()
    print('=== XAPK TOP-LEVEL CONTENTS ===')
    for n in names:
        info = z.getinfo(n)
        print(f'{info.file_size//1024:>8} KB  {n}')

    print('\n=== EXTRACTING ALL FILES ===')
    z.extractall(outdir)
    print(f'Extracted to {outdir}')

print('\n=== EXTRACTED DIRECTORY ===')
for f in os.listdir(outdir):
    size = os.path.getsize(os.path.join(outdir, f))
    print(f'{size//1024:>8} KB  {f}')
