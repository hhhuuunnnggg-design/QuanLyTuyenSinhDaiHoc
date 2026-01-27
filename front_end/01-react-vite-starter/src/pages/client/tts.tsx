import { getTTSAudiosAPI, type TTSAudio } from "@/api/tts.api";
import { config } from "@/config";
import { API_ENDPOINTS } from "@/constants";
import { CompassOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, message, Switch, Tooltip } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import "./tts.scss";

interface GeoPosition {
  lat: number;
  lng: number;
}

const haversineDistance = (p1: GeoPosition, p2: GeoPosition) => {
  const R = 6371000; // metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TTSPage = () => {
  const [audios, setAudios] = useState<TTSAudio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [autoGuide, setAutoGuide] = useState(true);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res: any = await getTTSAudiosAPI(1, 100);
        let data: TTSAudio[] = [];
        if (res?.data?.meta && res?.data?.result) {
          data = res.data.result as TTSAudio[];
        } else if (res?.meta && res?.result) {
          data = res.result as TTSAudio[];
        }
        setAudios(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (err: any) {
        message.error("Không thể tải danh sách audio ẩm thực");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Geolocation
  useEffect(() => {
    if (!autoGuide) return;
    if (!navigator.geolocation) {
      setGeoError("Trình duyệt không hỗ trợ GPS");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoEnabled(true);
        setGeoError(null);
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGeoEnabled(false);
        setGeoError(err.message || "Không thể lấy vị trí");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [autoGuide]);

  // Tự chọn điểm gần nhất trong bán kính
  useEffect(() => {
    if (!autoGuide || !position || audios.length === 0) return;

    let bestId: number | null = null;
    let bestDist = Infinity;

    audios.forEach((audio) => {
      if (audio.latitude != null && audio.longitude != null) {
        const dist = haversineDistance(position, { lat: audio.latitude, lng: audio.longitude });
        const radius = audio.accuracy ?? 50;
        if (dist <= radius && dist < bestDist) {
          bestDist = dist;
          bestId = audio.id;
        }
      }
    });

    if (bestId != null && bestId !== selectedId) {
      setSelectedId(bestId);
    }
  }, [autoGuide, position, audios, selectedId]);

  const selected = useMemo(
    () => audios.find((a) => a.id === selectedId) || audios[0] || null,
    [audios, selectedId]
  );

  const currentDistance = useMemo(() => {
    if (!position || !selected || selected.latitude == null || selected.longitude == null) return null;
    return Math.round(
      haversineDistance(position, { lat: selected.latitude, lng: selected.longitude })
    );
  }, [position, selected]);

  const sortedAudios = useMemo(() => {
    if (audios.length === 0) return [];
    if (!position) return audios;

    return [...audios].sort((a, b) => {
      const distA =
        a.latitude != null && a.longitude != null
          ? haversineDistance(position, { lat: a.latitude, lng: a.longitude })
          : Number.POSITIVE_INFINITY;
      const distB =
        b.latitude != null && b.longitude != null
          ? haversineDistance(position, { lat: b.latitude, lng: b.longitude })
          : Number.POSITIVE_INFINITY;
      return distA - distB;
    });
  }, [audios, position]);

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handlePlayPause = () => {
    if (!selected) return;
    const src = `${config.api.baseURL}${API_ENDPOINTS.TTS.AUDIO_DOWNLOAD(selected.id)}`;
    if (!audioRef.current) return;

    if (!isPlaying) {
      audioRef.current.src = src;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error(err);
          message.error("Không thể phát audio");
        });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatDistance = (d: number | null) => {
    if (d == null) return "—";
    if (d < 1000) return `${d}m`;
    return `${(d / 1000).toFixed(1)}km`;
  };

  // Dừng audio nếu đã ra khỏi bán kính kích hoạt
  useEffect(() => {
    if (!isPlaying || !position || !selected) return;
    if (selected.latitude == null || selected.longitude == null) return;

    const radius = selected.accuracy ?? 30;
    const dist = haversineDistance(position, {
      lat: selected.latitude,
      lng: selected.longitude,
    });

    if (dist > radius && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying, position, selected]);

  return (
    <div className="gps-food-page">
      <div className="gps-food-sidebar">
        <div className="gps-food-sidebar-header">
          <div className="app-title">
            <span className="dot" />
            <div>
              <div className="title">Phố Ẩm Thực GPS</div>
              <div className="subtitle">Hệ thống thuyết minh tự động</div>
            </div>
          </div>
          <div className="auto-guide-toggle">
            <span>AUTO-GUIDE</span>
            <Switch
              checked={autoGuide}
              onChange={setAutoGuide}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </div>
        </div>

        <div className="gps-food-sidebar-list">
          {sortedAudios.map((audio) => {
            const isActive = selected && audio.id === selected.id;
            return (
              <div
                key={audio.id}
                className={`stall-item ${isActive ? "active" : ""}`}
                onClick={() => handleSelect(audio.id)}
              >
                <div className="thumb">
                  {audio.imageUrl ? (
                    <img src={audio.imageUrl} alt={audio.foodName || "Ảnh món"} />
                  ) : (
                    <div className="placeholder">IMG</div>
                  )}
                </div>
                <div className="info">
                  <div className="name">{audio.foodName || "Món chưa đặt tên"}</div>
                  <div className="desc">
                    {audio.description
                      ? audio.description.length > 40
                        ? audio.description.substring(0, 40) + "..."
                        : audio.description
                      : audio.text.length > 40
                        ? audio.text.substring(0, 40) + "..."
                        : audio.text}
                  </div>
                  {audio.price != null && (
                    <div className="price">
                      {Number(audio.price).toLocaleString("vi-VN")} ₫
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && sortedAudios.length === 0 && (
            <div className="empty-state">
              Chưa có audio ẩm thực nào. Hãy tạo ở trang Admin &gt; TTS Audio.
            </div>
          )}
        </div>

        <div className="gps-food-sidebar-footer">
          <Button size="small">Ngôn ngữ: VI</Button>
          <Button
            size="small"
            icon={<CompassOutlined />}
            type={geoEnabled ? "primary" : "default"}
          >
            GPS: {geoEnabled ? "BẬT" : "TẮT"}
          </Button>
        </div>
      </div>

      <div className="gps-food-main">
        {selected && (
          <>
            <div className="hero">
              <div className="hero-bg">
                {selected.imageUrl && <img src={selected.imageUrl} alt={selected.foodName || ""} />}
              </div>

              <div className="hero-overlay">
                <div className="hero-top">
                  <div className="distance-chip">
                    <span>Cách bạn</span>
                    <strong>{formatDistance(currentDistance)}</strong>
                  </div>
                </div>

                <div className="hero-content">
                  <div className="badges">
                    <span className="badge">TRUYỀN THỐNG</span>
                    <span className="badge secondary">BÁN CHẠY</span>
                  </div>
                  <h1>{selected.foodName || "Món chưa đặt tên"}</h1>
                  <p className="sub">
                    {selected.text.length > 80
                      ? selected.text.substring(0, 80) + "..."
                      : selected.text}
                  </p>
                </div>
              </div>
            </div>

            <div className="audio-card">
              <div className="audio-header">
                <div>
                  <div className="audio-label">AUDIO GUIDE</div>
                  <div className="audio-title">
                    {selected.description && selected.description.length > 0
                      ? "Lịch sử & cách chế biến"
                      : "Thuyết minh món ăn"}
                  </div>
                </div>
                <div className="radius">
                  <span>Bán kính kích hoạt:</span>
                  <strong>{selected.accuracy ?? 30}m</strong>
                </div>
              </div>

              <div className="audio-controls">
                <Button
                  type="primary"
                  size="large"
                  shape="circle"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handlePlayPause}
                />
                <div className="audio-progress">
                  <div className="bar" />
                  <div className="time-row">
                    <span>0:00</span>
                    <span>--:--</span>
                  </div>
                </div>
                <Tooltip title="GPS auto-guide sẽ tự động phát khi bạn vào vùng bán kính cho phép">
                  <div className="auto-guide-pill">
                    <CompassOutlined />
                    <span>{autoGuide ? "Auto-guide đang bật" : "Auto-guide đang tắt"}</span>
                  </div>
                </Tooltip>
              </div>

              {geoError && <div className="geo-error">{geoError}</div>}
            </div>
          </>
        )}

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default TTSPage;
