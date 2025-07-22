//import ChatBox from "@/components/common/ChatBox";
import Restricted from "@/components/common/restricted";
import { useCurrentApp } from "@/components/context/app.context";
import { logout } from "@/redux/slice/auth.slice";
import { logoutAPI } from "@/services/api";
import {
  AccountBookTwoTone,
  ApiTwoTone,
  CloseOutlined,
  CloudTwoTone,
  MessageTwoTone,
  NotificationTwoTone,
  OpenAIFilled,
  VideoCameraTwoTone,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Dropdown,
  message,
  Space,
} from "antd";
import { Input } from "antd/lib";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import "./app.header.scss";

const fakeUserA = {
  id: 1,
  fullname: "Nguyễn Văn A",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};
const fakeUserB = {
  id: 2,
  fullname: "Trần Thị B",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

const fakeMessages = [
  { id: 1, sender: fakeUserA, content: "Chào bạn!", time: "10:00" },
  {
    id: 2,
    sender: fakeUserB,
    content: "Chào bạn, bạn khỏe không?",
    time: "10:01",
  },
  {
    id: 3,
    sender: fakeUserA,
    content: "Mình khỏe, cảm ơn bạn!",
    time: "10:02",
  },
];

export function ChatBox({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState(fakeMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: fakeUserA,
        content: input,
        time: new Date().toLocaleTimeString().slice(0, 5),
      },
    ]);
    setInput("");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        width: 340,
        height: 420,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f0f2f5",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={fakeUserB.avatar} />
          <span style={{ marginLeft: 10, fontWeight: 600 }}>
            {fakeUserB.fullname}
          </span>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: "#888" }}
        />
      </div>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection:
                msg.sender.id === fakeUserA.id ? "row-reverse" : "row",
              alignItems: "flex-end",
              marginBottom: 10,
            }}
          >
            <Avatar src={msg.sender.avatar} size={32} />
            <div
              style={{
                background:
                  msg.sender.id === fakeUserA.id ? "#e6f4ff" : "#f0f2f5",
                color: "#222",
                borderRadius: 16,
                padding: "8px 14px",
                margin: "0 8px",
                maxWidth: 200,
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
            <span style={{ fontSize: 12, color: "#888" }}>{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div
        style={{
          padding: 12,
          borderTop: "1px solid #eee",
          background: "#fff",
        }}
      >
        <Input.Search
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={handleSend}
          enterButton="Gửi"
          placeholder="Nhập tin nhắn..."
        />
      </div>
    </div>
  );
}

const AppHeader = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user, isAuthenticated, loading, setUser, setIsAuthenticated } =
    useCurrentApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      message.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error: any) {
      message.error(error?.message || "Đăng xuất thất bại!");
    }
  };

  const menuItems = [
    {
      label: <Link to="/account">Quản lý tài khoản</Link>,
      key: "account",
    },
    {
      label: <Link to="/history">Lịch sử mua hàng</Link>,
      key: "history",
    },
    {
      label: (
        <span style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </span>
      ),
      key: "logout",
    },
  ];

  if (user?.role !== null) {
    menuItems.unshift({
      label: (
        <Restricted permission="/api/v1/users/fetch-all">
          <Link to="/admin/user">Trang quản trị</Link>
        </Restricted>
      ),
      key: "admin",
    });
  }

  const navIcons = [
    {
      icon: (
        <Badge count={2} size="small">
          <MessageTwoTone />
        </Badge>
      ),
      key: "messages",
      onClick: () => console.log("Messages"),
    },
    {
      icon: (
        <Badge count={5} size="small">
          <NotificationTwoTone />
        </Badge>
      ),
      key: "notifications",
      onClick: () => console.log("Notifications"),
    },
  ];
  const navIcons1 = [
    {
      //<AccountBookTwoTone />
      //<HomeTwoTone />
      icon: <AccountBookTwoTone />, // thêm fontSize nếu cần
      key: "home",
      onClick: () => navigate("/"),
    },
    {
      icon: <VideoCameraTwoTone />,
      key: "video",
      onClick: () => console.log("Video"),
    },
    {
      icon: <ApiTwoTone />,
      key: "group",
      onClick: () => console.log("group"),
    },
    {
      icon: <CloudTwoTone />,
      key: "feed",
      onClick: () => console.log("feed"),
    }, // sửa key
  ];

  return (
    <>
      <div className="header-container">
        <header className="page-header">
          <div className="page-header__top">
            <div
              className="page-header__toggle"
              onClick={() => setOpenDrawer(true)}
            >
              ☰
            </div>
            <div className="page-header__logo">
              <Link to="/" className="logo">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    style={{ width: "40px", height: "40px" }}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
                    alt=""
                  />
                </div>
              </Link>

              <input
                className="input-search"
                type="text"
                placeholder="Tìm kiếm trên Facebook"
                // style={{ backgroundColor: "#f0f2f5" }}
              />
            </div>
            <div className="page-header__center">
              {navIcons1.map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  className="nav-item"
                  onClick={item.onClick}
                  style={{ margin: "40px" }}
                >
                  {item.icon}
                </div>
              ))}
            </div>
            <nav className="page-header__nav">
              {navIcons.map((item, index) => (
                <div
                  key={`${item.key}-${index}`}
                  className="nav-item"
                  onClick={item.onClick}
                >
                  {item.icon}
                </div>
              ))}
              {!loading && isAuthenticated && user && (
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <Space className="nav-item">
                    <Avatar
                      className="facebook-post__avatar"
                      src={user.avatar || undefined}
                      style={{ background: "#87d068", alignContent: "center" }}
                    >
                      {user.fullname?.[0] || "U"}
                    </Avatar>

                    <div style={{ color: "black" }}>{user?.fullname}</div>
                  </Space>
                </Dropdown>
              )}
            </nav>
          </div>
        </header>
      </div>

      <Drawer
        title="Menu chức năng"
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
      >
        {!isAuthenticated ? (
          <Button type="primary" onClick={() => navigate("/login")}>
            Đăng nhập
          </Button>
        ) : (
          <>
            <p>
              <Link to="/account">Quản lý tài khoản</Link>
            </p>
            <Divider />
            <p>
              <Link to="/history">Lịch sử mua hàng</Link>
            </p>
            <Divider />
            {user?.role !== null && (
              <Restricted permission="/api/v1/users/fetch-all">
                <p>
                  <Link to="/admin/user">Trang quản trị</Link>
                </p>
                <Divider />
              </Restricted>
            )}
            <p
              onClick={handleLogout}
              style={{ cursor: "pointer", color: "red" }}
            >
              Đăng xuất
            </p>
          </>
        )}
      </Drawer>
      <Button
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          bottom: "16px",
          right: "16px",
          background: "#fff",
          width: "48px",
          height: "48px",
          borderRadius: "9999px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
        onClick={() => setShowChat(true)}
      >
        <OpenAIFilled style={{ fontSize: 24 }} />
      </Button>
      {showChat && <ChatBox onClose={() => setShowChat(false)} />}
    </>
  );
};

export default AppHeader;
