import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, Tag, App, Breadcrumb, Input, Modal } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentBuildingApi } from "../../api/apartmentBuildingApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ApartmentBuildingDto } from "../../types/apartmentBuilding";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const ApartmentBuildings: React.FC = () => {
  const { notification } = App.useApp();
  const [apartmentBuildings, setApartmentBuildings] = useState<ApartmentBuildingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedApartmentBuilding, setSelectedApartmentBuilding] = useState<ApartmentBuildingDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedApartmentBuildingsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const fetchApartmentBuildings = async () => {
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
          Code: "name",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await apartmentBuildingApi.getApartmentBuildings({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
      if (response.data) {
        setApartmentBuildings(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch apartment buildings");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedApartmentBuildingsRef.current) {
      hasFetchedApartmentBuildingsRef.current = true;
      fetchApartmentBuildings();
    } else {
      fetchApartmentBuildings();
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  const handleEdit = (id: string) => {
    navigate(`/${apartmentBuildingId}/apartment-buildings/edit/${id}`);
  };

  const handleDeleteClick = (record: ApartmentBuildingDto) => {
    setSelectedApartmentBuilding(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApartmentBuilding?.id) return;

    try {
      setDeleting(true);
      await apartmentBuildingApi.deleteApartmentBuilding([selectedApartmentBuilding.id]);
      notification.success({ message: "Apartment building deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedApartmentBuilding(null);
      fetchApartmentBuildings();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete apartment building");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatusClick = (record: ApartmentBuildingDto) => {
    setSelectedApartmentBuilding(record);
    setUpdateStatusModalVisible(true);
  };

  const handleUpdateStatusConfirm = async () => {
    if (!selectedApartmentBuilding?.id) return;

    try {
      setUpdatingStatus(true);
      const newStatus = selectedApartmentBuilding.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
      await apartmentBuildingApi.updateStatus(selectedApartmentBuilding.id, { status: newStatus });
      notification.success({ message: `Apartment building status updated to ${newStatus} successfully!` });
      setUpdateStatusModalVisible(false);
      setSelectedApartmentBuilding(null);
      fetchApartmentBuildings();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to update apartment building status");
      notification.error({ message: errorMessage });
    } finally {
      setUpdatingStatus(false);
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

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns: ColumnType<ApartmentBuildingDto>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text: string) => text || "N/A",
    },
    {
      title: "Contact Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text: string) => text || "N/A",
    },
    {
      title: "Contact Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text: string) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: ApartmentBuildingDto) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined style={{ color: '#000' }} />}
            onClick={() => handleEdit(record.id!)}
            title="Edit"
          />
          <Button 
            type="text" 
            size="small" 
            icon={<SyncOutlined style={{ color: '#000' }} />}
            onClick={() => handleUpdateStatusClick(record)}
            title="Update Status"
          />
          <Button 
            type="text" 
            size="small" 
            icon={<DeleteOutlined style={{ color: '#000' }} />}
            onClick={() => handleDeleteClick(record)}
            title="Delete"
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
            title: "Apartment Buildings",
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
          <HomeOutlined /> Apartment Buildings Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/apartment-buildings/create`)}
        >
          Add New Apartment Building
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
        rowKey="id"
        dataSource={apartmentBuildings}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} apartment buildings`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Apartment Building
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedApartmentBuilding(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedApartmentBuilding?.name}</strong>?
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
              <li>All information related to this apartment building will be permanently deleted</li>
              <li>Users belonging to this apartment building will not be able to access the system</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            Warning: Update Apartment Building Status
          </span>
        }
        open={updateStatusModalVisible}
        onOk={handleUpdateStatusConfirm}
        onCancel={() => {
          setUpdateStatusModalVisible(false);
          setSelectedApartmentBuilding(null);
        }}
        okText="Update Status"
        cancelText="Cancel"
        okButtonProps={{ loading: updatingStatus }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to update the status of <strong>{selectedApartmentBuilding?.name}</strong>?
          </p>
          <p style={{ marginBottom: 12 }}>
            Current Status: <Tag color={getStatusColor(selectedApartmentBuilding?.status || null)}>
              {selectedApartmentBuilding?.status || "Unknown"}
            </Tag>
          </p>
          <p style={{ marginBottom: 12 }}>
            New Status: <Tag color={getStatusColor(
              selectedApartmentBuilding?.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active'
            )}>
              {selectedApartmentBuilding?.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active'}
            </Tag>
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
              <li>Users belonging to this apartment building will not be able to access the system</li>
              <li>This action will affect all users associated with this apartment building</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentBuildings;
