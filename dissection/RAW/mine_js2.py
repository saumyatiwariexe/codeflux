import re

MAIN = '/mnt/c/Saumya_workspace/codeflux/dissection/RAW/apk_contents/assets/public/main.6fd96a5f1918e7c3.js'

with open(MAIN, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Get ALL routes
print('=== ALL ROUTES ===')
routes = set(re.findall(r'path\s*:\s*["\']([a-zA-Z0-9/_\-]+)["\']', content))
for r in sorted(routes):
    print(r)

# Get all lpu.in URLs
print('\n=== ALL LPU URLS ===')
urls = set(re.findall(r'https?://[a-zA-Z0-9._/\-?=%&:+#@,;{}()\[\]]+', content))
lpu_urls = [u for u in urls if 'lpu' in u.lower() or 'mobileapi' in u.lower()]
for u in sorted(lpu_urls):
    print(u)

# Token / auth fields
print('\n=== AUTH / SESSION TOKENS REFERENCED ===')
auth_tokens = set(re.findall(r'["\'](?:token|Token|TOKEN|session|Session|cookie|Cookie|auth|Auth|bearer|Bearer|sessionId|SessionId|NToken|NTOKEN)["\']', content))
for t in sorted(auth_tokens):
    print(t)

# Storage keys (what gets persisted locally)
print('\n=== LOCAL STORAGE / PREFERENCES KEYS ===')
storage_keys = set(re.findall(r'(?:localStorage\.(?:getItem|setItem)|Preferences\.get|Preferences\.set)\s*\(\s*["\'\{]?\s*(?:key\s*:\s*)?["\']([^"\']+)["\']', content))
for k in sorted(storage_keys):
    print(k)

# Service names
print('\n=== ALL CLASS NAMES ===')
classes = set(re.findall(r'class\s+([A-Z][a-zA-Z0-9]+)', content))
for c in sorted(classes)[:80]:
    print(c)

# webservice endpoints
print('\n=== WEBSERVICE / SOAP ENDPOINTS ===')
soap_refs = set(re.findall(r'["\']([^"\']*(?:webservice|svc|soap|wsdl)[^"\']*)["\']', content, re.IGNORECASE))
for s in sorted(soap_refs):
    print(s)

# mobileapi endpoints
print('\n=== MOBILEAPI ENDPOINT DETAILS ===')
mapi = set(re.findall(r'["\']https://mobileapi\.lpu\.in[^"\']*["\']', content))
for m in sorted(mapi):
    print(m)

# obpapi endpoints  
print('\n=== OBPAPI ENDPOINT DETAILS ===')
obp = set(re.findall(r'["\']https://ums\.lpu\.in/obpapi[^"\']*["\']', content))
for o in sorted(obp):
    print(o)
