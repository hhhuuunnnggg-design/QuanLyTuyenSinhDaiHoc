// app.left.tsx
import { fetchAllPostsAPI } from "@/services/api";
import {
  CommentOutlined,
  LikeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "./app.center.scss";

const AppCenter = ({ className }: { className?: string }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAllPostsAPI()
      .then((res) => {
        if (res?.data?.result) {
          setPosts(res.data.result);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={className}>
      <div className="facebook-post-list">
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "40px auto" }}
          />
        ) : posts.length === 0 ? (
          <Empty description="Không có bài viết nào" />
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="facebook-post"
              style={{ marginBottom: 24 }}
            >
              {/*header  */}
              <div className="facebook-post__header">
                <Avatar
                  className="facebook-post__avatar"
                  src={post.user.avatar || undefined}
                  style={{ background: "#87d068" }}
                >
                  {post.user.fullname?.[0] || "U"}
                </Avatar>
                <div className="facebook-post__header-info">
                  <span className="facebook-post__name">
                    {post.user.fullname}
                  </span>
                  <span className="facebook-post__date">
                    {dayjs(post.createdAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </div>
              <div className="facebook-post__content">
                <p>{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }}
                  />
                )}
                {post.videoUrl && (
                  <video
                    controls
                    src={post.videoUrl}
                    style={{ maxWidth: "100%", marginTop: 8 }}
                  />
                )}
              </div>
              {/*footer  */}
              <div className="facebook-post__footer">
                <div className="facebook-post__reactions">
                  <span role="img" aria-label="haha">
                    😂
                  </span>{" "}
                  15K
                </div>
                <div className="facebook-post__stats">
                  <span>676 bình luận</span>
                  <span> · </span>
                  <span>200 lượt chia sẻ</span>
                </div>
                <div
                  className="facebook-post__actions"
                  style={{
                    borderTop: "1px solid #eee",
                    marginTop: "50px",
                    paddingTop: "8px",
                  }}
                >
                  <button>
                    <LikeOutlined />
                  </button>

                  <button>
                    <CommentOutlined />
                  </button>
                  <button>
                    <RollbackOutlined />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AppCenter;
