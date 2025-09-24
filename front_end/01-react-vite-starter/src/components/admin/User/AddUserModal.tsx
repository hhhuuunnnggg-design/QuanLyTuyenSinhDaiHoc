import { createUserAPI } from "@/services/api";
import { Form, Input, message, Modal, Select } from "antd";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal = ({ isOpen, onClose, onSuccess }: AddUserModalProps) => {
  const [form] = Form.useForm();

  const handleCreateUser = async (values: any) => {
    try {
      await createUserAPI(values);
      message.success("Tạo người dùng thành công!");
      onClose();
      form.resetFields();
      onSuccess();
      return true;
    } catch (error: any) {
      message.error(error.message || "Tạo người dùng thất bại!");
      return false;
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Tạo người dùng mới"
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleCreateUser}>
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
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu..." />
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

export default AddUserModal;
