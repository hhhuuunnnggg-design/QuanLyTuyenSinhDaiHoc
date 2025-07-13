import Restricted from "@/components/common/restricted";
import { useCurrentApp } from "@/components/context/app.context";
import { createUserAPI, deleteUserAPI, updateUserAPI } from "@/services/api";
import axios from "@/services/axios.customize";
import ProTable from "@ant-design/pro-table";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {
  const { user } = useCurrentApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const actionRef = useRef<any>();

  useEffect(() => {
    console.log("UsersPage - User:", user);
    console.log("UsersPage - User role:", user?.role);
    console.log("UsersPage - User permissions:", user?.role?.permissions);

    // Debug permission checks
    if (user?.role?.permissions) {
      const hasUpdatePermission = user.role.permissions.some(
        (p) => p.apiPath === "/api/v1/users/{id}" && p.method === "PUT"
      );
      const hasDeletePermission = user.role.permissions.some(
        (p) => p.apiPath === "/api/v1/users/{id}" && p.method === "DELETE"
      );
      console.log("UsersPage - Has update permission:", hasUpdatePermission);
      console.log("UsersPage - Has delete permission:", hasDeletePermission);
    }
  }, [user]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Restricted permission="/api/v1/users/{id}" method="PUT">
            <Button
              type="primary"
              size="small"
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
          </Restricted>
          <Restricted permission="/api/v1/users/{id}" method="DELETE">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" danger size="small">
                Xóa
              </Button>
            </Popconfirm>
          </Restricted>
        </Space>
      ),
    },
  ];

  const handleCreateUser = async (values: any) => {
    try {
      await createUserAPI(values);
      message.success("Tạo người dùng thành công!");
      setIsModalOpen(false);
      form.resetFields();
      // Refresh table
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      message.error(error.mesage || "Tạo người dùng thất bại!");
      return false;
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      email: user.email,
      firstName: user.fullname?.split(" ")[0] || "",
      lastName: user.fullname?.split(" ").slice(1).join(" ") || "",
      gender: user.gender,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      await updateUserAPI(editingUser.id, values);
      message.success("Cập nhật người dùng thành công!");
      setIsEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();
      // Refresh table
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.mesage || "Cập nhật người dùng thất bại!");
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUserAPI(userId);
      message.success("Xóa người dùng thành công!");
      // Refresh table
      actionRef.current?.reload();
    } catch (error: any) {
      message.error("Xóa người dùng thất bại!");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<IUserData>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const res = await axios.get("/api/v1/users/fetch-all", {
              params: {
                current: params.current,
                pageSize: params.pageSize,
              },
            });

            console.log("Users API response:", res);

            if (res && res.data) {
              return {
                data: res.data.result || [],
                total: res.data.meta?.total || 0,
                success: true,
              };
            }

            return {
              data: [],
              total: 0,
              success: false,
            };
          } catch (error) {
            console.error("Users API error:", error);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
        }}
        search={false}
        toolBarRender={() => [
          <Restricted key="create" permission="/api/v1/users/add-user">
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Thêm người dùng
            </Button>
          </Restricted>,
        ]}
      />

      {/* Create User Modal */}
      <Modal
        title="Tạo người dùng mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="firstName"
            label="Họ"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select>
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Sửa người dùng"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUser}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="firstName"
            label="Họ"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select>
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
