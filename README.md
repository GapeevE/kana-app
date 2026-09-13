# kana-app

Приложение для изучения японской азбуки с интервальными повторениями.

## Документация

- [Техническое задание](docs/spec.md)
- [Развёртывание](docs/deploy.md)
- [Факты и мнемоники](docs/content-facts.md)
- [План реализации](docs/superpowers/plans/2026-09-14-kana-app.md)

## Разработка

    pnpm install
    cp .env.example .env.local
    # заполнить значения, см. docs/deploy.md
    pnpm db:migrate
    pnpm dev

Тесты ядра:

    pnpm test

## Устройство

- `src/core` — SM-2, сборка сессии, прогрессия групп. Без зависимостей от React, Next.js и базы данных
- `src/data/kana` — датасет 208 знаков
- `src/server` — база, аутентификация, репозитории, серверные действия
- `src/features` — интерфейс по разделам
- `src/app` — маршруты

## Лицензии данных

Порядок черт — [KanjiVG](https://kanjivg.tagaini.net/), CC BY-SA 3.0.
