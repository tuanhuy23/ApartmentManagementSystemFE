import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Space, Tag, Modal, Drawer, Form, Input, DatePicker, Select, App, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { apartmentApi } from "../../api/apartmentApi";
import { getErrorMessage } from "../../utils/errorHandler";
import type { ResidentDto } from "../../types/resident";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

interface ResidentsTabProps {
  apartmentId: string;
}

const ResidentsTab: React.FC<ResidentsTabProps> = ({ apartmentId }) => {
  const { notification } = App.useApp();
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConfirmDrawerVisible, setIsConfirmDrawerVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentDto | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedResidentForDelete, setSelectedResidentForDelete] = useState<ResidentDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form] = Form.useForm<ResidentDto>();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const hasFetchedResidentsRef = useRef(false);
  const lastRequestKeyRef = useRef<string>("");
  const memberType = Form.useWatch("memberType", form) || "MEMBER";

  const fetchResidents = async () => {
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
          Code: "name",
          Operator: FilterOperator.Contains,
          Value: searchTerm,
        });
      }

      const response = await apartmentApi.getResidents(apartmentId, {
        filters: filters.length > 0 ? filters : undefined,
        sorts: sorts.length > 0 ? sorts : undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (response.data) {
        setResidents(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch residents");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedResidentsRef.current) {
      hasFetchedResidentsRef.current = true;
      fetchResidents();
    } else {
      fetchResidents();
    }
  }, [apartmentId, searchTerm, sorts, currentPage, pageSize]);

  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = lowercase + uppercase + numbers + special;
    let password = "";

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    const minLength = 12;
    for (let i = password.length; i < minLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split("").sort(() => Math.random() - 0.5).join("");

    setGeneratedPassword(password);
    form.setFieldValue("password", password);
    form.validateFields(["password"]);
    notification.success({ message: "Password generated successfully!" });
  };

  const handleCreate = () => {
    setSelectedResident(null);
    setGeneratedPassword("");
    form.resetFields();
    form.setFieldsValue({ memberType: "MEMBER" });
    setIsModalVisible(true);
  };

  const handleEdit = async (resident: ResidentDto) => {
    if (!apartmentId || !resident.id) return;
    try {
      setLoading(true);
      const response = await apartmentApi.getResidentDetail(apartmentId, resident.id);
      if (response.data) {
        setSelectedResident(response.data);
        form.setFieldsValue({
          ...response.data,
          brithDay: response.data.brithDay ? dayjs(response.data.brithDay) : null,
          memberType: response.data.memberType || "MEMBER",
        } as any);
        setIsModalVisible(true);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch resident details");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (resident: ResidentDto) => {
    setSelectedResidentForDelete(resident);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResidentForDelete?.id || !apartmentId) return;

    try {
      setDeleting(true);
      await apartmentApi.deleteResident(apartmentId, [selectedResidentForDelete.id]);
      notification.success({ message: "Resident deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedResidentForDelete(null);
      lastRequestKeyRef.current = "";
      await fetchResidents();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete resident");
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

      const submitData: ResidentDto = {
        ...values,
        id: selectedResident?.id || null,
        userId: selectedResident?.userId || "",
        apartmentId,
        apartmentBuildingId,
        brithDay: values.brithDay && dayjs.isDayjs(values.brithDay) ? values.brithDay.format("YYYY-MM-DD") : (values.brithDay || null),
        isOwner: values.memberType === "OWNER",
        memberType: values.memberType,
        password: values.password || generatedPassword || "",
      };

      await apartmentApi.createResident(apartmentId, submitData);
      notification.success({ message: selectedResident ? "Resident updated successfully!" : "Resident created successfully!" });
      setIsModalVisible(false);
      setGeneratedPassword("");
      form.resetFields();
      lastRequestKeyRef.current = "";
      await fetchResidents();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        notification.error({ message: "Please check your input" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to save resident");
        notification.error({ message: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelResident = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsConfirmDrawerVisible(true);
  };

  const handleConfirmCancel = () => {
    setIsModalVisible(false);
    setIsConfirmDrawerVisible(false);
    setGeneratedPassword("");
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

  const columns: ColumnsType<ResidentDto> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (text: string) => text || "N/A",
    },
    {
      title: "Member Type",
      dataIndex: "memberType",
      key: "memberType",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: ResidentDto) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#000" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            style={{ color: "#000" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Resident
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
        columns={columns}
        dataSource={residents}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} residents`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />

      <Drawer
        title={selectedResident ? "Edit Resident" : "Add Resident"}
        open={isModalVisible}
        onClose={handleCancelResident}
        width={600}
        placement="right"
        maskClosable={false}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancelResident}
            style={{ padding: 0 }}
          />
        }
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={handleCancelResident}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              {selectedResident ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter name" },
              { min: 6, message: "Name must be at least 6 characters" },
              { max: 100, message: "Name must not exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter name" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Birthday"
            name="brithDay"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Identity Number"
            name="identityNumber"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || value === "") {
                    return Promise.resolve();
                  }
                  if (!/^\d+$/.test(value)) {
                    return Promise.reject(new Error("Identity number must be numeric"));
                  }
                  if (value.length !== 12) {
                    return Promise.reject(new Error("Identity number must be exactly 12 digits"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter identity number" maxLength={12} />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^\d+$/,
                message: "Phone number must be numeric",
              },
              {
                len: 10,
                message: "Phone number must be exactly 10 digits",
              },
            ]}
          >
            <Input placeholder="Enter phone number" maxLength={10} />
          </Form.Item>

          <Form.Item
            label="Member Type"
            name="memberType"
            rules={[{ required: true, message: "Please select member type" }]}
          >
            <Select disabled={!!selectedResident}>
              <Option value="MEMBER">MEMBER</Option>
              <Option value="OWNER">OWNER</Option>
            </Select>
          </Form.Item>

          {memberType === "OWNER" && !selectedResident && (
            <>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Username"
                name="userName"
                rules={[
                  { required: true, message: "Please enter username" },
                  { min: 8, message: "Username must be at least 8 characters" },
                  { max: 32, message: "Username must not exceed 32 characters" },
                ]}
              >
                <Input placeholder="Enter username" maxLength={32} />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters"
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: "Password must contain uppercase, lowercase, number and special character!"
                  }
                ]}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input.Password
                    placeholder="Enter password"
                    style={{ flex: 1 }}
                    value={generatedPassword || form.getFieldValue("password")}
                    onChange={(e) => {
                      setGeneratedPassword(e.target.value);
                      form.setFieldValue("password", e.target.value);
                    }}
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      generatePassword();
                    }}
                    htmlType="button"
                    type="default"
                  >
                    Auto Gen
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>

      <Modal
        title="Resident Details"
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
        {selectedResident && (
          <div>
            <p><strong>Name:</strong> {selectedResident.name}</p>
            <p><strong>Email:</strong> {selectedResident.email}</p>
            <p><strong>Username:</strong> {selectedResident.userName}</p>
            <p><strong>Phone:</strong> {selectedResident.phoneNumber || "N/A"}</p>
            <p><strong>Identity Number:</strong> {selectedResident.identityNumber || "N/A"}</p>
            <p><strong>Birthday:</strong> {selectedResident.brithDay ? dayjs(selectedResident.brithDay).format("DD/MM/YYYY") : "N/A"}</p>
            <p><strong>Member Type:</strong> <Tag>{selectedResident.memberType}</Tag></p>
            <p><strong>Is Owner:</strong> <Tag color={selectedResident.isOwner ? "green" : "default"}>{selectedResident.isOwner ? "Yes" : "No"}</Tag></p>
          </div>
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
            Warning: Delete Resident
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedResidentForDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedResidentForDelete?.name}</strong>?
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
              <li>All information related to this resident will be permanently deleted</li>
              <li>If this resident is an owner, their account access will be removed</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ResidentsTab;

