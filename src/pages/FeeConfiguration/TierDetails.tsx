import React, { useState, useEffect, useRef } from "react";
import { Drawer, Table, Button, InputNumber, Space } from "antd";
import { PlusOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import type { FeeRateConfig, FeeTier } from "../../types/fee";

interface TierDetailsProps {
  open: boolean;
  onCancel: () => void;
  onSave: (tiers: FeeTier[]) => void;
  rateConfig: FeeRateConfig;
}

interface TierWithTempId extends FeeTier {
  tempId?: string;
}

const TierDetails: React.FC<TierDetailsProps> = ({
  open,
  onCancel,
  onSave,
  rateConfig,
}) => {
  const [tiers, setTiers] = useState<TierWithTempId[]>([]);
  const tempIdCounter = useRef(0);

  useEffect(() => {
    if (open) {
      const initialTiers = (rateConfig.tiers || []).map((tier) => ({
        ...tier,
        tempId: tier.id || `temp_${tempIdCounter.current++}`,
      }));
      setTiers(initialTiers);
    }
  }, [open, rateConfig]);

  const handleAddTier = () => {
    const newTier: TierWithTempId = {
      id: "",
      tempId: `temp_${tempIdCounter.current++}`,
      tier: tiers.length + 1,
      from: tiers.length > 0 ? tiers[tiers.length - 1].to + 1 : 0,
      to: 999999,
      rate: 0,
    };
    setTiers([...tiers, newTier]);
  };

  const handleDelete = (tempId: string) => {
    const updatedTiers = tiers.filter((t) => t.tempId !== tempId);
    const renumberedTiers = updatedTiers.map((t, index) => ({
      ...t,
      tier: index + 1,
    }));
    setTiers(renumberedTiers);
  };

  const handleFieldChange = (tempId: string, field: keyof FeeTier, value: any) => {
    const currentIndex = tiers.findIndex((t) => t.tempId === tempId);
    if (currentIndex === -1) return;

    setTiers(
      tiers.map((tier, index) => {
        if (tier.tempId === tempId) {
          return { ...tier, [field]: value };
        }
        if (field === "from" && index === currentIndex - 1) {
          return { ...tier, to: value - 1 };
        }
        if (field === "to" && index === currentIndex + 1) {
          return { ...tier, from: value + 1 };
        }
        return tier;
      })
    );
  };

  const handleSave = () => {
    const tiersToSave = tiers.map(({ tempId, ...tier }) => tier);
    onSave(tiersToSave);
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
      render: (_: unknown, record: TierWithTempId) => (
        <InputNumber
          value={record.from}
          onChange={(value) => handleFieldChange(record.tempId!, "from", value || 0)}
          style={{ width: "100%" }}
          min={0}
        />
      ),
    },
    {
      title: "To (End)",
      key: "to",
      render: (_: unknown, record: TierWithTempId) => (
        <InputNumber
          value={record.to}
          onChange={(value) => handleFieldChange(record.tempId!, "to", value || 0)}
          style={{ width: "100%" }}
          min={record.from}
        />
      ),
    },
    {
      title: `Rate (${rateConfig.unitName || "unit"})`,
      key: "rate",
      render: (_: unknown, record: TierWithTempId) => (
        <InputNumber
          value={record.rate}
          onChange={(value) => handleFieldChange(record.tempId!, "rate", value || 0)}
          style={{ width: "100%" }}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, "")) || 0}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: TierWithTempId) => (
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined style={{ color: "#000" }} />}
          onClick={() => handleDelete(record.tempId!)}
          style={{ color: "#000" }}
        />
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Tier Details: {rateConfig.configName}</span>
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
        mask: { zIndex: 999 }
      }}
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
        rowKey="tempId"
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
    </Drawer>
  );
};

export default TierDetails;

