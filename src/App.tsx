import AppRoutes from "./routes";
import Layout from "./components/Layout/Layout";
import { ConfigProvider, theme } from "antd";

function App() {
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
      <Layout>
        <AppRoutes />
      </Layout>
    </ConfigProvider>
  );
}

export default App;