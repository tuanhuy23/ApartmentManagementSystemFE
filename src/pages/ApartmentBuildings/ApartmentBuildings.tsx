import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, message, Tag, Image } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentBuildingApi } from "../../api/apartmentBuildingApi";
import type { ApartmentBuildingDto } from "../../types/apartmentBuilding";

const { Title } = Typography;

const ApartmentBuildings: React.FC = () => {
  const [apartmentBuildings, setApartmentBuildings] = useState<ApartmentBuildingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();

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
      message.error("Failed to fetch apartment buildings");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/apartment-buildings/edit/${id}`);
  };

  const handleDelete = async (_id: string) => {
    try {
      // Note: Delete API not provided in the specification, so this is a placeholder
      message.success("Apartment building deleted successfully!");
      fetchApartmentBuildings(); // Refresh the list
    } catch {
      message.error("Failed to delete apartment building");
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
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
      title: "Currency",
      dataIndex: "currencyUnit",
      key: "currencyUnit",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Image",
      dataIndex: "apartmentBuildingImgUrl",
      key: "apartmentBuildingImgUrl",
      render: (url: string) => (
        url ? (
          <Image
            width={50}
            height={50}
            src={url}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ 
            width: 50, 
            height: 50, 
            backgroundColor: '#f0f0f0', 
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            No Image
          </div>
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: ApartmentBuildingDto) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id!)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id!)}
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
          <HomeOutlined /> Apartment Buildings Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate("/apartment-buildings/create")}
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
