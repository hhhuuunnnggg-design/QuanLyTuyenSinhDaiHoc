import { useEffect, useRef } from "react";
import type { TTSAudio } from "@/api/tts.api";
import { GeoPosition } from "../types";
import { GeofenceEngine } from "../engines/GeofenceEngine";
import { NarrationEngine } from "../engines/NarrationEngine";

interface UseNarrationEngineProps {
  audios: TTSAudio[];
  position: GeoPosition | null;
  autoGuide: boolean;
  isPlaying: boolean;
  onPOIDetected: (poiId: number) => void;
  onShouldPlay: (audioId: number) => void;
  cooldownMinutes?: number;
}

/**
 * Hook quản lý Geofence và Narration Engine
 * Theo luồng hoạt động:
 * 1. Background service cập nhật vị trí (position)
 * 2. Geofence Engine xác định POI trong bán kính
 * 3. Narration Engine kiểm tra trạng thái và quyết định phát
 * 4. Ghi log để tránh lặp
 */
export const useNarrationEngine = ({
  audios,
  position,
  autoGuide,
  isPlaying,
  onPOIDetected,
  onShouldPlay,
  cooldownMinutes = 5,
}: UseNarrationEngineProps) => {
  const narrationEngineRef = useRef<NarrationEngine>(
    new NarrationEngine(cooldownMinutes)
  );
  const lastDetectedPOIRef = useRef<number | null>(null);

  useEffect(() => {
    if (!autoGuide || !position || audios.length === 0) return;

    // Chuyển đổi audios thành POIs
    const pois = audios
      .map((audio) => GeofenceEngine.audioToPOI(audio))
      .filter((poi): poi is NonNullable<typeof poi> => poi !== null);

    if (pois.length === 0) return;

    // Geofence Engine: Tìm POI gần nhất/ưu tiên cao nhất trong bán kính
    const detectedPOI = GeofenceEngine.findNearestPOI(position, pois);

    if (!detectedPOI) {
      lastDetectedPOIRef.current = null;
      return;
    }

    // Nếu POI mới được phát hiện, gửi sự kiện
    if (detectedPOI.id !== lastDetectedPOIRef.current) {
      lastDetectedPOIRef.current = detectedPOI.id;
      onPOIDetected(detectedPOI.id);
    }

    // Narration Engine: Kiểm tra trạng thái và quyết định phát
    const canPlay = narrationEngineRef.current.canPlay(detectedPOI.id, isPlaying);

    if (canPlay) {
      // Ghi log trước khi phát
      narrationEngineRef.current.logPlay(detectedPOI.id, detectedPOI.audioId);
      // Gửi sự kiện để phát audio
      onShouldPlay(detectedPOI.audioId);
    }
  }, [autoGuide, position, audios, isPlaying, onPOIDetected, onShouldPlay]);

  return {
    narrationEngine: narrationEngineRef.current,
  };
};
