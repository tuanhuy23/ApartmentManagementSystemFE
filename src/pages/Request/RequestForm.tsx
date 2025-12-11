import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, Card, Typography, App, Space, Upload, Image, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { requestApi } from "../../api/requestApi";
import { fileApi } from "../../api/fileApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RequestDto } from "../../types/request";
import type { FileAttachmentDto } from "../../types/file";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RequestForm: React.FC = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<RequestDto & { requestType: string }>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [files, setFiles] = useState<FileAttachmentDto[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean[]>([]);
  const isEditMode = !!id;
  const requestAbortRef = useRef<AbortController | null>(null);

  const handleFileUpload = async (index: number, file: File) => {
    try {
      setUploadingFiles(prev => {
        const newArray = [...prev];
        while (newArray.length <= index) {
          newArray.push(false);
        }
        newArray[index] = true;
        return newArray;
      });
      
      const fileUrl = await fileApi.upload(file);
      const newFiles = [...files];
      newFiles[index] = { 
        ...newFiles[index], 
        src: fileUrl,
        fileType: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
        name: file.name,
      };
      setFiles(newFiles);
      notification.success({ message: 'File uploaded successfully' });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to upload file');
      notification.error({ message: errorMessage });
    } finally {
      setUploadingFiles(prev => {
        const newArray = [...prev];
        while (newArray.length <= index) {
          newArray.push(false);
        }
        newArray[index] = false;
        return newArray;
      });
    }
  };

  const addFile = () => {
    const newFile: FileAttachmentDto = {
      id: null,
      name: "",
      description: "",
      src: "",
      fileType: "",
    };
    setFiles([...files, newFile]);
    setUploadingFiles([...uploadingFiles, false]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUploadingFiles = uploadingFiles.filter((_, i) => i !== index);
    setFiles(newFiles);
    setUploadingFiles(newUploadingFiles);
  };

  const updateFile = (index: number, field: keyof FileAttachmentDto, value: string) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [field]: value };
    setFiles(newFiles);
  };

  useEffect(() => {
    if (!isEditMode || !id || !apartmentBuildingId) return;

    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
    }
    const abortController = new AbortController();
    requestAbortRef.current = abortController;

    const fetchRequest = async () => {
      try {
        setFetching(true);
        const response = await requestApi.getById(id);
        if (!abortController.signal.aborted && response && response.data) {
          const data = Array.isArray(response.data) ? response.data[0] : response.data;
          if (data) {
            form.setFieldsValue({
              title: data.title || "",
              description: data.description || "",
              requestType: data.requestType || "TECHNICAL",
            });
            if (data.files && data.files.length > 0) {
              setFiles(data.files);
              setUploadingFiles(new Array(data.files.length).fill(false));
            } else {
              setFiles([]);
              setUploadingFiles([]);
            }
          }
        }
      } catch (error: unknown) {
        if (!abortController.signal.aborted) {
          const errorMessage = getErrorMessage(error, "Failed to fetch request details");
          notification.error({ message: errorMessage });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setFetching(false);
        }
      }
    };

    fetchRequest();

    return () => {
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
      }
    };
  }, [isEditMode, id, apartmentBuildingId, form, notification]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const buildingId = getApartmentBuildingIdFromToken();
      
      if (!buildingId) {
        notification.error({ message: "Apartment building ID not found" });
        return;
      }

      setLoading(true);

      const submitData: RequestDto = {
        id: isEditMode ? id : null,
        apartmentBuildingId: buildingId,
        title: values.title,
        description: values.description,
        status: "NEW",
        userId: user?.id || null,
        files: files.filter(f => f.src),
        feedbacks: [],
        requestType: values.requestType,
      };

      if (isEditMode) {
        await requestApi.update(submitData);
        notification.success({ message: "Request updated successfully!" });
      } else {
        await requestApi.create(submitData);
        notification.success({ message: "Request created successfully!" });
      }
      navigate(`/${apartmentBuildingId}/requests`);
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your input" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to create request");
        notification.error({ message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>{isEditMode ? "Edit Support Request" : "Submit New Support Request"}</Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/requests`)}
          >
            Back
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Title level={4}>Request Information</Title>

          <Form.Item
            label="Request Type"
            name="requestType"
            rules={[{ required: true, message: "Please select request type" }]}
          >
            <Select placeholder="Select request type">
              <Option value="TECHNICAL">Technical</Option>
              <Option value="CLEANING">Cleaning</Option>
              <Option value="SECURITY">Security</Option>
              <Option value="FEEDBACK">Feedback</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Please enter a title (Required)" />
          </Form.Item>

          <Form.Item
            label="Detailed Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Describe the issue you are facing in detail... (Required)" 
            />
          </Form.Item>

          <Title level={4}>Attachments (Optional)</Title>
          <div style={{ marginBottom: 24 }}>
            <Button 
              type="dashed" 
              onClick={addFile} 
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              Upload File
            </Button>
            
            {files.map((file, index) => (
              <Card key={index} size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: "grid", gap: 16, alignItems: "start" }}>
                  {file.src && file.fileType === 'IMAGE' && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Image
                        src={file.src}
                        alt={`File ${index + 1} preview`}
                        width={150}
                        height={150}
                        style={{ 
                          objectFit: 'cover',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px'
                        }}
                      />
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "center" }}>
                    <Input
                      placeholder="File name"
                      value={file.name || ""}
                      onChange={(e) => updateFile(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="File URL (auto-filled after upload)"
                      value={file.src || ""}
                      readOnly
                    />
                    <Button 
                      type="text" 
                      danger 
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeFile(index)}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Upload
                      customRequest={async (options) => {
                        const file = options.file as File;
                        await handleFileUpload(index, file);
                      }}
                      beforeUpload={(file) => {
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isLt10M) {
                          notification.error({ message: 'File must be smaller than 10MB!' });
                          return false;
                        }
                        return true;
                      }}
                      showUploadList={false}
                    >
                      <Button 
                        icon={uploadingFiles[index] ? <LoadingOutlined /> : <UploadOutlined />}
                        loading={uploadingFiles[index]}
                        size="small"
                      >
                        {uploadingFiles[index] ? 'Uploading...' : 'Upload File'}
                      </Button>
                    </Upload>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading || fetching}>
                {isEditMode ? "Update Request" : "Submit Request"}
              </Button>
              <Button onClick={() => navigate(`/${apartmentBuildingId}/requests`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RequestForm;

