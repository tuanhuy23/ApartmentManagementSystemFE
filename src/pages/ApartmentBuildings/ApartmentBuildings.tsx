import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, Tag, App, Breadcrumb, Input } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentBuildingApi } from "../../api/apartmentBuildingApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ApartmentBuildingDto } from "../../types/apartmentBuilding";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;
const { Search } = Input;

const ApartmentBuildings: React.FC = () => {
  const { notification } = App.useApp();
  const [apartmentBuildings, setApartmentBuildings] = useState<ApartmentBuildingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
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
    } catch {
      notification.error({ message: "Failed to fetch apartment buildings" });
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

  const handleDelete = async () => {
    try {
      notification.success({ message: "Apartment building deleted successfully!" });
      fetchApartmentBuildings();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete apartment building");
      notification.error({ message: errorMessage });
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
      title: "Code",
      dataIndex: "code",
      key: "code",
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

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by name"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch("");
            }
          }}
          style={{ maxWidth: 400 }}
        />
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
    </div>
  );
};

export default ApartmentBuildings;
