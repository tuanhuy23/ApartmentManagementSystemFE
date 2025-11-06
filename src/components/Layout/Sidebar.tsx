import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
  BuildOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getApartmentBuildingIdFromToken } from "../../utils/token";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  const apartmentBuildingId = pathParts[0] && pathParts[0] !== 'login' && pathParts[0] !== 'change-password' && pathParts[0] !== 'profile'
    ? pathParts[0]
    : getApartmentBuildingIdFromToken();

  const getPathWithApartmentId = (path: string) => {
    if (!apartmentBuildingId) return path;
    if (path === '/') return `/${apartmentBuildingId}`;
    return `/${apartmentBuildingId}${path}`;
  };

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Dashboard",
    },
    {
      key: getPathWithApartmentId("/users"),
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: getPathWithApartmentId("/apartment-buildings"),
      icon: <BuildOutlined />,
      label: "Apartment Buildings",
    },
    {
      key: getPathWithApartmentId("/fee-configuration"),
      icon: <DollarOutlined />,
      label: "Fee Configuration",
    },
    {
      key: getPathWithApartmentId("/tenants"),
      icon: <TeamOutlined />,
      label: "Tenants",
    },
    {
      key: getPathWithApartmentId("/contracts"),
      icon: <FileTextOutlined />,
      label: "Contracts",
    },
    {
      key: getPathWithApartmentId("/settings"),
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {collapsed ? "AMS" : "Apartment Management"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
