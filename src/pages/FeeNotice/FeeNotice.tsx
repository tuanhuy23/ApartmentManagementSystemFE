import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Input,
  Space,
  App,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { feeApi } from "../../api/feeApi";
import { getErrorMessage } from "../../utils/errorHandler";
import { useAuth } from "../../hooks/useAuth";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import ResidentFeeNoticeDetailModal from "./ResidentFeeNoticeDetailModal";

const { Title } = Typography;

interface FeeNotice {
  id: string;
  cycle: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

const FeeNotice: React.FC = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [feeNoticeLoading, setFeeNoticeLoading] = useState(false);
  const [feeNoticeSearchText, setFeeNoticeSearchText] = useState("");
  const [feeNoticeCurrentPage, setFeeNoticeCurrentPage] = useState(1);
  const [feeNoticePageSize, setFeeNoticePageSize] = useState(10);
  const [feeNoticeSorts, setFeeNoticeSorts] = useState<SortQuery[]>([]);
  const [selectedFeeNoticeId, setSelectedFeeNoticeId] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const feeNoticesLastRequestKeyRef = useRef<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "VND");
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Tag color="orange">DRAFT</Tag>;
      case "ISSUED":
        return <Tag color="green">ISSUED</Tag>;
      case "CANCELED":
        return <Tag color="red">CANCELED</Tag>;
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

  const fetchFeeNotices = async () => {
    if (!user?.apartmentId) return;

    const requestKey = JSON.stringify({
      feeNoticeSearchText,
      feeNoticeSorts,
      feeNoticeCurrentPage,
      feeNoticePageSize,
    });

    if (feeNoticesLastRequestKeyRef.current === requestKey) {
      return;
    }

    feeNoticesLastRequestKeyRef.current = requestKey;

    try {
      setFeeNoticeLoading(true);
      const filters: FilterQuery[] = [];

      if (feeNoticeSearchText) {
        filters.push({
          Code: "billingCycle",
          Operator: FilterOperator.Contains,
          Value: feeNoticeSearchText,
        });
      }

      const response = await feeApi.getResidentFeeNotices({
        filters: filters.length > 0 ? filters : undefined,
        sorts: feeNoticeSorts.length > 0 ? feeNoticeSorts : undefined,
        page: feeNoticeCurrentPage,
        limit: feeNoticePageSize,
      });

      if (response.data) {
        const convertedNotices: FeeNotice[] = response.data.map((dto) => ({
          id: dto.id,
          cycle: dto.billingCycle,
          totalAmount: dto.totalAmount,
          status: dto.status,
          paymentStatus: dto.paymentStatus,
        }));
        setFeeNotices(convertedNotices);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch fee notices");
      notification.error({ message: errorMessage });
    } finally {
      setFeeNoticeLoading(false);
    }
  };

  useEffect(() => {
    if (user?.apartmentId) {
      feeNoticesLastRequestKeyRef.current = "";
      fetchFeeNotices();
    }
  }, [user?.apartmentId, feeNoticeSearchText, feeNoticeSorts, feeNoticeCurrentPage, feeNoticePageSize]);

  const handleFeeNoticeTableChange = (
    _pagination: any,
    _filters: any,
    sorter: any
  ) => {
    if (sorter && sorter.columnKey) {
      const newSorts: SortQuery[] = [
        {
          Code: sorter.columnKey,
          Direction: sorter.order === "ascend" ? SortDirection.Ascending : SortDirection.Descending,
        },
      ];
      setFeeNoticeSorts(newSorts);
      setFeeNoticeCurrentPage(1);
    } else {
      setFeeNoticeSorts([]);
    }
  };

  const handleFeeNoticeSearch = (value: string) => {
    setFeeNoticeSearchText(value);
    setFeeNoticeCurrentPage(1);
  };

  const feeNoticeColumns: ColumnsType<FeeNotice> = [
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      sorter: true,
      sortDirections: ["ascend", "descend"],
      filters: [
        { text: "DRAFT", value: "DRAFT" },
        { text: "ISSUED", value: "ISSUED" },
        { text: "CANCELED", value: "CANCELED" },
      ],
      onFilter: (value: any, record: FeeNotice) => record.status === value,
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus: string) => getPaymentStatusTag(paymentStatus),
      sorter: true,
      sortDirections: ["ascend", "descend"],
      filters: [
        { text: "N/A", value: "N/A" },
        { text: "UNPAID", value: "UNPAID" },
        { text: "PAID", value: "PAID" },
      ],
      onFilter: (value: any, record: FeeNotice) => record.paymentStatus === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: FeeNotice) => {
        return (
          <Space size="small">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedFeeNoticeId(record.id);
                setIsDetailModalVisible(true);
              }}
              style={{ color: "#000" }}
              title="View Details"
            >
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          Fee Notices
        </Title>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 400,
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid #d9d9d9",
              backgroundColor: "#ffffff",
            }}
          >
            <Input
              placeholder="Search in table..."
              allowClear
              size="large"
              value={feeNoticeSearchText}
              onChange={(e) => {
                const value = e.target.value;
                setFeeNoticeSearchText(value);
                if (!value) {
                  handleFeeNoticeSearch("");
                }
              }}
              onPressEnter={(e) => {
                handleFeeNoticeSearch((e.target as HTMLInputElement).value);
              }}
              bordered={false}
              style={{
                flex: 1,
                border: "none",
                backgroundColor: "#ffffff",
              }}
            />
            <div
              style={{
                width: "1px",
                backgroundColor: "#d9d9d9",
                margin: "8px 0",
              }}
            />
            <Button
              size="large"
              icon={<SearchOutlined />}
              onClick={() => handleFeeNoticeSearch(feeNoticeSearchText)}
              type="text"
              style={{
                border: "none",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 0,
                color: "#8c8c8c",
              }}
            />
          </div>
        </div>

        <Table
          columns={feeNoticeColumns}
          dataSource={feeNotices}
          rowKey="id"
          loading={feeNoticeLoading}
          onChange={handleFeeNoticeTableChange}
          pagination={{
            current: feeNoticeCurrentPage,
            pageSize: feeNoticePageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setFeeNoticeCurrentPage(page);
              setFeeNoticePageSize(size);
            },
          }}
        />
      </Card>

      <ResidentFeeNoticeDetailModal
        open={isDetailModalVisible}
        feeNoticeId={selectedFeeNoticeId}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedFeeNoticeId(null);
        }}
      />
    </div>
  );
};

export default FeeNotice;
