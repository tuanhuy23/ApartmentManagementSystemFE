import React, { useState, useEffect } from "react";
import { Modal, Table, Button, InputNumber, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { FeeRateConfig, FeeTier } from "../../types/fee";

interface TierDetailsProps {
  open: boolean;
  onCancel: () => void;
  onSave: (tiers: FeeTier[]) => void;
  rateConfig: FeeRateConfig;
}

const TierDetails: React.FC<TierDetailsProps> = ({
  open,
  onCancel,
  onSave,
  rateConfig,
}) => {
  const [tiers, setTiers] = useState<FeeTier[]>(rateConfig.tiers || []);

  useEffect(() => {
    if (open) {
      setTiers(rateConfig.tiers || []);
    }
  }, [open, rateConfig]);

  const handleAddTier = () => {
    const newTier: FeeTier = {
      id: Date.now().toString(),
      tier: tiers.length + 1,
      from: tiers.length > 0 ? tiers[tiers.length - 1].to + 1 : 0,
      to: 999999,
      rate: 0,
    };
    setTiers([...tiers, newTier]);
  };

  const handleDelete = (id: string) => {
    const updatedTiers = tiers.filter((t) => t.id !== id);
    // Re-number tiers
    const renumberedTiers = updatedTiers.map((t, index) => ({
      ...t,
      tier: index + 1,
    }));
    setTiers(renumberedTiers);
  };

  const handleFieldChange = (id: string, field: keyof FeeTier, value: any) => {
    setTiers(
      tiers.map((tier) => {
        if (tier.id === id) {
          const updated = { ...tier, [field]: value };
          // Auto-adjust next tier's "from" if this tier's "to" changes
          if (field === "to") {
            const currentIndex = tiers.findIndex((t) => t.id === id);
            if (currentIndex < tiers.length - 1) {
              const nextTier = tiers[currentIndex + 1];
              if (nextTier.from <= value) {
                nextTier.from = value + 1;
              }
            }
          }
          return updated;
        }
        return tier;
      })
    );
  };

  const handleSave = () => {
    onSave(tiers);
  };

  const columns = [
    {
      title: "Tier",
      dataIndex: "tier",
      key: "tier",
      width: 80,
    },
    {
      title: "From (Start)",
      key: "from",
      render: (_: unknown, record: FeeTier) => (
        <InputNumber
          value={record.from}
          onChange={(value) => handleFieldChange(record.id, "from", value || 0)}
          style={{ width: "100%" }}
          min={0}
        />
      ),
    },
    {
      title: "To (End)",
      key: "to",
      render: (_: unknown, record: FeeTier) => (
        <InputNumber
          value={record.to}
          onChange={(value) => handleFieldChange(record.id, "to", value || 0)}
          style={{ width: "100%" }}
          min={record.from}
        />
      ),
    },
    {
      title: "Rate (VND/kWh)",
      key: "rate",
      render: (_: unknown, record: FeeTier) => (
        <InputNumber
          value={record.rate}
          onChange={(value) => handleFieldChange(record.id, "rate", value || 0)}
          style={{ width: "100%" }}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: FeeTier) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`Tier Details: ${rateConfig.configName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Config Name:</strong> <span>{rateConfig.configName}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>VAT Rate:</strong>{" "}
          <span>
            {rateConfig.vatRate} ({rateConfig.vatRate * 100}%)
          </span>
        </div>
        <div>
          <strong>BVMT Fee:</strong>{" "}
          <span>
            {rateConfig.bvmtFee.toFixed(2)} ({rateConfig.bvmtFee * 100}%)
          </span>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={tiers}
        columns={columns}
        pagination={false}
        footer={() => (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddTier}
            style={{ width: "100%" }}
          >
            Add New Tier
          </Button>
        )}
      />

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save Tiers
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default TierDetails;

