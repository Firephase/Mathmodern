import { NextResponse } from "next/server";

const DOCS = {
  name: "MathModern API v1",
  version: "1.0.0",
  auth: "Authorization: Bearer <API_SECRET_KEY>",
  base_url: "/api/v1",
  endpoints: {
    "GET /api/v1/analytics": {
      description: "Platform overview statistics",
      returns: "{ users, courses, enrollments, messages, topCourses, recentUsers }",
    },
    "GET /api/v1/users": {
      description: "List all users",
      params: { role: "STUDENT|MENTOR|ADMIN|INVESTOR", search: "string", page: "number", limit: "number" },
      returns: "{ data: User[], total, page, pages }",
    },
    "GET /api/v1/users/:id": {
      description: "Get full user profile with enrollments and achievements",
    },
    "PATCH /api/v1/users/:id": {
      description: "Update user fields",
      body: { name: "string?", bio: "string?", role: "string?", institution: "string?", country: "string?" },
    },
    "POST /api/v1/users/:id/message": {
      description: "Send a message to a user from the AI bot",
      body: { content: "string", isLatex: "boolean?" },
      returns: "{ chatId, messageId }",
    },
    "GET /api/v1/courses": {
      description: "List all courses with enrollment counts",
      params: { topic: "string", published: "true|false", search: "string" },
    },
    "GET /api/v1/courses/:id": {
      description: "Get course details, lessons, and enrollment stats",
    },
    "PATCH /api/v1/courses/:id": {
      description: "Update course fields",
      body: { title: "string?", description: "string?", isPublished: "boolean?", isOpen: "boolean?" },
    },
    "GET /api/v1/chats": {
      description: "List all chats with last message",
      params: { userId: "string — filter chats involving this user" },
    },
    "POST /api/v1/chats/broadcast": {
      description: "Send a message from the AI bot to multiple users at once",
      body: { userIds: "string[]", content: "string", isLatex: "boolean?" },
      returns: "{ sent: number, results: [{userId, chatId, messageId}] }",
    },
  },
};

export function GET() {
  return NextResponse.json(DOCS, { status: 200 });
}
