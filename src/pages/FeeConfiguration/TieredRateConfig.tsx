import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Space, Tag, Input, InputNumber, Form, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
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
  buildingName,
}) => {
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
        id: Date.now().toString(),
        configName: values.configName,
        vatRate: values.vatRate,
        bvmtFee: values.bvmtFee || 0,
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

  const handleToggleStatus = (configId: string) => {
    const targetConfig = rateConfigs.find((c) => c.id === configId);
    if (!targetConfig) return;

    const newStatus = targetConfig.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setRateConfigs(
      rateConfigs.map((config) => {
        if (config.id === configId) {
          return { ...config, status: newStatus };
        }
        // If activating this config, deactivate all others
        if (newStatus === "ACTIVE" && config.status === "ACTIVE") {
          return { ...config, status: "INACTIVE" };
        }
        return config;
      })
    );
  };

  const handleSave = () => {
    // Ensure only one active config
    const activeConfigs = rateConfigs.filter((c) => c.status === "ACTIVE");
    if (activeConfigs.length > 1) {
      message.warning("Only one config can be active at a time");
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
      title: "BVMT Fee",
      key: "bvmt",
      render: (_: unknown, record: FeeRateConfig) => `${record.bvmtFee * 100}%`,
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: FeeRateConfig) => (
        <Tag color={record.status === "ACTIVE" ? "green" : "default"}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: FeeRateConfig) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditTiers(record)}
          >
            Edit Tiers
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === "ACTIVE" ? "Deactiv" : "Activate"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Rate Management: ${feeType.feeName} (TIERED)`}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Fee Name:</strong> <span>{feeType.feeName}</span>
          </div>
          <div>
            <strong>Building:</strong> <span>{buildingName}</span>
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
      </Modal>

      {/* Create New Config Modal */}
      <Modal
        title="Create New Rate Config"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateConfig}
        okText="Create & Edit Tiers"
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
              parser={(value) => parseFloat(value!.replace("%", "")) / 100}
            />
          </Form.Item>

          <Form.Item
            name="bvmtFee"
            label="BVMT Fee"
            initialValue={0}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter BVMT fee (e.g., 0.00 for 0%)"
              min={0}
              max={1}
              step={0.01}
              formatter={(value) => `${(value! * 100).toFixed(0)}%`}
              parser={(value) => parseFloat(value!.replace("%", "")) / 100}
            />
          </Form.Item>
        </Form>
      </Modal>

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

