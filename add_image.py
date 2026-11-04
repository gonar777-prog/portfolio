#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Добавить картинку в галерею «Визуал» одной командой.

Пример:
  python add_image.py "D:\\путь\\shapka.jpg" --id shapka2 --ch paranorma --type banner --title "Шапка канала"

--ch    paranorma | gonar          (какому каналу принадлежит)
--type  logo | banner | thumb | char   (логотип | шапка | превью видео | персонаж)
Делает webp <=1600px (q82) + маленькую миниатюру (600px) в assets/img и дописывает запись в data.js
(перед маркером @@GALLERY_END@@). Оригиналы не трогаются. Нужен ffmpeg в PATH.
"""
import argparse, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ROOT, "assets", "img")
DATA = os.path.join(ROOT, "data.js")


def js(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def ff(src, dst, width, q):
    vf = "scale='min(%d,iw)':-2" % width
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-frames:v", "1", "-c:v", "libwebp", "-quality", str(q), dst], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        sys.exit(r.stderr[-600:])


def probe(p):
    o = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", p], text=True).strip().split(",")
    return int(o[0]), int(o[1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--id", required=True)
    ap.add_argument("--ch", default="paranorma", choices=["paranorma", "gonar"])
    ap.add_argument("--type", default="thumb", choices=["logo", "banner", "thumb", "char", "art", "card"])
    ap.add_argument("--title", default="")
    a = ap.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_]+", a.id):
        sys.exit("--id: только латиница, цифры и _")
    os.makedirs(IMG, exist_ok=True)
    ff(a.image, os.path.join(IMG, a.id + ".webp"), 1600, 82)
    ff(a.image, os.path.join(IMG, "t_" + a.id + ".webp"), 600, 78)
    w, h = probe(os.path.join(IMG, a.id + ".webp"))
    txt = open(DATA, encoding="utf-8").read()
    entry = ' {id:"%s", ch:"%s", type:"%s", ar:%s, title:%s},\n' % (a.id, a.ch, a.type, round(w / h, 3), js(a.title or a.id))
    txt = re.sub(r"\}\s*\n(\s*// @@GALLERY_END@@)", "},\n\\1", txt, count=1)
    txt = txt.replace(" // @@GALLERY_END@@", entry + " // @@GALLERY_END@@", 1)
    open(DATA, "w", encoding="utf-8").write(txt)
    print("OK:", a.id, "%dx%d" % (w, h))


if __name__ == "__main__":
    main()
