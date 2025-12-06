import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BuildOutlined,
  DollarOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { useAuth } from "../../hooks/useAuth";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  const apartmentBuildingId = pathParts[0] && pathParts[0] !== 'login' && pathParts[0] !== 'change-password' && pathParts[0] !== 'profile'
    ? pathParts[0]
    : getApartmentBuildingIdFromToken();

  const getPathWithApartmentId = (path: string) => {
    if (!apartmentBuildingId) return path;
    if (path === '/') return `/${apartmentBuildingId}`;
    return `/${apartmentBuildingId}${path}`;
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user?.permissions || user.permissions.length === 0) {
      return false;
    }
    return user.permissions.includes(`${permissionName}.Read`) || 
           user.permissions.includes(`${permissionName}.ReadWrite`);
  };

  const allMenuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Dashboard",
      permission: null,
    },
    {
      key: getPathWithApartmentId("/users"),
      icon: <UserOutlined />,
      label: "Users",
      permission: "Permissions.UserPermissions",
    },
    {
      key: getPathWithApartmentId("/roles"),
      icon: <SafetyOutlined />,
      label: "Roles",
      permission: "Permissions.RolePermissions",
    },
    {
      key: getPathWithApartmentId("/apartment-buildings"),
      icon: <BuildOutlined />,
      label: "Apartment Buildings",
      permission: "Permissions.ApartmentBuildingPermissions",
    },
    {
      key: getPathWithApartmentId("/apartments"),
      icon: <ApartmentOutlined />,
      label: "Apartments",
      permission: "Permissions.ApartmentPermissions",
    },
    {
      key: getPathWithApartmentId("/fee-configuration"),
      icon: <DollarOutlined />,
      label: "Fee Configuration",
      permission: "Permissions.FeeConfigurationPermissions",
    },
    {
      key: getPathWithApartmentId("/billing-cycle"),
      icon: <CalendarOutlined />,
      label: "Billing Cycle",
      permission: "Permissions.FeeConfigurationPermissions",
    },
    {
      key: getPathWithApartmentId("/announcements"),
      icon: <NotificationOutlined />,
      label: "Announcements",
      permission: "Permissions.NotificationPermissions",
    },
    {
      key: getPathWithApartmentId("/requests"),
      icon: <QuestionCircleOutlined />,
      label: "Requests",
      permission: "Permissions.RequestPermissions",
    },
  ];

  const menuItems = allMenuItems
    .filter(item => item.permission === null || hasPermission(item.permission))
    .map(({ permission, ...item }) => item);

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
