import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Switch, DatePicker, App, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { announcementApi } from "../../api/announcementApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { getErrorMessage } from "../../utils/errorHandler";
import type { AnnouncementDto } from "../../types/announcement";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

const AnnouncementForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<AnnouncementDto>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const buildingId = getApartmentBuildingIdFromToken();
      
      if (!buildingId) {
        notification.error({ message: "Apartment building ID not found" });
        return;
      }

      setLoading(true);

      const submitData: AnnouncementDto = {
        id: null,
        apartmentBuildingId: buildingId,
        title: values.title,
        body: values.body,
        status: "DRAFT",
        isAll: values.isAll || false,
        apartmentIds: values.isAll ? null : (values.apartmentIds || null),
        publishDate: values.publishDate && dayjs.isDayjs(values.publishDate) 
          ? values.publishDate.format("YYYY-MM-DD") 
          : dayjs().format("YYYY-MM-DD"),
        files: [],
      };

      await announcementApi.create(submitData);
      notification.success({ message: "Announcement created successfully!" });
      navigate(`/${apartmentBuildingId}/announcements`);
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your input" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to create announcement");
        notification.error({ message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Create Announcement</Title>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}
          >
            Back
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Body"
            name="body"
            rules={[{ required: true, message: "Please enter body" }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            label="Is All"
            name="isAll"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Publish Date"
            name="publishDate"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Create Announcement
              </Button>
              <Button onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AnnouncementForm;

