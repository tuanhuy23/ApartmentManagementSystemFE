import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Drawer,
  Form,
  InputNumber,
  DatePicker,
  Checkbox,
  Space,
  Divider,
  Input,
  Row,
  Col,
  Select,
  App,
  Tabs,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import {
  PlusOutlined,
  EyeOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { apartmentApi } from "../../api/apartmentApi";
import { feeApi } from "../../api/feeApi";
import { feeConfigurationApi } from "../../api/feeConfigurationApi";
import type {
  FeeNotice,
  UtilityReading,
  FeeType,
  InvoiceFormData,
  ApartmentDto,
  UtilityReadingDto,
} from "../../types/apartment";
import FeeNoticeDetailModal from "./FeeNoticeDetailModal";
import ResidentsTab from "./ResidentsTab";

const { Title, Text } = Typography;
const { Option } = Select;

const ApartmentDetail: React.FC = () => {
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const { modal, notification } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFeeNoticeId, setSelectedFeeNoticeId] = useState<string | null>(null);
  const [form] = Form.useForm<InvoiceFormData>();
  const [apartmentForm] = Form.useForm();
  const [feeNoticeSearchText, setFeeNoticeSearchText] = useState("");
  const [utilityReadingSearchText, setUtilityReadingSearchText] = useState("");
  const [currentInvoiceStatus] = useState<"DRAFT" | "ISSUED">("DRAFT");
  const [currentPaymentStatus] = useState<"N/A" | "UNPAID" | "PAID">("N/A");
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apartmentData, setApartmentData] = useState<ApartmentDto | null>(null);
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [utilityReadings, setUtilityReadings] = useState<UtilityReading[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [oldReadings, setOldReadings] = useState<Record<string, UtilityReadingDto | null>>({});
  const [allUtilityReadings, setAllUtilityReadings] = useState<UtilityReadingDto[]>([]);
  const fetchedApartmentIdRef = useRef<string | null>(null);

  const fetchUtilityReadings = useCallback(async () => {
    if (!apartmentId) return;
    try {
      const response = await feeApi.getUtilityReadings(apartmentId);
      if (response.data) {
        setAllUtilityReadings(response.data);
        const convertedReadings: UtilityReading[] = response.data.map((dto) => ({
          id: dto.id,
          type: dto.feeTypeName === "Electricity" ? "Electricity" : "Water",
          readingDate: dto.readingDate,
          readingValue: dto.currentReading,
          consumption: 0,
          unit: dto.feeTypeName === "Electricity" ? "kWh" : "m³",
        }));
        setUtilityReadings(convertedReadings);
      }
    } catch {
      notification.error({ message: "Failed to fetch utility readings" });
    }
  }, [apartmentId, notification]);

  const fetchApartmentDetail = useCallback(async () => {
    if (!apartmentId) return;
    try {
      setLoading(true);
      const response = await apartmentApi.getById(apartmentId);
      if (response.data) {
        setApartmentData(response.data);
        apartmentForm.setFieldsValue({
          name: response.data.name,
          area: response.data.area,
          floor: response.data.floor,
        });
      }
    } catch {
      notification.error({ message: "Failed to fetch apartment details" });
    } finally {
      setLoading(false);
    }
  }, [apartmentId, apartmentForm, notification]);

  const fetchFeeNotices = useCallback(async () => {
    if (!apartmentId) return;
    try {
      setLoading(true);
      const response = await feeApi.getByApartmentId(apartmentId);
      if (response.data) {
        const convertedNotices: FeeNotice[] = response.data.map((dto) => ({
          id: dto.id,
          cycle: dto.billingCycle,
          totalAmount: dto.totalAmount,
          status: dto.status as "DRAFT" | "ISSUED",
          paymentStatus: dto.paymentStatus as "N/A" | "UNPAID" | "PAID",
        }));
        setFeeNotices(convertedNotices);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee notices" });
    } finally {
      setLoading(false);
    }
  }, [apartmentId, notification]);

  useEffect(() => {
    if (apartmentId && fetchedApartmentIdRef.current !== apartmentId) {
      fetchedApartmentIdRef.current = apartmentId;
      fetchApartmentDetail();
      fetchFeeNotices();
      fetchUtilityReadings();
    }
  }, [apartmentId, fetchApartmentDetail, fetchFeeNotices, fetchUtilityReadings]);

  const fetchFeeTypes = useCallback(async () => {
    try {
      const response = await feeConfigurationApi.getAll();
      if (response.data) {
        const convertedTypes: FeeType[] = response.data
          .filter((dto) => dto.isActive)
          .map((dto) => ({
            id: dto.id,
            name: dto.name,
            type: dto.calculationType as "TIERED" | "QUANTITY" | "SERVICE",
          }));
        setFeeTypes(convertedTypes);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee types" });
    }
  }, [notification]);

  useEffect(() => {
    if (isModalVisible) {
      fetchFeeTypes();
    } else {
      setOldReadings({});
    }
  }, [isModalVisible, fetchFeeTypes]);

  useEffect(() => {
    if (selectedFees.length > 0 && allUtilityReadings.length > 0) {
      const readingsMap: Record<string, UtilityReadingDto | null> = {};
      selectedFees.forEach((feeId) => {
        const reading = allUtilityReadings.find((r) => r.feeTypeId === feeId);
        readingsMap[feeId] = reading || null;
      });
      setOldReadings(readingsMap);
    } else {
      setOldReadings({});
    }
  }, [selectedFees, allUtilityReadings]);

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

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : false,
  });

  const feeNoticeColumns: ColumnsType<FeeNotice> = [
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
      ...getColumnSearchProps("cycle"),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: "DRAFT", value: "DRAFT" },
        { text: "ISSUED", value: "ISSUED" },
      ],
      onFilter: (value: any, record: FeeNotice) => record.status === value,
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus: string) => getPaymentStatusTag(paymentStatus),
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
      render: (_: unknown, record: FeeNotice) => (
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
          />
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={() => notification.info({ message: "Recalculate" })}
            style={{ color: "#000" }}
            title="Recalculate"
          />
          {record.status === "DRAFT" && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => notification.success({ message: "Issued successfully" })}
              style={{ color: "#000" }}
              title="Issue"
            />
          )}
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => notification.warning({ message: record.status === "DRAFT" ? "Draft cancelled" : "Revoked/Cancelled" })}
            style={{ color: "#000" }}
            title={record.status === "DRAFT" ? "Cancel Draft" : "Revoke/Cancel"}
          />
        </Space>
      ),
    },
  ];

  const utilityReadingColumns: ColumnsType<UtilityReading> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => type === "Electricity" ? "Electricity" : "Water",
      filters: [
        { text: "Electricity", value: "Electricity" },
        { text: "Water", value: "Water" },
      ],
      onFilter: (value: any, record: UtilityReading) => record.type === value,
    },
    {
      title: "Reading Date",
      dataIndex: "readingDate",
      key: "readingDate",
      ...getColumnSearchProps("readingDate"),
      sorter: (a, b) => a.readingDate.localeCompare(b.readingDate),
    },
    {
      title: "Reading Value",
      dataIndex: "readingValue",
      key: "readingValue",
      render: (value: number, record: UtilityReading) =>
        `${value} ${record.unit}`,
      sorter: (a, b) => a.readingValue - b.readingValue,
    },
    {
      title: "Consumption (Auto-calculated)",
      dataIndex: "consumption",
      key: "consumption",
      render: (consumption: number, record: UtilityReading) =>
        `${consumption} ${record.unit}`,
      sorter: (a, b) => a.consumption - b.consumption,
    },
  ];

  const filteredFeeNotices = feeNotices.filter((notice) => {
    if (!feeNoticeSearchText) return true;
    return (
      notice.cycle.toLowerCase().includes(feeNoticeSearchText.toLowerCase()) ||
      formatCurrency(notice.totalAmount).toLowerCase().includes(feeNoticeSearchText.toLowerCase()) ||
      notice.status.toLowerCase().includes(feeNoticeSearchText.toLowerCase()) ||
      notice.paymentStatus.toLowerCase().includes(feeNoticeSearchText.toLowerCase())
    );
  });

  const filteredUtilityReadings = utilityReadings.filter((reading) => {
    if (!utilityReadingSearchText) return true;
    const typeText = reading.type === "Electricity" ? "Electricity" : "Water";
    return (
      typeText.toLowerCase().includes(utilityReadingSearchText.toLowerCase()) ||
      reading.readingDate.toLowerCase().includes(utilityReadingSearchText.toLowerCase()) ||
      reading.readingValue.toString().includes(utilityReadingSearchText) ||
      reading.consumption.toString().includes(utilityReadingSearchText)
    );
  });

  const handleCreateInvoice = async () => {
    setIsModalVisible(true);
    form.resetFields();
    setSelectedFees([]);
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      if (!apartmentId || !apartmentData) {
        notification.error({ message: "Apartment information is missing" });
        return;
      }

      setLoading(true);

      const feeDetails = selectedFees.map((feeId) => {
        const feeType = feeTypes.find((f) => f.id === feeId);
        if (!feeType) return null;

        const fieldName = feeType.name.toLowerCase().replace(/\s+/g, "");
        const formData = (values as any)[fieldName];

        if (feeType.type === "TIERED") {
          const oldReading = oldReadings[feeId];
          return {
            apartmentId,
            feeTypeId: feeId,
            utilityReading: {
              utilityCurentReadingId: oldReading?.id || null,
              currentReading: formData?.newReading || 0,
              readingDate: formData?.newReadingDate
                ? formData.newReadingDate.format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD"),
            },
          };
        }

        if (feeType.type === "QUANTITY") {
          return {
            apartmentId,
            feeTypeId: feeId,
            utilityReading: {
              utilityCurentReadingId: null,
              currentReading: formData?.adjustedQuantity || 0,
              readingDate: dayjs().format("YYYY-MM-DD"),
            },
          };
        }

        return null;
      }).filter((detail) => detail !== null) as any[];

      const convertCycleToApiFormat = (cycle: string): string => {
        const [month, year] = cycle.split("/");
        return `${year}-${month.padStart(2, "0")}`;
      };

      const createData = {
        id: null,
        apartmentId,
        apartmentBuildingId: apartmentData.apartmentBuildingId,
        billingCycle: convertCycleToApiFormat(values.cycle),
        feeTypeIds: selectedFees,
        feeDetails,
      };

      await feeApi.create(createData);
      notification.success({ message: "Draft saved and calculated successfully!" });
      setIsModalVisible(false);
      form.resetFields();
      setSelectedFees([]);
      fetchFeeNotices();
      fetchUtilityReadings();
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your information!" });
      } else {
        notification.error({ message: error?.response?.data?.message || "Failed to save draft" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModal = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    modal.confirm({
      title: "Confirm Cancel",
      content: "Are you sure you want to cancel? All changes will be lost.",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        setIsModalVisible(false);
        form.resetFields();
      },
    });
  };


  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Apartment Details: {apartmentData?.name || "Loading..."}
      </Title>

      <Card
        title="Basic Information"
        style={{ marginBottom: 24 }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          This area displays foundational data used for AREA and QUANTITY calculations, and determines the building that applies the price configuration.
        </Text>

        <Form form={apartmentForm} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Apartment Code">
                <Input value={apartmentData?.name || ""} readOnly />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Area (m²)"
                name="area"
                rules={[{ required: true, message: "Please enter area" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Floor"
                name="floor"
                rules={[{ required: true, message: "Please enter floor" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Fee Notice",
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4}>1. Create Invoice Action</Title>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreateInvoice}
                      size="large"
                    >
                      Create New Invoice
                    </Button>
                  </div>

                  <Divider />

                  <div style={{ marginBottom: 16 }}>
                    <Title level={4}>2. Invoice History (Fee Notice History)</Title>
                  </div>

                  <Input.Search
                    placeholder="Search in table..."
                    allowClear
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    onSearch={(value) => setFeeNoticeSearchText(value)}
                    onChange={(e) => {
                      if (!e.target.value) setFeeNoticeSearchText("");
                    }}
                  />

                  <Table
                    columns={feeNoticeColumns}
                    dataSource={filteredFeeNotices}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: "Utility Reading History",
              children: (
                <div>
                  <Input.Search
                    placeholder="Search in table..."
                    allowClear
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    onSearch={(value) => setUtilityReadingSearchText(value)}
                    onChange={(e) => {
                      if (!e.target.value) setUtilityReadingSearchText("");
                    }}
                  />

                  <Table
                    columns={utilityReadingColumns}
                    dataSource={filteredUtilityReadings}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    }}
                  />
                </div>
              ),
            },
            {
              key: "3",
              label: "Residents",
              children: apartmentId ? <ResidentsTab apartmentId={apartmentId} /> : null,
            },
          ]}
        />
      </Card>

      <Drawer
        title="Create Invoice Form Modal"
        open={isModalVisible}
        onClose={handleCancelModal}
        width={600}
        placement="right"
        maskClosable={false}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancelModal}
            style={{ padding: 0 }}
          />
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div>
              <Text strong>Status: </Text>
              {getStatusTag(currentInvoiceStatus)}
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Payment Status: </Text>
              {getPaymentStatusTag(currentPaymentStatus)}
            </div>
          </Col>
        </Row>

        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          This is a combined interface for selecting fees, entering readings, and calculations.
        </Text>

        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Billing Month"
                name="cycle"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select style={{ width: "100%" }} placeholder="Select cycle">
                  <Option value="11/2025">11/2025</Option>
                  <Option value="10/2025">10/2025</Option>
                  <Option value="09/2025">09/2025</Option>
                  <Option value="08/2025">08/2025</Option>
                  <Option value="07/2025">07/2025</Option>
                  <Option value="06/2025">06/2025</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Select Fees"
                name="selectedFees"
                rules={[
                  { required: true, message: "Please select at least one fee type" },
                ]}
              >
                <Checkbox.Group
                  onChange={(checkedValues) => {
                    setSelectedFees(checkedValues as string[]);
                  }}
                >
                  <Space>
                    {feeTypes.map((fee) => (
                      <Checkbox key={fee.id} value={fee.id}>
                        {fee.name}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>

          {selectedFees.map((feeId) => {
            const feeType = feeTypes.find((f) => f.id === feeId);
            if (!feeType) return null;

            const fieldName = feeType.name.toLowerCase().replace(/\s+/g, "");
            const oldReading = oldReadings[feeId];

            if (feeType.type === "TIERED") {
              return (
                <React.Fragment key={feeId}>
                  <Divider orientation="left">{feeType.name} Fee (TIERED)</Divider>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item
                        label="New Reading Date"
                        name={[fieldName, "newReadingDate"]}
                        rules={[
                          {
                            required: selectedFees.includes(feeId),
                            message: "Required",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                          placeholder="Select date"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="New Reading"
                        name={[fieldName, "newReading"]}
                        rules={[
                          {
                            required: selectedFees.includes(feeId),
                            message: "Required",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="Enter reading"
                          min={0}
                          step={0.01}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Old Reading">
                        <Input
                          value={oldReading?.currentReading || ""}
                          readOnly
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Old Date">
                        <Input
                          value={
                            oldReading
                              ? dayjs(oldReading.readingDate).format("DD/MM")
                              : ""
                          }
                          readOnly
                          style={{ backgroundColor: "#f5f5f5" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </React.Fragment>
              );
            }
            return null;
          })}

          <Divider />

          <Card title="Entered Reading History" style={{ marginTop: 16 }}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              This area serves as a Ledger to check raw data history.
            </Text>

            <Input.Search
              placeholder="Search in table..."
              allowClear
              style={{ marginBottom: 16, maxWidth: 400 }}
              onSearch={(value) => setUtilityReadingSearchText(value)}
              onChange={(e) => {
                if (!e.target.value) setUtilityReadingSearchText("");
              }}
            />

            <Table
              columns={utilityReadingColumns}
              dataSource={filteredUtilityReadings}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSaveDraft} loading={loading}>
              Save & Calculate Draft
            </Button>
          </div>
        </Form>
      </Drawer>

      <FeeNoticeDetailModal
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

export default ApartmentDetail;

