import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, App, Tag, Breadcrumb } from "antd";
import { PlusOutlined, NotificationOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { announcementApi } from "../../api/announcementApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { AnnouncementDto } from "../../types/announcement";
import dayjs from "dayjs";

const { Title } = Typography;

const Announcements: React.FC = () => {
  const { notification } = App.useApp();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementApi.getAll();
      if (response.data) {
        setAnnouncements(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch announcements" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag>{status}</Tag>,
    },
    {
      title: "Is All",
      dataIndex: "isAll",
      key: "isAll",
      render: (isAll: boolean) => <Tag color={isAll ? "green" : "default"}>{isAll ? "Yes" : "No"}</Tag>,
    },
    {
      title: "Publish Date",
      dataIndex: "publishDate",
      key: "publishDate",
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
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
            title: "Announcements",
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
          <NotificationOutlined /> Announcements
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/announcements/create`)}
        >
          Create Announcement
        </Button>
      </div>
      
      <Table
        rowKey="id"
        dataSource={announcements}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} announcements`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Announcements;

