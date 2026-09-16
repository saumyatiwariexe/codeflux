import zipfile
import json
import os
import re

RAW = '/mnt/c/Saumya_workspace/codeflux/dissection/RAW'
APK = os.path.join(RAW, 'xapk_unpacked', 'ums.lovely.university.apk')
APKDIR = os.path.join(RAW, 'apk_contents')
os.makedirs(APKDIR, exist_ok=True)

# Read xapk manifest first
print('=== XAPK MANIFEST.JSON ===')
with open(os.path.join(RAW, 'xapk_unpacked', 'manifest.json')) as f:
    manifest = json.load(f)
    print(json.dumps(manifest, indent=2))

# Extract APK (which is also a zip)
print('\n=== APK INTERNAL STRUCTURE ===')
with zipfile.ZipFile(APK, 'r') as z:
    names = z.namelist()
    
    # Categorize files
    categories = {}
    for n in names:
        top = n.split('/')[0]
        categories[top] = categories.get(top, 0) + 1
    
    print('Top-level directories/files:')
    for k, v in sorted(categories.items()):
        print(f'  {k}: {v} files')
    
    print('\n=== ASSETS FOLDER ===')
    assets = [n for n in names if n.startswith('assets/')]
    for a in sorted(assets)[:100]:
        try:
            info = z.getinfo(a)
            print(f'{info.file_size//1024:>6} KB  {a}')
        except:
            print(f'         {a}')
    
    print('\n=== LIB FOLDER (native libraries) ===')
    libs = [n for n in names if n.startswith('lib/')]
    for l in sorted(libs)[:50]:
        try:
            info = z.getinfo(l)
            print(f'{info.file_size//1024:>6} KB  {l}')
        except:
            print(f'         {l}')
    
    print('\n=== ROOT-LEVEL FILES ===')
    roots = [n for n in names if '/' not in n]
    for r in roots:
        try:
            info = z.getinfo(r)
            print(f'{info.file_size//1024:>6} KB  {r}')
        except:
            print(f'         {r}')

    # Extract key files
    print('\n=== EXTRACTING KEY FILES ===')
    to_extract = [n for n in names if (
        'AndroidManifest' in n or
        n.startswith('assets/') or
        'network_security' in n or
        'strings.xml' in n or
        'config.xml' in n or
        n.endswith('google-services.json') or
        n.endswith('BuildConfig.class') or
        'cordova' in n.lower() or
        'ionic' in n.lower() or
        'capacitor' in n.lower() or
        'react' in n.lower()
    )]
    for f in to_extract:
        try:
            z.extract(f, APKDIR)
            print(f'Extracted: {f}')
        except Exception as e:
            print(f'Error extracting {f}: {e}')

print(f'\nExtracted to {APKDIR}')
