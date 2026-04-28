export {
  attachmentSchema,
  imageAttachmentSchema,
  pdfAttachmentSchema,
  docxAttachmentSchema,
  txtAttachmentSchema,
  videoAttachmentSchema,
  type ApiAttachment,
  type ImageAttachment,
  type PdfAttachment,
  type DocxAttachment,
  type TxtAttachment,
  type VideoAttachment,
  type AttachmentType,
  type ChatRequest,
} from "./schemas/attachment.schema";

export type { ApiAttachment as ChatAttachment } from "./schemas/attachment.schema";
