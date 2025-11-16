import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, Tag, App, Breadcrumb } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentBuildingApi } from "../../api/apartmentBuildingApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { ApartmentBuildingDto } from "../../types/apartmentBuilding";

const { Title } = Typography;

const ApartmentBuildings: React.FC = () => {
  const { notification } = App.useApp();
  const [apartmentBuildings, setApartmentBuildings] = useState<ApartmentBuildingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchApartmentBuildings();
  }, []);

  const fetchApartmentBuildings = async () => {
    try {
      setLoading(true);
      const response = await apartmentBuildingApi.getApartmentBuildings();
      if (response.data) {
        setApartmentBuildings(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch apartment buildings" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/${apartmentBuildingId}/apartment-buildings/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      notification.success({ message: "Apartment building deleted successfully!" });
      fetchApartmentBuildings();
    } catch {
      notification.error({ message: "Failed to delete apartment building" });
    }
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Contact Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Contact Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status || "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: ApartmentBuildingDto) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined style={{ color: '#000' }} />}
            onClick={() => handleEdit(record.id!)}
          />
          <Button 
            type="text" 
            size="small" 
            icon={<DeleteOutlined style={{ color: '#000' }} />}
            onClick={handleDelete}
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
      
      <Table
        rowKey="id"
        dataSource={apartmentBuildings}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} apartment buildings`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default ApartmentBuildings;
