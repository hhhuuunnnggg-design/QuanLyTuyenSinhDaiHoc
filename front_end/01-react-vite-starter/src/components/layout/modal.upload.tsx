import { createPostAPI } from "@/api";
import { useCurrentApp } from "@/components/context/app.context";
import {
  EnvironmentOutlined,
  PlusOutlined,
  SmileOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { GetProp } from "antd";
import { Avatar, Divider, Modal, Upload, UploadProps, message } from "antd";
import { Image, UploadFile } from "antd/lib";
import React, { useState } from "react";
import "./ModalUpload.scss";

interface ModalUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ModalUpload: React.FC<ModalUploadProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useCurrentApp();

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <div className="upload-button">
      <PlusOutlined />
      <div>Ảnh/Video</div>
    </div>
  );

  const handleSubmit = async () => {
    if (!content.trim()) {
      message.warning("Vui lòng nhập nội dung bài viết!");
      return;
    }
    if (!user?.id) {
      message.error("Không tìm thấy thông tin user!");
      return;
    }
    setLoading(true);
    try {
      const file = fileList[0]?.originFileObj;
      await createPostAPI({
        content,
        userId: user.id,
        file: file as File | undefined,
      });
      message.success("Đăng bài thành công!");
      setContent("");
      setFileList([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Đăng bài thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="modal-header">
          <h2>Tạo bài viết</h2>
        </div>
      }
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Đăng"
      cancelText="Hủy"
      width={520}
      centered
      className="post-modal"
    >
      <div className="user-info">
        <Avatar
          src={
            user?.avatar ||
            "https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=262Ge7eTFLwQ7kNvwF8PpTe&_nc_oc=AdlBMf4kbbKKgwkljQi9ZwvF1XWbT-H3hzjC8qM6c1SiS_9LBWZ0DrCLs-5PezUAQEtbFfI6fLYOFibxDh_i-mY4&_nc_zt=24&_nc_ht=scontent.fsgn5-10.fna&oh=00_AfQyMtxGUfKX2p2Tutp5reEau2n3TnF5A8Lz80vkHCdG6A&oe=68A1607A"
          }
          size={40}
        />
        <div className="user-details">
          <span className="user-name">{user?.fullname}</span>
          <span className="privacy-option">Bạn bè</span>
        </div>
      </div>
      <textarea
        placeholder="Hùng ơi, bạn đang nghĩ gì thế?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="content-input"
      />
      <Divider />
      <div className="media-upload">
        <Upload
          action=""
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={() => false}
          accept="image/*,video/*"
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </div>
      <Divider />
      <div className="action-buttons">
        <span className="action-button" title="Biểu tượng cảm xúc">
          <SmileOutlined />
        </span>
        <span className="action-button" title="Gắn thẻ người khác">
          <TagOutlined />
        </span>
        <span className="action-button" title="Check in">
          <EnvironmentOutlined />
        </span>
      </div>
    </Modal>
  );
};

export default ModalUpload;
