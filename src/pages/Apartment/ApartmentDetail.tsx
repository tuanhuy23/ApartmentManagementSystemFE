import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Checkbox,
  Space,
  Divider,
  Input,
  message,
  Row,
  Col,
  Select,
  App,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type {
  Apartment,
  FeeNotice,
  UtilityReading,
  FeeType,
  InvoiceFormData,
} from "../../types/apartment";

const { Title, Text } = Typography;
const { Option } = Select;

const ApartmentDetail: React.FC = () => {
  const { modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm<InvoiceFormData>();
  const [initialFormValues, setInitialFormValues] = useState<Partial<InvoiceFormData> | null>(null);
  const [feeNoticeSearchText, setFeeNoticeSearchText] = useState("");
  const [utilityReadingSearchText, setUtilityReadingSearchText] = useState("");
  const [currentInvoiceStatus, setCurrentInvoiceStatus] = useState<"DRAFT" | "ISSUED">("DRAFT");
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<"N/A" | "UNPAID" | "PAID">("N/A");
  const [selectedFees, setSelectedFees] = useState<string[]>([]);

  const apartmentData: Apartment = {
    id: "apt-101",
    code: "APARTMENT-101",
    area: 80.5,
    buildingName: "TÒA A",
    registeredVehicles: {
      total: 2,
      cars: 1,
      motorbikes: 1,
    },
    closingDate: 20,
    managerName: "[BMB Manager Name]",
  };

  const feeNotices: FeeNotice[] = [
    {
      id: "1",
      cycle: "11/2025",
      totalAmount: 1500000,
      status: "DRAFT",
      paymentStatus: "N/A",
    },
    {
      id: "2",
      cycle: "10/2025",
      totalAmount: 1450000,
      status: "ISSUED",
      paymentStatus: "UNPAID",
    },
    {
      id: "3",
      cycle: "09/2025",
      totalAmount: 1300000,
      status: "ISSUED",
      paymentStatus: "PAID",
    },
  ];

  const utilityReadings: UtilityReading[] = [
    {
      id: "1",
      type: "Electricity",
      readingDate: "2025-10-22",
      readingValue: 1800,
      consumption: 150,
      unit: "kWh",
    },
    {
      id: "2",
      type: "Electricity",
      readingDate: "2025-09-20",
      readingValue: 1650,
      consumption: 100,
      unit: "kWh",
    },
    {
      id: "3",
      type: "Water",
      readingDate: "2025-10-22",
      readingValue: 250,
      consumption: 15,
      unit: "m³",
    },
  ];

  const feeTypes: FeeType[] = [
    { id: "1", name: "Điện", type: "TIERED" },
    { id: "2", name: "Nước", type: "TIERED" },
    { id: "3", name: "Dịch vụ", type: "SERVICE" },
    { id: "4", name: "Gửi xe", type: "QUANTITY" },
  ];

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
          placeholder={`Tìm kiếm ${dataIndex}`}
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
            Tìm kiếm
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
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
      title: "Chu kỳ",
      dataIndex: "cycle",
      key: "cycle",
      ...getColumnSearchProps("cycle"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Trạng thái",
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
      title: "Trạng thái TT",
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
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: FeeNotice) => (
        <Space>
          {record.status === "DRAFT" ? (
            <>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => message.info("Xem Chi tiết Draft")}
              >
                Xem Chi tiết Draft
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => message.success("Đã phát hành")}
              >
                PHÁT HÀNH
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => message.warning("Đã hủy Draft")}
              >
                Hủy Draft
              </Button>
            </>
          ) : (
            <>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => message.info("Xem Chi tiết")}
              >
                Chi tiết
              </Button>
              {record.paymentStatus !== "PAID" && (
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => message.warning("Đã thu hồi/hủy")}
                >
                  THU HỒI/HỦY
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const utilityReadingColumns: ColumnsType<UtilityReading> = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => type === "Electricity" ? "Điện" : "Nước",
      filters: [
        { text: "Điện", value: "Electricity" },
        { text: "Nước", value: "Water" },
      ],
      onFilter: (value: any, record: UtilityReading) => record.type === value,
    },
    {
      title: "Ngày Đọc",
      dataIndex: "readingDate",
      key: "readingDate",
      ...getColumnSearchProps("readingDate"),
      sorter: (a, b) => a.readingDate.localeCompare(b.readingDate),
    },
    {
      title: "Giá trị Chỉ số",
      dataIndex: "readingValue",
      key: "readingValue",
      render: (value: number, record: UtilityReading) =>
        `${value} ${record.unit}`,
      sorter: (a, b) => a.readingValue - b.readingValue,
    },
    {
      title: "Tiêu thụ (Tự tính)",
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
    const typeText = reading.type === "Electricity" ? "Điện" : "Nước";
    return (
      typeText.toLowerCase().includes(utilityReadingSearchText.toLowerCase()) ||
      reading.readingDate.toLowerCase().includes(utilityReadingSearchText.toLowerCase()) ||
      reading.readingValue.toString().includes(utilityReadingSearchText) ||
      reading.consumption.toString().includes(utilityReadingSearchText)
    );
  });

  const handleCreateInvoice = () => {
    const initialFees = ["1", "2", "3", "4"];
    setSelectedFees(initialFees);
    const initialValues = {
      cycle: "11/2025",
      selectedFees: initialFees,
      electricity: {
        newReadingDate: dayjs("2025-11-22"),
        newReading: 1950,
        oldReading: 1800,
        oldDate: "22/10",
      },
      water: {
        newReadingDate: dayjs("2025-11-22"),
        newReading: 265,
        oldReading: 250,
        oldDate: "22/10",
      },
      parking: {
        adjustedQuantity: apartmentData.registeredVehicles.total,
      },
    };
    setInitialFormValues(initialValues);
    setIsModalVisible(true);
    form.setFieldsValue(initialValues);
  };

  const handleSaveDraft = async () => {
    try {
      await form.validateFields();
      message.success("Đã lưu & tính nháp thành công!");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleCancelModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    modal.confirm({
      title: "Xác nhận hủy",
      content: "Bạn có chắc muốn hủy? Tất cả thay đổi sẽ bị mất.",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        setIsModalVisible(false);
        form.resetFields();
        setInitialFormValues(null);
      },
    });
  };


  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Chi tiết Căn hộ: {apartmentData.code}
      </Title>

      <Card
        title="PHẦN A: Thông tin Cơ bản (Read-Only)"
        style={{ marginBottom: 24 }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Khu vực này hiển thị dữ liệu nền tảng dùng cho tính toán AREA và
          QUANTITY, đồng thời xác định Tòa nhà áp dụng cấu hình giá.
        </Text>

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Mã Căn hộ: </Text>
              <Text>{apartmentData.code}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Tòa nhà: </Text>
              <Text>{apartmentData.buildingName}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Diện tích (m²): </Text>
              <Text>{apartmentData.area}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Số xe đã ĐK: </Text>
              <Text>
                {apartmentData.registeredVehicles.total} (
                {apartmentData.registeredVehicles.cars} Ô tô,{" "}
                {apartmentData.registeredVehicles.motorbikes} Xe máy)
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Ngày Chốt Sổ (Setting): </Text>
              <Text>{apartmentData.closingDate} hàng tháng</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <Text strong>Quản lý: </Text>
              <Text>{apartmentData.managerName}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="PHẦN B: Quản lý Hóa đơn & Phát hành (Fee Notice Management)">
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Đây là khu vực thao tác chính. Manager bắt đầu luồng tính phí tại đây
          và xem kết quả lịch sử.
        </Text>

        <div style={{ marginBottom: 16 }}>
          <Title level={4}>1. Thao tác Tạo Hóa đơn (Create Invoice Action)</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateInvoice}
            size="large"
          >
            Tạo Hóa đơn Mới
          </Button>
          <Text type="secondary" style={{ marginLeft: 16 }}>
            → Kích hoạt Form Modal Nhập liệu (Xem Mục C)
          </Text>
        </div>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Title level={4}>2. Lịch sử Hóa đơn (Fee Notice History)</Title>
        </div>

        <Input.Search
          placeholder="Tìm kiếm trong bảng..."
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
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
        />
      </Card>

      <Modal
        title="PHẦN C: Form Modal Tạo Hóa đơn"
        open={isModalVisible}
        onCancel={() => {}}
        footer={null}
        width={900}
        centered
        maskClosable={false}
        closeIcon={
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelModal(e);
            }}
            style={{
              cursor: "pointer",
              fontSize: "16px",
              color: "rgba(0, 0, 0, 0.45)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <CloseOutlined />
          </span>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div>
              <Text strong>Trạng thái: </Text>
              {getStatusTag(currentInvoiceStatus)}
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Trạng thái TT: </Text>
              {getPaymentStatusTag(currentPaymentStatus)}
            </div>
          </Col>
        </Row>

        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Đây là giao diện gộp cho việc chọn phí, nhập chỉ số, và tính toán.
        </Text>

        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Tháng Tính Phí"
                name="cycle"
                rules={[{ required: true, message: "Bắt buộc chọn" }]}
              >
                <Select style={{ width: "100%" }} placeholder="Chọn chu kỳ">
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
                label="Chọn Phí"
                name="selectedFees"
                rules={[
                  { required: true, message: "Vui lòng chọn ít nhất một loại phí" },
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

          {selectedFees.includes("1") && (
            <>
              <Divider orientation="left">Phí Điện (TIERED)</Divider>

              <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Ngày Đọc Mới"
                name={["electricity", "newReadingDate"]}
                rules={[
                  { 
                    required: selectedFees.includes("1"), 
                    message: "Bắt buộc nhập" 
                  }
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Chỉ số Mới"
                name={["electricity", "newReading"]}
                rules={[
                  { 
                    required: selectedFees.includes("1"), 
                    message: "Bắt buộc nhập" 
                  }
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập chỉ số"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Chỉ số Cũ">
                <Input
                  value="1800"
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Ngày Cũ">
                <Input
                  value="22/10"
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
          </Row>
            </>
          )}

          {selectedFees.includes("2") && (
            <>
              <Divider orientation="left">Phí Nước (TIERED)</Divider>

              <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Ngày Đọc Mới"
                name={["water", "newReadingDate"]}
                rules={[
                  { 
                    required: selectedFees.includes("2"), 
                    message: "Bắt buộc nhập" 
                  }
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Chỉ số Mới"
                name={["water", "newReading"]}
                rules={[
                  { 
                    required: selectedFees.includes("2"), 
                    message: "Bắt buộc nhập" 
                  }
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập chỉ số"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Chỉ số Cũ">
                <Input
                  value="250"
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Ngày Cũ">
                <Input
                  value="22/10"
                  readOnly
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
          </Row>
            </>
          )}

          {selectedFees.includes("4") && (
            <>
              <Divider orientation="left">Phí Gửi xe (QUANTITY)</Divider>

              <Form.Item
                label="Số lượng điều chỉnh"
                name={["parking", "adjustedQuantity"]}
              >
                <InputNumber
                  style={{ width: 200 }}
                  placeholder="Nhập số lượng"
                  min={0}
                  defaultValue={apartmentData.registeredVehicles.total}
                />
              </Form.Item>
            </>
          )}

          <Divider />

          <Card title="PHẦN D: Lịch sử Chỉ số Đã nhập" style={{ marginTop: 16 }}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              Khu vực này chỉ đóng vai trò là một Sổ cái (Ledger) để kiểm tra
              lịch sử dữ liệu thô.
            </Text>

            <Input.Search
              placeholder="Tìm kiếm trong bảng..."
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
                  `${range[0]}-${range[1]} của ${total} mục`,
              }}
            />
          </Card>

          <div style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleSaveDraft}>
              Lưu & Tính Nháp
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ApartmentDetail;

