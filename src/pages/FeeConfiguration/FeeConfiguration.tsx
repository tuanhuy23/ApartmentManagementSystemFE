import React, { useState, useEffect, useRef } from "react";
import { Table, Typography, Button, Space, Tag, App, Breadcrumb } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { feeConfigurationApi } from "../../api/feeConfigurationApi";
import type { FeeType, CalculationType, FeeTypeDto } from "../../types/fee";
import FeeTypeForm from "./FeeTypeForm";

const { Title } = Typography;

const FeeConfiguration: React.FC = () => {
  const { notification } = App.useApp();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const hasFetchedFeeTypesRef = useRef(false);
  const apartmentBuildingId = useApartmentBuildingId();

  useEffect(() => {
    if (!hasFetchedFeeTypesRef.current) {
      hasFetchedFeeTypesRef.current = true;
      fetchFeeTypes();
    }
  }, []);

  const fetchFeeTypes = async () => {
    try {
      setLoading(true);
      const response = await feeConfigurationApi.getAll();
      if (response.data) {
        const convertedFeeTypes = response.data.map((dto) => convertDtoToFeeType(dto));
        setFeeTypes(convertedFeeTypes);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee types" });
    } finally {
      setLoading(false);
    }
  };

  const convertDtoToFeeType = (dto: FeeTypeDto): FeeType => {
    const activeConfig = dto.feeRateConfigs?.find((rc) => rc.isActive);
    return {
      id: dto.id,
      feeName: dto.name,
      calculationType: dto.calculationType as CalculationType,
      buildingId: dto.apartmentBuildingId,
      buildingName: "",
      isActive: dto.isActive,
      isVATApplicable: dto.isVATApplicable,
      defaultRate: dto.defaultRate,
      vatRate: activeConfig?.vatRate || 0,
      rateConfigs: dto.feeRateConfigs?.map((rc) => ({
        id: rc.id,
        configName: rc.name,
        vatRate: rc.vatRate,
        bvmtFee: 0,
        status: rc.isActive ? "ACTIVE" : "INACTIVE",
        tiers: rc.feeTiers?.map((t) => ({
          id: t.id,
          tier: t.tierOrder,
          from: t.consumptionStart,
          to: t.consumptionEnd,
          rate: t.unitRate,
        })),
      })),
      quantityRates: dto.quantityRateConfigs?.map((qr) => ({
        id: qr.id || "",
        itemType: qr.itemType,
        unitRate: qr.unitRate,
        vatRate: 0,
      })),
    };
  };

  const handleCreate = () => {
    setEditingFeeType(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (feeType: FeeType) => {
    try {
      setLoading(true);
      const response = await feeConfigurationApi.getById(feeType.id);
      if (response.data) {
        const convertedFeeType = convertDtoToFeeType(response.data);
        setEditingFeeType(convertedFeeType);
        setIsModalOpen(true);
      }
    } catch {
      notification.error({ message: "Failed to fetch fee type details" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    notification.error({ message: "Delete functionality not available in API" });
  };

  const handleSave = async (feeType: FeeType) => {
    try {
      setLoading(true);
      const dto = convertFeeTypeToDto(feeType);
      
      if (editingFeeType) {
        await feeConfigurationApi.update(dto);
        notification.success({ message: "Fee type updated successfully!" });
      } else {
        await feeConfigurationApi.create(dto);
        notification.success({ message: "Fee type created successfully!" });
      }
      
      setIsModalOpen(false);
      setEditingFeeType(null);
      hasFetchedFeeTypesRef.current = false;
      fetchFeeTypes();
    } catch {
      notification.error({ message: "Failed to save fee type" });
    } finally {
      setLoading(false);
    }
  };

  const convertFeeTypeToDto = (feeType: FeeType) => {
    return {
      id: feeType.id && feeType.id.trim() !== "" ? feeType.id : null,
      name: feeType.feeName,
      calculationType: feeType.calculationType,
      apartmentBuildingId: apartmentBuildingId || "",
      isVATApplicable: feeType.isVATApplicable ?? true,
      defaultRate: feeType.defaultRate || 0,
      defaultVATRate: feeType.vatRate || 0,
      isActive: feeType.isActive ?? true,
      feeRateConfigs: feeType.rateConfigs?.map((rc) => ({
        id: rc.id && rc.id.trim() !== "" ? rc.id : null,
        name: rc.configName,
        vatRate: rc.vatRate,
        isActive: rc.status === "ACTIVE",
        feeTiers: rc.tiers?.map((t) => ({
          id: t.id && t.id.trim() !== "" ? t.id : null,
          tierOrder: t.tier,
          consumptionStart: t.from,
          consumptionEnd: t.to,
          unitRate: t.rate,
          unitName: "unit",
        })) || [],
      })) || [],
      quantityRateConfigs: feeType.quantityRates?.map((qr) => ({
        id: qr.id && qr.id.trim() !== "" ? qr.id : null,
        isActive: true,
        itemType: qr.itemType,
        unitRate: qr.unitRate,
      })) || [],
    };
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
      title: "Active",
      key: "active",
      width: 100,
      render: (_: unknown, record: FeeType) => (
        <span style={{ color: record.isActive ? "#000" : "#d9d9d9" }}>
          {record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: FeeType) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: "#000" }} />}
            onClick={() => handleEdit(record)}
            style={{ color: "#000" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined style={{ color: "#000" }} />}
            onClick={handleDelete}
            style={{ color: "#000" }}
          />
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
        loading={loading}
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
        buildingName=""
      />
    </div>
  );
};

export default FeeConfiguration;

