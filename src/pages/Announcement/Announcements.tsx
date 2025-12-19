import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, App, Tag, Breadcrumb, Input, Space, Modal } from "antd";
import { PlusOutlined, NotificationOutlined, HomeOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { announcementApi } from "../../api/announcementApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errorHandler";
import type { AnnouncementDto } from "../../types/announcement";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title } = Typography;

const Announcements: React.FC = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedAnnouncementsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const isResident = user?.roleName === "Resident";

  const fetchAnnouncements = async () => {
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

      if (response.data) {
        setAnnouncements(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch announcements");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedAnnouncementsRef.current) {
      hasFetchedAnnouncementsRef.current = true;
      fetchAnnouncements();
    } else {
      fetchAnnouncements();
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

  const handleDelete = (record: AnnouncementDto, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!record.id || record.id === "null" || record.id === "undefined") {
      notification.error({ message: "Cannot delete announcement: ID is missing" });
      return;
    }

    setSelectedAnnouncement(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement?.id) {
      return;
    }

    try {
      setDeleting(true);
      await announcementApi.delete([selectedAnnouncement.id]);
      notification.success({ message: "Announcement deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedAnnouncement(null);
      lastRequestKeyRef.current = "";
      await fetchAnnouncements();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete announcement");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
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
      render: (_: unknown, record: AnnouncementDto) => {
        if (isResident) {
          return (
            <Space size="small">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: "#000" }} />}
                onClick={() => {
                  if (record.id && record.id !== "null" && record.id !== "undefined") {
                    navigate(`/${apartmentBuildingId}/announcements/edit/${record.id}`);
                  }
                }}
                style={{ color: "#000" }}
              />
            </Space>
          );
        }
        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#000" }} />}
              onClick={() => {
                if (record.id && record.id !== "null" && record.id !== "undefined") {
                  navigate(`/${apartmentBuildingId}/announcements/edit/${record.id}`);
                } else {
                  notification.error({ message: "Cannot edit announcement: ID is missing" });
                }
              }}
              style={{ color: "#000" }}
            />
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "#000" }} />}
              onClick={(e) => handleDelete(record, e)}
              style={{ color: "#000" }}
            />
          </Space>
        );
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

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Announcement
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedAnnouncement(null);
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>"{selectedAnnouncement?.title}"</strong>?
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
              <li>This announcement will be permanently deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Announcements;

