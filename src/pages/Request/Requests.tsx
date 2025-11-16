import React, { useEffect, useState, useRef, useCallback } from "react";
import { Table, Typography, Button, Space, App, Tag, Breadcrumb } from "antd";
import { PlusOutlined, QuestionCircleOutlined, EditOutlined, DeleteOutlined, HomeOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { requestApi } from "../../api/requestApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { RequestDto } from "../../types/request";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;

const Requests: React.FC = () => {
  const { notification } = App.useApp();
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedApartmentIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();

  const fetchRequests = useCallback(async () => {
    if (!apartmentBuildingId) return;
    try {
      setLoading(true);
      const response = await requestApi.getAll();
      if (response.data) {
        setRequests(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch requests" });
    } finally {
      setLoading(false);
    }
  }, [apartmentBuildingId, notification]);

  useEffect(() => {
    if (apartmentBuildingId && fetchedApartmentIdRef.current !== apartmentBuildingId) {
      fetchedApartmentIdRef.current = apartmentBuildingId;
      fetchRequests();
    }
  }, [apartmentBuildingId, fetchRequests]);

  const columns: ColumnsType<RequestDto> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (id: string) => id ? `#${id.substring(0, 8).toUpperCase()}` : "N/A",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          NEW: "default",
          RECEIVED: "blue",
          "IN_PROGRESS": "orange",
          COMPLETED: "green",
          CANCELED: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Files",
      dataIndex: "files",
      key: "files",
      width: 80,
      render: (files: any[]) => files?.length || 0,
    },
    {
      title: "Feedbacks",
      dataIndex: "feedbacks",
      key: "feedbacks",
      width: 100,
      render: (feedbacks: any[]) => feedbacks?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: RequestDto) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/requests/${record.id}`)}
            style={{ color: "#000" }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/requests/${record.id}`)}
            style={{ color: "#000" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              // TODO: Implement delete functionality
              console.log("Delete request:", record.id);
            }}
            style={{ color: "#000" }}
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
            title: "Requests",
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
          <QuestionCircleOutlined /> Requests
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/requests/create`)}
        >
          Create Request
        </Button>
      </div>
      
      <Table
        rowKey="id"
        dataSource={requests}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} requests`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Requests;

