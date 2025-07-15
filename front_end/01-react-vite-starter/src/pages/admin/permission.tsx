import {
  createPermissionAPI,
  deletePermissionAPI,
  fetchAllPermissionsAPI,
  updatePermissionAPI,
} from "@/services/api";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
import { useRef, useState } from "react";

interface IPermission {
  id: number;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  createdAt: string;
}

const PermissionPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<IPermission | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const actionRef = useRef<any>();
  const [methodOptions, setMethodOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      hideInSearch: true,
    },
    {
      title: "Tên quyền",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "API Path",
      dataIndex: "apiPath",
      key: "apiPath",
      hideInSearch: true,
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      valueType: "select" as const,
      valueEnum: methodOptions.reduce(
        (acc, option) => ({
          ...acc,
          [option.value]: { text: option.label },
        }),
        {}
      ),
    },
    {
      title: "Module",
      dataIndex: "module",
      copyable: true,
      key: "module",
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
      render: (_: any, record: IPermission) => (
        <Space>
          <Button
            style={{
              backgroundColor: "rgb(255 200 53)",
              borderColor: "rgb(255 200 53)",
              color: "white",
            }}
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa quyền này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger size="small">
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreatePermission = async (values: any) => {
    try {
      await createPermissionAPI(values);
      message.success("Tạo quyền thành công!");
      setIsModalOpen(false);
      form.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      message.error(error.message || "Tạo quyền thất bại!");
      return false;
    }
  };

  const handleEdit = (permission: IPermission) => {
    setEditingPermission(permission);
    editForm.setFieldsValue({
      name: permission.name,
      apiPath: permission.apiPath,
      method: permission.method,
      module: permission.module,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePermission = async (values: any) => {
    try {
      await updatePermissionAPI(editingPermission!.id, values);
      message.success("Cập nhật quyền thành công!");
      setIsEditModalOpen(false);
      setEditingPermission(null);
      editForm.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || "Cập nhật quyền thất bại!");
    }
  };

  const handleDelete = async (permissionId: number) => {
    try {
      await deletePermissionAPI(permissionId);
      message.success("Xóa quyền thành công!");
      actionRef.current?.reload();
    } catch (error: any) {
      message.error("Xóa quyền thất bại!");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<IPermission>
        actionRef={actionRef}
        columns={columns as any}
        request={async (params) => {
          try {
            const filters: string[] = [];
            if (params.method) {
              filters.push(`method~'${params.method}'`);
            }
            if (params.module) {
              filters.push(`module~'${params.module}'`);
            }
            if (params.name) {
              filters.push(`name~'${params.name}'`);
            }
            const requestParams = {
              page: params.current,
              size: params.pageSize,
              filter: filters,
            };
            const res = await fetchAllPermissionsAPI(requestParams);
            const resultData = res.data.data?.result || res.data.result || [];
            const totalCount =
              res.data.data?.meta?.total || res.data.meta?.total || 0;

            // Extract unique methods and update methodOptions
            const uniqueMethods = Array.from(
              new Set(resultData.map((item: IPermission) => item.method))
            );
            const newMethodOptions = uniqueMethods.map((method) => ({
              label: method,
              value: method,
            }));
            setMethodOptions(newMethodOptions as any);

            return {
              data: resultData,
              total: totalCount,
              success: true,
            };
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        rowKey="id"
        pagination={{ showSizeChanger: true }}
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
          searchText: "Tìm kiếm",
          resetText: "Làm mới",
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="create"
            onClick={() => setIsModalOpen(true)}
          >
            Thêm quyền
          </Button>,
        ]}
      />

      {/* Create Permission Modal */}
      <Modal
        title="Tạo quyền mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePermission}>
          <Form.Item
            name="name"
            label="Tên quyền"
            rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="apiPath"
            label="API Path"
            rules={[{ required: true, message: "Vui lòng nhập API Path!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: "Vui lòng chọn method!" }]}
          >
            <Select options={methodOptions} />
          </Form.Item>
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: "Vui lòng nhập module!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        title="Sửa quyền"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingPermission(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePermission}
        >
          <Form.Item
            name="name"
            label="Tên quyền"
            rules={[{ required: true, message: "Vui lòng nhập tên quyền!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="apiPath"
            label="API Path"
            rules={[{ required: true, message: "Vui lòng nhập API Path!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: "Vui lòng chọn method!" }]}
          >
            <Select options={methodOptions} />
          </Form.Item>
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: "Vui lòng nhập module!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionPage;
