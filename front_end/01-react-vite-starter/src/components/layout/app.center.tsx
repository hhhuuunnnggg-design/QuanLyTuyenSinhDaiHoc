// app.left.tsx
import { createPostAPI, fetchAllPostsAPI } from "@/services/api";
import {
  CommentOutlined,
  LikeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Layout, Spin, message } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./app.center.scss";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

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
  const headerStyle: React.CSSProperties = {
    // textAlign: 'center',
    // color: '#fff',
    // height: 64,
    // paddingInline: 48,
    // lineHeight: '64px',
    // backgroundColor: '#4096ff',
  };

  const contentStyle: React.CSSProperties = {
    textAlign: "center",
    minHeight: 120,
    lineHeight: "120px",
    color: "#fff",
    backgroundColor: "#0958d9",
  };

  const siderStyle: React.CSSProperties = {
    textAlign: "center",
    lineHeight: "120px",
    color: "#fff",
    backgroundColor: "#1677ff",
  };

  const footerStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#4096ff",
  };

  const layoutStyle = {
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const file = values.file?.fileList?.[0]?.originFileObj;
      const res = await createPostAPI({
        content: values.content,
        userId: values.userId,
        file,
      });
      message.success("Tạo bài viết thành công!");
      console.log("API response:", res);
    } catch (err) {
      message.error("Tạo bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Ví dụ: hardcode content và userId, bạn có thể lấy từ state/form
    try {
      await createPostAPI({
        content: "Up avatar mới",
        userId: 47, // hoặc lấy từ user đang đăng nhập
        file,
      });
      message.success("Upload thành công!");
    } catch {
      message.error("Upload thất bại!");
    }
  };

  return (
    <div className={className}>
      <Layout style={layoutStyle}>
        <Content style={headerStyle}>
          <Layout>
            <Sider width="25%" style={siderStyle}>
              <Link to="/" className="logo">
                <title>Facebook</title>
                <img
                  style={{ width: "40px", height: "40px" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
                  alt=""
                />
              </Link>
            </Sider>
            <Content style={contentStyle}>
              <input
                className="input-search"
                type="text"
                placeholder="Tìm kiếm trên Facebook"
              />
            </Content>
          </Layout>
        </Content>

        <Layout>
          <Sider width="25%" style={siderStyle}>
            Sider
          </Sider>
          <Content style={contentStyle}>
            <Upload
              showUploadList={false}
              customRequest={async ({ file }) => {
                try {
                  await createPostAPI({
                    content: "Up avatar mới",
                    userId: 47,
                    file: file as File,
                  });
                  message.success("Upload thành công!");
                } catch {
                  message.error("Upload thất bại!");
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Up Avatar</Button>
            </Upload>
          </Content>
          <Sider width="25%" style={siderStyle}>
            Sider
          </Sider>
        </Layout>
      </Layout>

      <div className="facebook-post-list" style={{ width: "100%" }}>
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
