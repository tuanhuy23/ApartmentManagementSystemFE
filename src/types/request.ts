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
  internalNote?: string;
  submittedBy?: string;
  submittedOn?: string;
  activityLog?: ActivityLogEntry[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details?: string;
}

