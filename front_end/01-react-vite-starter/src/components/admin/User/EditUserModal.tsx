import { updateUserAPI } from "@/services/api";
import { Form, Input, message, Modal, Select } from "antd";
import { useEffect } from "react";

interface IUserData {
  id: number;
  email: string;
  fullname: string;
  gender: string;
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
  avatar?: string;
  coverPhoto?: string;
  dateOfBirth?: string;
  work?: string;
  education?: string;
  currentCity?: string;
  hometown?: string;
  bio?: string;
  isBlocked: boolean;
  isAdmin: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser: IUserData | null;
}

const EditUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
}: EditUserModalProps) => {
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (editingUser && isOpen) {
      editForm.setFieldsValue({
        email: editingUser.email,
        firstName: editingUser.fullname?.split(" ")[0] || "",
        lastName: editingUser.fullname?.split(" ").slice(1).join(" ") || "",
        gender: editingUser.gender,
      });
    }
  }, [editingUser, isOpen, editForm]);

  const handleUpdateUser = async (values: any) => {
    if (!editingUser) return;

    try {
      await updateUserAPI(editingUser.id, values);
      message.success("Cập nhật người dùng thành công!");
      onClose();
      editForm.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error.message || "Cập nhật người dùng thất bại!");
    }
  };

  const handleCancel = () => {
    editForm.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Sửa người dùng"
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => editForm.submit()}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form form={editForm} layout="vertical" onFinish={handleUpdateUser}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email..." />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="Họ"
          rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
        >
          <Input placeholder="Nhập họ..." />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
        >
          <Input placeholder="Nhập tên..." />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính...">
            <Select.Option value="MALE">Nam</Select.Option>
            <Select.Option value="FEMALE">Nữ</Select.Option>
            <Select.Option value="OTHER">Khác</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
