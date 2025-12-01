import React, { useEffect, useState, useCallback, useRef } from "react";
import { Table, Typography, Button, Space, App, Breadcrumb, Input } from "antd";
import { PlusOutlined, HomeOutlined, EyeOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentApi } from "../../api/apartmentApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ApartmentDto } from "../../types/apartment";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const Apartments: React.FC = () => {
  const { modal, notification } = App.useApp();
  const [apartments, setApartments] = useState<ApartmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestKeyRef = useRef<string>("");

  const fetchApartments = useCallback(async () => {
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
          Code: "name",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await apartmentApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });
      
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey && response.data) {
        setApartments(response.data);
      }
    } catch (error: unknown) {
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey) {
        const errorMessage = getErrorMessage(error, "Failed to fetch apartments");
        notification.error({ message: errorMessage });
      }
    } finally {
      if (!abortController.signal.aborted && requestKeyRef.current === requestKey) {
        setLoading(false);
      }
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  useEffect(() => {
    fetchApartments();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchApartments]);

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
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, "Failed to delete apartment");
          notification.error({ message: errorMessage });
        }
      },
    });
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

  const columns: ColumnType<ApartmentDto>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Area (m²)",
      dataIndex: "area",
      key: "area",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (area: number) => area?.toFixed(2) || "N/A",
    },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
      sorter: true,
      sortDirections: ["ascend", "descend"],
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
            icon={<EyeOutlined style={{ color: "#000" }} />}
            onClick={() => handleViewDetail(record.id)}
            style={{ color: "#000" }}
          >
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined style={{ color: "#000" }} />}
            onClick={() => handleDelete(record.id)}
            style={{ color: "#000" }}
          >
          </Button>
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
            title: "Apartments",
          },
        ]}
      />
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
        dataSource={apartments}
        columns={columns}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} apartments`,
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

export default Apartments;

