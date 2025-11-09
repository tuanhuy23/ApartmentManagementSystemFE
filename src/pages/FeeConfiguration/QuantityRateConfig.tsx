import React, { useState, useEffect, useRef } from "react";
import { Modal, Table, Button, InputNumber, Input, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { FeeType, QuantityRate } from "../../types/fee";

interface QuantityRateConfigProps {
  open: boolean;
  onCancel: () => void;
  onSave: (quantityRates: QuantityRate[]) => void;
  feeType: FeeType;
  buildingName: string;
}

interface QuantityRateWithTempId extends QuantityRate {
  tempId?: string;
}

const QuantityRateConfig: React.FC<QuantityRateConfigProps> = ({
  open,
  onCancel,
  onSave,
  feeType,
}) => {
  const [quantityRates, setQuantityRates] = useState<QuantityRateWithTempId[]>([]);
  const tempIdCounter = useRef(0);

  useEffect(() => {
    if (open) {
      const initialRates = (feeType.quantityRates || []).map((rate) => ({
        ...rate,
        tempId: (rate.id && rate.id.trim() !== "") ? rate.id : `temp_${tempIdCounter.current++}`,
      }));
      setQuantityRates(initialRates);
    }
  }, [open, feeType]);

  const handleAddRow = () => {
    const newRate: QuantityRateWithTempId = {
      id: "",
      tempId: `temp_${tempIdCounter.current++}`,
      itemType: "",
      unitRate: 0,
      vatRate: 0,
    };
    setQuantityRates([...quantityRates, newRate]);
  };

  const handleDelete = (tempId: string) => {
    setQuantityRates(quantityRates.filter((rate) => rate.tempId !== tempId));
  };

  const handleFieldChange = (tempId: string, field: keyof QuantityRate, value: any) => {
    setQuantityRates(
      quantityRates.map((rate) =>
        rate.tempId === tempId ? { ...rate, [field]: value } : rate
      )
    );
  };

  const handleSave = () => {
    const ratesToSave = quantityRates.map(({ tempId, ...rate }) => rate);
    onSave(ratesToSave);
  };

  const columns = [
    {
      title: "Item Type",
      key: "itemType",
      render: (_: unknown, record: QuantityRateWithTempId) => (
        <Input
          value={record.itemType}
          onChange={(e) => handleFieldChange(record.tempId!, "itemType", e.target.value)}
          placeholder="Enter item type"
        />
      ),
    },
    {
      title: "Unit Rate",
      key: "unitRate",
      render: (_: unknown, record: QuantityRateWithTempId) => (
        <InputNumber
          value={record.unitRate}
          onChange={(value) => handleFieldChange(record.tempId!, "unitRate", value || 0)}
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
      render: (_: unknown, record: QuantityRateWithTempId) => (
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
    <Modal
      title={`Rate Management: ${feeType.feeName} (QUANTITY)`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <div style={{ marginBottom: 16 }}>
        <div>
          <strong>Fee Name:</strong> <span>{feeType.feeName}</span>
        </div>
      </div>

      <Table
        rowKey="tempId"
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

