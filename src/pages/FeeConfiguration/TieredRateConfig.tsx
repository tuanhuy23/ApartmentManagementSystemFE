import React, { useState, useEffect } from "react";
import { Drawer, Table, Button, Space, Input, InputNumber, Form, App, Popconfirm, Switch } from "antd";
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, CloseOutlined } from "@ant-design/icons";
import type { FeeType, FeeRateConfig } from "../../types/fee";
import TierDetails from "./TierDetails";

interface TieredRateConfigProps {
  open: boolean;
  onCancel: () => void;
  onSave: (rateConfigs: FeeRateConfig[]) => void;
  feeType: FeeType;
  buildingName: string;
}

const TieredRateConfig: React.FC<TieredRateConfigProps> = ({
  open,
  onCancel,
  onSave,
  feeType,
  buildingName: _buildingName,
}) => {
  const { notification } = App.useApp();
  const [rateConfigs, setRateConfigs] = useState<FeeRateConfig[]>(
    feeType.rateConfigs || []
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTierDetailsOpen, setIsTierDetailsOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FeeRateConfig | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setRateConfigs(feeType.rateConfigs || []);
    }
  }, [open, feeType]);

  const handleCreateNew = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreateConfig = () => {
    form.validateFields().then((values) => {
      const newConfig: FeeRateConfig = {
        id: "",
        configName: values.configName,
        vatRate: values.vatRate,
        bvmtFee: values.bvmtFee || 0,
        unitName: values.unitName || "",
        status: "INACTIVE",
        tiers: [],
      };
      setRateConfigs([...rateConfigs, newConfig]);
      setIsCreateModalOpen(false);
      form.resetFields();
      setEditingConfig(newConfig);
      setIsTierDetailsOpen(true);
    });
  };

  const handleEditTiers = (config: FeeRateConfig) => {
    setEditingConfig(config);
    setIsTierDetailsOpen(true);
  };

  const handleTiersSave = (tiers: FeeRateConfig["tiers"]) => {
    if (editingConfig) {
      setRateConfigs(
        rateConfigs.map((config) =>
          config.id === editingConfig.id ? { ...config, tiers } : config
        )
      );
    }
    setIsTierDetailsOpen(false);
    setEditingConfig(null);
  };

  const handleDeleteConfig = (configId: string) => {
    setRateConfigs(rateConfigs.filter((config) => config.id !== configId));
    notification.success({ message: "Config deleted successfully" });
  };

  const handleToggleActive = (configId: string, checked: boolean) => {
    setRateConfigs(
      rateConfigs.map((config) =>
        config.id === configId
          ? { ...config, status: checked ? "ACTIVE" : "INACTIVE" }
          : config
      )
    );
  };

  const handleSave = () => {
    // Ensure only one active config
    const activeConfigs = rateConfigs.filter((c) => c.status === "ACTIVE");
    if (activeConfigs.length > 1) {
      notification.warning({ message: "Only one config can be active at a time" });
      return;
    }
    onSave(rateConfigs);
  };

  const columns = [
    {
      title: "Config Name",
      dataIndex: "configName",
      key: "configName",
    },
    {
      title: "VAT",
      key: "vat",
      render: (_: unknown, record: FeeRateConfig) => `${record.vatRate * 100}%`,
    },
    {
      title: "Other Fee",
      key: "bvmt",
      render: (_: unknown, record: FeeRateConfig) => `${record.bvmtFee * 100}%`,
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: FeeRateConfig) => (
        record.status === "ACTIVE" ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
        ) : (
          <CloseCircleOutlined style={{ color: "#8c8c8c", fontSize: "18px" }} />
        )
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: unknown, record: FeeRateConfig) => (
        <Space size="middle">
          <Switch
            checked={record.status === "ACTIVE"}
            onChange={(checked) => handleToggleActive(record.id, checked)}
            size="small"
          />
          <Button
            type="text"
            size="small"
            onClick={() => handleEditTiers(record)}
            style={{ color: "#000" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete config"
            description="Are you sure you want to delete this config?"
            onConfirm={() => handleDeleteConfig(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              style={{ color: "#000" }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Rate Management: {feeType.feeName} (TIERED)</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onCancel}
            />
          </div>
        }
        placement="right"
        onClose={onCancel}
        open={open}
        width={600}
        closable={false}
        maskClosable={false}
        zIndex={1000}
        styles={{ 
          body: { transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)" },
          mask: { zIndex: 999 },
          wrapper: { transform: "translateX(0) !important" as any }
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div>
            <strong>Fee Name:</strong> <span>{feeType.feeName}</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Create New Rate Config
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={rateConfigs}
          columns={columns}
          pagination={false}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Space>
            <Button onClick={onCancel}>Close</Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Space>
        </div>
      </Drawer>

      {/* Create New Config Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Create New Rate Config</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
            />
          </div>
        }
        placement="right"
        onClose={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        open={isCreateModalOpen}
        width={600}
        closable={false}
        maskClosable={false}
        zIndex={1000}
        styles={{ 
          body: { transition: "transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)" },
          mask: { zIndex: 999, transition: "opacity 0.3s ease-in-out" },
          wrapper: { transform: "translateX(0) !important" as any }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="configName"
            label="Config Name"
            rules={[{ required: true, message: "Please enter config name" }]}
          >
            <Input placeholder="Enter config name" />
          </Form.Item>

          <Form.Item
            name="vatRate"
            label="VAT Rate"
            rules={[{ required: true, message: "Please enter VAT rate" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter VAT rate (e.g., 0.08 for 8%)"
              min={0}
              max={1}
              step={0.01}
              formatter={(value) => `${(value! * 100).toFixed(0)}%`}
              parser={((value: string | undefined) => {
                if (!value) return 0;
                const num = parseFloat(value.replace("%", "")) / 100;
                return isNaN(num) ? 0 : num;
              }) as any}
            />
          </Form.Item>

          <Form.Item
            name="unitName"
            label="Unit Name"
            rules={[{ required: true, message: "Please enter unit name" }]}
          >
            <Input placeholder="Enter unit name" />
          </Form.Item>

          <Form.Item
            name="bvmtFee"
            label="Other Fee"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter other fee (e.g., 0.00 for 0%)"
              min={0}
              max={1}
              step={0.01}
              formatter={(value) => `${(value! * 100).toFixed(0)}%`}
              parser={((value: string | undefined) => {
                if (!value) return 0;
                const num = parseFloat(value.replace("%", "")) / 100;
                return isNaN(num) ? 0 : num;
              }) as any}
            />
            </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={handleCreateConfig}>
                Create & Edit Tiers
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Tier Details Modal */}
      {editingConfig && (
        <TierDetails
          open={isTierDetailsOpen}
          onCancel={() => {
            setIsTierDetailsOpen(false);
            setEditingConfig(null);
          }}
          onSave={handleTiersSave}
          rateConfig={editingConfig}
        />
      )}
    </>
  );
};

export default TieredRateConfig;

