import { createPostAPI, fetchAllPostsAPI } from "@/services/api";
import { Avatar, Button, Card, Divider, Input, Layout, message } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";
import "./app.center.scss";
import FacebookPostList from "./FacebookPostList";
import ModalUpload from "./modal.upload";

const { TextArea } = Input;

const AppCenter = ({ className }: { className?: string }) => {
  const { user } = useCurrentApp();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const openUploadModal = () => setIsUploadModalOpen(true);
  const closeUploadModal = () => setIsUploadModalOpen(false);

  const handleReloadPosts = () => {
    fetchAllPostsAPI().then((res) => {
      if (res?.data?.result) {
        setPosts(res.data.result);
      }
    });
  };

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
      handleReloadPosts();
    } catch (err) {
      message.error("Tạo bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const layoutStyle: React.CSSProperties = {
    borderRadius: 8,
    overflow: "hidden",
    width: "100%",
    backgroundColor: "#fff",
  };

  const contentStyle: React.CSSProperties = {
    textAlign: "center",
    // backgroundColor: "#fff",
    backgroundColor: "rgb(240, 242, 245)",
    padding: "16px",
  };
  return (
    <div className={className}>
      <Layout className="app-center-content" style={layoutStyle}>
        <Content style={contentStyle}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Card
              style={{
                borderRadius: 8,
                marginBottom: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Link to="/">
                  <Avatar
                    size={40}
                    src={
                      user?.avatar ||
                      "https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=262Ge7eTFLwQ7kNvwF8PpTe&_nc_oc=AdlBMf4kbbKKgwkljQi9ZwvF1XWbT-H3hzjC8qM6c1SiS_9LBWZ0DrCLs-5PezUAQEtbFfI6fLYOFibxDh_i-mY4&_nc_zt=24&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfQyMtxGUfKX2p2Tutp5reEau2n3TnF5A8Lz80vkHCdG6A&oe=68A1607A"
                    }
                  />
                </Link>
                <TextArea
                  placeholder="Hùng ơi, bạn đang nghĩ gì thế?"
                  autoSize={{ minRows: 2 }}
                  style={{
                    borderRadius: 20,
                    marginLeft: 12,
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#f0f2f5",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={openUploadModal}
                  readOnly
                />
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  type="text"
                  icon={
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/v4/yr/r/c0dWho49-X3.png"
                      alt=""
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onClick={openUploadModal}
                >
                  Video trực tiếp
                </Button>
                <Button
                  type="text"
                  icon={
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/v4/y7/r/Ivw7nhRtXyo.png"
                      alt=""
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  onClick={openUploadModal}
                >
                  Ảnh/Video
                </Button>
                <Button
                  type="text"
                  icon={
                    <img
                      src="https://static.xx.fbcdn.net/rsrc.php/v4/yd/r/Y4mYLVOhTwq.png"
                      alt=""
                      style={{ width: 24, height: 24 }}
                    />
                  }
                >
                  Cảm xúc/hoạt động
                </Button>
              </div>
            </Card>

            <ModalUpload
              isOpen={isUploadModalOpen}
              onClose={closeUploadModal}
              onSuccess={handleReloadPosts}
            />

            <FacebookPostList posts={posts} loading={loading} />
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default AppCenter;
