import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_TELEGRAM_PHONE,
  ADMIN_WHATSAPP_INTL,
  ADMIN_WHATSAPP_JID,
  ADMIN_WHATSAPP_RAW,
  WHATSAPP_QUICK_TEMPLATES,
  buildAdminTelegramUrl,
  buildAdminWhatsAppUrl,
  buildFormattedSupportMessage,
  generateWhatsAppQrMatrix,
  getWhatsAppIntegrationInfo,
  sendDirectTelegramNotification,
  sendDirectWhatsAppNotification,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const info = getWhatsAppIntegrationInfo();
    const defaultMsg = WHATSAPP_QUICK_TEMPLATES[0].defaultMessage;
    const whatsappPayload = buildAdminWhatsAppUrl(defaultMsg);
    const telegramPayload = buildAdminTelegramUrl(defaultMsg);

    const qrMatrix = generateWhatsAppQrMatrix(whatsappPayload);
    const telegramQrMatrix = generateWhatsAppQrMatrix(telegramPayload);

    return NextResponse.json({
      admin_number: ADMIN_WHATSAPP_RAW,
      admin_number_intl: ADMIN_WHATSAPP_INTL,
      admin_jid: ADMIN_WHATSAPP_JID,
      telegram_phone: ADMIN_TELEGRAM_PHONE,
      whatsapp_url: whatsappPayload,
      telegram_url: telegramPayload,
      default_chat_url: info.defaultChatUrl,
      default_telegram_url: info.defaultTelegramChatUrl,
      templates: WHATSAPP_QUICK_TEMPLATES,
      qr_payload: whatsappPayload,
      qr_matrix: qrMatrix,
      telegram_qr_payload: telegramPayload,
      telegram_qr_matrix: telegramQrMatrix,
      integration: info,
    });
  } catch (error) {
    console.error("Failed to load WhatsApp & Telegram integration:", error);
    return NextResponse.json(
      { error: "Gagal memuat konfigurasi WhatsApp & Telegram Admin." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action =
      typeof body?.action === "string" ? body.action.trim() : "preview";
    const channel =
      typeof body?.channel === "string" ? body.channel.trim() : "whatsapp";
    const topicId =
      typeof body?.topic_id === "string" ? body.topic_id.trim() : undefined;
    const topicLabel =
      typeof body?.topic_label === "string" ? body.topic_label.trim() : undefined;
    const invoiceNumber =
      typeof body?.invoice_number === "string"
        ? body.invoice_number.trim()
        : undefined;
    const gameName =
      typeof body?.game_name === "string" ? body.game_name.trim() : undefined;
    const targetUserId =
      typeof body?.target_user_id === "string"
        ? body.target_user_id.trim()
        : undefined;
    const senderPhone =
      typeof body?.sender_phone === "string"
        ? body.sender_phone.trim()
        : undefined;
    const customMessage =
      typeof body?.custom_message === "string"
        ? body.custom_message.trim()
        : undefined;

    const formattedMessage =
      typeof body?.formatted_message === "string" &&
      body.formatted_message.trim()
        ? body.formatted_message.trim()
        : buildFormattedSupportMessage({
            topicId,
            invoiceNumber,
            gameName,
            targetUserId,
            senderPhone,
            customMessage,
          });

    // Action: Kirim pesan langsung tanpa membuka WhatsApp Web atau Telegram Web
    if (action === "send_direct") {
      const activeTopic = WHATSAPP_QUICK_TEMPLATES.find((t) => t.id === topicId);
      const resolvedTopicLabel =
        topicLabel || activeTopic?.label || "Pesan Bantuan / Konfirmasi";

      if (channel === "whatsapp") {
        const waResult = await sendDirectWhatsAppNotification({
          formattedMessage,
          topicLabel: resolvedTopicLabel,
          invoiceNumber,
          senderPhone,
          gameName,
          targetUserId,
        });

        return NextResponse.json({
          success: true,
          channel: "whatsapp",
          message: `Pesan berhasil dikirim otomatis ke WhatsApp Admin (${ADMIN_WHATSAPP_RAW})!`,
          destination: ADMIN_WHATSAPP_RAW,
          formatted_message: formattedMessage,
          result: waResult,
        });
      }

      // Default: Telegram Bot
      const directResult = await sendDirectTelegramNotification({
        formattedMessage,
        topicLabel: resolvedTopicLabel,
        invoiceNumber,
        senderPhone,
        gameName,
        targetUserId,
      });

      return NextResponse.json({
        success: true,
        channel: "telegram",
        message: "Pesan berhasil dikirim otomatis ke Telegram Admin!",
        destination: "@Sukijem_bot",
        admin_number: ADMIN_WHATSAPP_RAW,
        formatted_message: formattedMessage,
        telegram_result: directResult,
      });
    }

    const whatsappUrl = buildAdminWhatsAppUrl(formattedMessage);
    const telegramUrl = buildAdminTelegramUrl(formattedMessage);

    const qrMatrix = generateWhatsAppQrMatrix(whatsappUrl);
    const telegramQrMatrix = generateWhatsAppQrMatrix(telegramUrl);

    return NextResponse.json({
      admin_number: ADMIN_WHATSAPP_RAW,
      admin_number_intl: ADMIN_WHATSAPP_INTL,
      admin_jid: ADMIN_WHATSAPP_JID,
      telegram_phone: ADMIN_TELEGRAM_PHONE,
      formatted_message: formattedMessage,
      whatsapp_url: whatsappUrl,
      telegram_url: telegramUrl,
      qr_payload: whatsappUrl,
      qr_matrix: qrMatrix,
      telegram_qr_payload: telegramUrl,
      telegram_qr_matrix: telegramQrMatrix,
    });
  } catch (error) {
    console.error("Failed to generate WhatsApp/Telegram payload:", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan WhatsApp/Telegram Admin." },
      { status: 500 }
    );
  }
}
