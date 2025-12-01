import React, { useEffect, useState, useRef, useCallback } from "react";
import { Table, Typography, Button, App, Tag, Breadcrumb, Input, Space } from "antd";
import { PlusOutlined, NotificationOutlined, HomeOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { announcementApi } from "../../api/announcementApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { AnnouncementDto } from "../../types/announcement";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;

const Announcements: React.FC = () => {
  const { notification } = App.useApp();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestKeyRef = useRef<string>("");

  const fetchAnnouncements = useCallback(async () => {
    const requestKey = JSON.stringify({ searchTerm, sorts, currentPage, pageSize });
    
    if (requestKeyRef.current === requestKey) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    requestKeyRef.current = requestKey;

    try {
      setLoading(true);
      const filters: FilterQuery[] = [];
      
      if (searchTerm) {
        filters.push({
          Code: "title",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await announcementApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey && response.data) {
        setAnnouncements(response.data);
      }
    } catch (error: unknown) {
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey) {
        const errorMessage = getErrorMessage(error, "Failed to fetch announcements");
        notification.error({ message: errorMessage });
      }
    } finally {
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey) {
        setLoading(false);
      }
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  useEffect(() => {
    fetchAnnouncements();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAnnouncements]);

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

  const columns: ColumnsType<AnnouncementDto> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (status: string) => <Tag>{status}</Tag>,
    },
    {
      title: "Is All",
      dataIndex: "isAll",
      key: "isAll",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (isAll: boolean) => <Tag color={isAll ? "green" : "default"}>{isAll ? "Yes" : "No"}</Tag>,
    },
    {
      title: "Publish Date",
      dataIndex: "publishDate",
      key: "publishDate",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: AnnouncementDto) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#000" }} />}
            onClick={() => navigate(`/${apartmentBuildingId}/announcements/edit/${record.id}`)}
            style={{ color: "#000" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#000" }} />}
            onClick={() => {
              // TODO: Implement delete functionality
              console.log("Delete announcement:", record.id);
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
            placeholder="Search by title"
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
        dataSource={announcements}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} announcements`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default Announcements;

