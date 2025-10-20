import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, message } from "antd";
import { PlusOutlined, SafetyOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { roleApi } from "../../api/roleApi";
import type { RoleDto, PermissionInfo } from "../../types/user";

const { Title } = Typography;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAll();
      if (response.data) {
        setRoles(response.data);
      }
    } catch {
      message.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (roleId: string) => {
    navigate(`/roles/edit/${roleId}`);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await roleApi.delete([roleId]);
      message.success("Role deleted successfully!");
      fetchRoles(); // Refresh the list
    } catch {
      message.error("Failed to delete role");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "roleId",
      key: "roleId",
      width: 100,
    },
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: PermissionInfo[]) => {
        if (!permissions || permissions.length === 0) {
          return "No permissions";
        }
        const selectedPermissions = permissions.filter(p => p.selected);
        return selectedPermissions.length > 0 
          ? `${selectedPermissions.length} permission(s)` 
          : "No permissions";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: RoleDto) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.roleId!)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.roleId!)}
          >
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
          <SafetyOutlined /> Roles Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate("/roles/create")}
        >
          Add New Role
        </Button>
      </div>
      
      <Table
        rowKey="roleId"
        dataSource={roles}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} roles`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Roles;
