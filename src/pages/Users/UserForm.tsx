import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Card, Typography, Spin, App } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { userApi } from "../../api/userApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { CreateOrUpdateUserRequestDto } from "../../types/user";

const { Title } = Typography;
const { Option } = Select;

const UserForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const roles: any[] = [];
  
  const isEditMode = !!userId;

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await userApi.getAll();
      if (response.data) {
        const userData = response.data.find(u => u.userId === userId);
        if (userData) {
          form.setFieldsValue({
            displayName: userData.displayName,
            email: userData.email,
            userName: userData.userName,
            roleId: userData.roleId,
            phoneNumber: userData.phoneNumber,
            appartmentBuildingId: userData.appartmentId,
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch user data");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const userData: CreateOrUpdateUserRequestDto = {
        userId: isEditMode ? userId : null,
        displayName: values.displayName,
        email: values.email,
        roleId: values.roleId,
        possition: values.possition,
        userName: values.userName,
        phoneNumber: values.phoneNumber,
        appartmentBuildingId: values.appartmentBuildingId,
      };

      if (isEditMode) {
        await userApi.update(userData);
        notification.success({ message: "User updated successfully!" });
      } else {
        await userApi.create(userData);
        notification.success({ message: "User created successfully!" });
      }
      
      navigate(`/${apartmentBuildingId}/users`);
    } catch (error: unknown) {
      const defaultMessage = isEditMode ? "Failed to update user" : "Failed to create user";
      const errorMessage = getErrorMessage(error, defaultMessage);
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${apartmentBuildingId}/users`);
  };

  if (loading && isEditMode) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

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
            {isEditMode ? "Update User" : "Create New User"}
          </Title>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Users
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              label="Display Name"
              name="displayName"
              rules={[
                { required: true, message: "Please input display name!" },
                { min: 2, message: "Display name must be at least 2 characters!" }
              ]}
            >
              <Input placeholder="Enter display name" />
            </Form.Item>

            <Form.Item
              label="Username"
              name="userName"
              rules={[
                { required: true, message: "Please input username!" },
                { min: 3, message: "Username must be at least 3 characters!" }
              ]}
            >
              <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: "Please enter a valid phone number!" }
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select placeholder="Select a role">
                {roles.map((role) => (
                  <Option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Position"
              name="possition"
            >
              <Input placeholder="Enter position" />
            </Form.Item>

            <Form.Item
              label="Apartment Building ID"
              name="appartmentBuildingId"
            >
              <Input placeholder="Enter apartment building ID" />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              {isEditMode ? "Update User" : "Create User"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
