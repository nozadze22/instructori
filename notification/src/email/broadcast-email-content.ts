/** Admin broadcast HTML/text template for Resend. */
export type BroadcastEmailContentInput = {
  recipientName: string;
  subject: string;
  body: string;
  siteUrl: string;
};

export type BroadcastEmailContent = {
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bodyToHtmlParagraphs(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const inner = escapeHtml(block).replace(/\n/g, '<br/>');
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155;">${inner}</p>`;
    })
    .join('');
}

export function buildBroadcastEmailContent(
  input: BroadcastEmailContentInput,
): BroadcastEmailContent {
  const name = escapeHtml(input.recipientName.trim() || 'მომხმარებელო');
  const subject = escapeHtml(input.subject.trim());
  const siteUrl = escapeHtml(input.siteUrl.replace(/\/$/, ''));
  const bodyHtml = bodyToHtmlParagraphs(input.body);
  const text = [
    `გამარჯობა, ${input.recipientName.trim() || 'მომხმარებელო'}!`,
    '',
    input.subject.trim(),
    '',
    input.body.trim(),
    '',
    `Instructorebi: ${input.siteUrl.replace(/\/$/, '')}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Instructorebi</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;line-height:1.3;color:#ffffff;">${subject}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0 0 20px;font-size:17px;font-weight:600;color:#0f172a;">გამარჯობა, ${name}!</p>
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">შეტყობინება</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 22px;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;" align="center">
              <a href="${siteUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;box-shadow:0 2px 8px rgba(37,99,235,0.35);">გადადი Instructorebi-ზე</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">
                ეს წერილი გამოგეგზავნათ <strong style="color:#475569;">Instructorebi</strong> ადმინისტრაციისგან.<br/>
                <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { html, text };
}
