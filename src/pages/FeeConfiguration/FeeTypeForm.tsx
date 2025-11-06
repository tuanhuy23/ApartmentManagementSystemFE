import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space } from "antd";
import type { FeeType, CalculationType } from "../../types/fee";
import QuantityRateConfig from "./QuantityRateConfig";
import TieredRateConfig from "./TieredRateConfig";

interface FeeTypeFormProps {
  open: boolean;
  onCancel: () => void;
  onSave: (feeType: FeeType) => void;
  feeType: FeeType | null;
  buildingName: string;
}

const FeeTypeForm: React.FC<FeeTypeFormProps> = ({
  open,
  onCancel,
  onSave,
  feeType,
  buildingName,
}) => {
  const [form] = Form.useForm();
  const [calculationType, setCalculationType] = useState<CalculationType>("AREA");
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isTieredModalOpen, setIsTieredModalOpen] = useState(false);

  useEffect(() => {
    if (feeType) {
      form.setFieldsValue({
        feeName: feeType.feeName,
        calculationType: feeType.calculationType,
        defaultRate: feeType.defaultRate,
        vatRate: feeType.vatRate,
      });
      setCalculationType(feeType.calculationType);
    } else {
      form.resetFields();
      setCalculationType("AREA");
    }
  }, [feeType, form]);

  const handleCalculationTypeChange = (value: CalculationType) => {
    setCalculationType(value);
    form.setFieldsValue({
      defaultRate: undefined,
      vatRate: undefined,
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const feeTypeData: FeeType = {
        id: feeType?.id || "",
        feeName: values.feeName,
        calculationType: values.calculationType,
        buildingId: feeType?.buildingId || "building-1",
        buildingName: buildingName,
        defaultRate: values.defaultRate,
        vatRate: values.vatRate,
        quantityRates: feeType?.quantityRates || [],
        rateConfigs: feeType?.rateConfigs || [],
      };
      onSave(feeTypeData);
    });
  };

  const handleQuantityRatesSave = (quantityRates: FeeType["quantityRates"]) => {
    if (feeType) {
      const updatedFeeType = { ...feeType, quantityRates };
      onSave(updatedFeeType);
    }
    setIsQuantityModalOpen(false);
  };

  const handleTieredRatesSave = (rateConfigs: FeeType["rateConfigs"]) => {
    if (feeType) {
      const updatedFeeType = { ...feeType, rateConfigs };
      onSave(updatedFeeType);
    }
    setIsTieredModalOpen(false);
  };

  return (
    <>
      <Modal
        title={feeType ? "Edit Fee Type Detail" : "Create Fee Type Detail"}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="feeName"
            label="Fee Name"
            rules={[{ required: true, message: "Please enter fee name" }]}
          >
            <Input placeholder="Enter fee name" />
          </Form.Item>

          <Form.Item
            name="building"
            label="Building"
          >
            <Input value={buildingName} readOnly />
          </Form.Item>

          <Form.Item
            name="calculationType"
            label="Calculation Type"
            rules={[{ required: true, message: "Please select calculation type" }]}
          >
            <Select
              placeholder="Select calculation type"
              onChange={handleCalculationTypeChange}
            >
              <Select.Option value="AREA">AREA</Select.Option>
              <Select.Option value="QUANTITY">QUANTITY</Select.Option>
              <Select.Option value="TIERED">TIERED</Select.Option>
            </Select>
          </Form.Item>

          {/* Dynamic Configuration Area */}
          {calculationType === "AREA" && (
            <>
              <Form.Item
                name="defaultRate"
                label="Default Rate"
                rules={[{ required: true, message: "Please enter default rate" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter default rate"
                  formatter={(value) => `${value} VND/m²`}
                  parser={(value) => value!.replace(" VND/m²", "")}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="vatRate"
                label="VAT Rate"
                rules={[{ required: true, message: "Please enter VAT rate" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter VAT rate (e.g., 0.10 for 10%)"
                  min={0}
                  max={1}
                  step={0.01}
                  formatter={(value) => `${(value! * 100).toFixed(0)}%`}
                  parser={(value) => parseFloat(value!.replace("%", "")) / 100}
                />
              </Form.Item>
            </>
          )}

          {calculationType === "QUANTITY" && (
            <Form.Item label="Quantity Rate Configuration">
              <Button
                type="default"
                onClick={() => setIsQuantityModalOpen(true)}
                disabled={!feeType}
              >
                Manage Quantity Rate Config
              </Button>
              {feeType && (
                <QuantityRateConfig
                  open={isQuantityModalOpen}
                  onCancel={() => setIsQuantityModalOpen(false)}
                  onSave={handleQuantityRatesSave}
                  feeType={feeType}
                  buildingName={buildingName}
                />
              )}
            </Form.Item>
          )}

          {calculationType === "TIERED" && (
            <Form.Item label="Tiered Rate Configuration">
              <Button
                type="default"
                onClick={() => setIsTieredModalOpen(true)}
                disabled={!feeType}
              >
                Manage Tiered Rate Config
              </Button>
              {feeType && (
                <TieredRateConfig
                  open={isTieredModalOpen}
                  onCancel={() => setIsTieredModalOpen(false)}
                  onSave={handleTieredRatesSave}
                  feeType={feeType}
                  buildingName={buildingName}
                />
              )}
            </Form.Item>
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FeeTypeForm;

