import React, { useState, useEffect } from "react";
import { Modal, Table, Typography, Tag, Descriptions, Spin, App } from "antd";
import type { ColumnsType } from "antd/es/table";
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

  const feeDetailColumns: ColumnsType<FeeDetailWithName> = [
    {
      title: "Fee Type",
      dataIndex: "feeTypeName",
      key: "feeTypeName",
      width: 150,
    },
    {
      title: "Consumption",
      dataIndex: "consumption",
      key: "consumption",
      width: 120,
      render: (consumption: number | null) => consumption !== null ? consumption.toFixed(2) : "N/A",
      align: "right",
    },
    {
      title: "Previous Reading",
      key: "previousReading",
      width: 150,
      render: (_: unknown, record: FeeDetailWithName) => (
        <div>
          <div>{record.previousReading !== null ? record.previousReading.toFixed(2) : "N/A"}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {formatDate(record.previousReadingDate)}
          </Text>
        </div>
      ),
      align: "right",
    },
    {
      title: "Current Reading",
      key: "currentReading",
      width: 150,
      render: (_: unknown, record: FeeDetailWithName) => (
        <div>
          <div>{record.currentReading !== null ? record.currentReading.toFixed(2) : "N/A"}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {formatDate(record.currentReadingDate)}
          </Text>
        </div>
      ),
      align: "right",
    },
    {
      title: "Proration",
      dataIndex: "proration",
      key: "proration",
      width: 100,
      render: (proration: number | null) => proration !== null ? `${(proration * 100).toFixed(2)}%` : "N/A",
      align: "right",
    },
    {
      title: "Sub Total",
      dataIndex: "subTotal",
      key: "subTotal",
      width: 120,
      render: (amount: number) => formatCurrency(amount),
      align: "right",
    },
    {
      title: "Gross Cost",
      dataIndex: "grossCost",
      key: "grossCost",
      width: 120,
      render: (amount: number) => formatCurrency(amount),
      align: "right",
    },
    {
      title: "VAT Rate",
      dataIndex: "vatRate",
      key: "vatRate",
      width: 100,
      render: (rate: number) => `${(rate * 100).toFixed(2)}%`,
      align: "right",
    },
    {
      title: "VAT Cost",
      dataIndex: "vatCost",
      key: "vatCost",
      width: 120,
      render: (amount: number) => formatCurrency(amount),
      align: "right",
    },
  ];

  const expandedRowRender = (record: FeeDetailWithName) => {
    if (!record.feeTierDetails || record.feeTierDetails.length === 0) {
      return null;
    }

    const tierColumns: ColumnsType<typeof record.feeTierDetails[0]> = [
      {
        title: "Tier Order",
        dataIndex: "tierOrder",
        key: "tierOrder",
        width: 100,
        align: "center",
      },
      {
        title: "Consumption Range",
        key: "range",
        width: 200,
        render: (_: unknown, tier: typeof record.feeTierDetails[0]) => (
          <Text>
            {tier.consumptionStart.toFixed(2)} - {tier.consumptionEnd.toFixed(2)} {tier.unitName}
          </Text>
        ),
      },
      {
        title: "Original Range",
        key: "originalRange",
        width: 200,
        render: (_: unknown, tier: typeof record.feeTierDetails[0]) => (
          <Text type="secondary">
            {tier.consumptionStartOriginal.toFixed(2)} - {tier.consumptionEndOriginal.toFixed(2)} {tier.unitName}
          </Text>
        ),
      },
      {
        title: "Unit Rate",
        dataIndex: "unitRate",
        key: "unitRate",
        width: 120,
        render: (rate: number, tier: typeof record.feeTierDetails[0]) => 
          formatCurrency(rate) + ` / ${tier.unitName}`,
        align: "right",
      },
      {
        title: "Consumption",
        dataIndex: "consumption",
        key: "consumption",
        width: 120,
        render: (consumption: number, tier: typeof record.feeTierDetails[0]) => 
          `${consumption.toFixed(2)} ${tier.unitName}`,
        align: "right",
      },
    ];

    return (
      <Table
        columns={tierColumns}
        dataSource={record.feeTierDetails}
        rowKey="tierOrder"
        pagination={false}
        size="small"
      />
    );
  };

  return (
    <Modal
      title="Fee Notice Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
    >
      <Spin spinning={loading}>
        {feeNotice && (
          <>
            <Descriptions
              title="Basic Information"
              bordered
              column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
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

            <Table
              columns={feeDetailColumns}
              dataSource={feeDetails}
              rowKey="feeTypeId"
              pagination={false}
              scroll={{ x: 1200 }}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => !!(record.feeTierDetails && record.feeTierDetails.length > 0),
              }}
            />
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default FeeNoticeDetailModal;

