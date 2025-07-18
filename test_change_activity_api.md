# Test API Change Activity User

## API Endpoint

```
PUT /api/v1/users/changeActivity/{id}
```

## Headers

```
Content-Type: application/json
Authorization: Bearer {your_jwt_token}
```

## Test Cases

### 1. Test với user tồn tại và đang hoạt động

**Request:**

```
PUT http://localhost:8080/api/v1/users/changeActivity/1
```

**Expected Response (200 OK):**

```json
{
  "message": "Đã thay đổi trạng thái user@example.com thành khóa"
}
```

### 2. Test với user tồn tại và đã bị khóa

**Request:**

```
PUT http://localhost:8080/api/v1/users/changeActivity/1
```

**Expected Response (200 OK):**

```json
{
  "message": "Đã thay đổi trạng thái user@example.com thành mở khóa"
}
```

### 3. Test với user không tồn tại

**Request:**

```
PUT http://localhost:8080/api/v1/users/changeActivity/999
```

**Expected Response (404 Not Found):**

```json
{
  "message": "User với id = 999 không tồn tại...",
  "status": "ERROR"
}
```

### 4. Test không có token

**Request:**

```
PUT http://localhost:8080/api/v1/users/changeActivity/1
```

**Expected Response (401 Unauthorized):**

```json
{
  "message": "Token không hợp lệ...",
  "status": "ERROR"
}
```

## Frontend Integration

### Features đã thêm:

1. ✅ API function `changeUserActivityAPI` trong `api.ts`
2. ✅ Permission `CHANGE_ACTIVITY` trong `permissions.ts`
3. ✅ Button khóa/mở khóa trong cột "Trạng thái"
4. ✅ Function `handleChangeActivity` để xử lý logic
5. ✅ Icon LockOutlined/UnlockOutlined cho button
6. ✅ Message success/error
7. ✅ Auto refresh table sau khi thay đổi

### UI Features:

- Button "Khóa" (màu đỏ) cho user đang hoạt động
- Button "Mở khóa" (màu xanh) cho user đã bị khóa
- Tag hiển thị trạng thái: "Hoạt động" (xanh) / "Đã khóa" (đỏ)
- Permission check để hiển thị button

### Logic:

- Toggle trạng thái `is_blocked` trong database
- Nếu user đang hoạt động → khóa
- Nếu user đã bị khóa → mở khóa
- Refresh table để cập nhật UI
- Hiển thị message thành công/thất bại
