import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Typography, Space, App } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { apartmentApi } from "../../api/apartmentApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { CreateOrUpdateApartmentDto } from "../../types/apartment";

const { Title } = Typography;

const ApartmentForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const apartmentBuildingId = useApartmentBuildingId();
  const isEditMode = !!apartmentId;

  useEffect(() => {
    if (isEditMode && apartmentId) {
      fetchApartment(apartmentId);
    }
  }, [apartmentId, isEditMode]);

  const fetchApartment = async (id: string) => {
    try {
      setLoading(true);
      const response = await apartmentApi.getById(id);
      if (response.data) {
        form.setFieldsValue({
          name: response.data.name,
          area: response.data.area,
          floor: response.data.floor,
        });
      }
    } catch {
      notification.error({ message: "Failed to fetch apartment details" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CreateOrUpdateApartmentDto) => {
    try {
      setLoading(true);
      if (isEditMode) {
        notification.error({ message: "Update functionality not available in API" });
        setLoading(false);
        return;
      }  
      await apartmentApi.create({
        ...values,
        apartmentBuildingId: apartmentBuildingId || "",
      });
      notification.success({ message: "Apartment created successfully!" });
      navigate(`/${apartmentBuildingId}/apartments`);
    } catch (error: any) {
      console.error("Error saving apartment:", error);
      let errorMessage = "Failed to save apartment";
      
      if (error?.response?.data) {
        if (error.response.data.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Title level={2}>{isEditMode ? "Edit Apartment" : "Create New Apartment"}</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Apartment Name"
          rules={[{ required: true, message: "Please enter apartment name" }]}
        >
          <Input placeholder="Enter apartment name" />
        </Form.Item>

        <Form.Item
          name="area"
          label="Area (m²)"
          rules={[
            { required: true, message: "Please enter area" },
            { type: "number", min: 0, message: "Area must be greater than 0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter area in square meters"
            min={0}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          name="floor"
          label="Floor"
          rules={[
            { required: true, message: "Please enter floor number" },
            { type: "number", min: 0, message: "Floor must be 0 or greater" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Enter floor number"
            min={0}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? "Update" : "Create"}
            </Button>
            <Button onClick={() => navigate(`/${apartmentBuildingId}/apartments`)}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ApartmentForm;

