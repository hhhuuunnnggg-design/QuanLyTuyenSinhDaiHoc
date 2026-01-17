import { fetchChatbotHistoryAPI, sendChatbotMessageAPI } from "@/api";
import { CloseOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Avatar, Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useCurrentApp } from "../context/app.context";
import imge_bot from "./img_left/ai_bot.png";

export function ModalChatbotAI({ onClose }: { onClose: () => void }) {
  const { user } = useCurrentApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingHistory(true);
    fetchChatbotHistoryAPI(user.id)
      .then((res) => {
        const data = res?.data?.data || [];
        const mapped = data.map((msg: any) => ({
          id: msg.id,
          sender: {
            id: msg.isBot ? 0 : user.id,
            fullname: msg.isBot ? "Chatbot" : user.fullname,
            avatar: msg.isBot ? imge_bot : user.avatar,
          },
          content: msg.content,
          time:
            msg.timestamp?.slice(11, 16) || msg.createdAt?.slice(11, 16) || "",
        }));
        setMessages(mapped);
      })
      .catch(() => message.error("Không thể tải lịch sử chat"))
      .finally(() => setLoadingHistory(false));
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: {
          id: user.id,
          fullname: user.fullname,
          avatar: user.avatar,
        },
        content: input,
        time: new Date().toLocaleTimeString().slice(0, 5),
      },
    ]);
    try {
      const res = await sendChatbotMessageAPI(user.id, input.trim());
      const botMsg = res?.data?.data;
      if (botMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: {
              id: 0,
              fullname: "Chatbot",
              avatar: imge_bot,
            },
            content: botMsg.content || "Bot đã trả lời.",
            time: new Date().toLocaleTimeString().slice(0, 5),
          },
        ]);
      }
    } catch (err) {
      message.error("Gửi tin nhắn thất bại!");
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        width: "350px",
        height: "500px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1001,
        border: "1px solid #e1e5e9",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e1e5e9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={imge_bot} size={32} />
          <span style={{ marginLeft: "8px", fontWeight: "bold" }}>
            Chatbot AI
          </span>
        </div>
        <div>
          <Button
            type="text"
            size="small"
            onClick={onClose}
            style={{ padding: "4px" }}
          >
            <UnorderedListOutlined />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={onClose}
            style={{ padding: "4px" }}
          >
            <CloseOutlined />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {loadingHistory ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Đang tải lịch sử chat...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender.id === 0 ? "flex-start" : "flex-end",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "8px 12px",
                  borderRadius: "18px",
                  backgroundColor: msg.sender.id === 0 ? "#f0f2f5" : "#0084ff",
                  color: msg.sender.id === 0 ? "#000" : "#fff",
                  wordWrap: "break-word",
                }}
              >
                <div style={{ fontSize: "14px" }}>{msg.content}</div>
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                    marginTop: "4px",
                    textAlign: "right",
                  }}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e1e5e9",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #e1e5e9",
            borderRadius: "20px",
            outline: "none",
          }}
          disabled={loading}
        />
        <Button
          type="primary"
          onClick={handleSend}
          loading={loading}
          disabled={!input.trim()}
          style={{ borderRadius: "50%", width: "36px", height: "36px" }}
        >
          ➤
        </Button>
      </div>
    </div>
  );
}

export default ModalChatbotAI;
