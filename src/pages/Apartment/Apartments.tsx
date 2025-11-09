import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, App } from "antd";
import { PlusOutlined, HomeOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentApi } from "../../api/apartmentApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { ApartmentDto } from "../../types/apartment";

const { Title } = Typography;

const Apartments: React.FC = () => {
  const { modal, notification } = App.useApp();
  const [apartments, setApartments] = useState<ApartmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await apartmentApi.getAll();
      if (response.data) {
        setApartments(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch apartments" });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (apartmentId: string) => {
    navigate(`/${apartmentBuildingId}/apartments/${apartmentId}`);
  };

  const handleDelete = (apartmentId: string) => {
    modal.confirm({
      title: "Delete Apartment",
      content: "Are you sure you want to delete this apartment? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          notification.error({ message: "Delete functionality not available in API" });
        } catch {
          notification.error({ message: "Failed to delete apartment" });
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Area (m²)",
      dataIndex: "area",
      key: "area",
      render: (area: number) => area?.toFixed(2) || "N/A",
    },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: ApartmentDto) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>
          <HomeOutlined /> Apartments Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/apartments/create`)}
        >
          Create New Apartment
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={apartments}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} apartments`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Apartments;

