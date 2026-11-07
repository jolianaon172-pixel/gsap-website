#!/usr/bin/env python3
"""Cache-busting helper for Pizza Manch (standard library only; the site does not need it to run).

Every reference to a local asset in index.html and assets/css/*.css gets ?v=<first 10 hex chars of the
file's SHA-256>. When a file changes its URL changes, so the host can cache /assets/ for a long time
(see README, "Caching and compression").

  python3 tools/asset-versions.py          update the ?v= values after you change a CSS/JS/image/font file
  python3 tools/asset-versions.py --check  only report; exit code 1 if any reference is missing or out of date

Run it from the project root. Do not deploy the tools/ folder.
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = r'(?:css|js|avif|webp|jpg|woff2)'
HTML_REF = re.compile(r'(assets/[A-Za-z0-9_./-]+\.' + EXT + r')(\?v=[0-9a-f]{10})?')
CSS_REF = re.compile(r'(\.\./(?:img|fonts)/[A-Za-z0-9_./-]+\.' + EXT + r')(\?v=[0-9a-f]{10})?')


def digest(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:10]


def process(file_rel, pattern, base_dir, check):
    path = os.path.join(ROOT, file_rel)
    text = open(path, encoding='utf-8').read()
    problems = []

    def repl(m):
        target = os.path.normpath(os.path.join(base_dir, m.group(1)))
        if not os.path.isfile(target):
            problems.append('missing file: %s (referenced in %s)' % (m.group(1), file_rel))
            return m.group(0)
        want = '?v=' + digest(target)
        if m.group(2) != want:
            problems.append('%s: %s%s -> %s' % (file_rel, m.group(1), m.group(2) or '', want))
        return m.group(1) + want

    new = pattern.sub(repl, text)
    if not check and new != text:
        open(path, 'w', encoding='utf-8', newline='\n').write(new)
    return problems


def main():
    check = '--check' in sys.argv
    problems = []
    # CSS first: index.html references the CSS files, so their hashes must be taken after they are updated
    css_dir = os.path.join(ROOT, 'assets', 'css')
    for name in sorted(os.listdir(css_dir)):
        if name.endswith('.css'):
            problems += process(os.path.join('assets', 'css', name), CSS_REF, css_dir, check)
    problems += process('index.html', HTML_REF, ROOT, check)
    missing = [p for p in problems if p.startswith('missing')]
    if check:
        print('\n'.join(problems) if problems else 'asset versions: all references up to date')
        return 1 if problems else 0
    for p in problems:
        print(p)
    print('updated %d reference(s)' % (len(problems) - len(missing)))
    return 1 if missing else 0


if __name__ == '__main__':
    sys.exit(main())
