import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Input,
  Space,
  Tag,
  Divider,
  App,
  Breadcrumb,
  Image,
  Timeline,
  Avatar,
  Upload,
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
import { userApi } from "../../api/userApi";
import { fileApi } from "../../api/fileApi";
import { getErrorMessage } from "../../utils/errorHandler";
import type { RequestDto, RequestHistoryDto } from "../../types/request";
import type { UserDto } from "../../types/user";
import type { FileAttachmentDto } from "../../types/file";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const RequestDetail: React.FC = () => {
  const { notification } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apartmentBuildingId = useApartmentBuildingId();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [handlerUser, setHandlerUser] = useState<UserDto | null>(null);
  const [comment, setComment] = useState("");
  const [commentFiles, setCommentFiles] = useState<FileAttachmentDto[]>([]);
  const requestAbortRef = useRef<AbortController | null>(null);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      NEW: "default",
      RECEIVED: "blue",
      IN_PROGRESS: "orange",
      COMPLETED: "green",
      CANCELED: "red",
    };
    return colorMap[status] || "default";
  };

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
      if (!abortController.signal.aborted && response && response.data) {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        if (data) {
          setRequest(data);

          if (data.assignee) {
            try {
              const handlerResponse = await userApi.getById(data.assignee);
              if (!abortController.signal.aborted && handlerResponse.data) {
                setHandlerUser(handlerResponse.data);
              }
            } catch {
            }
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
        setLoading(false);
      }
    }
  }, [id, apartmentBuildingId, notification]);

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

  const handleSendComment = async () => {
    if (!id || !comment.trim()) {
      notification.warning({ message: "Please enter a message" });
      return;
    }

    try {
      setSending(true);
      const commentData: RequestHistoryDto = {
        requestId: id,
        description: comment,
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

  const activityLog = request?.activityLog || [];
  if (!request?.activityLog || request.activityLog.length === 0) {
    activityLog.push({
      id: "initial",
      timestamp: request?.submittedOn || new Date().toISOString(),
      actor: user?.displayName || "Resident",
      actorRole: user?.roleName || "Resident",
      action: `Created Request: ${request?.description || ""}`,
      details: request?.files && request.files.length > 0
        ? `Attached: ${request.files.map(f => f.name).join(", ")}`
        : undefined,
    });
  }

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
          REQUEST DETAIL
        </Title>
        <div style={{ width: 80 }} />
      </div>

      <Card loading={loading}>
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Request Detail</Title>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Title: </Text>
            <Text>{request?.title || "N/A"}</Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Status: </Text>
            <Tag color={getStatusColor(request?.status || "NEW")}>
              {request?.status || "NEW"}
            </Tag>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Handler: </Text>
            {handlerUser ? (
              <Text>{handlerUser.displayName} ({handlerUser.roleName})</Text>
            ) : (
              <Text type="secondary">Not assigned</Text>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Description: </Text>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
              <Text>{request?.description || "N/A"}</Text>
            </div>
          </div>

          {request?.files && request.files.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Attachments: </Text>
              <Space direction="vertical" style={{ marginTop: 8, width: "100%" }}>
                {request.files.map((file, index) => (
                  <div key={index}>
                    <a href={file.src} target="_blank" rel="noopener noreferrer">
                      <FileOutlined /> {file.name || `File ${index + 1}`}
                    </a>
                    {file.fileType === "IMAGE" && (
                      <div style={{ marginTop: 8 }}>
                        <Image src={file.src} width={200} />
                      </div>
                    )}
                  </div>
                ))}
              </Space>
            </div>
          )}
        </div>

        <Divider />

        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Activity Timeline</Title>
          <Timeline
            items={activityLog
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => ({
                dot: <Avatar icon={<UserOutlined />} />,
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{entry.actor}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({entry.actorRole}) - {dayjs(entry.timestamp).format("MMM DD, YYYY hh:mm A")}
                      </Text>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text>{entry.action}</Text>
                      {entry.details && (
                        <div style={{ marginTop: 4, color: "#666" }}>
                          <Text type="secondary">{entry.details}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                ),
              }))}
          />
        </div>

        <Divider />

        <div>
          <Title level={4} style={{ marginBottom: 16 }}>Additional Comments / Feedback</Title>
          <TextArea
            rows={4}
            placeholder="Enter message to update the manager..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Space>
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
              <Button icon={<PaperClipOutlined />}>
                Attach
              </Button>
            </Upload>
            {commentFiles.length > 0 && (
              <Text type="secondary">{commentFiles.length} file(s) attached</Text>
            )}
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendComment}
              loading={sending}
            >
              Send Message
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default RequestDetail;
