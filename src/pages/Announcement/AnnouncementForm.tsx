import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Button, Card, Typography, Switch, DatePicker, App, Space, Select, Upload, Image } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, LoadingOutlined, DeleteOutlined } from "@ant-design/icons";
import { announcementApi } from "../../api/announcementApi";
import { fileApi } from "../../api/fileApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { getApartmentBuildingIdFromToken } from "../../utils/token";
import { getErrorMessage } from "../../utils/errorHandler";
import type { AnnouncementDto, ApartmentAnnouncementDto } from "../../types/announcement";
import type { FileAttachmentDto } from "../../types/file";
import dayjs, { type Dayjs } from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type AnnouncementFormValues = Omit<AnnouncementDto, "publishDate" | "apartmentIds"> & {
  publishDate?: Dayjs;
  apartmentIds?: string[];
};

const AnnouncementForm: React.FC = () => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<AnnouncementFormValues>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const apartmentBuildingId = useApartmentBuildingId();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<ApartmentAnnouncementDto[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [images, setImages] = useState<FileAttachmentDto[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const hasFetchedApartmentsRef = useRef(false);
  const fetchedAnnouncementIdRef = useRef<string | null>(null);
  const isEditMode = !!id;
  const isAll = Form.useWatch("isAll", form) || false;

  useEffect(() => {
    if (hasFetchedApartmentsRef.current) {
      return;
    }
    
    const fetchApartments = async () => {
      try {
        hasFetchedApartmentsRef.current = true;
        setLoadingApartments(true);
        const response = await announcementApi.getApartment();
        if (response.data) {
          setApartments(response.data);
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "Failed to fetch apartments");
        notification.error({ message: errorMessage });
        hasFetchedApartmentsRef.current = false; // Reset on error to allow retry
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

  useEffect(() => {
    if (!isEditMode || !id || id === "null" || id === "undefined") {
      fetchedAnnouncementIdRef.current = null;
      return;
    }

    // Check if we've already fetched this specific announcement
    if (fetchedAnnouncementIdRef.current === id) {
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        fetchedAnnouncementIdRef.current = id;
        setLoadingData(true);
        const response = await announcementApi.getById(id);
        if (response.data) {
          const announcement = response.data;
          form.setFieldsValue({
            title: announcement.title,
            body: announcement.body,
            isAll: announcement.isAll,
            apartmentIds: announcement.apartmentIds || [],
            publishDate: announcement.publishDate ? dayjs(announcement.publishDate) : undefined,
            status: announcement.status,
          } as AnnouncementFormValues);
          if (announcement.files) {
            setImages(announcement.files);
          }
        }
      } catch (error: unknown) {
        fetchedAnnouncementIdRef.current = null; // Reset on error to allow retry
        const errorMessage = getErrorMessage(error, "Failed to fetch announcement");
        notification.error({ message: errorMessage });
        navigate(`/${apartmentBuildingId}/announcements`);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAnnouncement();
  }, [id, isEditMode, form, notification, navigate, apartmentBuildingId]);

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
        id: isEditMode ? id : null,
        apartmentBuildingId: buildingId,
        title: values.title,
        body: values.body,
        status: isEditMode ? values.status : "DRAFT",
        isAll: values.isAll || false,
        apartmentIds: values.isAll ? [] : (values.apartmentIds || []),
        publishDate: values.publishDate && dayjs.isDayjs(values.publishDate) 
          ? values.publishDate.format("YYYY-MM-DD") 
          : "",
        files: images,
      };

      if (isEditMode) {
        await announcementApi.update(submitData);
        notification.success({ message: "Announcement updated successfully!" });
      } else {
        await announcementApi.create(submitData);
        notification.success({ message: "Announcement created successfully!" });
      }
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
          <Title level={2}>{isEditMode ? "Edit Announcement" : "Create Announcement"}</Title>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/${apartmentBuildingId}/announcements`)}
          >
            Back
          </Button>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loadingData}>
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
            rules={[{ required: true, message: "Please select publish date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          {isEditMode && (
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                <Option value="PUBLISH">PUBLISH</Option>
                <Option value="UNPUBLISH">UNPUBLISH</Option>
              </Select>
            </Form.Item>
          )}

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
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading || loadingData}>
                {isEditMode ? "Update Announcement" : "Create Announcement"}
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

