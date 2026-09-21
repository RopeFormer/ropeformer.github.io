#!/usr/bin/env python3
"""Build the browser data bundle from the reviewable JSON snapshot."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/figures.json'
OUTPUT = ROOT / 'static/js/figdata.js'


def render():
    data = json.loads(SOURCE.read_text(encoding='utf-8'))
    return ('// Generated from data/figures.json by scripts/generate_figdata.py.\n'
            '// Edit the JSON source, then regenerate this file.\n'
            'window.ROPEFIG_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + ';\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Fail if the bundle needs regeneration')
    args = parser.parse_args()
    expected = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != expected:
            parser.exit(1, 'Chart bundle is stale. Run python3 scripts/generate_figdata.py\n')
        print('Chart bundle matches data/figures.json.')
    else:
        OUTPUT.write_text(expected, encoding='utf-8')
        print('Updated static/js/figdata.js')


if __name__ == '__main__':
    main()
