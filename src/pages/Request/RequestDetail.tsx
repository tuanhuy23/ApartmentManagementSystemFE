import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Divider,
  App,
  Breadcrumb,
  Image,
  Timeline,
  Avatar,
  Upload,
  Form,
  Select,
  Row,
  Col,
  Descriptions,
  Tag,
  Badge,
  Empty,
} from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  FileOutlined,
  UserOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { requestApi } from "../../api/requestApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { useAuth } from "../../hooks/useAuth";
import { fileApi } from "../../api/fileApi";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RequestDto, RequestHistoryDto, UpdateStatusAndAssignRequestDto, CreateRequestActionDto } from "../../types/request";
import type { UserDto } from "../../types/user";
import type { FileAttachmentDto } from "../../types/file";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RequestDetail: React.FC = () => {
  const { notification } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [userHandlers, setUserHandlers] = useState<UserDto[]>([]);
  const [comment, setComment] = useState("");
  const [commentFiles, setCommentFiles] = useState<FileAttachmentDto[]>([]);
  const requestAbortRef = useRef<AbortController | null>(null);

  const fetchUserHandlers = useCallback(async () => {
    try {
      const response = await requestApi.getUserHandlers();
      if (response && response.data) {
        setUserHandlers(response.data);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to fetch user handlers");
      notification.error({ message: errorMessage });
    }
  }, [notification]);

  const fetchRequest = useCallback(async () => {
    if (!id || !apartmentBuildingId) return;
    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
    }
    const abortController = new AbortController();
    requestAbortRef.current = abortController;

    try {
      setLoading(true);
      const response = await requestApi.getById(id);
      const isCurrentRequest = requestAbortRef.current === abortController;
      if (isCurrentRequest && response && response.data) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setRequest(data);
          form.setFieldsValue({
            status: data.status || "NEW",
            handler: data.currentHandlerId || data.assignee || null,
          });
        }
      }
    } catch (error: unknown) {
      const isCurrentRequest = requestAbortRef.current === abortController;
      if (isCurrentRequest) {
        const errorMessage = getErrorMessage(error, "Failed to fetch request details");
        notification.error({ message: errorMessage });
      }
    } finally {
      const isCurrentRequest = requestAbortRef.current === abortController;
      if (isCurrentRequest) {
        setLoading(false);
      }
    }
  }, [id, apartmentBuildingId, notification, form]);

  useEffect(() => {
    if (apartmentBuildingId) {
      fetchUserHandlers();
    }
  }, [apartmentBuildingId, fetchUserHandlers]);

  useEffect(() => {
    if (id && apartmentBuildingId) {
      fetchRequest();
    }
    return () => {
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
      }
    };
  }, [id, apartmentBuildingId, fetchRequest]);

  const handleFileUpload = async (file: File) => {
    try {
      const fileUrl = await fileApi.upload(file);
      const newFile: FileAttachmentDto = {
        id: null,
        name: file.name,
        description: "",
        src: fileUrl,
        fileType: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
      };
      setCommentFiles([...commentFiles, newFile]);
      notification.success({ message: 'File uploaded successfully' });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to upload file');
      notification.error({ message: errorMessage });
    }
  };

  const handleUpdateStatusAndHandler = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (!id) {
        notification.error({ message: "Request ID is missing" });
        return;
      }

      setUpdating(true);
      const updateData: UpdateStatusAndAssignRequestDto = {
        id: id,
        status: values.status,
        currentHandlerId: values.handler || null,
      };

      await requestApi.updateStatus(updateData);
      notification.success({ message: "Status and handler updated successfully!" });
      await fetchRequest();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      const errorMessage = getErrorMessage(error, "Failed to update status and handler");
      notification.error({ message: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendComment = async () => {
    if (!id || !comment.trim()) {
      notification.warning({ message: "Please enter a message" });
      return;
    }

    try {
      setSending(true);
      const commentData: CreateRequestActionDto = {
        requestId: id,
        note: comment,
        files: commentFiles.length > 0 ? commentFiles : undefined,
      };

      await requestApi.createRequestAction(commentData);
      notification.success({ message: "Comment sent successfully!" });
      setComment("");
      setCommentFiles([]);
      fetchRequest();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to send comment");
      notification.error({ message: errorMessage });
    } finally {
      setSending(false);
    }
  };

  const activityLog: Partial<RequestHistoryDto>[] = [...(request?.requestHistories || [])];

  if (request) {
    activityLog.push({
      id: request.id,
      createdDate: request.submittedOn || new Date().toISOString(),
      createdDisplayUser: request.submittedBy || "Resident",
      action: `Created Request: ${request.title}`,
      note: request.description,
      files: request.files
    });
  }
  const statusColor = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case "NEW":
        return "blue";
      case "PROCESSING":
        return "orange";
      case "COMPLETED":
        return "green";
      case "CANCELED":
        return "red";
      default:
        return "default";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

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
            href: `/${apartmentBuildingId}/requests`,
            title: "Requests",
          },
          {
            title: "Request Detail",
          },
        ]}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/${apartmentBuildingId}/requests`)}
        >
          Back
        </Button>
        <Title level={2} style={{ margin: 0, flex: 1, textAlign: "center" }}>
          Request Detail
        </Title>
        <div style={{ width: 80 }} />
      </div>

      <Card loading={loading} bodyStyle={{ padding: 20 }} style={{ borderRadius: 8 }}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <Avatar size={64} style={{ backgroundColor: '#5b8cfa' }}>
                {getInitials(request?.submittedBy)}
              </Avatar>
              <div>
                <Title level={4} style={{ margin: 0 }}>{request?.title || "-"}</Title>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">Submitted by </Text>
                  <Text strong>{request?.submittedBy || "Resident"}</Text>
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    {request?.submittedOn ? dayjs(request.submittedOn).format('MMM DD, YYYY hh:mm A') : ''}
                  </Text>
                </div>
              </div>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<Text strong>Status</Text>}>
                <Tag color={statusColor(request?.status)}>{request?.status || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Type</Text>}>
                {request?.requestType || 'General'}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Apartment</Text>}>
                {request?.apartmentId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Handler</Text>}>
                {request?.currentHandlerId || request?.assignee || <Text type="secondary">Unassigned</Text>}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Internal Note</Text>}>
                <div style={{ whiteSpace: 'pre-wrap', color: '#444' }}>{request?.internalNote || <Text type="secondary">-</Text>}</div>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Title level={5}>Description</Title>
              <div style={{ marginTop: 8, padding: 14, backgroundColor: "#fafafa", borderRadius: 6, border: '1px solid #f0f0f0' }}>
                <Text style={{ color: '#333' }}>{request?.description || 'No description provided.'}</Text>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Title level={5}>Attachments</Title>
              {request?.files && request.files.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  <Image.PreviewGroup>
                    <Row gutter={[12, 12]}>
                      {request.files.map((file, i) => (
                        <Col key={i} xs={24} sm={12} md={8} lg={6}>
                          <Card size="small" hoverable>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FileOutlined style={{ fontSize: 20 }} />
                              <div style={{ flex: 1 }}>
                                <a href={file.src} target="_blank" rel="noopener noreferrer">{file.name || `File ${i+1}`}</a>
                                {file.fileType === 'IMAGE' && (
                                  <div style={{ marginTop: 8 }}>
                                    <Image src={file.src} alt={file.name} style={{ maxHeight: 120, objectFit: 'cover' }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>
              ) : (
                <Empty description="No attachments" />
              )}
            </div>

            <Divider />

            <div>
              <Title level={5}>Activity Timeline</Title>
              <Timeline
                mode="left"
                items={activityLog
                  .sort((a, b) => new Date(b.createdDate || "").getTime() - new Date(a.createdDate || "").getTime())
                  .map((entry) => ({
                    dot: <Avatar size={28} icon={<UserOutlined />} />,
                    children: (
                      <div style={{ padding: 8, borderRadius: 6, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>{entry.createdDisplayUser}</Text>
                            <div><Text type="secondary">{entry.createdDate ? dayjs(entry.createdDate).format('MMM DD, YYYY hh:mm A') : ''}</Text></div>
                          </div>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          {entry.action && <Text strong>{entry.action}</Text>}
                          {entry.note && <div style={{ marginTop: 6, color: '#555' }}><Text>{entry.note}</Text></div>}
                          {entry.files && entry.files.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">Attachments:</Text>
                              <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                                {entry.files.map((f, i) => (
                                  <li key={i}><a href={f.src} target="_blank" rel="noopener noreferrer">{f.name}</a></li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  }))}
              />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 24 }}>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Form form={form} layout="vertical" onFinish={handleUpdateStatusAndHandler}>
                  <Form.Item label={<Text strong>Status</Text>} name="status" rules={[{ required: true, message: 'Please select a status' }]}>
                    <Select placeholder="Select status">
                      <Option value="NEW">NEW</Option>
                      <Option value="PROCESSING">PROCESSING</Option>
                      <Option value="COMPLETED">COMPLETED</Option>
                      <Option value="CANCELED">CANCELED</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label={<Text strong>Handler</Text>} name="handler">
                    <Select
                      placeholder="Select handler"
                      allowClear
                      showSearch
                      filterOption={(input, option) => {
                        const label = option?.label || option?.children;
                        return String(label || "").toLowerCase().includes(input.toLowerCase());
                      }}
                    >
                      {userHandlers.map((user) => (
                        <Option key={user.userId} value={user.userId}>
                          {user.displayName} ({user.roleName})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={updating} block>
                      Update
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card size="small">
                <Title level={5} style={{ marginBottom: 12 }}>Add Comment</Title>
                <TextArea rows={4} placeholder="Enter message to update the manager..." value={comment} onChange={(e) => setComment(e.target.value)} />

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Upload
                      customRequest={async (options) => {
                        const file = options.file as File;
                        await handleFileUpload(file);
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
                      <Button icon={<PaperClipOutlined />}>Attach</Button>
                    </Upload>
                    {commentFiles.length > 0 && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>{commentFiles.length} file(s)</Text>
                    )}
                  </div>
                  <Button type="primary" icon={<SendOutlined />} onClick={handleSendComment} loading={sending}>
                    Send
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RequestDetail;
