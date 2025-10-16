import React, { useEffect, useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Space, 
  Row,
  Col
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { accountApi } from "../../api/accountApi";
import type { AccountInfoResponseDto, ChangePasswordRequestDto } from "../../types/user";

const { Title, Text } = Typography;

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<AccountInfoResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await accountApi.getAccount();
      if (response.data) {
        setProfile(response.data);
      }
    } catch  {
      message.error("Failed to fetch profile information");
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordChange = async (values: ChangePasswordRequestDto) => {
    try {
      setPasswordLoading(true);
      const response = await accountApi.changePassword(values);
      if (response.data?.isSuccess) {
        message.success("Password changed successfully!");
        passwordForm.resetFields();
        setShowChangePassword(false);
      } else {
        message.error("Failed to change password");
      }
    } catch {
      message.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <UserOutlined /> User Profile
      </Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Profile Information" loading={loading}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>Display Name:</Text>
                <br />
                <Text>{profile?.displayName || "N/A"}</Text>
              </div>
              
              <div>
                <Text strong>Email:</Text>
                <br />
                <Text>{profile?.email || "N/A"}</Text>
              </div>
              
              <div>
                <Text strong>Username:</Text>
                <br />
                <Text>{profile?.userName || "N/A"}</Text>
              </div>
              
              <div>
                <Text strong>Role:</Text>
                <br />
                <Text>{profile?.role || "N/A"}</Text>
              </div>
            </Space>
            
            <div style={{ marginTop: 24 }}>
              <Button
                type="default"
                icon={<LockOutlined />}
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                {showChangePassword ? "Hide Change Password" : "Change Password"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {showChangePassword && (
        <Row style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card title="Change Password">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  label="Current Password"
                  name="oldPassword"
                  rules={[
                    { required: true, message: "Please enter current password" }
                  ]}
                >
                  <Input.Password placeholder="Enter current password" />
                </Form.Item>

                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Please enter new password" },
                    { min: 6, message: "Password must be at least 6 characters" }
                  ]}
                >
                  <Input.Password placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                  label="Confirm New Password"
                  name="confirmNewPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: "Please confirm new password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirm new password" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={passwordLoading}
                      icon={<LockOutlined />}
                    >
                      Change Password
                    </Button>
                    <Button 
                      onClick={() => {
                        passwordForm.resetFields();
                        setShowChangePassword(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default UserProfile;
