import React, { useState } from "react";
import { Layout as AntLayout } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} />
      <AntLayout>
        <Header 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
            marginLeft: collapsed ? 96 : 216,
            transition: "margin-left 0.2s",
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
