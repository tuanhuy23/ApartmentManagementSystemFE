import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, message } from "antd";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { userApi } from "../../api/userApi";
import type { UserDto } from "../../types/user";

const { Title } = Typography;

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Apartment",
      dataIndex: "appartmentName",
      key: "appartmentName",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 24 
      }}>
        <Title level={2}>
          <UserOutlined /> Users Management
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Add New User
        </Button>
      </div>
      
      <Table
        rowKey="userId"
        dataSource={users}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Users;
