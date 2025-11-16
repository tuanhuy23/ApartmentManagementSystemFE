import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  App,
  Breadcrumb,
  Rate,
  Image,
  Timeline,
} from "antd";
import {
  HomeOutlined,
  SaveOutlined,
  CloseOutlined,
  FileOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { requestApi } from "../../api/requestApi";
import { useApartmentBuildingId } from "../../hooks/useApartmentBuildingId";
import { useAuth } from "../../hooks/useAuth";
import { apartmentApi } from "../../api/apartmentApi";
import { userApi } from "../../api/userApi";
import type { RequestDto, ActivityLogEntry } from "../../types/request";
import type { ApartmentDto } from "../../types/apartment";
import type { UserDto } from "../../types/user";
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
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<RequestDto | null>(null);
  const [apartment, setApartment] = useState<ApartmentDto | null>(null);
  const [submittedByUser, setSubmittedByUser] = useState<UserDto | null>(null);
  const [staffUsers, setStaffUsers] = useState<UserDto[]>([]);
  const fetchedRequestIdRef = useRef<string | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id || !apartmentBuildingId) return;
    try {
      setLoading(true);
      const response = await requestApi.getById(id);
      if (response.data) {
        const requestData = response.data;
        setRequest(requestData);
        form.setFieldsValue({
          status: requestData.status || "NEW",
          requestType: requestData.requestType || "TECHNICAL",
          assignee: requestData.assignee || null,
          internalNote: requestData.internalNote || "",
        });

        if (requestData.apartmentId) {
          const apartmentResponse = await apartmentApi.getById(requestData.apartmentId);
          if (apartmentResponse.data) {
            setApartment(apartmentResponse.data);
          }
        }

        if (requestData.userId) {
          try {
            const userResponse = await userApi.getById(requestData.userId);
            if (userResponse.data) {
              setSubmittedByUser(userResponse.data);
            }
          } catch {
            // User might not exist
          }
        }
      }
    } catch {
      notification.error({ message: "Failed to fetch request details" });
    } finally {
      setLoading(false);
    }
  }, [id, apartmentBuildingId, notification, form]);

  const fetchStaffUsers = useCallback(async () => {
    if (!apartmentBuildingId) return;
    try {
      const response = await userApi.getAll();
      if (response.data) {
        setStaffUsers(response.data.filter(u => u.roleName?.toLowerCase().includes("technical") || u.roleName?.toLowerCase().includes("staff")));
      }
    } catch {
      // Ignore error
    }
  }, [apartmentBuildingId]);

  useEffect(() => {
    if (id && apartmentBuildingId && fetchedRequestIdRef.current !== id) {
      fetchedRequestIdRef.current = id;
      fetchRequest();
      fetchStaffUsers();
    }
  }, [id, apartmentBuildingId, fetchRequest, fetchStaffUsers]);

  const handleUpdate = async () => {
    if (!request || !id) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const updatedRequest: RequestDto = {
        ...request,
        status: values.status,
        requestType: values.requestType,
        assignee: values.assignee,
        internalNote: values.internalNote,
      };

      const activityLogEntry: ActivityLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        actor: user?.displayName || "Manager",
        actorRole: user?.roleName || "Manager",
        action: `Updated request. Status: ${values.status}${values.assignee ? `, Assigned to: ${values.assignee}` : ""}`,
        details: values.internalNote || undefined,
      };

      updatedRequest.activityLog = [
        ...(request.activityLog || []),
        activityLogEntry,
      ];

      await requestApi.update(updatedRequest);
      notification.success({ message: "Request updated successfully!" });
      fetchRequest();
    } catch (error: any) {
      if (error?.errorFields) {
        notification.error({ message: "Please check your input" });
      } else {
        notification.error({ message: "Failed to update request" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const latestFeedback = request?.feedbacks && request.feedbacks.length > 0 
    ? request.feedbacks[request.feedbacks.length - 1] 
    : null;

  const showFeedback = request?.status === "COMPLETED" && latestFeedback;

  const activityLog = request?.activityLog || [];
  if (!request?.activityLog || request.activityLog.length === 0) {
    activityLog.push({
      id: "initial",
      timestamp: request?.submittedOn || new Date().toISOString(),
      actor: submittedByUser?.displayName || "Resident",
      actorRole: "Resident",
      action: `(Request Created) ${request?.description || ""}`,
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
            title: `Request Detail: #${id?.substring(0, 8).toUpperCase() || ""}`,
          },
        ]}
      />

      <Title level={2} style={{ marginBottom: 24 }}>
        Request Detail: #{id?.substring(0, 8).toUpperCase() || ""}
      </Title>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="Column 1: Information & Processing (Manager's Workspace)" loading={loading}>
            <Form form={form} layout="vertical">
              <Title level={4}>Section A: Request Information (Submitted by Resident)</Title>
              
              <Form.Item label="Apartment">
                <Input readOnly value={apartment?.name || "N/A"} />
              </Form.Item>

              <Form.Item label="Submitted by">
                <Input readOnly value={submittedByUser?.displayName || "N/A"} />
              </Form.Item>

              <Form.Item label="Submitted on">
                <Input readOnly value={request?.submittedOn ? dayjs(request.submittedOn).format("DD/MM/YYYY") : "N/A"} />
              </Form.Item>

              <Form.Item label="Title">
                <Input readOnly value={request?.title || ""} />
              </Form.Item>

              <Form.Item label="Description">
                <TextArea readOnly rows={4} value={request?.description || ""} />
              </Form.Item>

              <Form.Item label="Attachments (from Resident)">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {request?.files && request.files.length > 0 ? (
                    request.files.map((file, index) => (
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
                    ))
                  ) : (
                    <Text type="secondary">No attachments</Text>
                  )}
                </Space>
              </Form.Item>

              <Divider />

              <Title level={4}>Section B: Processing & Assignment Area (Manager's Actions)</Title>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="NEW">New</Option>
                  <Option value="RECEIVED">Received</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="CANCELED">Canceled</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Request Type"
                name="requestType"
                rules={[{ required: true, message: "Please select request type" }]}
              >
                <Select>
                  <Option value="TECHNICAL">Technical</Option>
                  <Option value="CLEANING">Cleaning</Option>
                  <Option value="SECURITY">Security</Option>
                  <Option value="FEEDBACK">Feedback</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Assignee"
                name="assignee"
              >
                <Select placeholder="Select assignee">
                  {staffUsers.map((staff) => (
                    <Option key={staff.userId} value={staff.userId}>
                      {staff.displayName} ({staff.roleName})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Add Internal Note"
                name="internalNote"
                extra="(This note is not visible to the Resident)"
              >
                <TextArea rows={3} placeholder="Add note for the technical team..." />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Column 2: History & Feedback" loading={loading}>
            {showFeedback && (
              <>
                <Title level={4}>Section C: Resident Feedback</Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  (This area ONLY appears when Status = "Completed" AND the Resident has submitted feedback)
                </Text>

                <Form.Item label="Rating">
                  <Rate disabled value={latestFeedback?.rate || 0} />
                  <Text style={{ marginLeft: 8 }}>{latestFeedback?.rate || 0}/5 Stars</Text>
                </Form.Item>

                <Form.Item label="Resident Comment">
                  <TextArea readOnly rows={3} value={latestFeedback?.description || ""} />
                </Form.Item>

                {latestFeedback?.files && latestFeedback.files.length > 0 && (
                  <Form.Item label="Images (from Resident)">
                    <Space direction="vertical">
                      {latestFeedback.files.map((file, index) => (
                        <div key={index}>
                          <a href={file.src} target="_blank" rel="noopener noreferrer">
                            {file.name || `Image ${index + 1}`}
                          </a>
                          {file.fileType === "IMAGE" && (
                            <div style={{ marginTop: 8 }}>
                              <Image src={file.src} width={200} />
                            </div>
                          )}
                        </div>
                      ))}
                    </Space>
                  </Form.Item>
                )}

                <Divider />
              </>
            )}

            <Title level={4}>Section D: Activity Log</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              (Displayed from newest to oldest)
            </Text>

            <Timeline
              items={activityLog
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((entry) => ({
                  children: (
                    <div>
                      <Text strong>
                        {dayjs(entry.timestamp).format("DD/MM/YYYY HH:mm A")} - {entry.actor} ({entry.actorRole}):
                      </Text>
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

            <Divider />

            <Title level={4}>Section E: Actions</Title>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdate}
                loading={submitting}
              >
                Update Request
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => navigate(`/${apartmentBuildingId}/requests`)}
              >
                Close
              </Button>
            </Space>
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              (Clicking [Update Request] saves the changes from Column 1 (Status, Assignee) and adds the Internal Note to the Activity Log (Column 2))
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RequestDetail;

