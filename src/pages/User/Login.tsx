import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { accountApi } from "../../api/accountApi";
import { tokenStorage } from "../../utils/storage";
import type { LoginRequestDto } from "../../types/user";

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (tokenStorage.isTokenValid()) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish = async (values: { userName: string; password: string }) => {
    setLoading(true);
    try {
      const loginData: LoginRequestDto = {
        userName: values.userName,
        password: values.password,
      };
      const response = await accountApi.login(loginData);
  
        if (response.success) {
          tokenStorage.setToken(response.data.accessToken, response.data.refreshToken, response.data.expireTime);
          
          message.success("Login successful!");
          navigate("/");
        } else {
          message.error(response.message || "Login failed!");
        }
    } catch (error: unknown) {
      let errorMessage = "Login failed!";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || "Login failed!";
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      background: "#f0f2f5"
    }}>
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Login
        </Title>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="userName"
            label="Username"
            rules={[
              { required: true, message: "Please enter your username!" },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password!" },
              { min: 6, message: "Password must be at least 6 characters!" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: "100%", height: 40 }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;