import type { FileAttachmentDto } from "./file";
import type { FeedbackDto } from "./feedback";

export interface RequestDto {
  id: string | null;
  title: string;
  description: string;
  status: string;
  userId: string | null;
  files: FileAttachmentDto[];
  feedbacks: FeedbackDto[];
  apartmentBuildingId: string;
  apartmentId?: string | null;
  requestType?: string;
  assignee?: string | null;
  currentHandlerId?: string | null;
  internalNote?: string;
  submittedBy?: string;
  submittedOn?: string;
  requestHistories?: RequestHistoryDto[];
}


export interface RequestHistoryDto {
  id?: string | null;
  requestId: string;
  createdDate: string;
  createdDisplayUser: string;
  createdUserId: string;
  actionType: string;
  note: string;
  action?: string;
  files?: FileAttachmentDto[];
}

export interface UpdateStatusAndAssignRequestDto {
  id: string;
  status?: string;
  currentHandlerId?: string | null;
}

export interface RattingRequestDto {
  requestId: string;
  rate: number;
  description?: string;
  files?: FileAttachmentDto[];
}

export interface CreateRequestActionDto {
  requestId: string;
  note: string;
  files?: FileAttachmentDto[];
  actionType: string;
}

