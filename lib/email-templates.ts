
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const PRIMARY_COLOR = "#ec4899"; // Pink
const SECONDARY_COLOR = "#f97316"; // Orange
const BG_COLOR = "#f3f4f6";
const CONTAINER_BG = "#ffffff";
const TEXT_COLOR = "#1f2937";
const MUTED_COLOR = "#6b7280";

/**
 * Base Email Layout
 * tailored for Persian (RTL) and Karnex Branding
 */
const emailLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            background-color: ${BG_COLOR};
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            color: ${TEXT_COLOR};
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: ${CONTAINER_BG};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR});
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.8;
            font-size: 16px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: ${MUTED_COLOR};
            border-top: 1px solid #e5e7eb;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR});
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
        }
        .info-box {
            background-color: #fce7f3;
            border-right: 4px solid ${PRIMARY_COLOR};
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
        }
        .label {
            font-weight: bold;
            color: ${MUTED_COLOR};
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
        }
        .value {
            margin-bottom: 16px;
            font-size: 15px;
            color: ${TEXT_COLOR};
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KARNEX | کارنکس</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Karnex. تمامی حقوق محفوظ است.</p>
            <p>این ایمیل به صورت خودکار ارسال شده است.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Template for Auto-Reply to User
 */
export const getContactUserTemplate = (name: string) => {
    const content = `
        <h2 style="color: ${PRIMARY_COLOR}; margin-bottom: 20px;">سلام ${name} عزیز،</h2>
        <p>پیام شما با موفقیت دریافت شد. خوشحالیم که با ما هستید!</p>
        <p>تیم پشتیبانی کارنکس پیام شما را بررسی کرده و در اسرع وقت (معمولاً کمتر از ۲۴ ساعت) به شما پاسخ خواهد داد.</p>
        
        <div class="info-box">
            <p style="margin:0;">شماره پیگیری سیستمی پیام شما ثبت شده است و همکاران ما آن را بررسی می‌کنند.</p>
        </div>

        <p>اگر نیاز به اطلاعات فوری دارید، می‌توانید به بخش سوالات متداول در سایت مراجعه کنید.</p>
        
        <div style="text-align: center;">
            <a href="https://karnex.ir" class="btn">بازگشت به وب‌سایت</a>
        </div>
    `;
    return emailLayout(content, 'دریافت پیام شما - کارنکس');
};

/**
 * Template for Admin Forwarding
 */
export const getContactAdminTemplate = (data: ContactFormData) => {
    const content = `
        <h2 style="color: ${SECONDARY_COLOR}; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            📩 پیام جدید از فرم تماس
        </h2>
        
        <p>یک پیام جدید از طریق وب‌سایت ارسال شده است. جزئیات به شرح زیر است:</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <span class="label">نام فرستنده:</span>
            <div class="value">${data.name}</div>

            <span class="label">ایمیل:</span>
            <div class="value"><a href="mailto:${data.email}" style="color: ${PRIMARY_COLOR}; text-decoration: none;">${data.email}</a></div>

            <span class="label">موضوع:</span>
            <div class="value" style="font-weight: bold;">${data.subject}</div>

            <span class="label">متن پیام:</span>
            <div class="value" style="background: white; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; white-space: pre-wrap;">${data.message}</div>
        </div>

        <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${data.email}?subject=پاسخ به: ${data.subject}" class="btn">پاسخ به کاربر</a>
        </div>
    `;
    return emailLayout(content, `کارت تماس جدید: ${data.subject}`);
};
