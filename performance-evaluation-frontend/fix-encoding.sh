#!/bin/bash

# Find all TypeScript and TSX files
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  echo "Fixing encoding in: $file"
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Replace literal \n with actual newlines and fix quotes
  sed 's/\\n/\n/g' "$file" | sed 's/\\"/"/g' > "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

echo "Encoding fixes completed!"
