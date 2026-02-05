import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Space, Tag, Modal, Drawer, Form, Input, Select, App, Typography, Descriptions } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined, SearchOutlined, EyeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { parkingApi } from "../../api/parkingApi";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ParkingRegistrationDto } from "../../types/parking";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";

const { Option } = Select;
const { Text } = Typography;

interface ParkingTabProps {
  apartmentId: string;
}

const ParkingTab: React.FC<ParkingTabProps> = ({ apartmentId }) => {
  const { notification } = App.useApp();
  const [parkings, setParkings] = useState<ParkingRegistrationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConfirmDrawerVisible, setIsConfirmDrawerVisible] = useState(false);
  const [selectedParking, setSelectedParking] = useState<ParkingRegistrationDto | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedParkingForDelete, setSelectedParkingForDelete] = useState<ParkingRegistrationDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form] = Form.useForm<ParkingRegistrationDto>();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const hasFetchedParkingsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");

  const fetchParkings = async () => {
    if (!apartmentId) return;

    const requestKey = JSON.stringify({ apartmentId, searchTerm, sorts, currentPage, pageSize });

    if (lastRequestKeyRef.current === requestKey) {
      return;
    }

    lastRequestKeyRef.current = requestKey;

    try {
      setLoading(true);
      const filters: FilterQuery[] = [];

      if (searchTerm) {
        filters.push({
          Code: "vehicleType",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await parkingApi.getByApartmentId(apartmentId, {
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (response.data) {
        setParkings(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch parkings");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedParkingsRef.current) {
      hasFetchedParkingsRef.current = true;
      fetchParkings();
    } else {
      fetchParkings();
    }
  }, [apartmentId, searchTerm, sorts, currentPage, pageSize]);

  const handleCreate = () => {
    setSelectedParking(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (parking: ParkingRegistrationDto) => {
    if (!parking.id) return;
    try {
      setLoading(true);
      const response = await parkingApi.getById(parking.id);
      if (response.data) {
        setSelectedParking(response.data);
        form.setFieldsValue({
          ...response.data,
        });
        setIsModalVisible(true);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch parking details");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (parking: ParkingRegistrationDto) => {
    if (!parking.id) return;
    try {
      setLoading(true);
      const response = await parkingApi.getById(parking.id);
      if (response.data) {
        setSelectedParking(response.data);
        setIsDetailModalVisible(true);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch parking details");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (parking: ParkingRegistrationDto) => {
    setSelectedParkingForDelete(parking);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedParkingForDelete?.id) return;

    try {
      setDeleting(true);
      await parkingApi.delete([selectedParkingForDelete.id]);
      notification.success({ message: "Parking deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedParkingForDelete(null);
      lastRequestKeyRef.current = "";
      await fetchParkings();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete parking");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!apartmentId) return;

      const apartmentBuildingId = getApartmentBuildingIdFromToken();
      if (!apartmentBuildingId) {
        notification.error({ message: "Apartment building ID not found" });
        return;
      }

      setSubmitting(true);

      const submitData: ParkingRegistrationDto = {
        ...values,
        id: selectedParking?.id || null,
        apartmentId,
        apartmentBuildingId,
      };

      if (selectedParking?.id) {
        await parkingApi.update(submitData);
        notification.success({ message: "Parking updated successfully!" });
      } else {
        await parkingApi.create(submitData);
        notification.success({ message: "Parking created successfully!" });
      }
      setIsModalVisible(false);
      form.resetFields();
      lastRequestKeyRef.current = "";
      await fetchParkings();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        notification.error({ message: "Please check your input" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to save parking");
        notification.error({ message: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelParking = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsConfirmDrawerVisible(true);
  };

  const handleConfirmCancel = () => {
    setIsModalVisible(false);
    setIsConfirmDrawerVisible(false);
    form.resetFields();
  };

  const handleCancelConfirm = () => {
    setIsConfirmDrawerVisible(false);
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

  const columns: ColumnsType<ParkingRegistrationDto> = [
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Vehicle Number",
      dataIndex: "vehicleNumber",
      key: "vehicleNumber",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Vehicle Description",
      dataIndex: "vehicleDescription",
      key: "vehicleDescription",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: ParkingRegistrationDto) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ color: "#000" }}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#000" }}
            title="Edit"
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            style={{ color: "#000" }}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Parking
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
            placeholder="Search by vehicle type"
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
        columns={columns}
        dataSource={parkings}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} parkings`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />

      <Drawer
        title={selectedParking ? "Edit Parking" : "Add Parking"}
        open={isModalVisible}
        onClose={handleCancelParking}
        width={600}
        placement="right"
        maskClosable={false}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancelParking}
            style={{ padding: 0 }}
          />
        }
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={handleCancelParking}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              {selectedParking ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Vehicle Type"
            name="vehicleType"
            rules={[
              { required: true, message: "Please select vehicle type" },
            ]}
          >
            <Select placeholder="Select vehicle type">
              <Option value="MOTORBIKE">MOTORBIKE</Option>
              <Option value="CAR">CAR</Option>
              <Option value="BICYCLE">BICYCLE</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Vehicle Number"
            name="vehicleNumber"
            rules={[
              { required: true, message: "Please enter vehicle number" },
            ]}
          >
            <Input placeholder="Enter vehicle number" />
          </Form.Item>
          <Form.Item
            label="Vehicle Description"
            name="vehicleDescription"
            rules={[
              { required: true, message: "Please enter vehicle description" },
            ]}
          >
            <Input.TextArea 
              placeholder="Enter vehicle description" 
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="Parking Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
        maskClosable={false}
        keyboard={false}
      >
        {selectedParking && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">
              {selectedParking.id}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Type">
              <Tag>{selectedParking.vehicleType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Number">
              {selectedParking.vehicleNumber || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedParking.vehicleDescription || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Drawer
        title="Confirm Cancel"
        open={isConfirmDrawerVisible}
        onClose={handleCancelConfirm}
        width={600}
        placement="right"
        maskClosable={false}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancelConfirm}
            style={{ padding: 0 }}
          />
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Text>Are you sure you want to cancel? All changes will be lost.</Text>
        </div>
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleCancelConfirm} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleConfirmCancel}>
            Confirm
          </Button>
        </div>
      </Drawer>

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Parking
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedParkingForDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete this parking registration?
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
              <li>All information related to this parking registration will be permanently deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ParkingTab;

