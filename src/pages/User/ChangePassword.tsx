import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { accountApi } from "../../api/accountApi";
import { tokenStorage } from "../../utils/storage";
import { useAuth } from "../../hooks/useAuth";
import type { ChangePasswordRequestDto } from "../../types/user";

const { Title } = Typography;

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (!tokenStorage.isTokenValid()) {
      navigate("/login");
    }
  }, [navigate]);

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const changePasswordData: ChangePasswordRequestDto = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      };

      const response = await accountApi.changePassword(changePasswordData);

      if (response && response.status === 200 && response.data?.isSuccess) {
        message.success("Password changed successfully!");
        login();
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        message.error("Failed to change password");
      }
    } catch {
      message.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 16 }}>
          Activate Account
        </Title>
        <div style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>
          Please change your password to activate your account
        </div>

        <Form
          name="changePassword"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="oldPassword"
            label="Old Password"
            rules={[
              { required: true, message: "Please enter your old password!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your old password"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your new password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your new password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%", height: 40 }}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;

