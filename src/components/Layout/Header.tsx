import React, { useState } from "react";
import { Layout, Button, Dropdown, Badge, Avatar, Space, Drawer, List, Typography, Tag } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { accountApi } from "../../api/accountApi";
import { tokenStorage } from "../../utils/storage";
import { useAuth } from "../../hooks/useAuth";

const { Text } = Typography;

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await accountApi.logout(refreshToken);
      } catch (error) {
      }
    }
    tokenStorage.removeToken();
    logout();
    window.location.href = "/login";
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: handleProfileClick,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const notifications = [
    {
      id: "1",
      title: "New Tenant Registered",
      description: "John Doe has registered for apartment A-101",
      time: "2 minutes ago",
      type: "success",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    },
    {
      id: "2",
      title: "Contract Expires Soon",
      description: "Contract for apartment B-205 expires in 7 days",
      time: "1 hour ago",
      type: "warning",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
    },
    {
      id: "3",
      title: "Payment Received",
      description: "Monthly rent payment received from Jane Smith",
      time: "3 hours ago",
      type: "success",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    },
    {
      id: "4",
      title: "Maintenance Request",
      description: "New maintenance request for apartment C-301",
      time: "5 hours ago",
      type: "info",
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
    },
    {
      id: "5",
      title: "Contract Renewal",
      description: "Contract renewal request from Mike Johnson",
      time: "1 day ago",
      type: "info",
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: "0 24px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        marginLeft: collapsed ? 80 : 200,
        transition: "margin-left 0.2s",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />

      <Space size="middle">
        <Badge count={notifications.length} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ fontSize: "18px" }}
            onClick={() => setNotificationDrawerOpen(true)}
          />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="text" style={{ padding: "4px 8px" }}>
            <Space>
              <Avatar icon={<UserOutlined />} size="small" />
              <span>{user?.displayName || user?.userName || "User"}</span>
            </Space>
          </Button>
        </Dropdown>
      </Space>

      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Notifications</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setNotificationDrawerOpen(false)}
            />
          </div>
        }
        placement="right"
        onClose={() => setNotificationDrawerOpen(false)}
        open={notificationDrawerOpen}
        width={400}
        closable={false}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong>{item.title}</Text>
                    <Tag color={item.type === "success" ? "green" : item.type === "warning" ? "orange" : "blue"}>
                      {item.type}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{item.description}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      {item.time}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </AntHeader>
  );
};

export default Header;
