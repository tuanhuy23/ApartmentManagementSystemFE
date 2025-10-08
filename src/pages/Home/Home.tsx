import React, { useEffect, useState } from "react";
import { Table, Typography } from "antd";
import { userApi } from "../../api/userApi";
import type { User } from "../../types/user";

const Home: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    userApi.getAll().then(response => setUsers(response.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>User List</Typography.Title>
      <Table
        rowKey="id"
        dataSource={users}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
        ]}
      />
    </div>
  );
};

export default Home;