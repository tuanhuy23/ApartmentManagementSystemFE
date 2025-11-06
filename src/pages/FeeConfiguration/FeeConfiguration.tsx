import React, { useState } from "react";
import { Table, Typography, Button, Space, Tag, message, Breadcrumb } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { FeeType, CalculationType } from "../../types/fee";
import FeeTypeForm from "./FeeTypeForm";

const { Title } = Typography;

// Seeded data
const mockFeeTypes: FeeType[] = [
  {
    id: "1",
    feeName: "Service Fee",
    calculationType: "AREA",
    buildingId: "building-1",
    buildingName: "BUILDING A",
    defaultRate: 15000,
    vatRate: 0.10,
  },
  {
    id: "2",
    feeName: "Parking Fee",
    calculationType: "QUANTITY",
    buildingId: "building-1",
    buildingName: "BUILDING A",
    quantityRates: [
      { id: "q1", itemType: "Motorbike", unitRate: 100000, vatRate: 0.08 },
      { id: "q2", itemType: "Car-4Seater", unitRate: 1200000, vatRate: 0.10 },
      { id: "q3", itemType: "Bicycle", unitRate: 30000, vatRate: 0.08 },
    ],
  },
  {
    id: "3",
    feeName: "Electricity Fee",
    calculationType: "TIERED",
    buildingId: "building-1",
    buildingName: "BUILDING A",
    rateConfigs: [
      {
        id: "rc1",
        configName: "EVN Rate 2025",
        vatRate: 0.08,
        bvmtFee: 0.00,
        status: "ACTIVE",
        tiers: [
          { id: "t1", tier: 1, from: 0, to: 50, rate: 1800 },
          { id: "t2", tier: 2, from: 51, to: 100, rate: 2000 },
          { id: "t3", tier: 3, from: 101, to: 999999, rate: 2500 },
        ],
      },
      {
        id: "rc2",
        configName: "EVN Rate 2024",
        vatRate: 0.10,
        bvmtFee: 0.00,
        status: "INACTIVE",
        tiers: [],
      },
    ],
  },
  {
    id: "4",
    feeName: "Water Fee",
    calculationType: "TIERED",
    buildingId: "building-1",
    buildingName: "BUILDING A",
    rateConfigs: [
      {
        id: "rc3",
        configName: "Water Rate 2025",
        vatRate: 0.05,
        bvmtFee: 0.00,
        status: "ACTIVE",
        tiers: [],
      },
    ],
  },
];

const FeeConfiguration: React.FC = () => {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(mockFeeTypes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const apartmentBuildingId = useApartmentBuildingId();

  const handleCreate = () => {
    setEditingFeeType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (feeType: FeeType) => {
    setEditingFeeType(feeType);
    setIsModalOpen(true);
  };

  const handleDelete = (feeTypeId: string) => {
    setFeeTypes(feeTypes.filter((ft) => ft.id !== feeTypeId));
    message.success("Fee type deleted successfully!");
  };

  const handleSave = (feeType: FeeType) => {
    if (editingFeeType) {
      setFeeTypes(feeTypes.map((ft) => (ft.id === feeType.id ? feeType : ft)));
      message.success("Fee type updated successfully!");
    } else {
      setFeeTypes([...feeTypes, { ...feeType, id: Date.now().toString() }]);
      message.success("Fee type created successfully!");
    }
    setIsModalOpen(false);
    setEditingFeeType(null);
  };

  const getRateStatus = (feeType: FeeType): string => {
    switch (feeType.calculationType) {
      case "AREA":
        return `${feeType.defaultRate?.toLocaleString("vi-VN")} VND/m²`;
      case "QUANTITY":
        return "(View Details)";
      case "TIERED":
        return "(View Active Rate)";
      default:
        return "-";
    }
  };

  const getVATDisplay = (feeType: FeeType): string => {
    switch (feeType.calculationType) {
      case "AREA":
        return `${(feeType.vatRate || 0) * 100}%`;
      case "QUANTITY":
        return "(Varies)";
      case "TIERED":
        const activeConfig = feeType.rateConfigs?.find((rc) => rc.status === "ACTIVE");
        return activeConfig ? `${activeConfig.vatRate * 100}%` : "-";
      default:
        return "-";
    }
  };

  const columns = [
    {
      title: "Fee Name",
      dataIndex: "feeName",
      key: "feeName",
    },
    {
      title: "Calculation Type",
      dataIndex: "calculationType",
      key: "calculationType",
      render: (type: CalculationType) => (
        <Tag color={type === "AREA" ? "blue" : type === "QUANTITY" ? "green" : "orange"}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Rate/Status",
      key: "rateStatus",
      render: (_: unknown, record: FeeType) => getRateStatus(record),
    },
    {
      title: "VAT",
      key: "vat",
      render: (_: unknown, record: FeeType) => getVATDisplay(record),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: FeeType) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Del
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
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
            title: "Fee Configuration",
          },
        ]}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>Fee Type & Rate Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create New Fee Type
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={feeTypes}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <FeeTypeForm
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingFeeType(null);
        }}
        onSave={handleSave}
        feeType={editingFeeType}
        buildingName={feeTypes[0]?.buildingName || "BUILDING A"}
      />
    </div>
  );
};

export default FeeConfiguration;

