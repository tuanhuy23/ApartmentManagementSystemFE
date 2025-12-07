import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, App, Breadcrumb, Input, Modal, Space } from "antd";
import { PlusOutlined, UserOutlined, EditOutlined, HomeOutlined, SearchOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/userApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { UserDto } from "../../types/user";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const Users: React.FC = () => {
  const { notification } = App.useApp();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedUsersRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const fetchUsers = async () => {
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
          Code: "displayName",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await userApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch users");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedUsersRef.current) {
      hasFetchedUsersRef.current = true;
      fetchUsers();
    } else {
      fetchUsers();
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  const handleEdit = (userId: string) => {
    navigate(`/${apartmentBuildingId}/users/edit/${userId}`);
  };

  const handleDelete = (user: UserDto) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser || !selectedUser.userId) return;

    try {
      setDeleting(true);
      const response = await userApi.delete([selectedUser.userId]);
      
      if (response.data) {
        const { userIdsDeleteSuccess, userIdsDeleteError } = response.data;
        
        if (userIdsDeleteSuccess && userIdsDeleteSuccess.length > 0) {
          notification.success({
            message: "Success",
            description: `User "${selectedUser.displayName}" has been deleted successfully.`,
          });
        }
        
        if (userIdsDeleteError && userIdsDeleteError.length > 0) {
          notification.warning({
            message: "Warning",
            description: `Some users could not be deleted.`,
          });
        }
        
        setDeleteModalVisible(false);
        setSelectedUser(null);
        lastRequestKeyRef.current = "";
        await fetchUsers();
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete user");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

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

  const columns: ColumnType<UserDto>[] = [
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text: string) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: UserDto) => (
        <Space size="middle">
          <EditOutlined
            style={{ color: "#000", cursor: "pointer", fontSize: 16 }}
            onClick={() => handleEdit(record.userId!)}
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
            title: "Users",
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
          <UserOutlined /> Users Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/users/create`)}
        >
          Add New User
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
        rowKey="userId"
        dataSource={users}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} users`,
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
            Delete User
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        confirmLoading={deleting}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedUser?.displayName}</strong>?
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
              <li>This user will be permanently deleted</li>
              <li>All data associated with this user will be lost</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
