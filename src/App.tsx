import { Navigate } from "react-router-dom";
import AppRoutes from "./routes";
import Layout from "./components/Layout/Layout";
import { ConfigProvider, theme, Spin } from "antd";
import { useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isChangePasswordPage = location.pathname === "/change-password";
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "var(--color-primary)",
            fontFamily: "var(--font-family)",
          },
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" tip="Loading..." />
        </div>
      </ConfigProvider>
    );
  }
  
  if (!isAuthenticated && !isLoginPage && !isChangePasswordPage) {
    return <Navigate to="/login" replace />;
  }
  
  const content = isLoginPage || isChangePasswordPage ? <AppRoutes /> : (
    <Layout>
      <AppRoutes />
    </Layout>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "var(--color-primary)",
          fontFamily: "var(--font-family)",
        },
      }}
    >
      {content}
    </ConfigProvider>
  );
}

export default App;