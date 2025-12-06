import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, App, Breadcrumb } from "antd";
import { SafetyOutlined, HomeOutlined } from "@ant-design/icons";
import { roleApi } from "../../api/roleApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RoleDto } from "../../types/role";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const Roles: React.FC = () => {
  const { notification } = App.useApp();
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedRolesRef = useRef(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleApi.getAll();
      
      if (response.data) {
        setRoles(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch roles");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRolesRef.current) {
      hasFetchedRolesRef.current = true;
      fetchRoles();
    }
  }, []);

  const columns: ColumnType<RoleDto>[] = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: RoleDto["permissions"]) => {
        if (!permissions || permissions.length === 0) {
          return "N/A";
        }
        const selectedPermissions = permissions
          .filter((p) => p.selected)
          .map((p) => p.displayName || p.name)
          .join(", ");
        return selectedPermissions || "N/A";
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            href: `/${apartmentBuildingId}`,
            title: (
              <>
                <HomeOutlined />
                <span>Dashboard</span>
              </>
            ),
          },
          {
            title: "Roles",
          },
        ]}
      />
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 24 
      }}>
        <Title level={2}>
          <SafetyOutlined /> Roles Management
        </Title>
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

