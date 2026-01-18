# Hướng dẫn sử dụng cspell để kiểm tra chính tả tiếng Việt

## 📋 Tổng quan

cspell (Code Spell Checker) đã được cấu hình để kiểm tra chính tả tiếng Việt và tiếng Anh trong code.

## 🚀 Các lệnh có sẵn

### 1. Kiểm tra chính tả (không sửa tự động)
```bash
npm run spellcheck
```

Lệnh này sẽ:
- Quét tất cả file `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` trong thư mục `src/`
- Hiển thị các từ sai chính tả
- **Không tự động sửa**, chỉ báo lỗi

### 2. Kiểm tra chính tả (chế độ interactive)
```bash
npm run spellcheck:interactive
```

Lệnh này cho phép bạn:
- Xem từng lỗi một
- Chọn sửa hoặc bỏ qua
- Thêm từ vào dictionary nếu cần

### 3. Kiểm tra chính tả (không báo lỗi nếu không tìm thấy file)
```bash
npm run spellcheck:fix
```

## 📝 Cách sử dụng

### Kiểm tra toàn bộ project:
```bash
npm run spellcheck
```

### Kiểm tra một file cụ thể:
```bash
npx cspell "src/components/admin/User/UserTable.tsx"
```

### Kiểm tra một thư mục:
```bash
npx cspell "src/components/**/*.tsx"
```

## 🔧 Thêm từ mới vào dictionary

Nếu có từ hợp lệ nhưng bị báo lỗi, bạn có thể:

### Cách 1: Thêm vào file `cspell-custom-words.txt`
Mở file `cspell-custom-words.txt` và thêm từ mới vào cuối file.

### Cách 2: Thêm vào `cspell.json`
Mở file `cspell.json` và thêm vào mảng `words`:
```json
{
  "words": [
    "từ-mới-của-bạn"
  ]
}
```

### Cách 3: Sử dụng interactive mode
Khi chạy `npm run spellcheck:interactive`, bạn có thể chọn option để thêm từ vào dictionary.

## 🎯 Tích hợp vào CI/CD

Để tự động kiểm tra khi push code, thêm vào workflow:

```yaml
- name: Spell Check
  run: npm run spellcheck
```

## 📌 Lưu ý

1. **File cấu hình**: `cspell.json` - chứa cấu hình chính
2. **Từ điển tùy chỉnh**: `cspell-custom-words.txt` - thêm từ riêng của project
3. **Bỏ qua**: Các file trong `node_modules`, `dist`, `build` sẽ tự động bị bỏ qua
4. **Ngôn ngữ hỗ trợ**: Tiếng Việt và Tiếng Anh

## 🐛 Troubleshooting

### Lỗi "Cannot find module 'cspell'"
```bash
npm install -D cspell
```

### Từ hợp lệ nhưng vẫn báo lỗi
Thêm từ đó vào `cspell-custom-words.txt` hoặc `cspell.json` → `words`

### Muốn bỏ qua một từ cụ thể trong code
Thêm comment: `// cspell:disable-next-line` hoặc `// cspell:ignore từ-cần-bỏ-qua`

### Muốn bỏ qua toàn bộ file
Thêm vào `cspell.json` → `ignorePaths`:
```json
{
  "ignorePaths": [
    "src/path/to/file.tsx"
  ]
}
```

## 📚 Tài liệu tham khảo

- [cspell Documentation](https://cspell.org/)
- [Vietnamese Dictionary](https://github.com/streetsidesoftware/cspell-dicts)
