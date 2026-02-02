import { z } from "zod";

export const baseAttachmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileKey: z.string(),
});

export const imageAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal("image"),
  url: z.string().url().min(1, "Image URL is required"),
});

export const pdfAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal("pdf"),
  url: z.string().url().min(1, "PDF URL is required"),
});

export const txtAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal("txt"),
  url: z.string().url().min(1, "TXT URL is required"),
});

export const docxAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal("docx"),
  url: z.string().url().optional(),
});

export const videoAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal("video"),
});

export const attachmentSchema = z.discriminatedUnion("type", [
  imageAttachmentSchema,
  pdfAttachmentSchema,
  txtAttachmentSchema,
  docxAttachmentSchema,
  videoAttachmentSchema,
]);

export const chatRequestSchema = z.object({
  model: z.string().min(1, "Model is required"),
  attachments: z.array(attachmentSchema).optional(),
});

export type ImageAttachment = z.infer<typeof imageAttachmentSchema>;
export type PdfAttachment = z.infer<typeof pdfAttachmentSchema>;
export type DocxAttachment = z.infer<typeof docxAttachmentSchema>;
export type TxtAttachment = z.infer<typeof txtAttachmentSchema>;
export type VideoAttachment = z.infer<typeof videoAttachmentSchema>;
export type ApiAttachment = z.infer<typeof attachmentSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type AttachmentType = ApiAttachment["type"];
