export interface GeoPosition {
  lat: number;
  lng: number;
}

export type ViewMode = "detail" | "map";
export type PositionSource = "gps" | "slider" | "drag";

// Extended POI với priority
export interface POI {
  id: number;
  latitude: number;
  longitude: number;
  radius: number; // Bán kính kích hoạt (mét)
  priority: number; // Độ ưu tiên (số càng cao = ưu tiên càng cao)
  audioId: number; // ID của audio thuyết minh
}

// Log entry để track đã phát
export interface NarrationLog {
  poiId: number;
  audioId: number;
  playedAt: number; // Timestamp
}
