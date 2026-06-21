import { describe, it, expect } from "vitest";
import {
  insertContentItemSchema,
  insertCalendarEventSchema,
  insertCachedMessageSchema,
} from "../schema";

describe("Schema Validation", () => {
  describe("insertContentItemSchema", () => {
    const validItem = {
      title: "Test Post",
      type: "image",
      assetPath: "/assets/test.jpg",
      caption: "A great caption",
      hashtags: "#test #wagyu",
      platform: "both",
      status: "draft",
    };

    it("accepts a valid content item", () => {
      const result = insertContentItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("accepts content item with optional fields", () => {
      const result = insertContentItemSchema.safeParse({
        ...validItem,
        campaign: "Fathers Day",
        scheduledDate: "2026-06-10",
        fbPostId: "fb_123",
        igPostId: "ig_456",
        postedAt: "2026-06-10T12:00:00Z",
        rejectionNote: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects when title is missing", () => {
      const { title, ...noTitle } = validItem;
      const result = insertContentItemSchema.safeParse(noTitle);
      expect(result.success).toBe(false);
    });

    it("rejects when type is missing", () => {
      const { type, ...noType } = validItem;
      const result = insertContentItemSchema.safeParse(noType);
      expect(result.success).toBe(false);
    });

    it("rejects when caption is missing", () => {
      const { caption, ...noCaption } = validItem;
      const result = insertContentItemSchema.safeParse(noCaption);
      expect(result.success).toBe(false);
    });

    it("rejects when platform is missing", () => {
      const { platform, ...noPlatform } = validItem;
      const result = insertContentItemSchema.safeParse(noPlatform);
      expect(result.success).toBe(false);
    });

    it("rejects entirely empty object", () => {
      const result = insertContentItemSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("insertCalendarEventSchema", () => {
    const validEvent = {
      date: "2026-06-16",
      title: "Youth Day",
      description: "Feed the Nation post",
      platform: "both",
    };

    it("accepts a valid calendar event", () => {
      const result = insertCalendarEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts event with optional campaign and color", () => {
      const result = insertCalendarEventSchema.safeParse({
        ...validEvent,
        campaign: "Youth Day",
        color: "#10b981",
        contentItemId: 5,
      });
      expect(result.success).toBe(true);
    });

    it("rejects when date is missing", () => {
      const { date, ...noDate } = validEvent;
      const result = insertCalendarEventSchema.safeParse(noDate);
      expect(result.success).toBe(false);
    });

    it("rejects when title is missing", () => {
      const { title, ...noTitle } = validEvent;
      const result = insertCalendarEventSchema.safeParse(noTitle);
      expect(result.success).toBe(false);
    });

    it("rejects when description is missing", () => {
      const { description, ...noDesc } = validEvent;
      const result = insertCalendarEventSchema.safeParse(noDesc);
      expect(result.success).toBe(false);
    });
  });

  describe("insertCachedMessageSchema", () => {
    const validMsg = {
      source: "gmail",
      messageId: "msg-001",
      inbox: "test@gmail.com",
      fromAddr: "sender@example.com",
      subject: "Test Subject",
      date: "2026-06-10T10:00:00Z",
      syncedAt: "2026-06-10T10:00:00Z",
    };

    it("accepts a valid message", () => {
      const result = insertCachedMessageSchema.safeParse(validMsg);
      expect(result.success).toBe(true);
    });

    it("accepts message with optional fields", () => {
      const result = insertCachedMessageSchema.safeParse({
        ...validMsg,
        snippet: "Preview text here",
        isRead: true,
        labels: '["inbox","important"]',
      });
      expect(result.success).toBe(true);
    });

    it("rejects when source is missing", () => {
      const { source, ...noSource } = validMsg;
      const result = insertCachedMessageSchema.safeParse(noSource);
      expect(result.success).toBe(false);
    });

    it("rejects when messageId is missing", () => {
      const { messageId, ...noId } = validMsg;
      const result = insertCachedMessageSchema.safeParse(noId);
      expect(result.success).toBe(false);
    });

    it("rejects when subject is missing", () => {
      const { subject, ...noSubject } = validMsg;
      const result = insertCachedMessageSchema.safeParse(noSubject);
      expect(result.success).toBe(false);
    });

    it("rejects empty object", () => {
      const result = insertCachedMessageSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
