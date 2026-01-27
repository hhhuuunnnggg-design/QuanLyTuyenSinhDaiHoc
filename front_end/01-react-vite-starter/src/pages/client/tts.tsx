import { getImageUrl, getTTSAudiosAPI, type TTSAudio } from "@/api/tts.api";
import { config } from "@/config";
import { API_ENDPOINTS } from "@/constants";
import { CompassOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, message, Slider, Switch, Tooltip } from "antd";
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
  const [mapZoom, setMapZoom] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPositionSourceRef = useRef<"gps" | "slider" | "drag">("gps"); // Track where position update came from

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

  // Auto-center map only when:
  // 1. Position changes from real GPS (not from slider/drag)
  // 2. Map hasn't been manually panned/zoomed (still at default state)
  // 3. Not currently dragging marker
  useEffect(() => {
    if (isDraggingMarker || !position || !latRange || !lngRange) return;
    
    // Don't auto-center if user has manually panned/zoomed the map
    const hasManualInteraction = mapOffset.x !== 0 || mapOffset.y !== 0 || mapZoom !== 1;
    if (hasManualInteraction) return;
    
    // Don't auto-center if position changed from slider or drag
    // Only auto-center when position comes from real GPS
    if (lastPositionSourceRef.current !== "gps") return;
    
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    // Normalize position to 0-1 range
    const normalizedLat = (position.lat - latRange.min) / (latRange.max - latRange.min);
    const normalizedLng = (position.lng - lngRange.min) / (lngRange.max - lngRange.min);
    
    // Calculate pixel position without offset
    const worldX = normalizedLng * canvas.width;
    const worldY = (1 - normalizedLat) * canvas.height;
    
    // Calculate offset needed to center this position
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const newOffsetX = centerX - worldX * mapZoom;
    const newOffsetY = centerY - worldY * mapZoom;
    
    setMapOffset({ x: newOffsetX, y: newOffsetY });
  }, [position?.lat, position?.lng, latRange, lngRange]); // Removed mapZoom from deps

  // Convert lat/lng to pixel coordinates trên custom map
  const latLngToPixel = (lat: number, lng: number) => {
    if (!latRange || !lngRange) return { x: 0, y: 0 };
    
    // Normalize lat/lng to 0-1 range
    const normalizedLat = (lat - latRange.min) / (latRange.max - latRange.min);
    const normalizedLng = (lng - lngRange.min) / (lngRange.max - lngRange.min);
    
    // Convert to pixel với zoom và offset
    const canvas = mapCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const width = canvas.width;
    const height = canvas.height;
    
    const x = normalizedLng * width * mapZoom + mapOffset.x;
    const y = (1 - normalizedLat) * height * mapZoom + mapOffset.y; // Flip Y axis
    
    return { x, y };
  };

  // Convert pixel to lat/lng
  const pixelToLatLng = (x: number, y: number) => {
    if (!latRange || !lngRange) return miniMapCenter || { lat: 0, lng: 0 };
    
    const canvas = mapCanvasRef.current;
    if (!canvas) return miniMapCenter || { lat: 0, lng: 0 };
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Remove offset and zoom
    const normalizedX = (x - mapOffset.x) / mapZoom;
    const normalizedY = (y - mapOffset.y) / mapZoom;
    
    // Convert to 0-1 range
    const lng = normalizedX / width;
    const lat = 1 - normalizedY / height; // Flip Y axis
    
    // Convert to actual lat/lng
    return {
      lat: latRange.min + lat * (latRange.max - latRange.min),
      lng: lngRange.min + lng * (lngRange.max - lngRange.min),
    };
  };

  // Draw custom map
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas || !miniMapCenter || !latRange || !lngRange) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    const gridSize = 40 * mapZoom;
    for (let x = -mapOffset.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = -mapOffset.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw roads (horizontal and vertical)
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 3 * mapZoom;
    const roadSpacing = 120 * mapZoom;
    for (let x = -mapOffset.x % roadSpacing; x < canvas.width; x += roadSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = -mapOffset.y % roadSpacing; y < canvas.height; y += roadSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw food markers
    audios
      .filter((a) => a.latitude != null && a.longitude != null)
      .forEach((audio) => {
        const isSelected = audio.id === selected?.id;
        const pos = latLngToPixel(audio.latitude!, audio.longitude!);
        const radius = audio.accuracy ?? 30;
        const radiusPixels = (radius / 0.5) * mapZoom; // approximate scale

        // Draw activation radius (dashed circle)
        ctx.strokeStyle = isSelected ? "#ff6b35" : "#9ca3af";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radiusPixels, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw marker dot
        ctx.fillStyle = isSelected ? "#ff6b35" : "#9ca3af";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 10 : 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label
        const label = audio.foodName
          ? audio.foodName.split(" ")[0].substring(0, 4)
          : "Food";
        ctx.fillStyle = isSelected ? "#ff6b35" : "#6b7280";
        ctx.font = `${isSelected ? "bold" : "normal"} 11px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(label, pos.x, pos.y - radiusPixels - 8);
      });

    // Draw user location marker (always at center)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw outer circle
    ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw middle circle
    ctx.fillStyle = "rgba(37, 99, 235, 0.2)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw center dot
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pointer
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(centerX + 12, centerY);
    ctx.lineTo(centerX + 20, centerY - 6);
    ctx.lineTo(centerX + 20, centerY + 6);
    ctx.closePath();
    ctx.fill();
  }, [audios, selected, miniMapCenter, latRange, lngRange, mapZoom, mapOffset, isDraggingMarker]);

  // Handle map interactions
  const handleMapMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on user marker (center area)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    if (dist < 30) {
      // Start dragging user marker
      setIsDraggingMarker(true);
      setDragStart({ x, y });
    } else {
      // Start panning
      setIsPanning(true);
      setDragStart({ x, y });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mapCanvasRef.current;
    if (!canvas || (!isDraggingMarker && !isPanning)) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingMarker) {
      // Convert mouse position to lat/lng (using current map state)
      const newPos = pixelToLatLng(x, y);
      
      // Update position
      setMockLat(newPos.lat);
      setMockLng(newPos.lng);
      setPosition(newPos);
      lastPositionSourceRef.current = "drag"; // Mark as drag update
      setMockGps(true);
      
      // Recalculate offset to keep user marker at center
      // We need to calculate where the new position would be on the map
      // and adjust offset so it appears at center
      if (latRange && lngRange) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Normalize new position to 0-1 range
        const normalizedLat = (newPos.lat - latRange.min) / (latRange.max - latRange.min);
        const normalizedLng = (newPos.lng - lngRange.min) / (lngRange.max - lngRange.min);
        
        // Calculate pixel position without offset
        const worldX = normalizedLng * canvas.width;
        const worldY = (1 - normalizedLat) * canvas.height;
        
        // Calculate offset needed to center this position
        const newOffsetX = centerX - worldX * mapZoom;
        const newOffsetY = centerY - worldY * mapZoom;
        
        setMapOffset({ x: newOffsetX, y: newOffsetY });
      }
    } else if (isPanning) {
      // Pan map (smooth)
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      setMapOffset({
        x: mapOffset.x + dx,
        y: mapOffset.y + dy,
      });
      setDragStart({ x, y });
    }
  };

  const handleMapMouseUp = () => {
    setIsDraggingMarker(false);
    setIsPanning(false);
  };

  const handleMapWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom factor (smaller step for smoother zoom)
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    const newZoom = Math.max(0.5, Math.min(3, mapZoom * zoomFactor));

    // Calculate zoom point in world coordinates
    const worldX = (mouseX - mapOffset.x) / mapZoom;
    const worldY = (mouseY - mapOffset.y) / mapZoom;

    // Adjust offset to zoom into mouse position
    const newOffsetX = mouseX - worldX * newZoom;
    const newOffsetY = mouseY - worldY * newZoom;

    setMapZoom(newZoom);
    setMapOffset({ x: newOffsetX, y: newOffsetY });
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
              <canvas
                ref={mapCanvasRef}
                className={`custom-map-canvas ${isDraggingMarker ? "dragging-marker" : ""}`}
                onMouseDown={handleMapMouseDown}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onMouseLeave={handleMapMouseUp}
                onWheel={handleMapWheel}
              />
              <div className="map-controls">
                <Button
                  size="small"
                  onClick={() => {
                    const canvas = mapCanvasRef.current;
                    if (!canvas) return;
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const worldX = (centerX - mapOffset.x) / mapZoom;
                    const worldY = (centerY - mapOffset.y) / mapZoom;
                    const newZoom = Math.min(3, mapZoom * 1.15);
                    setMapZoom(newZoom);
                    setMapOffset({
                      x: centerX - worldX * newZoom,
                      y: centerY - worldY * newZoom,
                    });
                  }}
                  title="Zoom in"
                >
                  +
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    const canvas = mapCanvasRef.current;
                    if (!canvas) return;
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const worldX = (centerX - mapOffset.x) / mapZoom;
                    const worldY = (centerY - mapOffset.y) / mapZoom;
                    const newZoom = Math.max(0.5, mapZoom * 0.85);
                    setMapZoom(newZoom);
                    setMapOffset({
                      x: centerX - worldX * newZoom,
                      y: centerY - worldY * newZoom,
                    });
                  }}
                  title="Zoom out"
                >
                  −
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setMapOffset({ x: 0, y: 0 });
                    setMapZoom(1);
                  }}
                  title="Reset view"
                >
                  ⟲
                </Button>
                <div className="zoom-level" title="Zoom level">
                  {Math.round(mapZoom * 100)}%
                </div>
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
