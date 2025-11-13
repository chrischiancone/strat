Chris's Notes

claude --dangerously-skip-permissions

npx create-next-app@latest .

find docs -name "*.md" -type f | grep -v "docs/Word" | while read file; do relative_path="${file#docs/}"; output_file="docs/Word/${relative_path%.md}.docx"; mkdir -p "$(dirname "$output_file")"; pandoc "$file" -o "$output_file"; echo "Converted: $file -> $output_file"; done

claude mcp add playwright npx @playwright/mcp@latest 
npx bmad-method install

J@g&Chr1$