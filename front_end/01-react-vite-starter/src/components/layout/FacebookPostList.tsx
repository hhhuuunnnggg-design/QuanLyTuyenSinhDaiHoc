import { createCommentAPI, fetchCommentsByPostAPI } from "@/api";
import { useCommentSocket } from "@/hooks/useCommentSocket";
import {
  CloseOutlined,
  CommentOutlined,
  LikeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Input, Modal, Spin, message } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { FaEarthAmericas } from "react-icons/fa6";
import { useCurrentApp } from "../context/app.context";
import "./FacebookPostList.scss";

interface Comment {
  id: string | number;
  user: {
    avatar?: string;
    fullname?: string;
  };
  content: string;
  createdAt: string;
}

interface User {
  id: number;
  avatar?: string;
  fullname?: string;
}

interface Post {
  id: string | number;
  user: User;
  createdAt: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface FacebookPostListProps {
  posts: Post[];
  loading: boolean;
}

const FacebookPostList: React.FC<FacebookPostListProps> = ({
  posts,
  loading,
}) => {
  const { user } = useCurrentApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<number, Comment[]>>({});

  // Khi mở modal, load comment thật từ API
  const handleComment = async (postId: number) => {
    setCurrentPostId(postId);
    setIsModalVisible(true);
    try {
      const res = await fetchCommentsByPostAPI(postId);
      setComments((prev) => ({
        ...prev,
        [postId]: res.data || [],
      }));
    } catch (err) {
      message.error("Không thể tải bình luận!");
    }
  };

  // Gửi comment mới
  const handleOk = async () => {
    if (!currentPostId || !user?.id || !comment.trim()) return;
    try {
      await createCommentAPI(currentPostId, user.id, comment.trim());
      setComment("");
      // Không cần reload, sẽ nhận qua socket
    } catch (err) {
      message.error("Gửi bình luận thất bại!");
    }
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setComment("");
    setCurrentPostId(null);
  };
  // --- Hook nhận comment realtime ---
  useCommentSocket(currentPostId, (data) => {
    const newComment = data.comment || data.data;

    if (data.type === "NEW_COMMENT" && newComment?.content) {
      setComments((prev) => ({
        ...prev,
        [currentPostId!]: [...(prev[currentPostId!] || []), newComment],
      }));
    }
  });

  return (
    <div className="facebook-post-list">
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : posts.length === 0 ? (
        <Empty description="Không có bài viết nào" className="empty-state" />
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="facebook-post">
            <div className="facebook-post__header">
              <Avatar
                className="facebook-post__avatar"
                src={post.user.avatar || undefined}
                size={40}
              >
                {post.user.fullname?.[0] || "U"}
              </Avatar>
              <div className="header-info">
                <h4 className="post-name">{post.user.fullname}</h4>
                <div className="post-meta">
                  <span className="post-date">
                    {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm")}{" "}
                    <FaEarthAmericas />
                  </span>
                </div>
              </div>
              <Button
                type="text"
                className="more-actions"
                icon={<FaEllipsisH />}
                aria-label="Hành động ba chấm với bài viết này"
              />
              <Button
                type="text"
                className="more-actions"
                icon={<CloseOutlined />}
                aria-label="Hành động xóa bài viết này"
              />
            </div>
            <div className="facebook-post__content">
              <p>{post.content}</p>
              {post.imageUrl && (
                <div className="post-image-container">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="post-image"
                  />
                </div>
              )}
              {post.videoUrl && (
                <div className="post-video-container">
                  <video controls src={post.videoUrl} className="post-video" />
                </div>
              )}
            </div>
            <div className="facebook-post__reactions">
              {/* ... giữ nguyên các reaction ... */}
            </div>
            <div className="facebook-post__stats">
              <span>{comments[post.id as number]?.length || 0} bình luận</span>{" "}
              · <span>211 lượt chia sẻ</span>
            </div>
            <div className="facebook-post__actions">
              <Button
                type="text"
                icon={<LikeOutlined />}
                className="action-button"
              >
                Thích
              </Button>
              <Button
                type="text"
                icon={<CommentOutlined />}
                className="action-button"
                onClick={() => handleComment(post.id as number)}
              >
                Bình luận
              </Button>
              <Button
                type="text"
                icon={<RollbackOutlined />}
                className="action-button"
              >
                Chia sẻ
              </Button>
            </div>
          </Card>
        ))
      )}
      <Modal
        title="Bình luận."
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Đăng123"
        cancelText="Hủy"
      >
        <div
          className="comment-list"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            marginBottom: "16px",
          }}
        >
          {(comments[currentPostId!] || []).length > 0 ? (
            comments[currentPostId!].map((comment) => (
              <div
                key={comment.id}
                className="comment-item"
                style={{ marginBottom: "12px" }}
              >
                <Avatar
                  src={comment.user.avatar || undefined}
                  size={32}
                  style={{ marginRight: "8px" }}
                >
                  {comment.user.fullname?.[0] || "U"}
                </Avatar>
                <div>
                  <strong>{comment.user.fullname}</strong>

                  <p>
                    {comment.content}

                    <Button
                      style={{ float: "right", marginRight: "100px" }}
                      type="text"
                      className="more-actions"
                      icon={<FaEllipsisH />}
                      aria-label="Hành động ba chấm với bài viết này"
                    />
                  </p>

                  <span style={{ color: "#888" }}>
                    {dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Chưa có bình luận nào.</p>
          )}
        </div>
        <Input.TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Viết bình luận của bạn..."
        />
      </Modal>
    </div>
  );
};

export default FacebookPostList;
