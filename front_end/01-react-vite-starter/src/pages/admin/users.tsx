import Restricted from "@/components/common/restricted";
import { useCurrentApp } from "@/components/context/app.context";
import {
  changeUserActivityAPI,
  createUserAPI,
  deleteUserAPI,
  updateUserAPI,
} from "@/services/api";
import axios from "@/services/axios.customize";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import {
  Avatar,
  Button,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tag,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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

const UsersPage = () => {
  const { user } = useCurrentApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const actionRef = useRef<any>();
  const [roleEnum, setRoleEnum] = useState<Record<string, { text: string }>>(
    {}
  );

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await axios.get("/api/v1/roles/fetch-all", {
          params: { page: 1, size: 100 },
        });
        const roles = res.data?.result || [];

        const enumData: Record<string, { text: string }> = {};
        roles.forEach((role: any) => {
          enumData[role.name] = { text: role.name };
        });

        setRoleEnum(enumData); // ✅ cập nhật valueEnum
      } catch (error) {
        console.error("Lỗi khi lấy danh sách roles:", error);
      }
    }

    fetchRoles();
  }, []);

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
    }
  }, [user]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hideInSearch: true,
    },
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      hideInSearch: true,
      width: 80,
      render: (avatar: string, record: IUserData) => {
        if (avatar) {
          return (
            <Image
              width={48}
              height={48}
              src={avatar}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #f0f0f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              //preview={{}}
              fallback="https://scontent.fsgn5-14.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeEcaJ2EWO-Y97M0W_twzJFDWt9TLzuBU1Ba31MvO4FTUJeQc-rZrByTKQxfnhpH7E1mwB5YcCUfBjeNd_PoRyN4&_nc_ohc=262Ge7eTFLwQ7kNvwExhYDu&_nc_oc=AdmTVjb4wkGSVv7F3xl_mX27CJuhgWoiBKzhWdIgbrlywYRJTY99hdPBKzbHMfH4QiI3rXWF9MBGBYiUh715dzsE&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&oh=00_AfQF0Mclro7BXOHaaeXFVFAWDumrLS93NhXoDam6IQjcrA&oe=68A1283A"
            />
          );
        }
        // Fallback: Avatar với chữ cái đầu
        return (
          <Avatar
            size={48}
            style={{
              backgroundColor: "#1890ff",
              color: "white",
              fontWeight: "bold",
              fontSize: "20px",
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {record.email?.[0]?.toUpperCase() ?? "U"}
          </Avatar>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      copyable: true,
      key: "email",
    },

    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      hideInSearch: true,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      hideInSearch: true,
    },
    {
      title: "Vai trò",
      dataIndex: ["role", "name"],
      key: "role",
      valueType: "select" as const,
      valueEnum: roleEnum,
    },
    {
      title: "Trạng thái",
      dataIndex: "blocked",
      key: "blocked",
      hideInSearch: true,
      render: (blocked: boolean) => (
        <Tag color={blocked ? "red" : "green"}>
          {blocked ? "Bị khóa" : "Hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      hideInSearch: true,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      hideInSearch: true,
      render: (_: any, record: any) => (
        <Space>
          <Restricted permission="/api/v1/users/{id}" method="PUT">
            <Button
              className="edit-user"
              style={{
                backgroundColor: "rgb(255 200 53)", // màu cam đậm (Ant Design orange-6)
                borderColor: "rgb(255 200 53)",
                color: "white",
              }}
              type="primary"
              size="small"
              onClick={() => handleEdit(record)}
            >
              <EditOutlined />
            </Button>
          </Restricted>
          <Restricted
            permission="/api/v1/users/changeActivity/{id}"
            method="PUT"
          >
            {record.blocked ? (
              <Button
                type="primary"
                size="small"
                danger
                onClick={() => handleChangeActivity(record.id, record.blocked)}
              >
                <FaEyeSlash />
              </Button>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => handleChangeActivity(record.id, record.blocked)}
              >
                <FaEye />
              </Button>
            )}
          </Restricted>
          <Restricted permission="/api/v1/users/{id}" method="DELETE">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="primary" danger size="small">
                <DeleteOutlined />
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
    console.log("handleEdit", user.blocked);
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

  const handleChangeActivity = async (
    userId: number,
    currentStatus: boolean
  ) => {
    try {
      await changeUserActivityAPI(userId);
      const action = currentStatus ? "mở khóa" : "khóa";
      message.success(`${action} tài khoản thành công!`);
      // Refresh table
      actionRef.current?.reload();
    } catch (error: any) {
      message.error("Thay đổi trạng thái tài khoản thất bại!");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<IUserData>
        actionRef={actionRef}
        columns={columns as any}
        request={async (params) => {
          try {
            // Xây dựng mảng filter
            const filters: string[] = [];

            if (params.email) {
              filters.push(`email~'${params.email}'`);
            }

            if (params.role) {
              // Tìm kiếm chính xác role name
              filters.push(`role.name~'${params.role}'`);
            }

            const requestParams = {
              page: params.current,
              size: params.pageSize,
              filter: filters,
            };

            console.log("Request params:", requestParams);
            console.log("Filters:", filters);

            const res = await axios.get("/api/v1/users/fetch-all", {
              params: requestParams,
              paramsSerializer: (params) => {
                const query = new URLSearchParams();
                query.append("page", params.page);
                query.append("size", params.size);
                params.filter?.forEach((f: any) => query.append("filter", f));
                return query.toString();
              },
            });

            console.log("Users API response:", res);
            console.log("Response data:", res.data);
            console.log("Response result:", res.data?.result);
            console.log("Response meta:", res.data?.meta);

            if (res && res.data) {
              const resultData = res.data.result || [];
              const totalCount = res.data.meta?.total || 0;

              console.log("Final result data:", resultData);
              console.log("Final total count:", totalCount);

              return {
                data: resultData,
                total: totalCount,
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
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
          searchText: "Tìm kiếm",
          resetText: "Làm mới",
        }}
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
