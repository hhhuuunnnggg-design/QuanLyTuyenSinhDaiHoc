# Giải thích chi tiết Luồng hoạt động GPS Food Guide

## 🎯 Mục đích tổng thể

Tạo một hệ thống **tự động phát audio thuyết minh** khi người dùng di chuyển đến gần các điểm ẩm thực (quán ăn, món ăn đặc sản), giống như một **hướng dẫn viên tự động** trong khu phố ẩm thực.

---

## 📋 Luồng hoạt động chi tiết (5 bước)

### **Bước 1: App tải danh sách POI** 📥

**Mục đích**: Chuẩn bị dữ liệu về các điểm ẩm thực cần thuyết minh

**Chi tiết**:
- App gọi API để lấy danh sách các điểm ẩm thực (POI - Point of Interest)
- Mỗi POI chứa:
  - **Tọa độ GPS** (`latitude`, `longitude`): Vị trí của quán/món ăn
  - **Bán kính kích hoạt** (`accuracy`): Khoảng cách bao nhiêu mét thì tự động phát audio (ví dụ: 30m, 50m)
  - **Độ ưu tiên** (`priority`): Nếu có nhiều POI trong cùng bán kính, POI nào có priority cao hơn sẽ được chọn
  - **Nội dung thuyết minh**: Link đến file audio hoặc text để chuyển thành giọng nói

**Ví dụ thực tế**:
```
POI 1: "Phở Bò" 
- Tọa độ: 10.7723, 106.6513
- Bán kính: 30m
- Priority: 5
- Audio: "Đây là quán phở nổi tiếng..."

POI 2: "Bánh Mì"
- Tọa độ: 10.7725, 106.6515  
- Bán kính: 25m
- Priority: 3
- Audio: "Bánh mì đặc sản Sài Gòn..."
```

**Code thực hiện**: `useTTSAudios` hook

---

### **Bước 2: Background Service cập nhật vị trí** 📍

**Mục đích**: Theo dõi liên tục vị trí của người dùng khi họ di chuyển

**Chi tiết**:
- Sử dụng GPS của điện thoại/thiết bị để lấy vị trí hiện tại
- **Background service** = chạy ngầm, không cần người dùng phải mở app liên tục
- Cập nhật vị trí theo thời gian thực (mỗi vài giây hoặc khi di chuyển)
- Hỗ trợ **mock GPS** (giả lập) để test trên máy tính

**Ví dụ thực tế**:
```
Thời điểm T1: User ở vị trí A (10.7720, 106.6510)
Thời điểm T2: User di chuyển đến vị trí B (10.7723, 106.6513) ← Gần "Phở Bò"
Thời điểm T3: User tiếp tục di chuyển đến vị trí C (10.7726, 106.6516)
```

**Code thực hiện**: `useGeolocation` hook

---

### **Bước 3: Geofence Engine xác định POI** 🎯

**Mục đích**: Phát hiện khi người dùng vào vùng bán kính của một POI và chọn POI phù hợp nhất

**Chi tiết**:
- **Geofence** = hàng rào địa lý ảo (vùng tròn quanh một điểm)
- Engine này:
  1. Lấy vị trí hiện tại của user
  2. Tính khoảng cách từ user đến TẤT CẢ các POI
  3. Lọc ra các POI mà user đang ở TRONG bán kính (distance ≤ radius)
  4. Trong số các POI trong bán kính, chọn POI có:
     - **Priority cao nhất** (ưu tiên quan trọng hơn)
     - **Gần nhất** (nếu priority bằng nhau)
  5. Gửi sự kiện "POI được phát hiện"

**Ví dụ thực tế**:
```
User đang ở vị trí: 10.7723, 106.6513

POI 1 "Phở Bò": 
- Khoảng cách: 20m
- Bán kính: 30m
- Priority: 5
→ ✅ TRONG BÁN KÍNH

POI 2 "Bánh Mì":
- Khoảng cách: 15m  
- Bán kính: 25m
- Priority: 3
→ ✅ TRONG BÁN KÍNH

Kết quả: Chọn POI 1 "Phở Bò" vì priority cao hơn (5 > 3)
```

**Code thực hiện**: `GeofenceEngine.findNearestPOI()`

---

### **Bước 4: Narration Engine quyết định phát audio** 🔊

**Mục đích**: Quyết định có nên phát audio hay không, tránh phát lặp lại hoặc phát khi không phù hợp

**Chi tiết**:
Engine này kiểm tra **2 điều kiện** trước khi phát:

#### **Điều kiện 1: Đang phát audio khác?**
- Nếu đang phát audio của POI khác → **KHÔNG phát mới**
- Lý do: Tránh cắt ngang audio đang phát, gây khó chịu cho người dùng

#### **Điều kiện 2: Đã phát trong X phút chưa?**
- Kiểm tra log: POI này đã được phát trong vòng X phút (mặc định 5 phút) chưa?
- Nếu đã phát gần đây → **KHÔNG phát lại**
- Lý do: Tránh phát lặp lại khi user đứng yên hoặc đi qua lại nhiều lần

**Ví dụ thực tế**:
```
Tình huống 1:
- User vào vùng "Phở Bò" lần đầu
- Không đang phát audio nào
- Chưa phát "Phở Bò" trong 5 phút
→ ✅ PHÁT AUDIO

Tình huống 2:
- User đang nghe audio "Bánh Mì"
- Vào vùng "Phở Bò"
- → ❌ KHÔNG PHÁT (vì đang phát audio khác)

Tình huống 3:
- User vào vùng "Phở Bò"
- Đã phát "Phở Bò" cách đây 2 phút
- → ❌ KHÔNG PHÁT (cooldown 5 phút chưa hết)

Tình huống 4:
- User vào vùng "Phở Bò"
- Đã phát "Phở Bò" cách đây 6 phút
- → ✅ PHÁT AUDIO (cooldown đã hết)
```

**Code thực hiện**: `NarrationEngine.canPlay()`

---

### **Bước 5: Ghi log đã phát** 📝

**Mục đích**: Lưu lại lịch sử đã phát để tránh lặp lại

**Chi tiết**:
- Mỗi khi phát audio của một POI, ghi lại:
  - POI ID
  - Audio ID  
  - Thời gian phát (timestamp)
- Log này được dùng ở Bước 4 để kiểm tra cooldown
- Log có thể được xóa khi cần (ví dụ: reset để test)

**Ví dụ thực tế**:
```
Log entries:
[
  { poiId: 1, audioId: 1, playedAt: 1700000000000 }, // "Phở Bò" phát lúc 10:00
  { poiId: 2, audioId: 2, playedAt: 1700000100000 }, // "Bánh Mì" phát lúc 10:01
  { poiId: 1, audioId: 1, playedAt: 1700000300000 }  // "Phở Bò" phát lại lúc 10:03
]
```

**Code thực hiện**: `NarrationEngine.logPlay()`

---

## 🔄 Luồng hoạt động tổng thể (Flowchart)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App khởi động                                           │
│    ↓                                                        │
│    Tải danh sách POI từ API                                │
│    [Phở Bò, Bánh Mì, Bún Bò, ...]                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Background Service                                       │
│    ↓                                                        │
│    Bắt đầu theo dõi GPS                                    │
│    Cập nhật vị trí liên tục                                │
│    [10.7720, 106.6510] → [10.7723, 106.6513] → ...        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Geofence Engine                                         │
│    ↓                                                        │
│    User ở vị trí: 10.7723, 106.6513                       │
│    ↓                                                        │
│    Tính khoảng cách đến các POI:                           │
│    - Phở Bò: 20m (trong bán kính 30m) ✅                  │
│    - Bánh Mì: 15m (trong bán kính 25m) ✅                 │
│    ↓                                                        │
│    Chọn POI có priority cao nhất: "Phở Bò" (priority=5)  │
│    ↓                                                        │
│    Gửi sự kiện: "POI được phát hiện"                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Narration Engine                                        │
│    ↓                                                        │
│    Kiểm tra:                                                │
│    - Đang phát audio khác? → KHÔNG                         │
│    - Đã phát "Phở Bò" trong 5 phút? → KHÔNG               │
│    ↓                                                        │
│    ✅ Điều kiện OK → Quyết định PHÁT AUDIO                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Ghi log & Phát audio                                    │
│    ↓                                                        │
│    Ghi log: { poiId: 1, audioId: 1, playedAt: ... }       │
│    ↓                                                        │
│    Phát audio "Phở Bò" cho user                            │
│    🔊 "Đây là quán phở nổi tiếng..."                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Tại sao cần từng bước?

### **Bước 1 - Tải POI**: 
- Cần biết có những điểm nào để thuyết minh
- Không thể hardcode vì danh sách có thể thay đổi

### **Bước 2 - Cập nhật vị trí**:
- Cần biết user đang ở đâu để so sánh với POI
- Phải cập nhật liên tục vì user đang di chuyển

### **Bước 3 - Geofence Engine**:
- Không thể phát audio cho TẤT CẢ POI → chỉ phát khi vào vùng
- Có thể có nhiều POI gần nhau → cần chọn ưu tiên

### **Bước 4 - Narration Engine**:
- Tránh phát lặp lại gây khó chịu
- Tránh cắt ngang audio đang phát
- Đảm bảo trải nghiệm tốt cho user

### **Bước 5 - Ghi log**:
- Cần nhớ đã phát gì để kiểm tra cooldown
- Tránh phát lại quá nhiều lần

---

## 🎬 Ví dụ thực tế hoàn chỉnh

**Kịch bản**: User đi bộ trong khu phố ẩm thực

```
10:00:00 - App khởi động
           → Tải danh sách: [Phở Bò, Bánh Mì, Bún Bò]

10:00:05 - User bắt đầu đi bộ
           → GPS: 10.7720, 106.6510 (chưa vào vùng nào)

10:00:30 - User đi đến gần "Bánh Mì"
           → GPS: 10.7725, 106.6515
           → Geofence: Phát hiện "Bánh Mì" (15m trong bán kính 25m)
           → Narration: Chưa phát → OK
           → 🔊 Phát: "Bánh mì đặc sản Sài Gòn..."
           → Log: { poiId: 2, playedAt: 10:00:30 }

10:00:45 - User tiếp tục đi, vào vùng "Phở Bò"
           → GPS: 10.7723, 106.6513
           → Geofence: Phát hiện "Phở Bò" (20m trong bán kính 30m)
           → Narration: Đang phát "Bánh Mì" → KHÔNG PHÁT MỚI

10:01:00 - Audio "Bánh Mì" kết thúc

10:01:05 - User vẫn trong vùng "Phở Bò"
           → Geofence: Vẫn phát hiện "Phở Bò"
           → Narration: Không đang phát + Chưa phát trong 5 phút → OK
           → 🔊 Phát: "Đây là quán phở nổi tiếng..."
           → Log: { poiId: 1, playedAt: 10:01:05 }

10:02:00 - User đi ra khỏi vùng "Phở Bò", vào lại vùng "Bánh Mì"
           → Geofence: Phát hiện "Bánh Mì"
           → Narration: Đã phát cách đây 1.5 phút (< 5 phút) → KHÔNG PHÁT

10:06:30 - User đi lại vào vùng "Bánh Mì"
           → Geofence: Phát hiện "Bánh Mì"
           → Narration: Đã phát cách đây 6 phút (> 5 phút) → OK
           → 🔊 Phát lại: "Bánh mì đặc sản Sài Gòn..."
           → Log: { poiId: 2, playedAt: 10:06:30 }
```

---

## 🔧 Cấu hình có thể thay đổi

- **Cooldown period**: Mặc định 5 phút, có thể thay đổi (ví dụ: 3 phút, 10 phút)
- **Priority calculation**: Hiện tại tính từ ID, có thể thay đổi logic
- **Radius default**: Mặc định 50m nếu POI không có `accuracy`

---

## ✅ Kết luận

Luồng hoạt động này đảm bảo:
1. ✅ Tự động phát audio khi vào vùng
2. ✅ Chọn đúng POI ưu tiên cao nhất
3. ✅ Tránh phát lặp lại gây khó chịu
4. ✅ Tránh cắt ngang audio đang phát
5. ✅ Trải nghiệm mượt mà cho người dùng

Giống như một **hướng dẫn viên thông minh** tự động giới thiệu các điểm ẩm thực khi bạn đi ngang qua! 🎯
