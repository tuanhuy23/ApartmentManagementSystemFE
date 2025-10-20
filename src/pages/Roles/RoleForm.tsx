import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Form, Input, Button, Card, Typography, message, Spin, Checkbox, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import { roleApi } from "../../api/roleApi";
import type { RoleDto, PermissionInfo } from "../../types/user";

const { Title } = Typography;

const RoleForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  
  const isEditMode = !!roleId;

  const fetchRole = useCallback(async () => {
    if (!roleId) return;
    
    try {
      setLoading(true);
      const response = await roleApi.getAll();
      if (response.data) {
        const roleData = response.data.find(r => r.roleId === roleId);
        if (roleData) {
          setPermissions(roleData.permissions || []);
          form.setFieldsValue({
            roleName: roleData.roleName,
          });
        }
      }
    } catch {
      message.error("Failed to fetch role data");
    } finally {
      setLoading(false);
    }
  }, [roleId, form]);

  useEffect(() => {
    if (isEditMode) {
      fetchRole();
    }
  }, [isEditMode, fetchRole]);

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setPermissions(prev => 
      prev.map(p => 
        p.name === permissionName 
          ? { ...p, selected: checked }
          : p
      )
    );
  };

  const toggleCardExpansion = (cardType: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardType]: !prev[cardType]
    }));
  };

  const handleSubmit = async (values: { roleName: string }) => {
    try {
      setLoading(true);
      
      const roleData: RoleDto = {
        roleId: isEditMode ? roleId : null,
        roleName: values.roleName,
        permissions: permissions,
      };

      if (isEditMode) {
        await roleApi.update(roleData);
        message.success("Role updated successfully!");
      } else {
        await roleApi.create(roleData);
        message.success("Role created successfully!");
      }
      
      navigate("/roles");
    } catch {
      message.error(isEditMode ? "Failed to update role" : "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/roles");
  };

  // Mock permissions data - trong thực tế sẽ load từ API
  const mockPermissions = useMemo((): PermissionInfo[] => [
    { name: "user.create", displayName: "Create User", selected: false, type: "user" },
    { name: "user.read", displayName: "View Users", selected: false, type: "user" },
    { name: "user.update", displayName: "Update User", selected: false, type: "user" },
    { name: "user.delete", displayName: "Delete User", selected: false, type: "user" },
    { name: "role.create", displayName: "Create Role", selected: false, type: "role" },
    { name: "role.read", displayName: "View Roles", selected: false, type: "role" },
    { name: "role.update", displayName: "Update Role", selected: false, type: "role" },
    { name: "role.delete", displayName: "Delete Role", selected: false, type: "role" },
    { name: "apartment.create", displayName: "Create Apartment", selected: false, type: "apartment" },
    { name: "apartment.read", displayName: "View Apartments", selected: false, type: "apartment" },
    { name: "apartment.update", displayName: "Update Apartment", selected: false, type: "apartment" },
    { name: "apartment.delete", displayName: "Delete Apartment", selected: false, type: "apartment" },
  ], []);

  // Permission category descriptions
  const permissionDescriptions: Record<string, string> = {
    user: "Manage user accounts, including creating, viewing, updating, and deleting user profiles",
    role: "Control role assignments and permissions, allowing you to define what users can access",
    apartment: "Handle apartment listings, property details, and apartment management operations"
  };

  // Initialize permissions if not in edit mode
  useEffect(() => {
    if (!isEditMode && permissions.length === 0) {
      setPermissions(mockPermissions);
    }
  }, [isEditMode, permissions.length, mockPermissions]);

  if (loading && isEditMode) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Group permissions by type
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const type = permission.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(permission);
    return acc;
  }, {} as Record<string, PermissionInfo[]>);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 24 
        }}>
          <Title level={2}>
            {isEditMode ? "Update Role" : "Create New Role"}
          </Title>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Roles
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Role Name"
            name="roleName"
            rules={[
              { required: true, message: "Please input role name!" },
              { min: 2, message: "Role name must be at least 2 characters!" }
            ]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Divider>Permissions</Divider>
          
          <div style={{ marginBottom: 24 }}>
            {Object.entries(groupedPermissions).map(([type, typePermissions]) => (
              <Card 
                key={type} 
                style={{ marginBottom: 16 }}
                title={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }} 
                  onClick={() => toggleCardExpansion(type)}
                  >
                    <div>
                      <Title level={4} style={{ textTransform: 'capitalize', margin: 0 }}>
                        {type} Permissions
                      </Title>
                      <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                        {permissionDescriptions[type]}
                      </Typography.Text>
                    </div>
                    {expandedCards[type] ? <DownOutlined /> : <RightOutlined />}
                  </div>
                }
                bodyStyle={{ padding: expandedCards[type] ? '16px' : '0' }}
              >
                {expandedCards[type] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                    {typePermissions.map((permission) => (
                      <Checkbox
                        key={permission.name}
                        checked={permission.selected}
                        onChange={(e) => handlePermissionChange(permission.name!, e.target.checked)}
                      >
                        {permission.displayName}
                      </Checkbox>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              {isEditMode ? "Update Role" : "Create Role"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RoleForm;
