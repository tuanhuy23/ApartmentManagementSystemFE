import React, { useEffect, useState, useRef } from "react";
import { Table, Typography, Button, Space, App, Breadcrumb, Input, Modal } from "antd";
import { PlusOutlined, HomeOutlined, EyeOutlined, DeleteOutlined, SearchOutlined, ExclamationCircleOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apartmentApi } from "../../api/apartmentApi";
import { feeApi } from "../../api/feeApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ApartmentDto } from "../../types/apartment";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;

const Apartments: React.FC = () => {
  const { notification } = App.useApp();
  const [apartments, setApartments] = useState<ApartmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<ApartmentDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedApartmentsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const fetchApartments = async () => {
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

      const response = await apartmentApi.getAll({
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (response.data) {
        setApartments(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch apartments");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedApartmentsRef.current) {
      hasFetchedApartmentsRef.current = true;
      fetchApartments();
    } else {
      fetchApartments();
    }
  }, [searchTerm, sorts, currentPage, pageSize]);

  const handleViewDetail = (apartmentId: string) => {
    navigate(`/${apartmentBuildingId}/apartments/${apartmentId}`);
  };

  const handleDeleteClick = (record: ApartmentDto) => {
    setSelectedApartment(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApartment?.id) return;

    try {
      setDeleting(true);
      await apartmentApi.delete(selectedApartment.id);
      notification.success({ message: "Apartment deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedApartment(null);
      lastRequestKeyRef.current = "";
      await fetchApartments();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete apartment");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
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

  const handleDownloadExcelTemplate = async () => {
    try {
      setDownloading(true);
      const blob = await feeApi.downloadExcelTemplate();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fee-notice-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notification.success({ message: "Excel template downloaded successfully!" });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to download Excel template");
      notification.error({ message: errorMessage });
    } finally {
      setDownloading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const response = await feeApi.import(file);

      if (response.data && response.data.length > 0) {
        const errors = response.data.filter(item => item.errorMessage);
        if (errors.length > 0) {
          notification.warning({
            message: "Import completed with issues",
            description: `${errors.length} items failed. Please check the response for details.`
          });
        } else {
          notification.success({ message: "Import Fee Notice successfully!" });
        }
      } else {
        notification.success({ message: "Import Fee Notice successfully!" });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to import fee notice");
      notification.error({ message: errorMessage });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
            onClick={() => handleDeleteClick(record)}
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
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadExcelTemplate}
            loading={downloading}
          >
            Download Excel Template
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={handleImportClick}
            loading={importing}
          >
            Import Fee Notice Excel
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/apartments/create`)}
          >
            Create New Apartment
          </Button>
        </Space>
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

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Apartment
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedApartment(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedApartment?.name}</strong>?
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
              <li>All information related to this apartment will be permanently deleted</li>
              <li>Residents belonging to this apartment will lose access</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Apartments;

