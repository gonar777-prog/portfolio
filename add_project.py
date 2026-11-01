#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Добавить видео-проект на сайт одной командой.

Пример:
  python add_project.py "D:\\путь\\ролик.mp4" --id moy_rolik --cat motion ^
      --ru "Название|Короткое описание" --en "Title|Short teaser"

Делает: постер (jpg), 4-сек. муте-луп 640px, веб-версию 720p (CRF27, пик <= -6 dB),
и дописывает запись в data.js (перед маркером @@PROJECTS_END@@).
Категории: anim, motion, edit, 3d, ai, clip  (можно придумать свою - добавь её в CATS в data.js).
Вариант формата того же проекта (1:1, 9:16 ...):
  python add_project.py "..\\ролик_9x16.mp4" --id moy_rolik_916 --variant-of moy_rolik --label 9:16
Оригиналы не трогаются. Требуется ffmpeg в PATH.
"""
import argparse, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, "assets")
DATA = os.path.join(ROOT, "data.js")


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        sys.exit("ffmpeg/ffprobe error:\n" + r.stderr[-800:])
    return r.stdout.strip()


def probe(path):
    w, h = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path]).split(",")[:2]
    d = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))
    return int(w), int(h), d


def js(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--id", required=True, help="латиница/цифры/_ (имя файлов)")
    ap.add_argument("--cat", default="motion")
    ap.add_argument("--ru", default="", help='"Название|Описание"')
    ap.add_argument("--en", default="", help='"Title|Teaser"')
    ap.add_argument("--year", default="2026")
    ap.add_argument("--ss", type=float, default=None, help="секунда для постера/лупа (по умолчанию ~30%%)")
    ap.add_argument("--variant-of", default=None, help="id основного проекта (добавить как вариант формата)")
    ap.add_argument("--label", default=None, help="подпись варианта, напр. 9:16")
    a = ap.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9_]+", a.id):
        sys.exit("--id: только латиница, цифры и _")
    src = a.video
    w, h, d = probe(src)
    ss = a.ss if a.ss is not None else min(d * 0.3, 40)
    for sub in ("video", "loop", "poster"):
        os.makedirs(os.path.join(A, sub), exist_ok=True)
    vert = h > w
    sc = "scale=-2:1280" if vert else "scale=-2:720"
    lsc = "scale=-2:640" if vert else "scale=640:-2"
    # poster
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-i", src, "-frames:v", "1", "-vf", sc, "-q:v", "4", os.path.join(A, "poster", a.id + ".jpg")])
    # loop (4s, muted)
    if not a.variant_of:
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", "4", "-i", src, "-an", "-vf", lsc + ",fps=24", "-c:v", "libx264", "-crf", "31", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", os.path.join(A, "loop", a.id + ".mp4")])
    # web 720p, peak limiter -6 dB (0.5)
    has_a = bool(run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", src]))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", sc + ",fps=30", "-c:v", "libx264", "-crf", "27", "-preset", "veryfast", "-pix_fmt", "yuv420p"]
    cmd += (["-af", "alimiter=limit=0.5:level=disabled", "-c:a", "aac", "-b:a", "96k"] if has_a else ["-an"])
    cmd += ["-movflags", "+faststart", os.path.join(A, "video", a.id + ".mp4")]
    run(cmd)
    ar = round(w / h, 3)
    txt = open(DATA, encoding="utf-8").read()
    if a.variant_of:
        m = re.search(r'^( \{id:"%s",)(.*)$' % re.escape(a.variant_of), txt, re.M)
        if not m:
            sys.exit("не найден проект " + a.variant_of)
        v = '{id:"%s",label:%s,ar:%s}' % (a.id, js(a.label or ("%d:%d" % (w, h))), ar)
        line = m.group(0)
        if "variants:[" in line:
            new = line.replace("variants:[", "variants:[" + v + ",", 1)
        else:
            new = line.replace(", year:", ", variants:[" + v + "], year:", 1)
        txt = txt.replace(line, new)
    else:
        r = (a.ru or a.id + "|").split("|", 1) + [""]
        e = (a.en or a.ru or a.id + "|").split("|", 1) + [""]
        entry = ' {id:"%s", cat:"%s", year:%s, ar:%s, ru:[%s,%s], en:[%s,%s]},\n' % (a.id, a.cat, a.year, ar, js(r[0]), js(r[1]), js(e[0]), js(e[1]))
        if "// @@PROJECTS_END@@" not in txt:
            sys.exit("нет маркера @@PROJECTS_END@@ в data.js")
        # запятая у предыдущей записи
        txt = re.sub(r"\}\s*\n(\s*// @@PROJECTS_END@@)", "},\n\\1", txt, count=1)
        txt = txt.replace(" // @@PROJECTS_END@@", entry + " // @@PROJECTS_END@@", 1)
    open(DATA, "w", encoding="utf-8").write(txt)
    print("OK:", a.id, "%dx%d" % (w, h), "-> assets/video|loop|poster")


if __name__ == "__main__":
    main()
