#!/usr/bin/env bash
set -euo pipefail

##
# Скрипт собирает текстовое содержимое избранных директорий/файлов
# и записывает в report.md в корне проекта.
##

# Определяем корень проекта (где лежит сам скрипт).
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Переходим в корень проекта
cd "$PROJECT_ROOT"

REPORT_FILE="$PROJECT_ROOT/report.md"

# Список путей, откуда нужно собрать содержимое.
# Можете адаптировать под ваши нужды:
PATHS=(
  "./prisma"
  "./public"
  "./src"
  "./supabase"
  "./middleware.ts"
  "./next.config.js"
  "./package.json"
  "./tsconfig.json"
  "./vercel.json"
)

# Очищаем (или создаём заново) report.md
echo "# Project Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Функция, которая добавляет файл file в report.md,
# если он является текстовым.
add_file_to_report() {
  local file="$1"

  # Проверяем, является ли файл текстовым (используем `file`).
  if file "$file" | grep -q text; then
    echo "### File: $file" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    cat "$file" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
}

for p in "${PATHS[@]}"; do
  if [[ -d "$p" ]]; then
    # Если это директория
    echo "## Directory: $p" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Находим все файлы внутри директории,
    # исключая нежелательные папки/файлы
    find "$p" -type f \
      ! -path "*/node_modules/*" \
      ! -path "*/.next/*" \
      ! -path "*/.git/*" \
      ! -path "*/.vercel/*" \
      ! -name "report.md" \
      ! -name "$(basename "$0")" \
      | while IFS= read -r file; do
          add_file_to_report "$file"
        done

  elif [[ -f "$p" ]]; then
    # Если это конкретный файл
    echo "## File: $p" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    add_file_to_report "$p"
  else
    echo "## Skipping '$p': not found or not a regular file/directory" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
done

echo "Done. Generated report in $REPORT_FILE"