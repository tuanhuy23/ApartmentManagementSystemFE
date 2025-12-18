import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Switch, DatePicker, App, Space, Select, Upload, Image } from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, DeleteOutlined } from "@ant-design/icons";
import { announcementApi } from "../../api/announcementApi";
import { fileApi } from "../../api/fileApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { getErrorMessage } from "../../utils/errorHandler";
import type { AnnouncementDto, ApartmentAnnouncementDto } from "../../types/announcement";
import type { FileAttachmentDto } from "../../types/file";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AnnouncementForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<AnnouncementDto>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<ApartmentAnnouncementDto[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [images, setImages] = useState<FileAttachmentDto[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const isAll = Form.useWatch("isAll", form) || false;

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoadingApartments(true);
        const response = await announcementApi.getApartment();
        if (response.data) {
          setApartments(response.data);
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "Failed to fetch apartments");
        notification.error({ message: errorMessage });
      } finally {
        setLoadingApartments(false);
      }
    };

    fetchApartments();
  }, [notification]);

  useEffect(() => {
    if (isAll) {
      form.setFieldValue("apartmentIds", []);
    }
  }, [isAll, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const buildingId = getApartmentBuildingIdFromToken();
      
      if (!buildingId) {
        notification.error({ message: "Apartment building ID not found" });
        return;
      }

      setLoading(true);

      const submitData: AnnouncementDto = {
        id: null,
        apartmentBuildingId: buildingId,
        title: values.title,
        body: values.body,
        status: "DRAFT",
        isAll: values.isAll || false,
        apartmentIds: values.isAll ? [] : (values.apartmentIds || []),
        publishDate: values.publishDate && dayjs.isDayjs(values.publishDate) 
          ? values.publishDate.format("YYYY-MM-DD") 
          : dayjs().format("YYYY-MM-DD"),
        files: images,
      };

      await announcementApi.create(submitData);
      notification.success({ message: "Announcement created successfully!" });
      navigate(`/${apartmentBuildingId}/announcements`);
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your input" });
      } else {
        const errorMessage = getErrorMessage(error, "Failed to create announcement");
        notification.error({ message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImages(true);
      const fileUrl = await fileApi.upload(file);
      if (!fileUrl) {
        notification.error({ message: "Failed to get image URL from response" });
        return;
      }

      const attachment: FileAttachmentDto = {
        id: null,
        name: file.name,
        description: "",
        src: fileUrl,
        fileType: file.type || "image/*",
      };

      setImages((prev) => [...prev, attachment]);
      notification.success({ message: "Image uploaded successfully" });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to upload image");
      notification.error({ message: errorMessage });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Create Announcement</Title>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}
          >
            Back
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Body"
            name="body"
            rules={[{ required: true, message: "Please enter body" }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            label="Is All"
            name="isAll"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {!isAll && (
            <Form.Item
              label="Apartment"
              name="apartmentIds"
              rules={[{ required: true, message: "Please select at least one apartment" }]}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Select apartments"
                loading={loadingApartments}
                optionFilterProp="children"
              >
                {apartments.map((a) => (
                  <Option key={a.id} value={a.id}>
                    {a.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="Publish Date"
            name="publishDate"
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Title level={4} style={{ marginTop: 8 }}>Images</Title>
          <div style={{ marginBottom: 16 }}>
            <Upload
              multiple
              customRequest={async (options) => {
                const file = options.file as File;
                await handleImageUpload(file);
              }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  notification.error({ message: "You can only upload image files!" });
                  return false;
                }
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  notification.error({ message: "Image must be smaller than 10MB!" });
                  return false;
                }
                return true;
              }}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                icon={uploadingImages ? <LoadingOutlined /> : <UploadOutlined />}
                loading={uploadingImages}
              >
                {uploadingImages ? "Uploading..." : "Upload Images"}
              </Button>
            </Upload>
          </div>

          {images.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              {images.map((img, idx) => (
                <div key={`${img.src}-${idx}`} style={{ position: "relative" }}>
                  <Image
                    src={img.src}
                    alt={img.name}
                    width={160}
                    height={160}
                    style={{
                      objectFit: "cover",
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                    }}
                    preview
                  />
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeImage(idx)}
                    style={{ position: "absolute", top: 8, right: 8 }}
                    size="small"
                  />
                </div>
              ))}
            </div>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Create Announcement
              </Button>
              <Button onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AnnouncementForm;

