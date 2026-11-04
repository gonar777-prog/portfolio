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

ФОНОВАЯ МУЗЫКА
  Файл assets/audio/bgm.mp3 (из "супер песня.mp3", 128 kbps, пик -7.7 dB). Громкость 0.22, fade-in 2.5 с, loop.
  Стартует по кнопке "ВОЙТИ В СИСТЕМУ" после BOOT SEQUENCE (браузеры не дают автозвук без клика);
  если автоплей разрешён - играет сразу. Запасной вариант - первый клик/скролл/касание.
  Тумблер SND (эквалайзер) вкл/выкл музыку, выбор хранится в localStorage; выключили - в след. раз не включится.
  Ducking до 0.05 при открытом модальном плеере/showreel со звуком; пауза при скрытой вкладке.
  Заменить музыку: положить новый mp3 в assets/audio/bgm.mp3.

PDF-ПОРТФОЛИО
  assets/docs/GONAR_Portfolio_RU.pdf и _EN.pdf (копии из D:\Claude\portfolio_pro). Кнопки скачивания - в hero, "Обо мне", "Контакты";
  язык берётся по переключателю RU/EN. Блок ОПЫТ - в "Обо мне" (тексты в data.js: exp_*, expf, appr).

КАТЕГОРИИ
  Проекты (--cat): anim Анимация, motion Моушн, edit Монтаж, 3d 3D, ai AI, ps Photoshop, ad Реклама, clip Клипы.
  Галерея (--type): logo Логотипы, banner Шапки, thumb Превью YouTube, promo Баннеры, art Photoshop-арты,
  card Дизайн карточек, char Персонажи; --ch paranorma|gonar. Подпись EN: --en "...".

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
