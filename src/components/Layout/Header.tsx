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
        await accountApi.logout({ refreshToken });
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
    </AntHeader>
  );
};

export default Header;
