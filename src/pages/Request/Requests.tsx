import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, App, Tag, Breadcrumb, Input, Modal } from "antd";
import { PlusOutlined, QuestionCircleOutlined, EditOutlined, DeleteOutlined, HomeOutlined, EyeOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { requestApi } from "../../api/requestApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RequestDto } from "../../types/request";
import type { ColumnsType } from "antd/es/table";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";

const { Title } = Typography;

const Requests: React.FC = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedRequestsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");
  
  const isResident = user?.roleName === "Resident";

  const fetchRequests = async () => {
    if (!apartmentBuildingId) return;

    const requestKey = JSON.stringify({ apartmentBuildingId, searchTerm, sorts, currentPage, pageSize });
    
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

      const response = await requestApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
      if (response && response.data) {
        const requestsData = Array.isArray(response.data) ? response.data : [];
        setRequests(requestsData);
      } else {
        setRequests([]);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch requests");
      notification.error({ message: errorMessage });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apartmentBuildingId) {
      if (!hasFetchedRequestsRef.current) {
        hasFetchedRequestsRef.current = true;
        fetchRequests();
      } else {
        fetchRequests();
      }
    }
  }, [apartmentBuildingId, searchTerm, sorts, currentPage, pageSize]);

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

  const handleDelete = (record: RequestDto) => {
    console.log("handleDelete called", record);
    if (!record.id) {
      console.log("No record id");
      return;
    }

    Modal.confirm({
      title: "Delete Request",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete the request "${record.title}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          await requestApi.delete([record.id!]);
          notification.success({ message: "Request deleted successfully!" });
          lastRequestKeyRef.current = "";
          fetchRequests();
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, "Failed to delete request");
          notification.error({ message: errorMessage });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns: ColumnsType<RequestDto> = [
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
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: RequestDto) => (
        <Space size="small">
          {isResident && record.status === "NEW" ? (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/${apartmentBuildingId}/requests/edit/${record.id}`)}
              style={{ color: "#000" }}
            />
          ) : (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/${apartmentBuildingId}/requests/${record.id}`)}
              style={{ color: "#000" }}
            />
          )}
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Delete button clicked", record);
              handleDelete(record);
            }}
            style={{ color: "#ff4d4f" }}
            danger
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
        {isResident && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/requests/create`)}
          >
            Create Request
          </Button>
        )}
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
        dataSource={requests}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} requests`,
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

export default Requests;

