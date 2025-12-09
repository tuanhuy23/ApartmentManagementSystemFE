import React, { useState, useEffect, useRef } from "react";
import { Table, Typography, Button, Space, Tag, App, Breadcrumb, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { feeConfigurationApi } from "../../api/feeConfigurationApi";
import { getErrorMessage } from "../../utils/errorHandler";
import type { FeeType, CalculationType, FeeTypeDto } from "../../types/fee";
import FeeTypeForm from "./FeeTypeForm";

const { Title } = Typography;

const FeeConfiguration: React.FC = () => {
  const { notification } = App.useApp();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFeeTypeForDelete, setSelectedFeeTypeForDelete] = useState<FeeType | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch fee types");
      notification.error({ message: errorMessage });
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
      applyDate: dto.applyDate,
      rateConfigs: dto.feeRateConfigs?.map((rc) => ({
        id: rc.id,
        configName: rc.name,
        vatRate: rc.vatRate,
        bvmtFee: 0,
        unitName: rc.unitName,
        applyDate: rc.applyDate,
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch fee type details");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (feeType: FeeType) => {
    setSelectedFeeTypeForDelete(feeType);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFeeTypeForDelete) return;

    try {
      setDeleting(true);
      await feeConfigurationApi.delete([selectedFeeTypeForDelete.id]);
      notification.success({ message: "Fee type deleted successfully!" });
      setDeleteModalVisible(false);
      setSelectedFeeTypeForDelete(null);
      hasFetchedFeeTypesRef.current = false;
      fetchFeeTypes();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to delete fee type");
      notification.error({ message: errorMessage });
    } finally {
      setDeleting(false);
    }
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to save fee type");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const convertFeeTypeToDto = (feeType: FeeType) => {
    const now = new Date().toISOString();
    return {
      id: feeType.id && feeType.id.trim() !== "" ? feeType.id : null,
      name: feeType.feeName,
      calculationType: feeType.calculationType,
      apartmentBuildingId: apartmentBuildingId || "",
      isVATApplicable: feeType.isVATApplicable ?? true,
      defaultRate: feeType.defaultRate || 0,
      defaultVATRate: feeType.vatRate || 0,
      isActive: feeType.isActive ?? true,
      applyDate: feeType.applyDate ?? null,
      feeRateConfigs: feeType.rateConfigs?.map((rc) => ({
        id: rc.id && rc.id.trim() !== "" ? rc.id : null,
        name: rc.configName,
        vatRate: rc.vatRate,
        isActive: rc.status === "ACTIVE",
        applyDate: rc.applyDate || now,
        unitName: rc.unitName || "unit",
        otherRate: null,
        feeTiers: rc.tiers?.map((t) => ({
          id: t.id && t.id.trim() !== "" ? t.id : null,
          tierOrder: t.tier,
          consumptionStart: t.from,
          consumptionEnd: t.to,
          unitRate: t.rate,
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
            onClick={() => handleDelete(record)}
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

      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Warning: Delete Fee Type
          </span>
        }
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedFeeTypeForDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleting }}
        width={600}
      >
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
            Are you sure you want to delete <strong>{selectedFeeTypeForDelete?.feeName}</strong>?
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
              <li>All fee configuration data will be permanently deleted</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeeConfiguration;

