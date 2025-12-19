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
  Modal,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CloseOutlined,
  DeleteOutlined,
  SearchOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { apartmentApi } from "../../api/apartmentApi";
import { feeApi } from "../../api/feeApi";
import { feeConfigurationApi } from "../../api/feeConfigurationApi";
import { getErrorMessage } from "../../utils/errorHandler";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { UpdateApartmentDto } from "../../types/apartment";
import type {
  FeeNotice,
  UtilityReading,
  FeeType,
  InvoiceFormData,
  ApartmentDto,
  UtilityReadingDto,
} from "../../types/apartment";
import type { FilterQuery, SortQuery } from "../../types/apiResponse";
import { FilterOperator, SortDirection } from "../../types/apiResponse";
import FeeNoticeDetailModal from "./FeeNoticeDetailModal";
import ResidentsTab from "./ResidentsTab";

const { Title, Text } = Typography;
const { Option } = Select;

const ApartmentDetail: React.FC = () => {
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const { notification } = App.useApp();
  const apartmentBuildingId = useApartmentBuildingId();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isConfirmDrawerVisible, setIsConfirmDrawerVisible] = useState(false);
  const [selectedFeeNoticeId, setSelectedFeeNoticeId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cancelFeeModalVisible, setCancelFeeModalVisible] = useState(false);
  const [updatePaymentStatusModalVisible, setUpdatePaymentStatusModalVisible] = useState(false);
  const [selectedFeeNoticeForAction, setSelectedFeeNoticeForAction] = useState<FeeNotice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [form] = Form.useForm<InvoiceFormData>();
  const [apartmentForm] = Form.useForm();
  const [feeNoticeSearchText, setFeeNoticeSearchText] = useState("");
  const [utilityReadingSearchText, setUtilityReadingSearchText] = useState("");
  const [currentInvoiceStatus] = useState<"DRAFT" | "ISSUED">("DRAFT");
  const [currentPaymentStatus] = useState<"N/A" | "UNPAID" | "PAID">("N/A");
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [feeNoticeLoading, setFeeNoticeLoading] = useState(false);
  const [apartmentData, setApartmentData] = useState<ApartmentDto | null>(null);
  const [feeNotices, setFeeNotices] = useState<FeeNotice[]>([]);
  const [utilityReadings, setUtilityReadings] = useState<UtilityReading[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [oldReadings, setOldReadings] = useState<Record<string, UtilityReadingDto | null>>({});
  const [allUtilityReadings, setAllUtilityReadings] = useState<UtilityReadingDto[]>([]);
  const [feeNoticeCurrentPage, setFeeNoticeCurrentPage] = useState(1);
  const [feeNoticePageSize, setFeeNoticePageSize] = useState(10);
  const [feeNoticeSorts, setFeeNoticeSorts] = useState<SortQuery[]>([]);
  const [utilityReadingCurrentPage, setUtilityReadingCurrentPage] = useState(1);
  const [utilityReadingPageSize, setUtilityReadingPageSize] = useState(10);
  const [utilityReadingLoading, setUtilityReadingLoading] = useState(false);
  const [utilityReadingSorts, setUtilityReadingSorts] = useState<SortQuery[]>([]);
  const utilityReadingsLastRequestKeyRef = useRef<string>("");
  const fetchedApartmentIdRef = useRef<string | null>(null);
  const utilityReadingsAbortRef = useRef<AbortController | null>(null);
  const apartmentDetailAbortRef = useRef<AbortController | null>(null);
  const feeNoticesLastRequestKeyRef = useRef<string>("");

  const fetchUtilityReadings = async () => {
    if (!apartmentId) return;

    const requestKey = JSON.stringify({ apartmentId, utilityReadingSearchText, utilityReadingSorts, utilityReadingCurrentPage, utilityReadingPageSize });

    if (utilityReadingsLastRequestKeyRef.current === requestKey) {
      return;
    }

    utilityReadingsLastRequestKeyRef.current = requestKey;

    try {
      setUtilityReadingLoading(true);
      const filters: FilterQuery[] = [];

      if (utilityReadingSearchText) {
        filters.push({
          Code: "feeTypeName",
          Operator: FilterOperator.Contains,
          Value: utilityReadingSearchText,
        });
      }

      const response = await feeApi.getUtilityReadings(apartmentId, {
        filters: filters.length > 0 ? filters : undefined,
        sorts: utilityReadingSorts.length > 0 ? utilityReadingSorts : undefined,
        page: utilityReadingCurrentPage,
        limit: utilityReadingPageSize,
      });

      if (response.data) {
        setAllUtilityReadings(response.data);

        // Sort by readingDate to calculate consumption correctly
        const sortedData = [...response.data].sort((a, b) => {
          const dateA = new Date(a.readingDate).getTime();
          const dateB = new Date(b.readingDate).getTime();
          return dateA - dateB;
        });

        // Group by feeTypeId to calculate consumption
        const readingsByFeeType: Record<string, UtilityReadingDto[]> = {};
        sortedData.forEach((dto) => {
          if (!readingsByFeeType[dto.feeTypeId]) {
            readingsByFeeType[dto.feeTypeId] = [];
          }
          readingsByFeeType[dto.feeTypeId].push(dto);
        });

        const convertedReadings: UtilityReading[] = response.data.map((dto) => {
          const feeTypeReadings = readingsByFeeType[dto.feeTypeId] || [];
          const currentIndex = feeTypeReadings.findIndex((r) => r.id === dto.id);
          const previousReading = currentIndex > 0 ? feeTypeReadings[currentIndex - 1] : null;

          const consumption = previousReading
            ? dto.currentReading - previousReading.currentReading
            : 0;

          return {
            id: dto.id,
            type: dto.feeTypeName === "Electricity" ? "Electricity" : "Water",
            readingDate: dto.readingDate,
            readingValue: dto.currentReading,
            consumption: consumption > 0 ? consumption : 0,
            unit: dto.feeTypeName === "Electricity" ? "kWh" : "m³",
          };
        });
        setUtilityReadings(convertedReadings);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch utility readings");
      notification.error({ message: errorMessage });
    } finally {
      setUtilityReadingLoading(false);
    }
  };

  const fetchApartmentDetail = useCallback(async () => {
    if (!apartmentId) return;
    if (apartmentDetailAbortRef.current) {
      apartmentDetailAbortRef.current.abort();
    }
    const abortController = new AbortController();
    apartmentDetailAbortRef.current = abortController;

    try {
      setLoading(true);
      const response = await apartmentApi.getById(apartmentId);
      const isCurrentRequest = apartmentDetailAbortRef.current === abortController;

      if (isCurrentRequest && response && response.status === 200 && response.data) {
        const apartmentData = response.data;
        setApartmentData(apartmentData);
        apartmentForm.setFieldsValue({
          name: apartmentData.name || "",
          area: apartmentData.area ?? 0,
          floor: apartmentData.floor ?? 0,
        });
      }
    } catch (error: unknown) {
      const isCurrentRequest = apartmentDetailAbortRef.current === abortController;
      if (isCurrentRequest) {
        const errorMessage = getErrorMessage(error, "Failed to fetch apartment details");
        notification.error({ message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  }, [apartmentId, notification, apartmentForm]);

  const fetchFeeNotices = async () => {
    if (!apartmentId) return;

    const requestKey = JSON.stringify({ apartmentId, feeNoticeSearchText, feeNoticeSorts, feeNoticeCurrentPage, feeNoticePageSize });

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

      const response = await feeApi.getByApartmentId(apartmentId, {
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
          status: dto.status as "ISSUED" | "CANCELED",
          paymentStatus: dto.paymentStatus as "N/A" | "UNPAID" | "PAID",
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
    if (apartmentId && fetchedApartmentIdRef.current !== apartmentId) {
      fetchedApartmentIdRef.current = apartmentId;
      feeNoticesLastRequestKeyRef.current = "";
      utilityReadingsLastRequestKeyRef.current = "";
      fetchApartmentDetail();
      fetchUtilityReadings();
    }
    return () => {
      if (utilityReadingsAbortRef.current) {
        utilityReadingsAbortRef.current.abort();
      }
      if (apartmentDetailAbortRef.current) {
        apartmentDetailAbortRef.current.abort();
      }
    };
  }, [apartmentId, fetchApartmentDetail]);

  useEffect(() => {
    if (apartmentId) {
      utilityReadingsLastRequestKeyRef.current = "";
      fetchUtilityReadings();
    }
  }, [apartmentId, utilityReadingSearchText, utilityReadingSorts, utilityReadingCurrentPage, utilityReadingPageSize]);

  useEffect(() => {
    if (apartmentId) {
      feeNoticesLastRequestKeyRef.current = "";
      fetchFeeNotices();
    }
  }, [apartmentId, feeNoticeSearchText, feeNoticeSorts, feeNoticeCurrentPage, feeNoticePageSize]);

  useEffect(() => {
    if (apartmentData) {
      apartmentForm.setFieldsValue({
        name: apartmentData.name || "",
        area: apartmentData.area ?? 0,
        floor: apartmentData.floor ?? 0,
      });
    }
  }, [apartmentData, apartmentForm]);

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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch fee types");
      notification.error({ message: errorMessage });
    }
  }, []);

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
      width: 200,
      render: (_: unknown, record: FeeNotice) => {
        if (record.status === "CANCELED") {
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
              />
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => {
                  setSelectedFeeNoticeForAction(record);
                  setDeleteModalVisible(true);
                }}
                style={{ color: "#000" }}
                title="Delete"
              />
            </Space>
          );
        }
        if (record.paymentStatus === "PAID") {
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
              />
            </Space>
          );
        }

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
            />
            <Button
              type="link"
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedFeeNoticeForAction(record);
                setCancelFeeModalVisible(true);
              }}
              style={{ color: "#000" }}
              title="Cancel Fee"
            />
            <Button
              type="link"
              icon={<CreditCardOutlined />}
              onClick={() => {
                setSelectedFeeNoticeForAction(record);
                setUpdatePaymentStatusModalVisible(true);
              }}
              style={{ color: "#000" }}
              title="Update Payment Status"
            />
          </Space>
        );
      },
    },
  ];

  const utilityReadingColumns: ColumnsType<UtilityReading> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => type === "Electricity" ? "Electricity" : "Water",
      sorter: true,
      sortDirections: ["ascend", "descend"],
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
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date: string) => {
        if (!date || date === "0001-01-01T00:00:00") return "N/A";
        return dayjs(date).format("DD/MM/YYYY");
      },
    },
    {
      title: "Reading Value",
      dataIndex: "readingValue",
      key: "readingValue",
      render: (value: number, record: UtilityReading) =>
        `${value} ${record.unit}`,
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
  ];

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

  const handleUtilityReadingTableChange = (
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
      setUtilityReadingSorts(newSorts);
      setUtilityReadingCurrentPage(1);
    } else {
      setUtilityReadingSorts([]);
    }
  };

  const handleUtilityReadingSearch = (value: string) => {
    setUtilityReadingSearchText(value);
    setUtilityReadingCurrentPage(1);
  };

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
      feeNoticesLastRequestKeyRef.current = "";
      await fetchFeeNotices();
      fetchUtilityReadings();
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your information!" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to save draft");
        notification.error({ message: errorMessage });
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

    setIsConfirmDrawerVisible(true);
  };

  const handleConfirmCancel = () => {
    setIsModalVisible(false);
    setIsConfirmDrawerVisible(false);
    form.resetFields();
  };

  const handleCancelConfirm = () => {
    setIsConfirmDrawerVisible(false);
  };

  const handleUpdateApartment = async () => {
    try {
      await apartmentForm.validateFields();
      const values = apartmentForm.getFieldsValue();

      if (!apartmentId || !apartmentBuildingId) {
        notification.error({ message: "Missing required information" });
        return;
      }

      setUpdating(true);
      const updateData: UpdateApartmentDto = {
        id: apartmentId,
        name: values.name,
        area: values.area,
        floor: values.floor,
      };

      await apartmentApi.update(updateData);
      notification.success({ message: "Apartment updated successfully!" });

      await fetchApartmentDetail();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      const errorMessage = getErrorMessage(error, "Failed to update apartment");
      notification.error({ message: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelFeeConfirm = async () => {
    if (!selectedFeeNoticeForAction?.id) return;

    try {
      setCanceling(true);
      await feeApi.cancelFee(selectedFeeNoticeForAction.id);
      notification.success({ message: "Fee notice canceled successfully!" });
      setCancelFeeModalVisible(false);
      setSelectedFeeNoticeForAction(null);
      feeNoticesLastRequestKeyRef.current = "";
      await fetchFeeNotices();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to cancel fee notice");
      notification.error({ message: errorMessage });
    } finally {
      setCanceling(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeeNoticeForAction?.id) return;

    try {
      setDeleting(true);
      await feeApi.delete([selectedFeeNoticeForAction.id]);
      notification.success({ message: "Fee notice deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedFeeNoticeForAction(null);
      feeNoticesLastRequestKeyRef.current = "";
      await fetchFeeNotices();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete fee notice");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePaymentStatusConfirm = async () => {
    if (!selectedFeeNoticeForAction?.id) return;

    try {
      setUpdatingPaymentStatus(true);
      await feeApi.updatePaymentStatusFee(selectedFeeNoticeForAction.id);
      notification.success({ message: "Payment status updated successfully!" });
      setUpdatePaymentStatusModalVisible(false);
      setSelectedFeeNoticeForAction(null);
      feeNoticesLastRequestKeyRef.current = "";
      await fetchFeeNotices();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to update payment status");
      notification.error({ message: errorMessage });
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };


  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        Apartment Details: {apartmentData?.name || "Loading..."}
      </Title>

      <Card
        title="Basic Information"
        style={{ marginBottom: 24 }}
        loading={loading}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          This area displays foundational data used for AREA and QUANTITY calculations, and determines the building that applies the price configuration.
        </Text>

        <Form form={apartmentForm} layout="vertical" onFinish={handleUpdateApartment}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Apartment Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter apartment name" },
                  { max: 16, message: "Apartment name must not exceed 16 characters" },
                ]}
              >
                <Input placeholder="Enter apartment name" maxLength={16} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Area (m²)"
                name="area"
                rules={[
                  { required: true, message: "Please enter area" },
                  { type: "number", message: "Area must be a number" },
                  { type: "number", min: 0, message: "Area must be greater than 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter area in square meters"
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Floor"
                name="floor"
                rules={[
                  { required: true, message: "Please enter floor number" },
                  { type: "number", message: "Floor must be a number" },
                  { type: "number", min: 0, message: "Floor must be 0 or greater" },
                  {
                    validator: (_, value) => {
                      if (value === null || value === undefined) {
                        return Promise.resolve();
                      }
                      if (Number.isInteger(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Floor must be an integer"));
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter floor number"
                  min={0}
                  precision={0}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={updating}>
              Update
            </Button>
          </Form.Item>
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

                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      display: 'flex',
                      maxWidth: 400,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #d9d9d9',
                      backgroundColor: '#ffffff'
                    }}>
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
                          border: 'none',
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <div style={{
                        width: '1px',
                        backgroundColor: '#d9d9d9',
                        margin: '8px 0'
                      }} />
                      <Button
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={() => handleFeeNoticeSearch(feeNoticeSearchText)}
                        type="text"
                        style={{
                          border: 'none',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 0,
                          color: '#8c8c8c',
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
                </div>
              ),
            },
            {
              key: "2",
              label: "Utility Reading History",
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      display: 'flex',
                      maxWidth: 400,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #d9d9d9',
                      backgroundColor: '#ffffff'
                    }}>
                      <Input
                        placeholder="Search in table..."
                        allowClear
                        size="large"
                        value={utilityReadingSearchText}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUtilityReadingSearchText(value);
                          if (!value) {
                            handleUtilityReadingSearch("");
                          }
                        }}
                        onPressEnter={(e) => {
                          handleUtilityReadingSearch((e.target as HTMLInputElement).value);
                        }}
                        bordered={false}
                        style={{
                          flex: 1,
                          border: 'none',
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <div style={{
                        width: '1px',
                        backgroundColor: '#d9d9d9',
                        margin: '8px 0'
                      }} />
                      <Button
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={() => handleUtilityReadingSearch(utilityReadingSearchText)}
                        type="text"
                        style={{
                          border: 'none',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 0,
                          color: '#8c8c8c',
                        }}
                      />
                    </div>
                  </div>

                  <Table
                    columns={utilityReadingColumns}
                    dataSource={utilityReadings}
                    rowKey="id"
                    loading={utilityReadingLoading}
                    onChange={handleUtilityReadingTableChange}
                    pagination={{
                      current: utilityReadingCurrentPage,
                      pageSize: utilityReadingPageSize,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                      onChange: (page, size) => {
                        setUtilityReadingCurrentPage(page);
                        setUtilityReadingPageSize(size);
                      },
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

            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                maxWidth: 400,
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #d9d9d9',
                backgroundColor: '#ffffff'
              }}>
                <Input
                  placeholder="Search in table..."
                  allowClear
                  size="large"
                  value={utilityReadingSearchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUtilityReadingSearchText(value);
                    if (!value) {
                      setUtilityReadingCurrentPage(1);
                    }
                  }}
                  onPressEnter={(e) => {
                    setUtilityReadingSearchText((e.target as HTMLInputElement).value);
                    setUtilityReadingCurrentPage(1);
                  }}
                  bordered={false}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
                <div style={{
                  width: '1px',
                  backgroundColor: '#d9d9d9',
                  margin: '8px 0'
                }} />
                <Button
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => {
                    setUtilityReadingCurrentPage(1);
                  }}
                  type="text"
                  style={{
                    border: 'none',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 0,
                    color: '#8c8c8c',
                  }}
                />
              </div>
            </div>

            <Table
              columns={utilityReadingColumns}
              dataSource={utilityReadings}
              rowKey="id"
              loading={utilityReadingLoading}
              onChange={handleUtilityReadingTableChange}
              pagination={{
                current: utilityReadingCurrentPage,
                pageSize: utilityReadingPageSize,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, size) => {
                  setUtilityReadingCurrentPage(page);
                  setUtilityReadingPageSize(size);
                },
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

      <Drawer
        title="Confirm Cancel"
        open={isConfirmDrawerVisible}
        onClose={handleCancelConfirm}
        width={600}
        placement="right"
        maskClosable={false}
        closable={false}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancelConfirm}
            style={{ padding: 0 }}
          />
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Text>Are you sure you want to cancel? All changes will be lost.</Text>
        </div>
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleCancelConfirm} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleConfirmCancel}>
            Confirm
          </Button>
        </div>
      </Drawer>

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Cancel Fee Notice
          </span>
        }
        open={cancelFeeModalVisible}
        onOk={handleCancelFeeConfirm}
        onCancel={() => {
          setCancelFeeModalVisible(false);
          setSelectedFeeNoticeForAction(null);
        }}
        okText="Cancel Fee"
        cancelText="Close"
        okButtonProps={{ danger: true, loading: canceling }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to cancel this fee notice?
          </p>
          <div style={{
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4,
            padding: 12,
            marginTop: 16
          }}>
            <p style={{ margin: 0, color: '#d46b08', fontWeight: 500 }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Important Warning:
            </p>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>This fee notice will be marked as CANCELED</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Fee Notice
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedFeeNoticeForAction(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete this fee notice?
          </p>
          <div style={{
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4,
            padding: 12,
            marginTop: 16
          }}>
            <p style={{ margin: 0, color: '#d46b08', fontWeight: 500 }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              Important Warning:
            </p>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>This fee notice will be permanently deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Confirm: Update Payment Status
          </span>
        }
        open={updatePaymentStatusModalVisible}
        onOk={handleUpdatePaymentStatusConfirm}
        onCancel={() => {
          setUpdatePaymentStatusModalVisible(false);
          setSelectedFeeNoticeForAction(null);
        }}
        okText="Update"
        cancelText="Cancel"
        okButtonProps={{ loading: updatingPaymentStatus }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to update the payment status of this fee notice?
          </p>
          <p style={{ margin: 0, color: '#595959' }}>
            This will mark the fee notice as paid.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentDetail;

