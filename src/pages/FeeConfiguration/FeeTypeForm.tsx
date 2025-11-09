import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space, App, Switch } from "antd";
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
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [calculationType, setCalculationType] = useState<CalculationType>("AREA");
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isTieredModalOpen, setIsTieredModalOpen] = useState(false);
  const [tempFeeType, setTempFeeType] = useState<FeeType | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isVATApplicable, setIsVATApplicable] = useState<boolean>(true);

  useEffect(() => {
    if (feeType) {
      form.setFieldsValue({
        feeName: feeType.feeName,
        calculationType: feeType.calculationType,
        defaultRate: feeType.defaultRate,
        vatRate: feeType.vatRate,
      });
      setCalculationType(feeType.calculationType);
      setTempFeeType(feeType);
      setIsActive(feeType.isActive ?? true);
      setIsVATApplicable(feeType.isVATApplicable ?? true);
    } else {
      form.resetFields();
      form.setFieldsValue({
        calculationType: "AREA",
      });
      setCalculationType("AREA");
      setTempFeeType(null);
      setIsActive(true);
      setIsVATApplicable(true);
    }
  }, [feeType, form]);


  const handleCalculationTypeChange = (value: CalculationType) => {
    setCalculationType(value);
    form.setFieldsValue({
      defaultRate: undefined,
      vatRate: undefined,
    });
  };

  const getCurrentFeeType = (): FeeType => {
    if (feeType) return feeType;
    
    const formValues = form.getFieldsValue();
    return {
      id: "",
      feeName: formValues.feeName || "",
      calculationType: calculationType,
      buildingId: tempFeeType?.buildingId || "",
      buildingName: buildingName,
      defaultRate: formValues.defaultRate,
      vatRate: formValues.vatRate,
      quantityRates: tempFeeType?.quantityRates || [],
      rateConfigs: tempFeeType?.rateConfigs || [],
    };
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const feeTypeData: FeeType = {
        id: feeType?.id || "",
        feeName: values.feeName,
        calculationType: values.calculationType,
        buildingId: feeType?.buildingId || tempFeeType?.buildingId || "",
        buildingName: buildingName,
        defaultRate: values.defaultRate,
        vatRate: values.vatRate,
        isActive: feeType ? isActive : true,
        isVATApplicable: isVATApplicable,
        quantityRates: feeType?.quantityRates || tempFeeType?.quantityRates || [],
        rateConfigs: feeType?.rateConfigs || tempFeeType?.rateConfigs || [],
      };
      onSave(feeTypeData);
    });
  };

  const handleQuantityRatesSave = (quantityRates: FeeType["quantityRates"]) => {
    const currentFeeType = getCurrentFeeType();
    const updatedFeeType = { ...currentFeeType, quantityRates };
    setTempFeeType(updatedFeeType);
    setIsQuantityModalOpen(false);
  };

  const handleTieredRatesSave = (rateConfigs: FeeType["rateConfigs"]) => {
    const currentFeeType = getCurrentFeeType();
    const updatedFeeType = { ...currentFeeType, rateConfigs };
    setTempFeeType(updatedFeeType);
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
            name="calculationType"
            label="Calculation Type"
            rules={[{ required: true, message: "Please select calculation type" }]}
            initialValue="AREA"
          >
            <Select
              placeholder="Select calculation type"
              onChange={handleCalculationTypeChange}
              disabled={!!feeType}
            >
              <Select.Option value="AREA">AREA</Select.Option>
              <Select.Option value="QUANTITY">QUANTITY</Select.Option>
              <Select.Option value="TIERED">TIERED</Select.Option>
            </Select>
          </Form.Item>

          {calculationType !== "TIERED" && (
            <>
              <Form.Item label="VAT Applicable">
                <Switch
                  checked={isVATApplicable}
                  onChange={setIsVATApplicable}
                />
              </Form.Item>

              {isVATApplicable && (
                <Form.Item
                  name="vatRate"
                  label="VAT Rate"
                  rules={[{ required: isVATApplicable, message: "Please enter VAT rate" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter VAT rate (e.g., 0.10 for 10%)"
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
              )}
            </>
          )}

          {feeType && (
            <Form.Item label="Active">
              <Switch
                checked={isActive}
                onChange={setIsActive}
              />
            </Form.Item>
          )}

          {calculationType === "AREA" && (
            <Form.Item
              name="defaultRate"
              label="Default Rate"
              rules={[{ required: true, message: "Please enter default rate" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter default rate"
                formatter={(value) => `${value} VND/m²`}
                parser={((value: string | undefined) => {
                  if (!value) return 0;
                  return parseFloat(value.replace(" VND/m²", "")) || 0;
                }) as any}
                min={0}
              />
            </Form.Item>
          )}

          {calculationType === "QUANTITY" && (
            <Form.Item label="Quantity Rate Configuration">
              <Button
                type="default"
                htmlType="button"
                onClick={() => {
                  try {
                    const feeName = form.getFieldValue("feeName");
                    if (!feeName || feeName.trim() === "") {
                      notification.warning({ message: "Please enter fee name first" });
                      return;
                    }
                    const currentFeeType = getCurrentFeeType();
                    if (currentFeeType && currentFeeType.feeName) {
                      setTempFeeType(currentFeeType);
                      setTimeout(() => {
                        setIsQuantityModalOpen(true);
                      }, 0);
                    }
                  } catch (error) {
                    console.error("Error opening quantity modal:", error);
                    notification.error({ message: "Failed to open quantity rate configuration" });
                  }
                }}
              >
                Manage Quantity Rate Config
              </Button>
              <QuantityRateConfig
                open={isQuantityModalOpen}
                onCancel={() => {
                  setIsQuantityModalOpen(false);
                }}
                onSave={handleQuantityRatesSave}
                feeType={tempFeeType || feeType || getCurrentFeeType()}
                buildingName={buildingName}
              />
            </Form.Item>
          )}

          {calculationType === "TIERED" && (
            <Form.Item label="Tiered Rate Configuration">
              <Button
                type="default"
                htmlType="button"
                onClick={() => {
                  try {
                    const feeName = form.getFieldValue("feeName");
                    if (!feeName || feeName.trim() === "") {
                      notification.warning({ message: "Please enter fee name first" });
                      return;
                    }
                    const currentFeeType = getCurrentFeeType();
                    if (currentFeeType && currentFeeType.feeName) {
                      setTempFeeType(currentFeeType);
                      setTimeout(() => {
                        setIsTieredModalOpen(true);
                      }, 0);
                    }
                  } catch (error) {
                    console.error("Error opening tiered modal:", error);
                    notification.error({ message: "Failed to open tiered rate configuration" });
                  }
                }}
              >
                Manage Tiered Rate Config
              </Button>
              <TieredRateConfig
                open={isTieredModalOpen}
                onCancel={() => {
                  setIsTieredModalOpen(false);
                }}
                onSave={handleTieredRatesSave}
                feeType={tempFeeType || feeType || getCurrentFeeType()}
                buildingName={buildingName}
              />
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

