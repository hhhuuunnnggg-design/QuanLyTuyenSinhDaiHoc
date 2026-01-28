import { getImageUrl, getTTSAudiosAPI, type TTSAudio } from "@/api/tts.api";
import { config } from "@/config";
import { API_ENDPOINTS } from "@/constants";
import { CompassOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, message, Slider, Switch, Tooltip } from "antd";
import { DivIcon, Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
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
  const [viewMode, setViewMode] = useState<"detail" | "map">("detail");
  const [mockGps, setMockGps] = useState(true);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mockLat, setMockLat] = useState<number | null>(null);
  const [mockLng, setMockLng] = useState<number | null>(null);
  const [latRange, setLatRange] = useState<{ min: number; max: number } | null>(null);
  const [lngRange, setLngRange] = useState<{ min: number; max: number } | null>(null);
  const mapRef = useRef<Map | null>(null);
  const lastPositionSourceRef = useRef<"gps" | "slider" | "drag">("slider");
  const hasManualPanRef = useRef(false);

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

  // Tính range cho slider giả lập từ danh sách quán có toạ độ
  useEffect(() => {
    const withCoords = audios.filter(
      (a) => a.latitude != null && a.longitude != null
    );
    if (withCoords.length === 0) return;

    const lats = withCoords.map((a) => a.latitude!) as number[];
    const lngs = withCoords.map((a) => a.longitude!) as number[];

    const padding = 0.0005; // ~55m
    setLatRange({
      min: Math.min(...lats) - padding,
      max: Math.max(...lats) + padding,
    });
    setLngRange({
      min: Math.min(...lngs) - padding,
      max: Math.max(...lngs) + padding,
    });

    // Khởi tạo vị trí giả lập ở quán đầu tiên
    if (mockLat == null || mockLng == null) {
      setMockLat(withCoords[0].latitude!);
      setMockLng(withCoords[0].longitude!);
      setPosition({
        lat: withCoords[0].latitude!,
        lng: withCoords[0].longitude!,
      });
      lastPositionSourceRef.current = "slider"; // Initial load is from slider
      setGeoEnabled(true);
    }
  }, [audios, mockLat, mockLng]);

  // Geolocation - luôn watch để lấy từ Sensors (Chrome DevTools) hoặc real GPS
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
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        lastPositionSourceRef.current = "gps"; // Mark as GPS update
        // Đồng bộ slider với giá trị từ Sensors/real GPS
        if (mockGps) {
          setMockLat(newPos.lat);
          setMockLng(newPos.lng);
        }
      },
      (err) => {
        // Nếu đang ở chế độ mock và có lỗi, fallback về slider
        if (mockGps && mockLat != null && mockLng != null) {
          setPosition({ lat: mockLat, lng: mockLng });
          lastPositionSourceRef.current = "slider"; // Mark as slider update
          setGeoEnabled(true);
          setGeoError(null);
        } else {
          setGeoEnabled(false);
          setGeoError(err.message || "Không thể lấy vị trí");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [autoGuide, mockGps, mockLat, mockLng]);

  // Sync position với mockLat/mockLng khi slider thay đổi (chỉ khi đang dùng mock GPS)
  useEffect(() => {
    if (!mockGps || mockLat == null || mockLng == null) return;
    
    // Chỉ update position nếu giá trị thực sự thay đổi
    if (position?.lat !== mockLat || position?.lng !== mockLng) {
      setPosition({ lat: mockLat, lng: mockLng });
      lastPositionSourceRef.current = "slider"; // Đánh dấu là từ slider
    }
  }, [mockGps, mockLat, mockLng]);

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

  const miniMapCenter = useMemo<GeoPosition | null>(() => {
    if (position) return position;
    if (selected && selected.latitude != null && selected.longitude != null) {
      return { lat: selected.latitude, lng: selected.longitude };
    }
    return null;
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

  // Component để auto-center map khi position thay đổi và track manual pan
  const MapCenter = ({ position, hasManualPan, onMapReady }: { 
    position: GeoPosition | null; 
    hasManualPan: boolean;
    onMapReady: (map: Map) => void;
  }) => {
    const map = useMap();
    
    useEffect(() => {
      onMapReady(map);
      map.on("dragstart", () => {
        hasManualPanRef.current = true;
      });
    }, [map, onMapReady]);
    
    useEffect(() => {
      if (!position || hasManualPan) return;
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }, [position?.lat, position?.lng, map, hasManualPan]);
    
    return null;
  };

  // Custom icon cho user marker
  const createUserIcon = () => {
    return new DivIcon({
      className: "custom-user-marker",
      html: `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #2563eb;
              border: 2px solid white;
            "></div>
          </div>
          <div style="
            position: absolute;
            right: -8px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 12px solid #2563eb;
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Custom icon cho food markers
  const createFoodIcon = (isSelected: boolean, label: string) => {
    return new DivIcon({
      className: "custom-food-marker",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: ${isSelected ? 20 : 16}px;
            height: ${isSelected ? 20 : 16}px;
            border-radius: 50%;
            background: ${isSelected ? "#ff6b35" : "#9ca3af"};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>
          <div style="
            margin-top: 4px;
            padding: 2px 6px;
            background: ${isSelected ? "#ff6b35" : "#6b7280"};
            color: white;
            border-radius: 4px;
            font-size: 10px;
            font-weight: ${isSelected ? "bold" : "normal"};
            white-space: nowrap;
          ">${label}</div>
        </div>
      `,
      iconSize: [60, 40],
      iconAnchor: [30, 20],
    });
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
            <span>TỰ ĐỘNG PHÁT</span>
            <Switch
              checked={autoGuide}
              onChange={setAutoGuide}
              size="small"
              style={{ marginLeft: 8 }}
            />
          </div>
        </div>

        {latRange && lngRange && (
          <div className="gps-mock-panel">
            <div className="mock-header">
              <div className="mock-title">Giả lập di chuyển</div>
              <Switch
                size="small"
                checked={mockGps}
                onChange={setMockGps}
              />
            </div>

            <div className="mock-row">
              <div className="mock-label">
                LATITUDE{" "}
                <span className="mock-value">
                  {mockLat != null ? mockLat.toFixed(6) : "--"}
                </span>
              </div>
              <Slider
                min={latRange.min}
                max={latRange.max}
                step={(latRange.max - latRange.min) / 200}
                value={mockLat ?? latRange.min}
                onChange={(value: number) => {
                  setMockGps(true);
                  setMockLat(value);
                }}
              />
            </div>

            <div className="mock-row">
              <div className="mock-label">
                LONGITUDE{" "}
                <span className="mock-value">
                  {mockLng != null ? mockLng.toFixed(6) : "--"}
                </span>
              </div>
              <Slider
                min={lngRange.min}
                max={lngRange.max}
                step={(lngRange.max - lngRange.min) / 200}
                value={mockLng ?? lngRange.min}
                onChange={(value: number) => {
                  setMockGps(true);
                  setMockLng(value);
                }}
              />
            </div>
          </div>
        )}

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
                  {getImageUrl(audio.imageUrl) ? (
                    <img src={getImageUrl(audio.imageUrl)!} alt={audio.foodName || "Ảnh món"} />
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
          <div className="footer-top">
            <Button size="small">Ngôn ngữ: VI</Button>
            <Button
              size="small"
              icon={<CompassOutlined />}
              type={geoEnabled ? "primary" : "default"}
            >
              GPS: {geoEnabled ? "BẬT" : "TẮT"}
            </Button>
          </div>
          <div className="footer-tabs">
            <Button
              size="small"
              type={viewMode === "detail" ? "primary" : "default"}
              onClick={() => setViewMode("detail")}
            >
              Chi tiết
            </Button>
            <Button
              size="small"
              type={viewMode === "map" ? "primary" : "default"}
              onClick={() => setViewMode("map")}
            >
              Bản đồ
            </Button>
          </div>
        </div>
      </div>

      <div className="gps-food-main">
        {selected && viewMode === "detail" && (
          <>
            <div className="hero">
              <div className="hero-bg">
                {getImageUrl(selected.imageUrl) && (
                  <img src={getImageUrl(selected.imageUrl)!} alt={selected.foodName || ""} />
                )}
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

        {selected && viewMode === "map" && miniMapCenter && (
          <div className="gps-map-page">
            <div className="gps-map-header">
              <div>
                <div className="gps-map-title">Bản đồ Ẩm thực</div>
                <div className="gps-map-subtitle">Theo dõi vị trí của bạn trong khu phố</div>
              </div>
              <div className="gps-map-right">
                <div className="live-gps-pill">
                  LIVE GPS: {miniMapCenter.lat.toFixed(4)}, {miniMapCenter.lng.toFixed(4)}
                </div>
                <div className="auto-guide-chip">
                  <span
                    className={`dot-indicator ${autoGuide ? "on" : "off"}`}
                  />
                  <span>Tự động phát: {autoGuide ? "BẬT" : "TẮT"}</span>
                </div>
              </div>
            </div>

            <div className="gps-map-frame">
              {miniMapCenter && (
                <MapContainer
                  center={[miniMapCenter.lat, miniMapCenter.lng]}
                  zoom={18}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                  dragging={true}
                  touchZoom={true}
                  boxZoom={true}
                  keyboard={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapCenter 
                    position={position} 
                    hasManualPan={hasManualPanRef.current}
                    onMapReady={(map) => {
                      mapRef.current = map;
                    }}
                  />
                  
                  {/* User location marker */}
                  {position && (
                    <Marker
                      position={[position.lat, position.lng]}
                      icon={createUserIcon()}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const marker = e.target;
                          const newPos = marker.getLatLng();
                          setMockLat(newPos.lat);
                          setMockLng(newPos.lng);
                          setPosition({ lat: newPos.lat, lng: newPos.lng });
                          lastPositionSourceRef.current = "drag";
                          setMockGps(true);
                        },
                      }}
                    />
                  )}

                  {/* Food markers and circles */}
                  {audios
                    .filter((a) => a.latitude != null && a.longitude != null)
                    .map((audio) => {
                      const isSelected = audio.id === selected?.id;
                      const radius = audio.accuracy ?? 30;
                      const label = audio.foodName
                        ? audio.foodName.split(" ")[0].substring(0, 4)
                        : "Food";

                      return (
                        <React.Fragment key={audio.id}>
                          <Circle
                            center={[audio.latitude!, audio.longitude!]}
                            radius={radius}
                            pathOptions={{
                              color: isSelected ? "#ff6b35" : "#9ca3af",
                              fillColor: isSelected ? "#ff6b35" : "#9ca3af",
                              fillOpacity: 0.1,
                              weight: 2,
                              dashArray: "5, 5",
                            }}
                          />
                          <Marker
                            position={[audio.latitude!, audio.longitude!]}
                            icon={createFoodIcon(isSelected, label)}
                            eventHandlers={{
                              click: () => {
                                handleSelect(audio.id);
                              },
                            }}
                          />
                        </React.Fragment>
                      );
                    })}
                </MapContainer>
              )}
              <div className="map-controls">
                <Button
                  size="small"
                  onClick={() => {
                    if (mapRef.current && position) {
                      mapRef.current.setView([position.lat, position.lng], mapRef.current.getZoom(), {
                        animate: true,
                      });
                      hasManualPanRef.current = false;
                    }
                  }}
                  title="Reset view"
                >
                  ⟲
                </Button>
              </div>
            </div>
          </div>
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
