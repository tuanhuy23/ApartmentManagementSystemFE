import React, { useState, useEffect } from "react";
import { Drawer, Typography, Tag, Descriptions, Spin, App, Card, Space, Divider, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { feeApi } from "../../api/feeApi";
import { feeConfigurationApi } from "../../api/feeConfigurationApi";
import type { FeeNoticeDto, FeeDetailDto } from "../../types/apartment";
import type { FeeTypeDto } from "../../types/fee";

const { Title, Text } = Typography;

interface FeeNoticeDetailModalProps {
  open: boolean;
  feeNoticeId: string | null;
  onClose: () => void;
}

interface FeeDetailWithName extends FeeDetailDto {
  feeTypeName: string;
}

const FeeNoticeDetailModal: React.FC<FeeNoticeDetailModalProps> = ({
  open,
  feeNoticeId,
  onClose,
}) => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [feeNotice, setFeeNotice] = useState<FeeNoticeDto | null>(null);
  const [feeDetails, setFeeDetails] = useState<FeeDetailWithName[]>([]);
  const [feeTypes, setFeeTypes] = useState<Record<string, FeeTypeDto>>({});

  useEffect(() => {
    if (open && feeNoticeId) {
      fetchFeeNoticeDetail();
      fetchFeeTypes();
    }
  }, [open, feeNoticeId]);

  const fetchFeeNoticeDetail = async () => {
    if (!feeNoticeId) return;
    try {
      setLoading(true);
      const response = await feeApi.getById(feeNoticeId);
      if (response.data) {
        setFeeNotice(response.data);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee notice details" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await feeConfigurationApi.getAll();
      if (response.data) {
        const feeTypesMap: Record<string, FeeTypeDto> = {};
        response.data.forEach((feeType) => {
          feeTypesMap[feeType.id] = feeType;
        });
        setFeeTypes(feeTypesMap);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee types" });
    }
  };

  useEffect(() => {
    if (feeNotice && Object.keys(feeTypes).length > 0) {
      const detailsWithNames: FeeDetailWithName[] = feeNotice.feeDetails.map((detail) => ({
        ...detail,
        feeTypeName: feeTypes[detail.feeTypeId]?.name || "Unknown",
      }));
      setFeeDetails(detailsWithNames);
    }
  }, [feeNotice, feeTypes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "VND");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Tag color="orange">DRAFT</Tag>;
      case "ISSUED":
        return <Tag color="green">ISSUED</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "N/A":
        return <Tag color="default">N/A</Tag>;
      case "UNPAID":
        return <Tag color="red">UNPAID</Tag>;
      case "PAID":
        return <Tag color="green">PAID</Tag>;
      default:
        return <Tag>{paymentStatus}</Tag>;
    }
  };

  const renderFeeDetailCard = (detail: FeeDetailWithName) => {
    return (
      <Card
        key={detail.feeTypeId}
        title={detail.feeTypeName}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Descriptions column={2} size="small">
            {detail.consumption !== null && (
              <Descriptions.Item label="Consumption">
                {detail.consumption.toFixed(2)}
              </Descriptions.Item>
            )}

            {detail.proration !== null && (
              <Descriptions.Item label="Proration">
                {`${(detail.proration * 100).toFixed(2)}%`}
              </Descriptions.Item>
            )}
            {detail.previousReading !== null && (
              <Descriptions.Item label="Previous Reading">
                <div>
                  <div>{detail.previousReading !== null ? detail.previousReading.toFixed(2) : "N/A"}</div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {formatDate(detail.previousReadingDate)}
                  </Text>
                </div>
              </Descriptions.Item>
            )}
            {detail.currentReading !== null && (
              <Descriptions.Item label="Current Reading">
                <div>
                  <div>{detail.currentReading !== null ? detail.currentReading.toFixed(2) : "N/A"}</div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {formatDate(detail.currentReadingDate)}
                  </Text>
                </div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Gross Cost">
              {formatCurrency(detail.grossCost)}
            </Descriptions.Item>
            <Descriptions.Item label="VAT Rate">
              {(detail.vatRate * 100).toFixed(2)}%
            </Descriptions.Item>
            <Descriptions.Item label="VAT Cost">
              {formatCurrency(detail.vatCost)}
            </Descriptions.Item>
            <Descriptions.Item label="Sub Total">
              <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                {formatCurrency(detail.subTotal)}
              </Text>
            </Descriptions.Item>
          </Descriptions>

          {detail.feeTierDetails && detail.feeTierDetails.length > 0 && (
            <>
              <Divider orientation="left" style={{ margin: "16px 0" }}>
                Tiered Rate Details
              </Divider>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {detail.feeTierDetails.map((tier) => (
                  <Card key={tier.tierOrder} size="small" style={{ backgroundColor: "#fafafa" }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Tier Order">
                        {tier.tierOrder}
                      </Descriptions.Item>
                      <Descriptions.Item label="Consumption">
                        {tier.consumption.toFixed(2)} {tier.unitName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Consumption Range">
                        {tier.consumptionStart.toFixed(2)} - {tier.consumptionEnd.toFixed(2)} {tier.unitName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Original Range">
                        <Text type="secondary">
                          {tier.consumptionStartOriginal.toFixed(2)} - {tier.consumptionEndOriginal.toFixed(2)} {tier.unitName}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Unit Rate">
                        {formatCurrency(tier.unitRate)} / {tier.unitName}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ))}
              </Space>
            </>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <Drawer
      title="Fee Notice Details"
      open={open}
      onClose={onClose}
      width={800}
      placement="right"
      maskClosable={false}
      closable={false}
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ padding: 0 }}
        />
      }
    >
      <Spin spinning={loading}>
        {feeNotice && (
          <>
            <Descriptions
              title="Basic Information"
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Billing Cycle">
                {feeNotice.billingCycle}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(feeNotice.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                {getPaymentStatusTag(feeNotice.paymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {formatCurrency(feeNotice.totalAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Issue Date">
                {formatDate(feeNotice.issueDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {formatDate(feeNotice.dueDate)}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginBottom: 16 }}>
              Fee Details
            </Title>

            <div>
              {feeDetails.map((detail) => renderFeeDetailCard(detail))}
            </div>
          </>
        )}
      </Spin>
    </Drawer>
  );
};

export default FeeNoticeDetailModal;

