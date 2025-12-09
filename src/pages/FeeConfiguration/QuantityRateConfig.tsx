import React, { useState, useEffect, useRef } from "react";
import { Drawer, Table, Button, InputNumber, Input, Space, Select } from "antd";
import { PlusOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import type { FeeType, QuantityRate } from "../../types/fee";

const { Option } = Select;

const ITEM_TYPE_OPTIONS = [
  "Electric Motorbike",
  "Motorbike",
  "Electric Car",
  "Car",
  "Bicycle",
  "Other",
];

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
      render: (_: unknown, record: QuantityRateWithTempId) => {
        const isOther = !ITEM_TYPE_OPTIONS.slice(0, -1).includes(record.itemType);
        const selectedValue = isOther ? "Other" : record.itemType;
        
        return (
          <Space.Compact style={{ width: "100%" }}>
            <Select
              value={selectedValue}
              onChange={(value) => {
                if (value === "Other") {
                  handleFieldChange(record.tempId!, "itemType", "");
                } else {
                  handleFieldChange(record.tempId!, "itemType", value);
                }
              }}
              style={{ width: isOther ? "40%" : "100%" }}
              placeholder="Select item type"
            >
              {ITEM_TYPE_OPTIONS.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
            {isOther && (
              <Input
                value={record.itemType}
                onChange={(e) => handleFieldChange(record.tempId!, "itemType", e.target.value)}
                placeholder="Enter custom item type"
                style={{ width: "60%" }}
              />
            )}
          </Space.Compact>
        );
      },
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
    <Drawer
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Rate Management: {feeType.feeName} (QUANTITY)</span>
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
    </Drawer>
  );
};

export default QuantityRateConfig;

