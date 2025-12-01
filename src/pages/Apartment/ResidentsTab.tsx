import React, { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Space, Tag, Modal, Drawer, Form, Input, DatePicker, Select, App, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
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
  const { notification, modal } = App.useApp();
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConfirmDrawerVisible, setIsConfirmDrawerVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentDto | null>(null);
  const [form] = Form.useForm<ResidentDto>();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorts, setSorts] = useState<SortQuery[]>([]);
  const fetchedApartmentIdRef = useRef<string | null>(null);
  const residentsAbortRef = useRef<AbortController | null>(null);
  const memberType = Form.useWatch("memberType", form) || "MEMBER";

  const fetchResidents = useCallback(async () => {
    if (!apartmentId) return;
    if (residentsAbortRef.current) {
      residentsAbortRef.current.abort();
    }
    const abortController = new AbortController();
    residentsAbortRef.current = abortController;

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
      
      if (!abortController.signal.aborted && response.data) {
        setResidents(response.data);
      }
    } catch (error: unknown) {
      if (!abortController.signal.aborted) {
        const errorMessage = getErrorMessage(error, "Failed to fetch residents");
        notification.error({ message: errorMessage });
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apartmentId, searchTerm, sorts, currentPage, pageSize]);

  useEffect(() => {
    if (apartmentId && fetchedApartmentIdRef.current !== apartmentId) {
      fetchedApartmentIdRef.current = apartmentId;
      fetchResidents();
    }
    return () => {
      if (residentsAbortRef.current) {
        residentsAbortRef.current.abort();
      }
    };
  }, [apartmentId, fetchResidents]);

  const handleCreate = () => {
    setSelectedResident(null);
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

  const handleDelete = (resident: ResidentDto) => {
    modal.confirm({
      title: "Delete Resident",
      content: `Are you sure you want to delete ${resident.name}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        notification.info({ message: "Delete functionality not implemented" });
      },
    });
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
      };

      await apartmentApi.createResident(apartmentId, submitData);
      notification.success({ message: selectedResident ? "Resident updated successfully!" : "Resident created successfully!" });
      setIsModalVisible(false);
      form.resetFields();
      fetchResidents();
    } catch (error: any) {
      if (error?.errorFields) {
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
      title: "Is Owner",
      dataIndex: "isOwner",
      key: "isOwner",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (isOwner: boolean) => (
        <Tag color={isOwner ? "green" : "default"}>{isOwner ? "Yes" : "No"}</Tag>
      ),
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
            onClick={() => handleDelete(record)}
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
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
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
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input />
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
                <Input />
              </Form.Item>

              <Form.Item
                label="Username"
                name="userName"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password />
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
    </>
  );
};

export default ResidentsTab;

