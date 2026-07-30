/**
 * Minimal AgentMail sender for client notifications/receipts.
 * https://docs.agentmail.to
 *
 * Env vars:
 *  - AGENTMAIL_API_KEY
 *  - AGENTMAIL_FROM_INBOX  (an inbox on your account, e.g. naledi.cmo@studex-group.com)
 */

const API_BASE = "https://api.agentmail.to/v0";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  const fromInbox = process.env.AGENTMAIL_FROM_INBOX;
  if (!apiKey || !fromInbox) {
    return { sent: false, error: "AgentMail not configured (AGENTMAIL_API_KEY / AGENTMAIL_FROM_INBOX)" };
  }

  const res = await fetch(`${API_BASE}/inboxes/${encodeURIComponent(fromInbox)}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.html.replace(/<[^>]+>/g, " "),
    }),
  });

  if (!res.ok) {
    return { sent: false, error: `AgentMail send failed (${res.status}): ${await res.text()}` };
  }
  return { sent: true };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export function invoiceEmailHtml(opts: {
  clientName: string;
  projectTitle: string;
  stageLabel: string;
  amountZar: number;
  invoiceNumber?: string;
}): string {
  const clientName = escapeHtml(opts.clientName || "there");
  const projectTitle = escapeHtml(opts.projectTitle);
  const stageLabel = escapeHtml(opts.stageLabel);
  const invoiceNumber = opts.invoiceNumber ? escapeHtml(opts.invoiceNumber) : undefined;

  return `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#0a0a0a;color:#f5ecd0;padding:32px;margin:0">
    <div style="max-width:520px;margin:0 auto">
      <div style="font-size:10px;letter-spacing:6px;text-transform:uppercase;color:#9a8a5a">StudEx Group · Dark Factory</div>
      <h1 style="font-weight:300;color:#f5ecd0;margin:12px 0 4px">Payment received ✓</h1>
      <p style="color:#8a8a8a;font-size:14px;line-height:1.7">
        Hi ${clientName}, we've received your <strong style="color:#C9A84C">${stageLabel}</strong>
        payment of <strong style="color:#4CFFA8">R${opts.amountZar.toLocaleString()}</strong> for
        <strong>${projectTitle}</strong>.
      </p>
      ${
        invoiceNumber
          ? `<p style="color:#8a8a8a;font-size:13px">QuickBooks invoice <strong style="color:#f5ecd0">#${invoiceNumber}</strong> has been generated for your records.</p>`
          : ""
      }
      <p style="color:#8a8a8a;font-size:13px;line-height:1.7">Your project will now advance to the next stage. We'll keep you posted.</p>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:24px;padding-top:16px;color:#555;font-size:11px">
        © ${new Date().getFullYear()} StudEx Group · factory.studex-group.com
      </div>
    </div>
  </body></html>`;
}
