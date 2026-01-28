import { NarrationLog } from "../types";

/**
 * Narration Engine: Quản lý việc phát audio thuyết minh
 * - Kiểm tra trạng thái (đang phát? đã phát trong X phút?)
 * - Quyết định có phát TTS/Audio hay không
 * - Ghi log để tránh lặp
 */
export class NarrationEngine {
  private logs: Map<number, NarrationLog> = new Map(); // Map<poiId, log>
  private cooldownMinutes: number; // Số phút cooldown trước khi phát lại

  constructor(cooldownMinutes: number = 5) {
    this.cooldownMinutes = cooldownMinutes;
  }

  /**
   * Kiểm tra xem có thể phát audio cho POI này không
   * @param poiId ID của POI
   * @param isCurrentlyPlaying Có đang phát audio khác không
   * @returns true nếu có thể phát, false nếu không
   */
  canPlay(poiId: number, isCurrentlyPlaying: boolean): boolean {
    // Nếu đang phát audio khác, không phát mới
    if (isCurrentlyPlaying) {
      return false;
    }

    // Kiểm tra xem đã phát trong cooldown period chưa
    const log = this.logs.get(poiId);
    if (!log) {
      return true; // Chưa phát bao giờ, có thể phát
    }

    const now = Date.now();
    const cooldownMs = this.cooldownMinutes * 60 * 1000;
    const timeSinceLastPlay = now - log.playedAt;

    // Nếu đã qua cooldown period, có thể phát lại
    return timeSinceLastPlay >= cooldownMs;
  }

  /**
   * Ghi log khi phát audio
   * @param poiId ID của POI
   * @param audioId ID của audio
   */
  logPlay(poiId: number, audioId: number): void {
    this.logs.set(poiId, {
      poiId,
      audioId,
      playedAt: Date.now(),
    });
  }

  /**
   * Xóa log của một POI (để test hoặc reset)
   */
  clearLog(poiId: number): void {
    this.logs.delete(poiId);
  }

  /**
   * Xóa tất cả logs
   */
  clearAllLogs(): void {
    this.logs.clear();
  }

  /**
   * Lấy log của một POI
   */
  getLog(poiId: number): NarrationLog | undefined {
    return this.logs.get(poiId);
  }

  /**
   * Lấy tất cả logs
   */
  getAllLogs(): NarrationLog[] {
    return Array.from(this.logs.values());
  }

  /**
   * Set cooldown period (phút)
   */
  setCooldownMinutes(minutes: number): void {
    this.cooldownMinutes = minutes;
  }
}
