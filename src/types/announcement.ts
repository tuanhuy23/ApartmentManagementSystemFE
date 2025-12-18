import type { FileAttachmentDto } from "./file";

export interface AnnouncementDto {
  id: string | null;
  apartmentBuildingId: string;
  title: string;
  body: string;
  status: string;
  isAll: boolean;
  apartmentIds: string[] | null;
  publishDate: string;
  files: FileAttachmentDto[];
}

export interface ApartmentAnnouncementDto {
  id: string;
  name: string;
}

