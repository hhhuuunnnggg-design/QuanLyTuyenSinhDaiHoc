import { useCurrentApp } from "@/components/context/app.context";
import { createPostAPI } from "@/services/api";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp } from "antd";
import { Divider, Modal, Upload, UploadProps, message } from "antd";
import { Image, UploadFile } from "antd/lib";
import React, { useState } from "react";

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
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
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
      title="Tạo bài viết"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <textarea
        placeholder="Mời bạn nhập nội dung"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", minHeight: 80, marginBottom: 12 }}
      />
      <Divider />
      <>
        <p>Mời bạn tải ảnh lên</p>
        <Upload
          action=""
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={() => false}
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
      </>
    </Modal>
  );
};

export default ModalUpload;
