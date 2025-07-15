import { deletePostAPI, fetchAllPostsAPI } from "@/services/api";
import { DeleteOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import { Avatar, Button, message, Popconfirm, Space, Tag } from "antd";
import { useRef } from "react";

interface IUser {
  id: number;
  email: string;
  fullname: string;
  avatar: string | null;
  coverPhoto: string | null;
  gender: string;
}

interface IPostData {
  id: number;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  visible: boolean;
  createdAt: string;
  user: IUser;
}

const PostPage = () => {
  const actionRef = useRef<any>();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      hideInSearch: true,
    },

    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      copyable: true,
      width: 180,
      render: (_: any, record: IPostData) => (
        <Space>
          <Avatar src={record.user.avatar || undefined}>
            {record.user.email?.[0]?.toUpperCase() || "U"}
          </Avatar>
          {record.user.email}
        </Space>
      ),
      // enable search by email
      search: {
        transform: (value: string) => ({ "user.email": value }),
      },
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      width: 220,
      ellipsis: true,

      hideInSearch: true,
    },
    {
      title: "Ảnh/Video",
      key: "media",
      width: 120,
      hideInSearch: true,
      render: (_: any, record: IPostData) =>
        record.imageUrl ? (
          <img
            src={record.imageUrl}
            alt="img"
            style={{ width: 60, borderRadius: 4 }}
          />
        ) : record.videoUrl ? (
          <video
            src={record.videoUrl}
            style={{ width: 60, borderRadius: 4 }}
            controls
          />
        ) : (
          <Tag color="default">Không có</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
      hideInSearch: true,
    },
    {
      title: "Hiển thị",
      dataIndex: "visible",
      key: "visible",
      width: 90,
      render: (visible: boolean) => (
        <Tag color={visible ? "green" : "red"}>{visible ? "Có" : "Không"}</Tag>
      ),
      hideInSearch: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 90,
      hideInSearch: true,
      render: (_: any, record: IPostData) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa bài viết này?"
          onConfirm={async () => {
            try {
              await deletePostAPI(record.id);
              message.success("Xóa bài viết thành công!");
              actionRef.current?.reload();
            } catch (error) {
              message.error("Xóa bài viết thất bại!");
            }
          }}
          okText="Có"
          cancelText="Không"
        >
          <Button type="primary" danger size="small">
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<IPostData>
        actionRef={actionRef}
        columns={columns as any}
        request={async (params) => {
          try {
            const filters: string[] = [];
            if (params["user.email"]) {
              filters.push(`user.email~'${params["user.email"]}'`);
            }
            const requestParams = {
              page: params.current,
              size: params.pageSize,
              filter: filters,
            };
            const res = await fetchAllPostsAPI(requestParams);
            const resultData = res.data?.result || res.data?.data?.result || [];
            const totalCount =
              res.data?.meta?.total || res.data?.data?.meta?.total || 0;
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
        toolBarRender={false}
      />
    </div>
  );
};

export default PostPage;
