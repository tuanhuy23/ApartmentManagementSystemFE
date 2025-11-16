import React, { useEffect, useState, useRef } from "react";
import { Form, InputNumber, Button, Typography, Card, Space, App, Breadcrumb } from "antd";
import { SaveOutlined, CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import { billingCycleApi } from "../../api/billingCycleApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { BillingCycleSettingDto } from "../../types/billingCycle";

const { Title } = Typography;

const BillingCycleSetting: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [billingCycleId, setBillingCycleId] = useState<string | null>(null);
  const apartmentBuildingId = useApartmentBuildingId();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;
    fetchBillingCycleSetting();
  }, []);

  const fetchBillingCycleSetting = async () => {
    try {
      setFetching(true);
      const response = await billingCycleApi.get();
      if (response.data) {
        setBillingCycleId(response.data.id || null);
        form.setFieldsValue({
          closingDayOfMonth: response.data.closingDayOfMonth,
          paymentDueDate: response.data.paymentDueDate,
        });
      } else {
        setBillingCycleId(null);
      }
    } catch {
      notification.error({ message: "Failed to fetch billing cycle settings" });
      setBillingCycleId(null);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values: { closingDayOfMonth: number; paymentDueDate: number }) => {
    try {
      setLoading(true);
      const data: BillingCycleSettingDto = {
        ...(billingCycleId && { id: billingCycleId }),
        apartmentBuildingId: apartmentBuildingId || "",
        closingDayOfMonth: values.closingDayOfMonth,
        paymentDueDate: values.paymentDueDate,
      } as BillingCycleSettingDto;
      
      await billingCycleApi.create(data);
      notification.success({ message: "Billing cycle settings saved successfully!" });
      fetchBillingCycleSetting();
    } catch {
      notification.error({ message: "Failed to save billing cycle settings" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
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
            title: "Billing Cycle",
          },
        ]}
      />
      <Title level={2}>
        <CalendarOutlined /> Billing Cycle Settings
      </Title>

      <Card loading={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="closingDayOfMonth"
            label="Closing Day of Month"
            rules={[
              { required: true, message: "Please enter closing day of month" },
              { type: "number", min: 1, max: 31, message: "Day must be between 1 and 31" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter closing day (1-31)"
              min={1}
              max={31}
            />
          </Form.Item>

          <Form.Item
            name="paymentDueDate"
            label="Payment Due Date (Days)"
            rules={[
              { required: true, message: "Please enter payment due date" },
              { type: "number", min: 1, message: "Due date must be at least 1 day" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter payment due date in days"
              min={1}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BillingCycleSetting;

