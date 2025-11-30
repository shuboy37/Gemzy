import { z } from "zod";

// =============================================================================
// ATTACHMENT SCHEMAS
// =============================================================================

/**
 * Schema for image attachments (uploaded to S3)
 */
export const imageAttachmentSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  fileKey: z.string(),
  imageUrl: z.string().url(), // Presigned S3 URL
  title: z.string(),
});

/**
 * Schema for document attachments (PDF, DOCX, TXT)
 * Documents need to be processed differently - we'll fetch and extract text
 */
export const documentAttachmentSchema = z.object({
  id: z.string(),
  type: z.enum(["pdf", "docx", "txt", "video"]),
  fileKey: z.string(),
  documentUrl: z.string().url().optional(), // Presigned S3 URL for fetching
  title: z.string(),
});

/**
 * Combined attachment schema
 */
export const attachmentSchema = z.discriminatedUnion("type", [
  imageAttachmentSchema,
  z.object({
    id: z.string(),
    type: z.literal("pdf"),
    fileKey: z.string(),
    documentUrl: z.string().url().optional(),
    title: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("docx"),
    fileKey: z.string(),
    documentUrl: z.string().url().optional(),
    title: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("txt"),
    fileKey: z.string(),
    documentUrl: z.string().url().optional(),
    title: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("video"),
    fileKey: z.string(),
    title: z.string(),
  }),
]);

// =============================================================================
// CHAT REQUEST SCHEMA
// =============================================================================

/**
 * Schema for the additional body fields sent with useChat
 * (messages are handled automatically by AI SDK)
 */
export const chatRequestSchema = z.object({
  // Model ID from OpenRouter (e.g., "google/gemini-2.5-flash")
  model: z.string().min(1, "Model is required"),

  // Attachments with presigned URLs (optional)
  attachments: z.array(attachmentSchema).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ImageAttachment = z.infer<typeof imageAttachmentSchema>;
export type DocumentAttachment = z.infer<typeof documentAttachmentSchema>;
export type ChatAttachment = z.infer<typeof attachmentSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

// =============================================================================
// HELPER TYPES FOR FRONTEND
// =============================================================================

/**
 * Type for attachments ready to send to the API
 * (after fetching presigned URLs)
 */
export interface PreparedAttachment {
  id: string;
  type: "image" | "pdf" | "docx" | "txt" | "video";
  fileKey: string;
  url: string; // Presigned S3 URL
  title: string;
  mediaType: string; // MIME type for AI SDK
}
