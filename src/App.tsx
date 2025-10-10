import AppRoutes from "./routes";
import Layout from "./components/Layout/Layout";
import { ConfigProvider, theme } from "antd";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

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
      {isLoginPage ? (
        <AppRoutes />
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </ConfigProvider>
  );
}

export default App;