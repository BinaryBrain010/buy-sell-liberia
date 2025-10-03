import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "../../../modules/auth/services/admin-auth.service";
import mongoose from "mongoose";
import Chat from "../../../../../models/Chat";
import { createAdminAuditLogger } from "../../../../../lib/admin-audit-middleware";
import { OperationType, ModuleType } from "../../../../../lib/audit-logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    // Auth: Only super_admin can access
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const payload = AdminAuthService.verifyAccessToken(token);
    if (
      !payload ||
      typeof payload !== "object" ||
      payload.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { messageId } = params;
    if (!messageId) {
      return NextResponse.json(
        { error: "Missing messageId parameter" },
        { status: 400 }
      );
    }

    // 1) Try to delete an entire chat if the provided ID matches a chat _id
    const chatById = mongoose.Types.ObjectId.isValid(messageId)
      ? await Chat.findById(messageId)
      : null;

    if (chatById) {
      const chatId = chatById._id.toString();
      await Chat.deleteOne({ _id: chatById._id });

      const logger = createAdminAuditLogger(
        request,
        (payload as any)._id || (payload as any).id || "unknown"
      );
      await logger.logCustomOperation(
        ModuleType.MESSAGE_MANAGEMENT,
        OperationType.MESSAGE_DELETE,
        chatId,
        "Chat",
        {
          adminUserId: (payload as any)._id || (payload as any).id || "unknown",
          chatId,
          participants: {
            user1: chatById.user1?.toString?.() || String(chatById.user1),
            user2: chatById.user2?.toString?.() || String(chatById.user2),
          },
          totalMessages: chatById.messages?.length || 0,
          summary: `Deleted entire chat ${chatId}`,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Chat deleted successfully",
      });
    }

    // 2) Fall back to deleting a single message inside a chat
    const chat = await Chat.findOne({ "messages._id": messageId });
    if (!chat) {
      return NextResponse.json(
        { error: "Message or Chat not found" },
        { status: 404 }
      );
    }

    const messageToDelete = chat.messages.find(
      (msg: any) => msg._id.toString() === messageId
    );
    chat.messages = chat.messages.filter(
      (msg: any) => msg._id.toString() !== messageId
    );
    await chat.save();

    const logger = createAdminAuditLogger(
      request,
      (payload as any)._id || (payload as any).id || "unknown"
    );
    await logger.logCustomOperation(
      ModuleType.MESSAGE_MANAGEMENT,
      OperationType.MESSAGE_DELETE,
      messageId,
      "Message",
      {
        adminUserId: (payload as any)._id || (payload as any).id || "unknown",
        messageId,
        chatId: chat._id.toString(),
        messageContent:
          messageToDelete?.content?.substring(0, 100) || "Unknown content",
        messageSender: messageToDelete?.sender?.toString() || "Unknown",
        summary: `Deleted message from chat ${chat._id}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
