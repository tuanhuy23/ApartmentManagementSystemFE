import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Select, Button, Card, Typography, Spin, App, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { userApi } from "../../api/userApi";
import { roleApi } from "../../api/roleApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { CreateOrUpdateUserRequestDto } from "../../types/user";
import type { RoleDto } from "../../types/role";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;
const { Option } = Select;

const UserForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [userRoleId, setUserRoleId] = useState<string>("");
  const hasFetchedRolesRef = useRef(false);
  const hasFetchedUserRef = useRef(false);

  const { user } = useAuth();
  
  const isEditMode = !!userId;

  useEffect(() => {
    if (!hasFetchedRolesRef.current) {
      hasFetchedRolesRef.current = true;
      fetchRoles();
    }
  }, []);

  useEffect(() => {
    if (isEditMode && userId && !hasFetchedUserRef.current) {
      hasFetchedUserRef.current = true;
      fetchUser();
    }
  }, [isEditMode, userId]);

  const fetchRoles = async () => {
    if (user?.roleName === "SupperAdmin") return;
    try {
      setFetchingRoles(true);
      const response = await roleApi.getAll();
      if (response.data) {
        setRoles(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch roles");
      notification.error({ message: errorMessage });
    } finally {
      setFetchingRoles(false);
    }
  };

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

  const fetchUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await userApi.getById(userId);
      if (response.data) {
        setUserRoleId(response.data.roleId || "");
        form.setFieldsValue({
          displayName: response.data.displayName,
          email: response.data.email,
          userName: response.data.userName,
          roleId: response.data.roleId || "",
          phoneNumber: response.data.phoneNumber || "",
        });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch user data");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode && userRoleId && roles.length > 0) {
      const roleExists = roles.some(role => role.roleId === userRoleId);
      if (roleExists) {
        form.setFieldValue("roleId", userRoleId);
      }
    }
  }, [userRoleId, roles, isEditMode]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const userData: CreateOrUpdateUserRequestDto = {
        userId: isEditMode && userId ? userId : "",
        displayName: values.displayName,
        email: values.email,
        roleId: user?.roleName != "SupperAdmin" ? values.roleId : userRoleId,
        userName: values.userName,
        phoneNumber: values.phoneNumber || "",
        appartmentBuildingId: apartmentBuildingId || "",
        password: isEditMode ? "" : (values.password || generatedPassword || ""),
        apartmentId: "",
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

            {user?.roleName != "SupperAdmin" && (<Form.Item
              label="Role"
              name="roleId"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select 
                placeholder="Select a role"
                loading={fetchingRoles}
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label || option?.children;
                  return String(label || "").toLowerCase().includes(input.toLowerCase());
                }}
              >
                {roles.map((role) => (
                  <Option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>)}

            {!isEditMode && (
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input password!" },
                  { 
                    min: 8, 
                    message: "Password must be at least 8 characters!" 
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
            )}
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
