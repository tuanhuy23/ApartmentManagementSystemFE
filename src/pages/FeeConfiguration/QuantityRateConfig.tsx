import React, { useState, useEffect } from "react";
import { Modal, Table, Button, InputNumber, Input, Space, Form } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { FeeType, QuantityRate } from "../../types/fee";

interface QuantityRateConfigProps {
  open: boolean;
  onCancel: () => void;
  onSave: (quantityRates: QuantityRate[]) => void;
  feeType: FeeType;
  buildingName: string;
}

const QuantityRateConfig: React.FC<QuantityRateConfigProps> = ({
  open,
  onCancel,
  onSave,
  feeType,
  buildingName,
}) => {
  const [quantityRates, setQuantityRates] = useState<QuantityRate[]>(
    feeType.quantityRates || []
  );

  useEffect(() => {
    if (open) {
      setQuantityRates(feeType.quantityRates || []);
    }
  }, [open, feeType]);

  const handleAddRow = () => {
    const newRate: QuantityRate = {
      id: Date.now().toString(),
      itemType: "",
      unitRate: 0,
      vatRate: 0,
    };
    setQuantityRates([...quantityRates, newRate]);
  };

  const handleDelete = (id: string) => {
    setQuantityRates(quantityRates.filter((rate) => rate.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof QuantityRate, value: any) => {
    setQuantityRates(
      quantityRates.map((rate) =>
        rate.id === id ? { ...rate, [field]: value } : rate
      )
    );
  };

  const handleSave = () => {
    onSave(quantityRates);
  };

  const columns = [
    {
      title: "Item Type",
      key: "itemType",
      render: (_: unknown, record: QuantityRate) => (
        <Input
          value={record.itemType}
          onChange={(e) => handleFieldChange(record.id, "itemType", e.target.value)}
          placeholder="Enter item type"
        />
      ),
    },
    {
      title: "Unit Rate",
      key: "unitRate",
      render: (_: unknown, record: QuantityRate) => (
        <InputNumber
          value={record.unitRate}
          onChange={(value) => handleFieldChange(record.id, "unitRate", value || 0)}
          style={{ width: "100%" }}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
        />
      ),
    },
    {
      title: "VAT Rate",
      key: "vatRate",
      render: (_: unknown, record: QuantityRate) => (
        <InputNumber
          value={record.vatRate}
          onChange={(value) => handleFieldChange(record.id, "vatRate", value || 0)}
          style={{ width: "100%" }}
          min={0}
          max={1}
          step={0.01}
          formatter={(value) => `${(value! * 100).toFixed(0)}%`}
          parser={(value) => parseFloat(value!.replace("%", "")) / 100}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: QuantityRate) => (
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
      title={`Rate Management: ${feeType.feeName} (QUANTITY)`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Fee Name:</strong> <span>{feeType.feeName}</span>
        </div>
        <div>
          <strong>Building:</strong> <span>{buildingName}</span>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={quantityRates}
        columns={columns}
        pagination={false}
        footer={() => (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
            style={{ width: "100%" }}
          >
            Add New Row
          </Button>
        )}
      />

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save Rates
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default QuantityRateConfig;

