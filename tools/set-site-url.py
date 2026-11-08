#!/usr/bin/env python3
"""Add the site's real address to everything that needs an absolute URL (standard library only).

Search engines and social networks need absolute URLs for: the canonical link, og:url, og:image,
twitter:image, the JSON-LD "url"/"image"/"@id", sitemap.xml and the Sitemap line in robots.txt.
The real domain is not known yet, so the site ships without them instead of with placeholders.
Once it is known, run from the project root:

  python3 tools/set-site-url.py https://www.example.co.il/

Safe to run again (for example after moving to another domain): it replaces what it added before.
Afterwards run  python3 tools/asset-versions.py  (it versions the share-image URL too).
Do not use the Wolt (ordering) address. Do not deploy the tools/ folder.
"""
import datetime, json, os, re, sys
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
START, END = '<!-- SITE-URL:START', '<!-- SITE-URL:END -->'
SHARE_IMG, SHARE_W, SHARE_H = 'assets/img/pizza.jpg', 1004, 1004   # existing photo, square -> twitter:card "summary"
SHARE_ALT = 'פיצה שלמה על קרש הגשה מעץ'                              # the hero photo's existing alt text


def esc(v):
    return v.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    base = sys.argv[1].strip()
    u = urlsplit(base)
    if u.scheme != 'https' or not u.netloc or u.query or u.fragment:
        sys.exit('Give the full https address of the site, e.g. https://www.example.co.il/')
    if 'bitetech' in u.netloc or 'wolt.com' in u.netloc:
        sys.exit('That is an ordering platform, not the restaurant website.')
    if not base.endswith('/'):
        base += '/'
    img = base + SHARE_IMG

    # index.html: head tags between the markers
    path = os.path.join(ROOT, 'index.html')
    html = open(path, encoding='utf-8').read()
    a = html.index(START)
    a = html.index('-->', a) + 3
    b = html.index(END, a)
    tags = ('\n<link rel="canonical" href="%s">\n'
            '<meta property="og:url" content="%s">\n'
            '<meta property="og:image" content="%s"><meta property="og:image:type" content="image/jpeg">'
            '<meta property="og:image:width" content="%d"><meta property="og:image:height" content="%d"><meta property="og:image:alt" content="%s">\n'
            '<meta name="twitter:image" content="%s"><meta name="twitter:image:alt" content="%s">\n'
            % (esc(base), esc(base), esc(img), SHARE_W, SHARE_H, esc(SHARE_ALT), esc(img), esc(SHARE_ALT)))
    html = html[:a] + tags + html[b:]

    # JSON-LD: add @id, url, image (keeps every existing property and its order)
    m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', html, re.S)
    data = json.loads(m.group(2))
    out = {}
    for k, v in data.items():
        if k in ('@id', 'url', 'image'):
            continue
        out[k] = v
        if k == '@type':
            out['@id'] = base + '#restaurant'
            out['url'] = base
            out['image'] = img
    html = html[:m.start(2)] + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + html[m.end(2):]
    open(path, 'w', encoding='utf-8', newline='\n').write(html)

    # sitemap.xml: one page (English is a language switch on the same page, not a separate URL)
    today = datetime.date.today().isoformat()
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8', newline='\n').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n</urlset>\n' % (esc(base), today))

    # robots.txt: one Sitemap line
    rpath = os.path.join(ROOT, 'robots.txt')
    lines = [l for l in open(rpath, encoding='utf-8').read().splitlines() if not l.lower().startswith('sitemap:')]
    open(rpath, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines).rstrip('\n') + '\nSitemap: %ssitemap.xml\n' % base)
    print('site address set to', base, '- now run: python3 tools/asset-versions.py')


if __name__ == '__main__':
    main()
