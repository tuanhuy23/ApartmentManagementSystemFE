import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  BuildOutlined,
  DollarOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  TransactionOutlined,
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

  const hasPermission = (permissionName: string, action: string): boolean => {
    if (!user?.permissions || user.permissions.length === 0) {
      return false;
    }
    return user.permissions.includes(`${permissionName}.${action}`)
  };

  const allMenuItems = [
    {
      key: getPathWithApartmentId("/users"),
      icon: <UserOutlined />,
      label: "Users",
      permission: "Permissions.UserPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/roles"),
      icon: <SafetyOutlined />,
      label: "Roles",
      permission: "Permissions.RolePermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/apartment-buildings"),
      icon: <BuildOutlined />,
      label: "Apartment Buildings",
      permission: "Permissions.ApartmentBuildingPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/apartments"),
      icon: <ApartmentOutlined />,
      label: "Apartments",
      permission: "Permissions.ApartmentPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/fee-configuration"),
      icon: <DollarOutlined />,
      label: "Fee Configuration",
      permission: "Permissions.FeeConfigurationPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/billing-cycle"),
      icon: <CalendarOutlined />,
      label: "Billing Cycle",
      permission: "Permissions.FeeConfigurationPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/fee-notice"),
      icon: <TransactionOutlined />,
      label: "Fee Notice",
      permission: "Permissions.FeeNoticePermissions",
      action: "ReadRetrict",
    },
    {
      key: getPathWithApartmentId("/announcements"),
      icon: <NotificationOutlined />,
      label: "Announcements",
      permission: "Permissions.NotificationPermissions",
      action: "Read",
    },
    {
      key: getPathWithApartmentId("/requests"),
      icon: <QuestionCircleOutlined />,
      label: "Requests",
      permission: "Permissions.RequestPermissions",
      action: "Read",
    },
  ];

  const menuItems = allMenuItems
    .filter(item => item.permission === null || hasPermission(item.permission, item.action))
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
