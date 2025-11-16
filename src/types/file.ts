export interface ImageDto {
  url: string;
}

export interface UploadFileData extends ImageDto {}

export interface FileAttachmentDto {
  id: string | null;
  name: string;
  description: string;
  src: string;
  fileType: string;
}

