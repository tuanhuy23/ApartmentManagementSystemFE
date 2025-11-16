import type { FileAttachmentDto } from "./file";

export interface FeedbackDto {
  id: string | null;
  description: string;
  rate: number;
  requestId: string;
  files: FileAttachmentDto[];
}

