import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Card, Typography, App, Breadcrumb, Checkbox, Row, Col } from "antd";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  BuildOutlined,
  ApartmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  ReconciliationOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { roleApi } from "../../api/roleApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RoleDto, PermissionInfo } from "../../types/role";

const { Title } = Typography;

interface GroupedPermissions {
  [key: string]: PermissionInfo[];
}

const RoleForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId?: string }>();
  const apartmentBuildingId = useApartmentBuildingId();
  const isEditMode = !!roleId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingRole, setFetchingRole] = useState(false);
  const [permissions, setPermissions] = useState<PermissionInfo[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const hasFetchedPermissionsRef = useRef(false);
  const hasFetchedRoleRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedPermissionsRef.current) {
      hasFetchedPermissionsRef.current = true;
      fetchPermissions();
    }
  }, []);

  useEffect(() => {
    if (isEditMode && roleId && !hasFetchedRoleRef.current) {
      hasFetchedRoleRef.current = true;
      fetchRole();
    }
  }, [isEditMode, roleId]);

  const fetchRole = async () => {
    if (!roleId) return;
    
    try {
      setFetchingRole(true);
      const response = await roleApi.getById(roleId);
      if (response.data) {
        form.setFieldsValue({
          roleName: response.data.roleName,
        });
        
        const selected = response.data.permissions
          .filter((p) => p.selected)
          .map((p) => p.name);
        setSelectedPermissions(selected);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch role");
      notification.error({ message: errorMessage });
      navigate(`/${apartmentBuildingId}/roles`);
    } finally {
      setFetchingRole(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setFetching(true);
      const response = await roleApi.getPermissions();
      if (response.data) {
        setPermissions(response.data);
        groupPermissionsByType(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch permissions");
      notification.error({ message: errorMessage });
    } finally {
      setFetching(false);
    }
  };

  const groupPermissionsByType = (perms: PermissionInfo[]) => {
    const grouped: GroupedPermissions = {};
    perms.forEach((perm) => {
      const groupName = perm.groupName || perm.type || "Other";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(perm);
    });
    setGroupedPermissions(grouped);
  };

  const getGroupIcon = (groupName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "User": <UserOutlined />,
      "Users": <UserOutlined />,
      "Role": <SafetyOutlined />,
      "Roles": <SafetyOutlined />,
      "ApartmentBuilding": <BuildOutlined />,
      "Apartment Buildings": <BuildOutlined />,
      "Apartment": <ApartmentOutlined />,
      "Apartments": <ApartmentOutlined />,
      "Fee": <DollarOutlined />,
      "FeeConfiguration": <DollarOutlined />,
      "Fee Configuration": <DollarOutlined />,
      "Fee Notice": <ReconciliationOutlined />,
      "BillingCycle": <CalendarOutlined />,
      "Billing Cycle": <CalendarOutlined />,
      "Notification": <NotificationOutlined />,
      "Announcement": <NotificationOutlined />,
      "Announcements": <NotificationOutlined />,
      "Request": <QuestionCircleOutlined />,
      "Requests": <QuestionCircleOutlined />,
    };
    return iconMap[groupName] || <SettingOutlined />;
  };

  const getGroupDescription = (groupName: string, perms: PermissionInfo[]): string => {
    if (perms.length > 0 && perms[0].groupName) {
      return `Permissions related to ${groupName}`;
    }
    const descriptions: { [key: string]: string } = {
      "User": "Manage user accounts, roles, and access permissions",
      "Apartment": "Manage apartments, residents, and apartment-related information",
      "ApartmentBuilding": "Manage apartment buildings and building configurations",
      "Fee": "Configure fees, fee notices, and billing cycles",
      "FeeConfiguration": "Configure fee types, rates, and fee structures",
      "Notification": "Manage announcements and notifications",
      "Request": "Manage service requests and feedback",
      "Role": "Manage roles and permissions",
      "Other": "Other permissions and settings"
    };
    return descriptions[groupName] || `Permissions related to ${groupName}`;
  };

  const handlePermissionToggle = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionName]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((name) => name !== permissionName));
    }
  };

  const handleGroupToggle = (groupType: string, checked: boolean) => {
    const groupPerms = groupedPermissions[groupType] || [];
    const groupNames = groupPerms.map((p) => p.name);

    if (checked) {
      setSelectedPermissions([...new Set([...selectedPermissions, ...groupNames])]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((name) => !groupNames.includes(name)));
    }
  };

  const isGroupChecked = (groupType: string): boolean => {
    const groupPerms = groupedPermissions[groupType] || [];
    return groupPerms.length > 0 && groupPerms.every((p) => selectedPermissions.includes(p.name));
  };

  const isGroupIndeterminate = (groupType: string): boolean => {
    const groupPerms = groupedPermissions[groupType] || [];
    const selectedCount = groupPerms.filter((p) => selectedPermissions.includes(p.name)).length;
    return selectedCount > 0 && selectedCount < groupPerms.length;
  };

  const handleSubmit = async (values: { roleName: string }) => {
    try {
      setLoading(true);

      const roleData: RoleDto = {
        roleId: isEditMode && roleId ? roleId : "",
        roleName: values.roleName,
        appartmentBuildingId: apartmentBuildingId || "",
        permissions: permissions
          .filter((perm) => selectedPermissions.includes(perm.name))
          .map((perm) => ({
            name: perm.name,
            displayName: perm.displayName,
            selected: true,
            type: perm.type,
            groupName: perm.groupName,
          })),
      };

      const response = isEditMode 
        ? await roleApi.update(roleData)
        : await roleApi.create(roleData);

      if (response && response.status === 200) {
        notification.success({
          message: isEditMode ? "Role updated successfully!" : "Role created successfully!",
          duration: 3,
        });
        setTimeout(() => {
          navigate(`/${apartmentBuildingId}/roles`);
        }, 1500);
      } else {
        notification.warning({
          message: isEditMode ? "Role updated but unexpected response" : "Role created but unexpected response",
        });
        navigate(`/${apartmentBuildingId}/roles`);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, isEditMode ? "Failed to update role" : "Failed to create role");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${apartmentBuildingId}/roles`);
  };

  return (
    <div style={{ padding: 24 }}>
      <style>
        {`
          .permission-checkbox:hover {
            background-color: #f5f5f5;
          }
          .permission-checkbox.ant-checkbox-wrapper-checked:hover {
            background-color: #e6f7ff;
          }
        `}
      </style>
      <Card>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24
        }}>
          <Title level={2}>{isEditMode ? "Edit Role" : "Create New Role"}</Title>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Roles
          </Button>
        </div>

        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              href: `/${apartmentBuildingId}`,
              title: (
                <>
                  <HomeOutlined />
                  <span>Dashboard</span>
                </>
              ),
            },
            {
              href: `/${apartmentBuildingId}/roles`,
              title: "Roles",
            },
            {
              title: isEditMode ? "Edit Role" : "Create Role",
            },
          ]}
        />

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          disabled={fetchingRole}
        >
          <Form.Item
            name="roleName"
            label="Role Name"
            rules={[
              { required: true, message: "Please enter role name" },
              { max: 100, message: "Role name must not exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter role name" size="large" />
          </Form.Item>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <Title level={4}>Select Permissions</Title>
            <p style={{ color: "#8c8c8c", marginBottom: 16 }}>
              Choose the permissions for this role. Permissions are grouped by category.
            </p>
          </div>

          {fetching || fetchingRole ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Typography.Text>Loading permissions...</Typography.Text>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {Object.keys(groupedPermissions).map((groupType) => {
                const groupPerms = groupedPermissions[groupType];
                if (groupPerms.length === 0) return null;

                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={groupType}>
                    <Card
                      size="small"
                      style={{
                        marginBottom: 16,
                        height: "100%",
                      }}
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {getGroupIcon(groupType)}
                          <span>{groupType}</span>
                        </div>
                      }
                    >
                      <div style={{ marginBottom: 8, fontSize: 12, color: "#8c8c8c" }}>
                        {getGroupDescription(groupType, groupPerms)}
                      </div>
                      <Checkbox
                        checked={isGroupChecked(groupType)}
                        indeterminate={isGroupIndeterminate(groupType)}
                        onChange={(e) => handleGroupToggle(groupType, e.target.checked)}
                        style={{ marginBottom: 8, fontWeight: 500 }}
                      >
                        Select All
                      </Checkbox>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {groupPerms.map((perm) => (
                          <Checkbox
                            key={perm.name}
                            checked={selectedPermissions.includes(perm.name)}
                            onChange={(e) => handlePermissionToggle(perm.name, e.target.checked)}
                            className="permission-checkbox"
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              margin: 0,
                            }}
                          >
                            {perm.displayName || perm.name}
                          </Checkbox>
                        ))}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={handleBack} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {isEditMode ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RoleForm;

