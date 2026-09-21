#!/usr/bin/env python3
"""Check source structure, resource paths and generated chart data; no packages required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys
from generate_figdata import render

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class CheckHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.ids = set()
        self.refs = []
        self.errors = []
        self.tasks = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line = self.getpos()[0]
        identifier = attrs.get('id')
        if identifier:
            if identifier in self.ids:
                self.errors.append(f'Line {line}: duplicate ID {identifier}')
            self.ids.add(identifier)
        classes = attrs.get('class', '').split()
        if 'task' in classes:
            self.tasks += 1
            if any('task' in item[1] for item in self.stack):
                self.errors.append(f'Line {line}: task sections must be siblings, not nested')
        for key in ['src', 'href', 'poster']:
            if key in attrs:
                self.refs.append((attrs[key], line))
        if tag not in VOID:
            self.stack.append((tag, classes, line))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1][0] != tag:
            expected = self.stack[-1][0] if self.stack else '(none)'
            self.errors.append(f'Line {self.getpos()[0]}: closing {tag}; expected {expected}')
        else:
            self.stack.pop()


def main():
    source = (ROOT / 'index.html').read_text(encoding='utf-8')
    parser = CheckHTML()
    parser.feed(source)
    parser.close()
    errors = parser.errors
    errors += [f'Line {line}: unclosed {tag}' for tag, _, line in parser.stack]
    if parser.tasks != 3:
        errors.append(f'Expected three simulation tasks; found {parser.tasks}')
    for value, line in parser.refs:
        url = urlsplit(value)
        if any(marker in value for marker in ['[ARXIV-URL]', '[EMAIL]', 'XXXX.XXXXX']):
            errors.append(f'Line {line}: active placeholder link')
        elif not url.scheme and not url.netloc:
            if url.path and not (ROOT / unquote(url.path)).is_file():
                errors.append(f'Line {line}: missing local asset {url.path}')
            if not url.path and url.fragment and unquote(url.fragment) not in parser.ids:
                errors.append(f'Line {line}: missing section {url.fragment}')
    for css in (ROOT / 'static/css').glob('*.css'):
        for value in re.findall(r'url\([\'"]?([^\)\'\"]+)', css.read_text()):
            url = urlsplit(value)
            if not url.scheme and not url.netloc and not (css.parent / unquote(url.path)).is_file():
                errors.append(f'{css.name}: missing asset {value}')
    if (ROOT / 'static/js/figdata.js').read_text(encoding='utf-8') != render():
        errors.append('Chart bundle is stale; run python3 scripts/generate_figdata.py')
    if errors:
        print('\n'.join(errors), file=sys.stderr)
        return 1
    print('PASS: balanced HTML, sibling tasks, unique IDs, local assets, fragment links and chart data.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
