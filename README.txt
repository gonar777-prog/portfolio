GONAR PORTFOLIO — космический киберпанк сайт (HTML+CSS+JS, без сборки)

ЗАПУСК
  Двойной клик по start.bat -> поднимется локальный сервер и откроется http://localhost:8765/
  (нужен Python). Закрыть: закрыть чёрное окно.
  Прямое открытие index.html тоже работает, но видео надёжнее через сервер.

ХОСТИНГ (бесплатно, по запросу владельца)
  Netlify: app.netlify.com/drop -> перетащить папку portfolio_site целиком.
  GitHub Pages: создать репозиторий, залить содержимое папки (без screens), Settings -> Pages -> Branch main / root.
  Вес ~75 МБ; Netlify Drop принимает. GitHub: файлы < 100 МБ каждый — ок.

ПРАВКИ
  data.js — проекты, тексты RU/EN, навыки. Файлы: assets/video (полные), assets/loop (превью), assets/poster.
  Библиотеки: Three.js и шрифты Google — с CDN (нужен интернет).

ДОБАВЛЕНИЕ РАБОТ (одной командой)
  Видео-проект:
    python add_project.py "D:\путь\ролик.mp4" --id moy_rolik --cat motion --ru "Название|Описание" --en "Title|Teaser"
    (--cat: anim, motion, edit, 3d, ai, clip; --ss 5 - секунда для постера; вариант формата:
     --variant-of moy_rolik --label 9:16 - добавит переключатель формата в плеере)
    Скрипт делает постер, 4-сек луп, 720p (CRF27, пик -6 dB) и дописывает запись в data.js.
  Картинка в галерею «Визуал»:
    python add_image.py "D:\путь\картинка.png" --id shapka2 --ch paranorma --type banner --title "Название"
    (--ch: paranorma|gonar; --type: logo|banner|thumb|char) - webp до 1600px, q82.
  Нужен ffmpeg в PATH. Оригиналы не трогаются. Telegram/почта меняются в index.html.

TODO
  - Проверить ссылку @gonarforce (найдена поиском YouTube).
  - Freelancehunt закрыт проверкой на бота: список услуг в терминале общий — заменить реальными из профиля.
  - Добавить новые ссылки/соцсети в блок Контакты.
