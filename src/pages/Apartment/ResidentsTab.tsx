import React, { useState, useEffect, useCallback, useRef } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, DatePicker, Select, App } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { apartmentApi } from "../../api/apartmentApi";
import type { ResidentDto } from "../../types/resident";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import dayjs from "dayjs";

const { Option } = Select;

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
  const [selectedResident, setSelectedResident] = useState<ResidentDto | null>(null);
  const [form] = Form.useForm<ResidentDto>();
  const fetchedApartmentIdRef = useRef<string | null>(null);
  const memberType = Form.useWatch("memberType", form) || "MEMBER";

  const fetchResidents = useCallback(async () => {
    if (!apartmentId) return;
    try {
      setLoading(true);
      const response = await apartmentApi.getResidents(apartmentId);
      if (response.data) {
        setResidents(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch residents" });
    } finally {
      setLoading(false);
    }
  }, [apartmentId, notification]);

  useEffect(() => {
    if (apartmentId && fetchedApartmentIdRef.current !== apartmentId) {
      fetchedApartmentIdRef.current = apartmentId;
      fetchResidents();
    }
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
    } catch {
      notification.error({ message: "Failed to fetch resident details" });
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
        notification.error({ message: "Failed to save resident" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<ResidentDto> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Member Type",
      dataIndex: "memberType",
      key: "memberType",
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Is Owner",
      dataIndex: "isOwner",
      key: "isOwner",
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
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Resident
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={residents}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} residents`,
        }}
      />

      <Modal
        title={selectedResident ? "Edit Resident" : "Add Resident"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        maskClosable={false}
        keyboard={false}
        confirmLoading={submitting}
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
      </Modal>

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
    </>
  );
};

export default ResidentsTab;

