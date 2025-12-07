import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, App, Breadcrumb, Button, Input, Modal, Space } from "antd";
import { SafetyOutlined, HomeOutlined, PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { roleApi } from "../../api/roleApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RoleDto } from "../../types/role";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const Roles: React.FC = () => {
  const { notification } = App.useApp();
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const apartmentBuildingId = useApartmentBuildingId();
  const navigate = useNavigate();
  const hasFetchedRolesRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const fetchRoles = async () => {
    const requestKey = JSON.stringify({ searchTerm, sorts, currentPage, pageSize });
    
    if (lastRequestKeyRef.current === requestKey) {
      return;
    }
    
    lastRequestKeyRef.current = requestKey;

    try {
      setLoading(true);
      const filters: FilterQuery[] = [];
      
      if (searchTerm) {
        filters.push({
          Code: "roleName",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await roleApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
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
    } else {
      fetchRoles();
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  const handleTableChange = (
    _pagination: any,
    _filters: any,
    sorter: any
  ) => {
    if (sorter && sorter.columnKey) {
      const newSorts: SortQuery[] = [
        {
          Code: sorter.columnKey,
          Direction: sorter.order === "ascend" ? SortDirection.Ascending : SortDirection.Descending,
        },
      ];
      setSorts(newSorts);
      setCurrentPage(1);
    } else {
      setSorts([]);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (role: RoleDto) => {
    navigate(`/${apartmentBuildingId}/roles/edit/${role.roleId}`);
  };

  const handleDelete = (role: RoleDto) => {
    setSelectedRole(role);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;

    try {
      setDeleting(true);
      const response = await roleApi.delete([selectedRole.roleId]);
      
      if (response.data) {
        const { roleIdsDeleteSuccess, roleIdsDeleteError } = response.data;
        
        if (roleIdsDeleteSuccess && roleIdsDeleteSuccess.length > 0) {
          notification.success({
            message: "Success",
            description: `Role "${selectedRole.roleName}" has been deleted successfully.`,
          });
        }
        
        if (roleIdsDeleteError && roleIdsDeleteError.length > 0) {
          notification.warning({
            message: "Warning",
            description: `Some roles could not be deleted.`,
          });
        }
        
        setDeleteModalVisible(false);
        setSelectedRole(null);    
        lastRequestKeyRef.current = "";
        await fetchRoles();
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete role");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnType<RoleDto>[] = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
      sorter: true,
      sortDirections: ["ascend", "descend"],
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
          .map((p) => p.displayName || p.name)
          .filter((name) => name && name.trim() !== "");
        
        if (selectedPermissions.length === 0) {
          return "N/A";
        }
        
        return (
          <div style={{ 
            wordWrap: "break-word", 
            wordBreak: "break-word",
            whiteSpace: "normal",
            maxWidth: 500
          }}>
            {selectedPermissions.join(" ")}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: any, record: RoleDto) => (
        <Space size="middle">
          <EditOutlined
            style={{ color: "#000", cursor: "pointer", fontSize: 16 }}
            onClick={() => handleEdit(record)}
          />
          <DeleteOutlined
            style={{ color: "#000", cursor: "pointer", fontSize: 16 }}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
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
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/roles/create`)}
        >
          Add New Role
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          maxWidth: 400,
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid #d9d9d9',
          backgroundColor: '#ffffff'
        }}>
          <Input
            placeholder="Search by name"
            allowClear
            size="large"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              if (!value) {
                handleSearch("");
              }
            }}
            onPressEnter={(e) => {
              handleSearch((e.target as HTMLInputElement).value);
            }}
            bordered={false}
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: '#ffffff',
            }}
          />
          <div style={{
            width: '1px',
            backgroundColor: '#d9d9d9',
            margin: '8px 0'
          }} />
          <Button
            size="large"
            icon={<SearchOutlined />}
            onClick={() => handleSearch(searchTerm)}
            type="text"
            style={{
              border: 'none',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0,
              color: '#8c8c8c',
            }}
          />
        </div>
      </div>
      
      <Table
        rowKey="roleId"
        dataSource={roles}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} roles`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
            Delete Role
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedRole(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={deleting}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedRole?.roleName}</strong>?
          </p>
          <div style={{ 
            background: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: 4, 
            padding: 12,
            marginTop: 16 
          }}>
            <p style={{ margin: 0, color: '#d46b08', fontWeight: 500 }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Important Warning:
            </p>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>This role will be permanently deleted</li>
              <li>Users assigned to this role may lose access to certain features</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;

