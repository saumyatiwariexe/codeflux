import re
import sys

MAIN = '/mnt/c/Saumya_workspace/codeflux/dissection/RAW/apk_contents/assets/public/main.6fd96a5f1918e7c3.js'

with open(MAIN, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

print(f'=== JS BUNDLE SIZE: {len(content):,} chars ===\n')

# Extract all URLs
print('=== ALL UNIQUE URLS / HOSTNAMES ===')
urls = set(re.findall(r'https?://[a-zA-Z0-9._/\-?=%&:+#@]+', content))
for u in sorted(urls):
    print(u)

print('\n=== API PATH STRINGS ===')
# Look for path-like strings related to UMS features
paths = set(re.findall(r'["\']/([\w/\-.?=&]+)["\']', content))
api_paths = [p for p in paths if any(kw in p.lower() for kw in [
    'api', 'student', 'attendance', 'timetable', 'course', 'grade', 'mark',
    'profile', 'login', 'auth', 'ums', 'touch', 'mobile', 'lpu', 'notice',
    'result', 'fee', 'exam', 'schedule', 'class', 'faculty', 'subject',
    'announcement', 'message', 'notification', 'report'
])]
for p in sorted(set(api_paths)):
    print('/' + p)

print('\n=== ALL STRINGS CONTAINING lpu / ums ===')
lpu_strings = re.findall(r'["\'][^"\']*(?:lpu|ums\.)[^"\']*["\']', content, re.IGNORECASE)
for s in sorted(set(lpu_strings))[:80]:
    print(s)

print('\n=== HTTP SERVICE / FETCH / AXIOS CALLS ===')
http_calls = re.findall(r'(?:this\.http\.|axios\.|fetch\(|\.get\(|\.post\(|\.put\(|\.delete\()\s*["\']([^"\']+)["\']', content)
for call in sorted(set(http_calls))[:60]:
    print(call)

print('\n=== ENVIRONMENT / CONFIG VARS ===')
env_vars = re.findall(r'(?:baseUrl|apiUrl|BASE_URL|API_URL|serverUrl|endpoint|host)\s*[:=]\s*["\']([^"\']+)["\']', content, re.IGNORECASE)
for v in sorted(set(env_vars))[:30]:
    print(v)

print('\n=== ANGULAR SERVICE NAMES (containing Http/Service/Api) ===')
services = re.findall(r'class\s+(\w+(?:Service|Api|Http|Provider|Repository)\w*)', content)
for s in sorted(set(services))[:40]:
    print(s)

print('\n=== ROUTE NAMES (Angular router) ===')
routes = re.findall(r'path\s*:\s*["\']([a-zA-Z0-9/_-]+)["\']', content)
for r in sorted(set(routes))[:60]:
    print(r)

print('\n=== IONIC/ANGULAR INDICATORS ===')
indicators = [
    'ionic', 'capacitor', 'cordova', 'angular', '@angular', 'NgModule',
    'Component', 'Injectable', 'HttpClient', 'FormsModule', 'Router',
    'ActivatedRoute', 'BrowserModule', 'Observable', 'Subject', 'BehaviorSubject'
]
for ind in indicators:
    count = content.count(ind)
    if count > 0:
        print(f'{ind}: {count} occurrences')

print('\n=== THIRD PARTY SDK STRINGS ===')
sdks = ['firebase', 'FCM', 'onesignal', 'sentry', 'crashlytics', 'analytics', 'admob', 'braintree', 'razorpay', 'paytm']
for sdk in sdks:
    count = content.lower().count(sdk.lower())
    if count > 0:
        print(f'{sdk}: {count} occurrences')

print('\n=== BIOMETRIC / SPECIAL FEATURES ===')
special = ['biometric', 'fingerprint', 'faceId', 'barcode', 'qrcode', 'scanner', 'camera', 'geolocation', 'location']
for s in special:
    count = content.lower().count(s.lower())
    if count > 0:
        print(f'{s}: {count} occurrences')
