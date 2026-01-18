# Hướng dẫn cấu hình GitHub Secrets

## 📋 Tổng quan

Workflow đã được cấu hình để sử dụng GitHub Secrets. Bạn có thể sử dụng 2 cách:

### Cách 1: Sử dụng secret `ENV_PRODUCTION` (Đơn giản)
Tạo một secret duy nhất chứa tất cả biến môi trường.

### Cách 2: Tách thành các secrets riêng (An toàn hơn)
Tạo từng secret riêng cho mỗi biến môi trường.

## 🔧 Cách 1: Sử dụng ENV_PRODUCTION

### Bước 1: Tạo Secret
1. Vào repository trên GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. **Name**: `ENV_PRODUCTION`
5. **Secret**: Dán nội dung sau (điều chỉnh giá trị cho phù hợp):

```
# DATABASE
DB_URL=jdbc:mysql://localhost:3306/hung123
DB_USERNAME=root
DB_PASSWORD=123456

# JWT
JWT_BASE64_SECRET=TRrx3ZoD9xgevlM73MU8/ay9VO+8RJ7NjvFh5Ab0xoTsKzuPYwCOKDZugGYsVxroYRfP94DH6jBxBhFyBPaQQQ==
JWT_ACCESS_EXPIRE=300
JWT_REFRESH_EXPIRE=604800
```

6. Click **Add secret**

### Bước 2: Workflow tự động parse
Workflow sẽ tự động parse secret này thành các biến môi trường riêng lẻ.

## 🔐 Cách 2: Tách thành các secrets riêng (Khuyến nghị)

Tạo các secrets riêng lẻ:

| Secret Name | Value | Mô tả |
|------------|-------|-------|
| `DB_URL` | `jdbc:mysql://localhost:3306/hung123` | Database connection URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | `123456` | Database password |
| `JWT_BASE64_SECRET` | `TRrx3ZoD9xgevlM73MU8/ay9VO+8RJ7NjvFh5Ab0xoTsKzuPYwCOKDZugGYsVxroYRfP94DH6jBxBhFyBPaQQQ==` | JWT secret key |
| `JWT_ACCESS_EXPIRE` | `300` | JWT access token expiration (seconds) |
| `JWT_REFRESH_EXPIRE` | `604800` | JWT refresh token expiration (seconds) |

### Ưu điểm:
- ✅ An toàn hơn (chỉ expose secret cần thiết)
- ✅ Dễ quản lý từng secret
- ✅ Có thể rotate từng secret độc lập

## 🎯 Workflow sẽ ưu tiên

Workflow sẽ ưu tiên sử dụng secrets theo thứ tự:

1. **Secrets riêng lẻ** (nếu có): `DB_URL`, `DB_USERNAME`, etc.
2. **Từ ENV_PRODUCTION đã parse** (nếu có secret `ENV_PRODUCTION`)
3. **Giá trị mặc định** (cho testing)

## 📝 Ví dụ cấu hình

### Test Environment (tự động)
```yaml
# Sử dụng giá trị mặc định cho testing
DB_URL: jdbc:mysql://localhost:3306/testdb
DB_USERNAME: root
DB_PASSWORD: root
```

### Production (từ secrets)
```yaml
# Tự động lấy từ GitHub Secrets
DB_URL: ${{ secrets.DB_URL || env.DB_URL }}
DB_USERNAME: ${{ secrets.DB_USERNAME || env.DB_USERNAME }}
DB_PASSWORD: ${{ secrets.DB_PASSWORD || env.DB_PASSWORD }}
```

## 🔍 Kiểm tra secrets đã cấu hình

### Xem secrets trong workflow:
1. Vào **Actions** tab
2. Chọn một workflow run
3. Xem logs để kiểm tra biến môi trường (values sẽ bị ẩn vì lý do bảo mật)

### Debug (nếu cần):
Thêm step này vào workflow để debug (chỉ dùng trong development):
```yaml
- name: Debug env vars
  run: |
    echo "DB_URL is set: $([ -n "$DB_URL" ] && echo 'yes' || echo 'no')"
    echo "DB_USERNAME is set: $([ -n "$DB_USERNAME" ] && echo 'yes' || echo 'no')"
    # Không echo giá trị thực để bảo mật
```

## ⚠️ Lưu ý bảo mật

1. **Không commit secrets vào code**
2. **Không log giá trị secrets** trong workflow
3. **Rotate secrets định kỳ**
4. **Sử dụng Environment Secrets** cho production (nếu có nhiều môi trường)

## 🚀 Sử dụng với Environments

Nếu bạn có nhiều môi trường (dev, staging, production):

1. Vào **Settings** > **Environments**
2. Tạo environment mới (ví dụ: `production`)
3. Thêm secrets vào environment đó
4. Uncomment phần `environment` trong workflow:

```yaml
environment:
  name: production
  url: https://your-backend-domain.com
```

## 📚 Tài liệu tham khảo

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
