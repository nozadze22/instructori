/** Registration email verification HTML/text for Resend. */
export type VerificationEmailContentInput = {
  fullName: string;
  verificationLink: string;
  ttlHours: number;
  siteUrl: string;
};

export type VerificationEmailContent = {
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

export function buildVerificationEmailContent(
  input: VerificationEmailContentInput,
): VerificationEmailContent {
  const name = escapeHtml(input.fullName.trim() || 'მომხმარებელო');
  const link = escapeHtml(input.verificationLink);
  const siteUrl = escapeHtml(input.siteUrl.replace(/\/$/, ''));
  const siteLabel = siteUrl.replace(/^https?:\/\//, '');
  const hours = input.ttlHours;

  const text = [
    `გამარჯობა, ${input.fullName.trim() || 'მომხმარებელო'}!`,
    '',
    'რეგისტრაციის დასასრულებლად დაადასტურე ელფოსტა ბმულზე დაჭერით:',
    input.verificationLink,
    '',
    `ბმული ძალაშია ${hours} საათის განმავლობაში.`,
    'თუ თვითონ არ დარეგისტრირდი, უგულებელყოფ ეს წერილი.',
    '',
    `Instructorebi · ${input.siteUrl.replace(/\/$/, '')}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ელფოსტის დადასტურება</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Instructorebi</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;line-height:1.3;color:#ffffff;">დაადასტურე ელფოსტა</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.45;color:rgba(255,255,255,0.88);">რეგისტრაციის ბოლო ნაბიჯი — SimDrive Pro</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 20px;">
              <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#0f172a;">გამარჯობა, ${name}!</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#334155;">
                მადლობა რეგისტრაციისთვის. ანგარიშის შესაქმნელად დაადასტურე, რომ ეს ელფოსტა შენია — ბმულზე დაჭერით ქვემოთ.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;" align="center">
              <a href="${link}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;box-shadow:0 2px 8px rgba(37,99,235,0.35);">ელფოსტის დადასტურება</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
                <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
                  ღილაკი არ იხსნება? ჩასვი ბმული ბრაუზერში:
                </p>
                <p style="margin:0;font-size:12px;line-height:1.55;word-break:break-all;">
                  <a href="${link}" style="color:#2563eb;text-decoration:underline;">${link}</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:#64748b;text-align:center;">
                ბმული ძალაშია <strong style="color:#475569;">${hours} საათის</strong> განმავლობაში.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.55;color:#64748b;text-align:center;">
                თუ თვითონ არ დარეგისტრირდი, უგულებელყოფ ეს წერილი.<br/>
                <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">${siteLabel}</a>
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
