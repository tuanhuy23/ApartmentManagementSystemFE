import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { apartmentBuildingApi } from "../../api/apartmentBuildingApi";
import type { CreateApartmentBuildingDto, ApartmentBuildingImageDto } from "../../types/apartmentBuilding";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormValues {
  name: string;
  code: string;
  address: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  currencyUnit: string;
  apartmentBuildingImgUrl?: string;
  managementDisplayName: string;
  managementEmail: string;
  managementUserName: string;
  managementPhoneNumber: string;
  managementPassword: string;
}

const ApartmentBuildingForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ApartmentBuildingImageDto[]>([]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      const apartmentBuildingData: CreateApartmentBuildingDto = {
        name: values.name,
        code: values.code,
        address: values.address,
        description: values.description || null,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        currencyUnit: values.currencyUnit,
        apartmentBuildingImgUrl: values.apartmentBuildingImgUrl || null,
        images: images.length > 0 ? images : null,
        managementDisplayName: values.managementDisplayName,
        managementEmail: values.managementEmail,
        managementUserName: values.managementUserName,
        managementPhoneNumber: values.managementPhoneNumber,
        managementPassword: values.managementPassword,
      };

      await apartmentBuildingApi.createApartmentBuilding(apartmentBuildingData);
      message.success("Apartment building created successfully!");
      navigate("/apartment-buildings");
    } catch  {
      message.error("Failed to create apartment building");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/apartment-buildings");
  };

  const addImage = () => {
    const newImage: ApartmentBuildingImageDto = {
      id: null,
      name: null,
      description: null,
      src: null,
    };
    setImages([...images, newImage]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const updateImage = (index: number, field: keyof ApartmentBuildingImageDto, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 24 
        }}>
          <Title level={2}>
            Create New Apartment Building
          </Title>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Apartment Buildings
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* Basic Information */}
          <Title level={4}>Basic Information</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please input apartment building name!" },
                { min: 2, message: "Name must be at least 2 characters!" }
              ]}
            >
              <Input placeholder="Enter apartment building name" />
            </Form.Item>

            <Form.Item
              label="Code"
              name="code"
              rules={[
                { required: true, message: "Please input apartment building code!" },
                { min: 2, message: "Code must be at least 2 characters!" }
              ]}
            >
              <Input placeholder="Enter apartment building code" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input address!" }
              ]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>

            <Form.Item
              label="Currency Unit"
              name="currencyUnit"
              rules={[
                { required: true, message: "Please select currency unit!" }
              ]}
            >
              <Select placeholder="Select currency unit">
                <Option value="VND">VND (Vietnamese Dong)</Option>
                <Option value="USD">USD (US Dollar)</Option>
                <Option value="EUR">EUR (Euro)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Contact Email"
              name="contactEmail"
              rules={[
                { required: true, message: "Please input contact email!" },
                { type: "email", message: "Please enter a valid email!" }
              ]}
            >
              <Input placeholder="Enter contact email" />
            </Form.Item>

            <Form.Item
              label="Contact Phone"
              name="contactPhone"
              rules={[
                { required: true, message: "Please input contact phone!" },
                { pattern: /^[0-9+\-\s()]+$/, message: "Please enter a valid phone number!" }
              ]}
            >
              <Input placeholder="Enter contact phone" />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            label="Main Image URL"
            name="apartmentBuildingImgUrl"
          >
            <Input placeholder="Enter main image URL" />
          </Form.Item>

          {/* Management Information */}
          <Title level={4}>Management Information</Title>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <Form.Item
              label="Management Display Name"
              name="managementDisplayName"
              rules={[
                { required: true, message: "Please input management display name!" }
              ]}
            >
              <Input placeholder="Enter management display name" />
            </Form.Item>

            <Form.Item
              label="Management Email"
              name="managementEmail"
              rules={[
                { required: true, message: "Please input management email!" },
                { type: "email", message: "Please enter a valid email!" }
              ]}
            >
              <Input placeholder="Enter management email" />
            </Form.Item>

            <Form.Item
              label="Management Username"
              name="managementUserName"
              rules={[
                { required: true, message: "Please input management username!" }
              ]}
            >
              <Input placeholder="Enter management username" />
            </Form.Item>

            <Form.Item
              label="Management Phone Number"
              name="managementPhoneNumber"
              rules={[
                { required: true, message: "Please input management phone number!" },
                { pattern: /^[0-9+\-\s()]+$/, message: "Please enter a valid phone number!" }
              ]}
            >
              <Input placeholder="Enter management phone number" />
            </Form.Item>

            <Form.Item
              label="Management Password"
              name="managementPassword"
              rules={[
                { required: true, message: "Please input management password!" },
                { min: 6, message: "Password must be at least 6 characters!" }
              ]}
            >
              <Input.Password placeholder="Enter management password" />
            </Form.Item>
          </div>

          {/* Additional Images */}
          <Title level={4}>Additional Images</Title>
          <div style={{ marginBottom: 24 }}>
            <Button 
              type="dashed" 
              onClick={addImage} 
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              Add Image
            </Button>
            
            {images.map((image, index) => (
              <Card key={index} size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "center" }}>
                  <Input
                    placeholder="Image name"
                    value={image.name || ""}
                    onChange={(e) => updateImage(index, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Image URL"
                    value={image.src || ""}
                    onChange={(e) => updateImage(index, "src", e.target.value)}
                  />
                  <Input
                    placeholder="Image description"
                    value={image.description || ""}
                    onChange={(e) => updateImage(index, "description", e.target.value)}
                  />
                  <Button 
                    type="text" 
                    danger 
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeImage(index)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Create Apartment Building
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ApartmentBuildingForm;
