import {
  CloseOutlined,
  CommentOutlined,
  LikeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Input, Modal, Spin } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import "./FacebookPostList.scss";

interface Comment {
  id: string | number;
  user: User;
  content: string;
  createdAt: string;
}

interface User {
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
  comments?: Comment[];
}

const fakeComments: Comment[] = [
  {
    id: 1,
    user: {
      avatar: "https://example.com/avatar1.jpg",
      fullname: "Nguyễn Văn A",
    },
    content: "Bài viết hay quá! 😊",
    createdAt: "2025-07-22T18:00:00",
  },
  {
    id: 2,
    user: {
      avatar: "https://example.com/avatar2.jpg",
      fullname: "Trần Thị B",
    },
    content: "Cảm ơn bạn đã chia sẻ! 🔥",
    createdAt: "2025-07-22T18:15:00",
  },
  {
    id: 3,
    user: {
      avatar: "https://example.com/avatar3.jpg",
      fullname: "Lê Văn C",
    },
    content: "Haha, cái này vui thật! 😂",
    createdAt: "2025-07-22T18:30:00",
  },
];

const fakePosts: Post[] = [
  {
    id: 1,
    user: {
      avatar: "https://example.com/avatar4.jpg",
      fullname: "Phạm Minh D",
    },
    createdAt: "2025-07-22T17:00:00",
    content: "Hôm nay là một ngày tuyệt vời!",
    imageUrl: "https://example.com/post-image.jpg",
    comments: fakeComments,
  },
  {
    id: 2,
    user: {
      avatar: "https://example.com/avatar5.jpg",
      fullname: "Hoàng Thị E",
    },
    createdAt: "2025-07-22T16:30:00",
    content: "Ai thích xem video này không? 🎥",
    videoUrl: "https://example.com/post-video.mp4",
    comments: [],
  },
];

interface FacebookPostListProps {
  posts: Post[];
  loading: boolean;
}

const FacebookPostList: React.FC<FacebookPostListProps> = ({
  posts = fakePosts,
  loading,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | number | null>(
    null
  );
  const [comment, setComment] = useState("");

  const handleComment = (postId: string | number) => {
    setCurrentPostId(postId);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log(`Bình luận cho bài viết ${currentPostId}: ${comment}`);
    setIsModalVisible(false);
    setComment("");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setComment("");
  };

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
                    {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm")} ·{" "}
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
              <span className="reaction-item">
                <img
                  className="reaction-icon"
                  src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M16.0001 7.9996c0 4.418-3.5815 7.9996-7.9995 7.9996S.001 12.4176.001 7.9996 3.5825 0 8.0006 0C12.4186 0 16 3.5815 16 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.5'/%3E%3Cpath d='M7.3014 3.8662a.6974.6974 0 0 1 .6974-.6977c.6742 0 1.2207.5465 1.2207 1.2206v1.7464a.101.101 0 0 0 .101.101h1.7953c.992 0 1.7232.9273 1.4917 1.892l-.4572 1.9047a2.301 2.301 0 0 1-2.2374 1.764H6.9185a.5752.5752 0 0 1-.5752-.5752V7.7384c0-.4168.097-.8278.2834-1.2005l.2856-.5712a3.6878 3.6878 0 0 0 .3893-1.6509l-.0002-.4496ZM4.367 7a.767.767 0 0 0-.7669.767v3.2598a.767.767 0 0 0 .767.767h.767a.3835.3835 0 0 0 .3835-.3835V7.3835A.3835.3835 0 0 0 5.134 7h-.767Z' fill='%23fff'/%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(90 .0005 8) scale(7.99958)'%3E%3Cstop offset='.5618' stop-color='%230866FF' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%230866FF' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5257 10.9237) scale(10.1818)'%3E%3Cstop offset='.3143' stop-color='%2302ADFC'/%3E%3Cstop offset='1' stop-color='%2302ADFC' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.3989' y1='2.3999' x2='13.5983' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2302ADFC'/%3E%3Cstop offset='.5' stop-color='%230866FF'/%3E%3Cstop offset='1' stop-color='%232B7EFF'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"
                  alt="Thích"
                />
                6.9K
              </span>
              <span className="reaction-item">
                <img
                  className="reaction-icon"
                  src="data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cg clip-path='url(%23clip0_15251_63610)'%3E%3Cpath d='M15.9953 7.9996c0 4.418-3.5816 7.9996-7.9996 7.9996S-.004 12.4176-.004 7.9996 3.5776 0 7.9957 0c4.418 0 7.9996 3.5815 7.9996 7.9996Z' fill='url(%23paint0_linear_15251_63610)'/%3E%3Cpath d='M15.9973 7.9992c0 4.4178-3.5811 7.9992-7.9987 7.9992C3.5811 15.9984 0 12.417 0 7.9992S3.5811 0 7.9986 0c4.4176 0 7.9987 3.5814 7.9987 7.9992Z' fill='url(%23paint1_radial_15251_63610)'/%3E%3Cpath d='M15.9953 7.9996c0 4.418-3.5816 7.9996-7.9996 7.9996S-.004 12.4176-.004 7.9996 3.5776 0 7.9957 0c4.418 0 7.9996 3.5815 7.9996 7.9996Z' fill='url(%23paint2_radial_15251_63610)' fill-opacity='.8'/%3E%3Cpath d='M12.5278 8.1957c.4057.1104.6772.4854.623.9024-.3379 2.6001-2.5167 4.9012-5.1542 4.9012s-4.8163-2.3011-5.1542-4.9012c-.0542-.417.2173-.792.623-.9024.8708-.237 2.5215-.596 4.5312-.596 2.0098 0 3.6605.359 4.5312.596Z' fill='%234B280E'/%3E%3Cpath d='M11.5809 12.3764c-.9328.9843-2.1948 1.6228-3.5841 1.6228-1.3892 0-2.6512-.6383-3.5839-1.6225a.5425.5425 0 0 0-.016-.0174c.4475-1.0137 2.2-1.3599 3.5999-1.3599 1.4 0 3.1514.3468 3.5998 1.3599l-.0157.0171Z' fill='url(%23paint3_linear_15251_63610)'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M13.3049 5.8793c.1614-1.1485-.6387-2.2103-1.7872-2.3717l-.0979-.0138c-1.1484-.1614-2.2103.6388-2.3717 1.7872l-.0163.1164a.5.5 0 0 0 .9902.1392l.0163-.1164c.0846-.6016.6408-1.0207 1.2424-.9362l.0978.0138c.6016.0845 1.0207.6407.9362 1.2423l-.0164.1164a.5.5 0 0 0 .9903.1392l.0163-.1164ZM2.6902 5.8793c-.1614-1.1485.6387-2.2103 1.7872-2.3717l.0979-.0138c1.1484-.1614 2.2103.6388 2.3717 1.7872l.0164.1164a.5.5 0 1 1-.9903.1392l-.0163-.1164c-.0846-.6016-.6408-1.0207-1.2423-.9362l-.098.0138c-.6015.0845-1.0206.6407-.936 1.2423l.0163.1164a.5.5 0 0 1-.9902.1392l-.0164-.1164Z' fill='%231C1C1D'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint1_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='matrix(0 7.9992 -7.99863 0 7.9986 7.9992)'%3E%3Cstop offset='.5637' stop-color='%23FF5758' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23FF5758' stop-opacity='.1'/%3E%3C/radialGradient%3E%3CradialGradient id='paint2_radial_15251_63610' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='rotate(45 -4.5272 10.9202) scale(10.1818)'%3E%3Cstop stop-color='%23FFF287'/%3E%3Cstop offset='1' stop-color='%23FFF287' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='paint0_linear_15251_63610' x1='2.396' y1='2.3999' x2='13.5954' y2='13.5993' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FFF287'/%3E%3Cstop offset='1' stop-color='%23F68628'/%3E%3C/linearGradient%3E%3ClinearGradient id='paint3_linear_15251_63610' x1='5.1979' y1='10.7996' x2='5.245' y2='14.2452' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23FF60A4'/%3E%3Cstop offset='.2417' stop-color='%23FA2E3E'/%3E%3Cstop offset='1' stop-color='%23BC0A26'/%3E%3C/linearGradient%3E%3CclipPath id='clip0_15251_63610'%3E%3Cpath fill='%23fff' d='M-.002 0h16v15.9992h-16z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"
                  alt="Haha"
                />
                3.8K
              </span>
              <span className="reaction-total">Ngọc Hân và 10K người khác</span>
            </div>
            <div className="facebook-post__stats">
              <span>{post.comments?.length || 0} bình luận</span> ·{" "}
              <span>211 lượt chia sẻ</span>
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
                onClick={() => handleComment(post.id)}
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
        title="Bình luận"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Đăng"
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
          {posts
            .find((post) => post.id === currentPostId)
            ?.comments?.map((comment) => (
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
                  <span style={{ marginLeft: "8px", color: "#888" }}>
                    {dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                  <p>{comment.content}</p>
                </div>
              </div>
            )) || <p>Chưa có bình luận nào.</p>}
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
