import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, App, Space, Upload, Image, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { requestApi } from "../../api/requestApi";
import { fileApi } from "../../api/fileApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { useAuth } from "../../hooks/useAuth";
import { apartmentApi } from "../../api/apartmentApi";
import type { RequestDto } from "../../types/request";
import type { FileAttachmentDto } from "../../types/file";
import type { ApartmentDto } from "../../types/apartment";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RequestForm: React.FC = () => {
  const { notification } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm<RequestDto & { requestType: string; apartmentId: string }>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileAttachmentDto[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean[]>([]);
  const [userApartment, setUserApartment] = useState<ApartmentDto | null>(null);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await apartmentApi.getAll();
      if (response.data && response.data.length > 0) {
        // Try to find user's apartment (this is a simplified approach)
        // In real app, you'd get apartmentId from user profile
        setUserApartment(response.data[0]);
        form.setFieldsValue({ apartmentId: response.data[0].id });
      }
    } catch {
      notification.error({ message: "Failed to fetch apartments" });
    }
  };

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
    } catch {
      notification.error({ message: 'Failed to upload file' });
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
        id: null,
        apartmentBuildingId: buildingId,
        title: values.title,
        description: values.description,
        status: "NEW",
        userId: user?.id || null,
        files: files.filter(f => f.src),
        feedbacks: [],
      };

      await requestApi.create(submitData);
      notification.success({ message: "Request created successfully!" });
      navigate(`/${apartmentBuildingId}/requests`);
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your input" });
      } else {
        notification.error({ message: "Failed to create request" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Submit New Support Request</Title>
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
            label="Apartment"
            name="apartmentId"
          >
            <Input 
              readOnly 
              value={userApartment?.name || "N/A"}
              placeholder="System auto-fills the Resident's apartment"
            />
          </Form.Item>

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
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Submit Request
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

