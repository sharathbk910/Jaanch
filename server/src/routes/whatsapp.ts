import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { analyzeOffer, type VerificationStatus, formatWhatsAppShareText } from '@jaanch/shared';
export { formatWhatsAppShareText };
import { loadEnv } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { validateBody } from '../middleware/validate.js';
import { ThreatIntelRepository } from '../lib/threatIntelRepository.js';

const router = Router();

export const WhatsAppWebhookPayloadSchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string().optional(),
        changes: z
          .array(
            z.object({
              value: z.object({
                messaging_product: z.string().optional(),
                metadata: z
                  .object({
                    display_phone_number: z.string().optional(),
                    phone_number_id: z.string().optional(),
                  })
                  .optional(),
                contacts: z.array(z.any()).optional(),
                messages: z
                  .array(
                    z.object({
                      from: z.string(),
                      id: z.string(),
                      timestamp: z.string().optional(),
                      type: z.string(),
                      text: z.object({ body: z.string() }).optional(),
                    })
                  )
                  .optional(),
              }),
              field: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

export const WhatsAppShareIntentSchema = z.object({
  status: z.enum(['LIKELY_GENUINE', 'NEEDS_REVIEW', 'HIGH_CONCERN', 'CONFIRMED_SCAM']),
  publicId: z.string().optional(),
  matchedIndicators: z.array(z.string()).default([]),
  claimedOrg: z.string().optional(),
  language: z.enum(['en', 'hi', 'kn']).default('en'),
});

/**
 * Validates Meta X-Hub-Signature-256 header using WHATSAPP_APP_SECRET
 */
export function verifyWhatsAppSignature(
  rawBody: string | Buffer,
  signatureHeader: string | undefined,
  appSecret: string | undefined
): boolean {
  if (!appSecret) return true; // If no app secret configured in local/test, pass through
  if (!signatureHeader) return false;

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const providedBuf = Buffer.from(parts[1], 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook verification handshake endpoint.
 */
router.get('/webhook', (req: Request, res: Response) => {
  const env = loadEnv();
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    logger.info({ requestId: req.id }, 'WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
    return;
  }

  logger.warn(
    {
      requestId: req.id,
      providedToken: token ? `${String(token).slice(0, 4)}***` : 'none',
    },
    'WhatsApp webhook verification rejected'
  );

  res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'WhatsApp webhook verification token mismatch.',
      requestId: req.id,
    },
  });
});

/**
 * POST /api/whatsapp/webhook
 * Inbound WhatsApp messages webhook from Meta Cloud API.
 * Validates HMAC signature, runs deterministic verification, and generates advisory reply.
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const env = loadEnv();
  const signature = req.headers['x-hub-signature-256'] as string | undefined;

  // Signature validation if app secret configured
  if (env.WHATSAPP_APP_SECRET) {
    const rawPayload = JSON.stringify(req.body);
    const isValid = verifyWhatsAppSignature(rawPayload, signature, env.WHATSAPP_APP_SECRET);
    if (!isValid) {
      logger.warn({ requestId: req.id }, 'WhatsApp webhook signature mismatch');
      res.status(401).json({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'WhatsApp webhook signature verification failed.',
          requestId: req.id,
        },
      });
      return;
    }
  }

  const parsed = WhatsAppWebhookPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'Invalid WhatsApp webhook payload schema.',
        requestId: req.id,
      },
    });
    return;
  }

  const entries = parsed.data.entry || [];
  const processedReplies: Array<{ to: string; message: string; status: VerificationStatus }> = [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const messages = change.value?.messages || [];
      for (const msg of messages) {
        if (msg.type === 'text' && msg.text?.body) {
          const bodyText = msg.text.body;

          // Run deterministic analysis
          const result = analyzeOffer({
            text: bodyText,
            domain: 'other',
            runOfflineOnly: true,
          });

          // Check if indicators match confirmed intel
          const indicatorsToCheck: Array<{ type: string; value: string }> = [];
          for (const u of result.extractedEntities.urls) indicatorsToCheck.push({ type: 'url', value: u });
          for (const d of result.extractedEntities.domains) indicatorsToCheck.push({ type: 'domain', value: d });
          for (const p of result.extractedEntities.phones) indicatorsToCheck.push({ type: 'phone', value: p });
          for (const upi of result.extractedEntities.upiHandles) indicatorsToCheck.push({ type: 'upi', value: upi });

          const intelMatch = await ThreatIntelRepository.matchIntel(req.supabase || null, {
            text: bodyText,
            indicators: indicatorsToCheck,
          });

          let finalStatus = result.status;
          if (intelMatch?.status === 'confirmed') {
            finalStatus = 'CONFIRMED_SCAM';
          }

          let replyText = '';
          if (finalStatus === 'CONFIRMED_SCAM') {
            replyText = `🚨 JAANCH VERIFICATION: CONFIRMED SCAM\n\nThis offer matches a confirmed fraud pattern (${intelMatch?.publicId || 'RECORD'}). Do NOT pay any deposit, caution money, or registration fee.\n\nHelpline: Call 1930 immediately or visit cybercrime.gov.in\nFull audit: https://jaanch.ai`;
          } else if (finalStatus === 'HIGH_CONCERN') {
            replyText = `⚠️ JAANCH VERIFICATION: HIGH CONCERN\n\nWarning: High-risk signals detected in this message (upfront payment or credentials requested).\n\nNational Cyber Helpline: 1930 / cybercrime.gov.in\nDetailed safety checklist: https://jaanch.ai/resources`;
          } else if (finalStatus === 'NEEDS_REVIEW') {
            replyText = `🔍 JAANCH VERIFICATION: NEEDS REVIEW\n\nIncomplete details or unverified contact information found. Always corroborate independently on official company career portals.\n\nCheck official portals: https://jaanch.ai`;
          } else {
            replyText = `✅ JAANCH VERIFICATION: NO SCAM SIGNALS FOUND\n\nNo common fee or fraud indicators were detected. Always confirm appointment letters on the employer's official domain.`;
          }

          processedReplies.push({
            to: msg.from,
            message: replyText,
            status: finalStatus,
          });
        }
      }
    }
  }

  // Zero-Auto-Send Invariant: Responds with processed results; does not blast unsolicited external SMS
  res.status(200).json({
    status: 'success',
    processed: processedReplies.length,
    replies: processedReplies,
  });
});

/**
 * POST /api/whatsapp/share-intent
 * Generates privacy-safe, confirmed-only WhatsApp sharing links.
 * Prohibits raw student text and unredacted submissions.
 */
router.post(
  '/share-intent',
  validateBody(WhatsAppShareIntentSchema),
  (req: Request, res: Response) => {
    const { status, publicId, matchedIndicators, claimedOrg, language } = req.body as z.infer<
      typeof WhatsAppShareIntentSchema
    >;

    const safeText = formatWhatsAppShareText({
      status: status as VerificationStatus,
      publicId,
      matchedIndicators,
      claimedOrg,
      language,
    });

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(safeText)}`;

    res.status(200).json({
      data: {
        shareUrl,
        safeText,
      },
    });
  }
);

export const whatsappRouter = router;
