# Luồng hoạt động GPS Food Guide

## Tổng quan

Hệ thống tự động phát audio thuyết minh khi người dùng di chuyển đến gần các điểm ẩm thực (POI - Point of Interest).

## Luồng hoạt động

### 1. App tải danh sách POI
- **Component**: `useTTSAudios` hook
- **Chức năng**: Fetch danh sách TTSAudio từ API
- **Dữ liệu**: Mỗi POI chứa:
  - `latitude`, `longitude`: Tọa độ GPS
  - `accuracy` (radius): Bán kính kích hoạt (mét)
  - `priority`: Độ ưu tiên (tính ở frontend: ID nhỏ = priority cao hơn)
  - `id`: ID của audio thuyết minh

### 2. Background Service cập nhật vị trí
- **Component**: `useGeolocation` hook
- **Chức năng**: 
  - Watch GPS position liên tục
  - Cập nhật vị trí khi người dùng di chuyển
  - Hỗ trợ mock GPS (slider) để test

### 3. Geofence Engine xác định POI
- **Component**: `GeofenceEngine` class
- **Chức năng**:
  - Nhận vị trí hiện tại và danh sách POI
  - Tìm POI gần nhất và có priority cao nhất trong bán kính
  - Tính điểm số: `priority * 10000 - distance`
  - Gửi sự kiện khi phát hiện POI mới

### 4. Narration Engine quyết định phát audio
- **Component**: `NarrationEngine` class + `useNarrationEngine` hook
- **Chức năng**:
  - Kiểm tra trạng thái:
    - Đang phát audio khác? → Không phát mới
    - Đã phát trong X phút? → Không phát lại (cooldown)
  - Quyết định có phát TTS/Audio hay không
  - Ghi log khi phát để tránh lặp

### 5. Ghi log đã phát
- **Component**: `NarrationEngine.logPlay()`
- **Chức năng**:
  - Lưu timestamp khi phát audio
  - Kiểm tra cooldown period (mặc định 5 phút)
  - Tránh phát lại cùng một POI trong thời gian ngắn

## Cấu trúc code

```
tts/
├── engines/
│   ├── GeofenceEngine.ts      # Engine xác định POI trong bán kính
│   └── NarrationEngine.ts      # Engine quản lý việc phát audio
├── hooks/
│   ├── useNarrationEngine.ts   # Hook tích hợp 2 engines
│   ├── useGeolocation.ts       # Hook quản lý GPS
│   ├── useTTSAudios.ts         # Hook fetch POI list
│   └── useAudioPlayer.ts       # Hook phát audio
└── index.tsx                    # Component chính
```

## Cấu hình

- **Cooldown period**: Mặc định 5 phút (có thể thay đổi)
- **Default radius**: 50m nếu POI không có `accuracy`
- **Priority calculation**: 
  - Nếu backend có field `priority` → dùng luôn
  - Nếu không → tính từ ID: `priority = 1000 - id` (ID nhỏ = priority cao)
  - Có thể thay đổi logic trong `GeofenceEngine.audioToPOI()`

## Ví dụ sử dụng

```typescript
// Trong component
useNarrationEngine({
  audios,              // Danh sách POI
  position,            // Vị trí hiện tại
  autoGuide,           // Bật/tắt auto-guide
  isPlaying,           // Trạng thái đang phát
  cooldownMinutes: 5,  // Cooldown 5 phút
  onPOIDetected: (poiId) => {
    // Cập nhật UI khi phát hiện POI
  },
  onShouldPlay: (audioId) => {
    // Phát audio tự động
  },
});
```
