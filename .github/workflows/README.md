# CI/CD Pipeline Documentation

## 📋 Tổng quan

Workflow CI/CD này được thiết kế để tự động hóa quá trình build, test, và deploy ứng dụng Spring Boot.

## 🔄 Các Job trong Pipeline

### 1. **build-and-test**

- ✅ Validate Maven configuration
- 🧹 Clean previous builds
- 🔨 Compile code
- 🧪 Chạy tests
- 📊 Generate test reports
- 📦 Build JAR artifact
- 📤 Upload artifacts

### 2. **code-quality**

- 🔒 OWASP Dependency Check (security scanning)
- 📋 Dependency graph submission
- 📤 Upload security reports

### 3. **docker-build** (Optional)

- 🐳 Build Docker image
- 🏷️ Tag và push lên Docker Hub
- ⚡ Sử dụng cache để tăng tốc

### 4. **deploy** (Optional)

- 🚀 Deploy ứng dụng lên server
- ⚙️ Hỗ trợ multiple environments (staging, production)

### 5. **notify**

- 📧 Gửi thông báo khi pipeline thành công/thất bại

## 🚀 Cách sử dụng

### Trigger tự động

- **Push** vào branches: `restFull`, `main`, `develop`
- **Pull Request** vào các branches trên

### Trigger thủ công

1. Vào tab **Actions** trên GitHub
2. Chọn workflow **CI/CD Pipeline - Spring Boot**
3. Click **Run workflow**
4. Chọn environment (staging/production)
5. Click **Run workflow**

## ⚙️ Cấu hình Secrets

Để sử dụng đầy đủ tính năng, bạn cần thêm các secrets sau trong GitHub Settings > Secrets:

### Docker Hub (nếu dùng Docker)

- `DOCKER_USERNAME`: Tên đăng nhập Docker Hub
- `DOCKER_PASSWORD`: Mật khẩu Docker Hub

### Notifications (tùy chọn)

- `SLACK_WEBHOOK_URL`: Webhook URL cho Slack notifications
- Hoặc các service khác (Discord, Email, etc.)

### Deployment (nếu deploy tự động)

- `DEPLOY_HOST`: Địa chỉ server
- `DEPLOY_USER`: Username SSH
- `DEPLOY_KEY`: SSH private key
- `DEPLOY_PATH`: Đường dẫn deploy trên server

## 📊 Xem kết quả

### Test Results

- Vào tab **Actions** > Chọn workflow run > Job **build-and-test**
- Download artifact **test-results** để xem chi tiết

### Security Reports

- Vào tab **Actions** > Chọn workflow run > Job **code-quality**
- Download artifact **dependency-check-report** để xem báo cáo bảo mật

### Artifacts

- JAR file được upload tự động và có thể download từ tab **Actions**

## 🔧 Tùy chỉnh

### Thay đổi Java version

Sửa biến `JAVA_VERSION` trong phần `env`:

```yaml
env:
  JAVA_VERSION: "17" # Thay đổi version ở đây
```

### Thêm test coverage

Thêm plugin JaCoCo vào `pom.xml`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
</plugin>
```

Sau đó thêm step vào workflow:

```yaml
- name: 📊 Generate coverage report
  run: mvn jacoco:report
```

### Thêm SonarQube

Thêm step sau vào job `code-quality`:

```yaml
- name: 🔍 Run SonarQube
  uses: sonarsource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## 🐛 Troubleshooting

### Build fails

- Kiểm tra logs trong tab **Actions**
- Đảm bảo Maven dependencies có thể download được
- Kiểm tra Java version compatibility

### Tests fail

- Xem chi tiết trong artifact **test-results**
- Kiểm tra database connection (nếu tests cần DB)

### Docker build fails

- Kiểm tra Dockerfile có đúng syntax không
- Đảm bảo Docker Hub credentials đã được cấu hình

## 📚 Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Maven Documentation](https://maven.apache.org/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)
