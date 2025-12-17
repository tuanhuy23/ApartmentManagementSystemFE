import React, { useEffect, useRef, useState } from "react";
import { Table, Typography, Button, Space, App } from "antd";
import { HomeOutlined, ArrowLeftOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { feeApi } from "../../api/feeApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import type { ImportFeeNoticeResult } from "../../types/fee";
import { getErrorMessage } from "../../utils/errorHandler";
import { IMPORT_FEE_NOTICE_RESULT_KEY } from "../../constants/storageKeys";

const { Title } = Typography;

const ImportFeeNoticeResultPage: React.FC = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();

  const [results, setResults] = useState<ImportFeeNoticeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(IMPORT_FEE_NOTICE_RESULT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setResults(parsed);
        }
      } catch {
        sessionStorage.removeItem(IMPORT_FEE_NOTICE_RESULT_KEY);
      }
    }
  }, []);

  const handleBack = () => {
    navigate(`/${apartmentBuildingId}/apartments`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await feeApi.downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fee-notice-import-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      notification.success({ message: "Excel template downloaded successfully!" });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to download Excel template");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const response = await feeApi.import(file);
      if (response.data && response.data.length > 0) {
        sessionStorage.setItem(IMPORT_FEE_NOTICE_RESULT_KEY, JSON.stringify(response.data));
        setResults(response.data);
      } else {
        notification.success({ message: "Import Fee Notice successfully!" });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to import fee notice");
      notification.error({ message: errorMessage });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const columns: ColumnsType<ImportFeeNoticeResult> = [
    {
      title: "Apartment Name",
      dataIndex: "apartmentName",
      key: "apartmentName",
      render: (text: string | null) => text || "N/A",
    },
    {
      title: "Error Message",
      dataIndex: "errorMessage",
      key: "errorMessage",
      render: (text: string | null) => text || "N/A",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back to Apartments
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            <HomeOutlined /> Import Fee Notice Result
          </Title>
        </Space>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} loading={loading}>
            Download Excel Template
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleImportClick} loading={importing}>
            Import Fee Notice Excel
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
        </Space>
      </div>

      <Table
        rowKey={(record, index) => `${record.apartmentName || "unknown"}-${index}`}
        dataSource={results}
        columns={columns}
        loading={loading || importing}
        pagination={false}
      />
    </div>
  );
};

export default ImportFeeNoticeResultPage;

