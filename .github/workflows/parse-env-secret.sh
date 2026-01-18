#!/bin/bash
# Script helper để parse ENV_PRODUCTION secret thành các biến môi trường
# Sử dụng trong GitHub Actions workflow

if [ -z "$1" ]; then
    echo "Usage: $0 <env-secret-content>"
    exit 1
fi

# Parse từng dòng trong secret
echo "$1" | while IFS= read -r line; do
    # Bỏ qua dòng trống và comment
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Tách key=value
    if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Loại bỏ khoảng trắng
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        
        # Loại bỏ comment trong value
        value=$(echo "$value" | sed 's/#.*//' | xargs)
        
        if [[ -n "$key" && -n "$value" ]]; then
            # Export vào GITHUB_ENV
            echo "${key}=${value}" >> $GITHUB_ENV
            echo "Set ${key}=${value}"
        fi
    fi
done
