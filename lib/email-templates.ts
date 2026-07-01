interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type GradientType = 'brand' | 'success' | 'security' | 'support';

const getGradientColors = (type: GradientType) => {
  switch (type) {
    case 'success':
      return { primary: '#10b981', secondary: '#0d9488' }; // Emerald to Teal
    case 'security':
      return { primary: '#6366f1', secondary: '#3b82f6' }; // Indigo to Blue
    case 'support':
      return { primary: '#4b5563', secondary: '#1f2937' }; // Slate to Charcoal
    case 'brand':
    default:
      return { primary: '#ec4899', secondary: '#f97316' }; // Pink to Orange
  }
};

/**
 * Modern Base Email Layout
 * Supports both RTL directionality and standard dark-mode overrides via prefers-color-scheme.
 */
const emailLayout = (content: string, title: string, gradientType: GradientType = 'brand') => {
  const { primary, secondary } = getGradientColors(gradientType);
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        /* Base styles */
        body {
            font-family: 'Vazirmatn', Tahoma, -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            direction: rtl;
            text-align: right;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: ${primary};
            background: linear-gradient(135deg, ${primary}, ${secondary});
            padding: 40px 30px;
            text-align: center;
            border-bottom: 4px solid rgba(255, 255, 255, 0.1);
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 10px 0 0 0;
            font-size: 14px;
            font-weight: 500;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.8;
            font-size: 15px;
            color: #334155;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #f1f5f9;
        }
        .footer p {
            margin: 6px 0;
        }
        .footer a {
            color: ${primary};
            text-decoration: none;
            font-weight: 500;
            margin: 0 8px;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 16px;
        }
        .badge-success {
            background-color: #dcfce7;
            color: #15803d;
        }
        .badge-info {
            background-color: #dbeafe;
            color: #1d4ed8;
        }
        .badge-warning {
            background-color: #fef3c7;
            color: #d97706;
        }
        .info-box {
            background-color: #f8fafc;
            border-right: 4px solid ${primary};
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
            border-left: 1px solid #e2e8f0;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }
        .card {
            background-color: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .label {
            font-weight: 700;
            color: #64748b;
            display: block;
            margin-bottom: 4px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value {
            margin-bottom: 18px;
            font-size: 15px;
            color: #0f172a;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 25px 0;
            border: none;
        }
        .bulletproof-button-container {
            margin: 25px auto;
            text-align: center;
        }
        .bulletproof-button {
            background: linear-gradient(135deg, ${primary}, ${secondary});
            background-color: ${primary};
            color: #ffffff !important;
            padding: 14px 30px;
            font-size: 15px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        /* Dark mode overrides */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #0f172a;
                color: #f1f5f9;
            }
            .container {
                background-color: #1e293b;
                border-color: #334155;
            }
            .content {
                color: #cbd5e1;
            }
            .footer {
                background-color: #0f172a;
                border-top-color: #334155;
                color: #94a3b8;
            }
            .info-box {
                background-color: #1e293b;
                border-left-color: #334155;
                border-top-color: #334155;
                border-bottom-color: #334155;
            }
            .card {
                background-color: #1e293b;
                border-color: #334155;
            }
            .value {
                color: #f8fafc;
            }
            .divider {
                background-color: #334155;
            }
        }
    </style>
</head>
<body>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: inherit;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <div class="container">
                    <div class="header">
                        <h1>کارنکس | KARNEX</h1>
                        <p>هم‌بنیان‌گذار هوشمند و دستیار توسعه کسب‌وکار شما</p>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        <p>
                            <a href="https://www.karnex.ir/dashboard" target="_blank">پیشخوان کاربری</a> | 
                            <a href="https://www.karnex.ir/dashboard/help" target="_blank">مرکز پشتیبانی</a> | 
                            <a href="https://www.karnex.ir" target="_blank">وب‌سایت اصلی</a>
                        </p>
                        <p style="margin-top: 15px;">© ${currentYear} Karnex. تمامی حقوق محفوظ است.</p>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                            این ایمیل به صورت خودکار ارسال شده است. اگر این پیام را به اشتباه دریافت کرده‌اید، لطفاً آن را نادیده بگیرید.
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

/**
 * Dynamic Onboarding Steps Helper for Welcome Email
 */
const getOnboardingSteps = (role?: string) => {
  const genericSteps = `
    <li><strong>کامل کردن پروفایل کاربری:</strong> تنظیم نام، موقعیت و زمینه علاقه برای شخصی‌سازی بهتر خروجی‌ها.</li>
    <li><strong>شروع Genesis Wizard:</strong> ایجاد اولین پروژه و پاسخ به سوالات تعاملی برای دریافت اولین بیزینس پلن هوشمند.</li>
    <li><strong>تکمیل تسک‌های بومی نقشه راه:</strong> پیش بردن چک‌لیست‌های تخصصی جهت راه‌اندازی گام‌به‌گام کسب‌وکار در ایران.</li>
  `;
  const creatorSteps = `
    <li><strong>تعریف نیچ محتوایی:</strong> مشخص کردن مخاطب هدف، کانال‌های انتشار و پرسونای ویژه دنبال‌کنندگان.</li>
    <li><strong>ایجاد تقویم محتوایی هوشمند:</strong> استفاده از مولد محتوای هوش مصنوعی برای تولید سناریو، متن و ایده پست‌ها.</li>
    <li><strong>ساخت مدیاکیت و تعرفه تبلیغات:</strong> خروجی گرفتن پی‌دی‌اف حرفه‌ای از آمار شبکه‌های اجتماعی جهت جذب حامی و اسپانسر.</li>
  `;
  const startupSteps = `
    <li><strong>رسم بوم مدل کسب‌وکار (Lean Canvas):</strong> پر کردن جزئیات مشکلات، راه‌حل‌ها، شاخص‌های کلیدی و مزیت رقابتی.</li>
    <li><strong>شبیه‌سازی فایل ارائه به سرمایه‌گذار (Pitch Deck):</strong> استفاده از موتور تم پویا برای ساخت اسلایدهای TAM/SAM/SOM و ساختار هزینه.</li>
    <li><strong>تحلیل رقبا و سنجش بازار:</strong> دریافت ماتریس مقایسه رقبا و ارزیابی عیار آمادگی جذب سرمایه (Readiness Score).</li>
  `;
  const traditionalSteps = `
    <li><strong>بررسی مجوزها و الزامات محلی:</strong> دریافت راهنمای دقیق ثبت نام دامنه ir.، اینماد (enamad) و درگاه پرداخت.</li>
    <li><strong>تحلیل SWOT محلی:</strong> تحلیل نقاط قوت، ضعف، فرصت‌ها و تهدیدها در فضای جغرافیایی و بازارهای سنتی کشور.</li>
    <li><strong>طراحی ساختار بازاریابی آفلاین/آنلاین:</strong> گنجاندن متدهای ترکیبی برای جذب مشتری حضوری و راه‌اندازی شعبه دیجیتال.</li>
  `;

  if (role === 'creator') return creatorSteps;
  if (role === 'startup') return startupSteps;
  if (role === 'traditional') return traditionalSteps;
  return genericSteps;
};

/**
 * 1. Welcome / Onboarding Template
 */
export const getWelcomeTemplate = (name: string, userRole?: string) => {
  const roleText = userRole === 'creator' ? 'تولیدکننده محتوا' 
                 : userRole === 'startup' ? 'استارتاپ خلاق' 
                 : userRole === 'traditional' ? 'کسب‌وکار سنتی' 
                 : '';
  const roleSection = roleText ? `<p style="font-weight: 500;">کارنکس مسیر طلایی پیش روی شما را به عنوان <strong>${roleText}</strong> بهینه‌سازی کرده است.</p>` : '';

  const content = `
    <h2 style="color: #ec4899; font-size: 20px; font-weight: 800; margin-top: 0;">سلام ${name} عزیز، به کارنکس خوش آمدید!</h2>
    <p>بسیار خوشحالیم که شما را در جمع کارآفرینان و مدیران آینده کارنکس داریم. هدف ما تسریع، ساده‌سازی و جهت‌دهی صحیح به ایده‌های کسب‌وکار شما با قدرت هوش مصنوعی بومی است.</p>
    
    ${roleSection}

    <div style="background-color: #fff5f8; border: 1px solid #ffe4e6; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e11d48; font-size: 16px;">🚀 اولین گام‌های پیشنهادی شما:</h3>
        <ul style="margin: 0; padding-right: 20px; color: #4f46e5; line-height: 2;">
            ${getOnboardingSteps(userRole)}
        </ul>
    </div>

    <p>برای شروع همین حالا می‌توانید وارد پنل خود شده و فرآیند خلق ایده جدید را آغاز کنید:</p>

    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.karnex.ir/dashboard" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#ec4899">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">ورود به پیشخوان کارنکس</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="https://www.karnex.ir/dashboard" class="bulletproof-button">ورود به پیشخوان کارنکس</a>
        <!--<![endif]-->
    </div>
  `;

  return emailLayout(content, 'به کارنکس خوش آمدید - شروع مسیر جدید', 'brand');
};

/**
 * 2. OTP Verification Template
 */
export const getVerificationTemplate = (otpCode: string) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-info">تایید هویت دو مرحله‌ای</span>
        <h2 style="color: #4f46e5; font-size: 20px; font-weight: 800; margin: 10px 0 0 0;">کد تایید ایمیل شما</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">لطفاً از کد زیر برای تکمیل فرآیند ورود یا ثبت‌نام در کارنکس استفاده کنید.</p>
    </div>

    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
        <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; display: block; direction: ltr;">
            ${otpCode}
        </span>
    </div>

    <div class="info-box">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
            🛡️ <strong>نکته امنیتی:</strong> این کد تنها به مدت <strong>۱۰ دقیقه</strong> معتبر است. هرگز این کد را در اختیار دیگران قرار ندهید. پشتیبانان کارنکس هیچ‌گاه کد تایید شما را درخواست نخواهند کرد.
        </p>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center;">اگر شما این درخواست را ارسال نکرده‌اید، می‌توانید این ایمیل را نادیده بگیرید.</p>
  `;

  return emailLayout(content, 'کد تایید هویت کارنکس', 'security');
};

/**
 * 3. Password Reset Template
 */
export const getPasswordResetTemplate = (name: string, resetUrl: string) => {
  const content = `
    <h2 style="color: #4f46e5; font-size: 20px; font-weight: 800; margin-top: 0;">بازیابی رمز عبور کارنکس</h2>
    <p>کاربر ${name} عزیز، ما یک درخواست برای بازیابی رمز عبور حساب کاربری شما دریافت کردیم. برای ایجاد رمز عبور جدید، روی دکمه زیر کلیک کنید:</p>

    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#6366f1">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">تغییر رمز عبور</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${resetUrl}" class="bulletproof-button">تغییر رمز عبور</a>
        <!--<![endif]-->
    </div>

    <div class="info-box" style="border-right-color: #f43f5e; background-color: #fff1f2; border-left: 1px solid #ffe4e6; border-top: 1px solid #ffe4e6; border-bottom: 1px solid #ffe4e6;">
        <p style="margin: 0; font-size: 13px; color: #9f1239; line-height: 1.6;">
            ⚠️ <strong>هشدار امنیتی:</strong> این لینک بازیابی به مدت <strong>۱ ساعت</strong> فعال است. اگر شما این تغییر را درخواست نداده‌اید، احتمالاً امنیت ایمیل شما به خطر افتاده است. لطفا سریعاً نسبت به تغییر گذرواژه‌های خود اقدام نمایید.
        </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">اگر دکمه بالا برای شما کار نمی‌کند، می‌توانید لینک زیر را کپی کرده و در مرورگر خود باز کنید:</p>
    <p style="font-size: 12px; word-break: break-all; color: #3b82f6; text-align: left; direction: ltr; font-family: monospace;">${resetUrl}</p>
  `;

  return emailLayout(content, 'درخواست بازیابی رمز عبور کارنکس', 'security');
};

/**
 * 4. Project Collaboration Invitation Template
 */
export const getInvitationTemplate = (senderName: string, projectName: string, roleLabel: string, inviteUrl: string) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-warning" style="background-color: #fef3c7; color: #d97706;">دعوت‌نامه همکاری</span>
        <h2 style="color: #d97706; font-size: 20px; font-weight: 800; margin: 10px 0 0 0;">دعوت به همکاری در پروژه</h2>
    </div>

    <p>سلام،</p>
    <p>کاربر <strong>${senderName}</strong> شما را به عنوان همکار با نقش <strong>«${roleLabel}»</strong> در پروژه طراحی و توسعه استراتژی <strong>«${projectName}»</strong> در پلتفرم کارنکس دعوت کرده است.</p>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 10px 0; color: #b45309; font-size: 15px;">🤝 با قبول این دعوت، شما می‌توانید:</h3>
        <ul style="margin: 0; padding-right: 20px; color: #78350f; line-height: 1.8; font-size: 14px;">
            <li>بر روی بوم ناب (Lean Canvas) پروژه به طور همزمان کار کنید.</li>
            <li>به نقشه راه‌های اجرایی، ابزارها و پنل AI دستیار دسترسی داشته باشید.</li>
            <li>با سایر اعضا در بخش‌های مختلف پیشخوان همکاری و هماهنگی داشته باشید.</li>
        </ul>
    </div>

    <p>برای تایید و ورود مستقیم به فضای همکاری، روی دکمه زیر کلیک کنید:</p>

    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${inviteUrl}" style="height:50px;v-text-anchor:middle;width:220px;" arcsize="20%" stroke="f" fillcolor="#f97316">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">پذیرش دعوت و ورود به پروژه</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${inviteUrl}" class="bulletproof-button" style="background: linear-gradient(135deg, #f97316, #ea580c); background-color: #f97316;">پذیرش دعوت و ورود به پروژه</a>
        <!--<![endif]-->
    </div>
  `;

  return emailLayout(content, `دعوت به همکاری در پروژه ${projectName} - کارنکس`, 'brand');
};

/**
 * 5. Plan Activation & Receipt Template
 */
export const getActivationEmailTemplate = (data: {
  planName: string;
  amount: number; // in Tomans
  refId: string;
  date: Date;
  userName?: string;
  nextBillingDate?: Date;
  transactionId?: string;
}) => {
  const formattedAmount = new Intl.NumberFormat('fa-IR').format(data.amount);
  const formattedDate = data.date.toLocaleDateString('fa-IR');
  const formattedNextDate = data.nextBillingDate ? data.nextBillingDate.toLocaleDateString('fa-IR') : '-';

  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-success">پرداخت موفقیت‌آمیز</span>
        <h2 style="color: #059669; font-size: 20px; font-weight: 800; margin: 10px 0 0 0;">اشتراک ${data.planName} شما فعال شد!</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 5px;">
            ${data.userName ? `${data.userName} عزیز، ` : ''}بابت انتخاب کارنکس و ارتقای پلن خود سپاسگزاریم.
        </p>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; font-weight: 700;">
            🧾 جزئیات رسمی فاکتور
        </h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 2;">
            <tr>
                <td style="color: #64748b; padding: 6px 0;">نوع اشتراک:</td>
                <td style="text-align: left; font-weight: 700; color: #0f172a;">پلن حرفه‌ای ${data.planName}</td>
            </tr>
            <tr>
                <td style="color: #64748b; padding: 6px 0;">کد پیگیری تراکنش:</td>
                <td style="text-align: left; font-family: monospace; font-size: 14px; color: #0f172a; direction: ltr;">${data.refId}</td>
            </tr>
            <tr>
                <td style="color: #64748b; padding: 6px 0;">تاریخ خرید:</td>
                <td style="text-align: left; color: #0f172a;">${formattedDate}</td>
            </tr>
            ${data.nextBillingDate ? `
            <tr>
                <td style="color: #64748b; padding: 6px 0;">تاریخ سررسید بعدی:</td>
                <td style="text-align: left; color: #0f172a; font-weight: 500;">${formattedNextDate}</td>
            </tr>
            ` : ''}
            <tr>
                <td colspan="2"><div class="divider" style="margin: 12px 0;"></div></td>
            </tr>
            <tr>
                <td style="color: #0f172a; font-weight: 700; font-size: 15px;">مبلغ کل پرداختی:</td>
                <td style="text-align: left; font-weight: 800; color: #10b981; font-size: 18px;">
                    ${formattedAmount} <span style="font-size: 12px; color: #64748b; font-weight: normal;">تومان</span>
                </td>
            </tr>
        </table>
    </div>

    <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; padding: 20px; border: 1px solid #a7f3d0; margin-bottom: 25px;">
        <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 700;">✨ قابلیت‌های جدید فعال شده روی حساب شما:</h4>
        <ul style="margin: 0; padding-right: 20px; color: #064e3b; line-height: 1.8; font-size: 13px;">
            <li>تولید کامل و بی‌محدودیت بیزینس پلن‌ها توسط مدل‌های پیشرفته هوش مصنوعی.</li>
            <li>امکان دسترسی به قالب‌های ویژه Pitch Deck و صادرات آن به فرمت پاورپوینت (PPTX).</li>
            <li>اولویت پردازش کوئری‌ها در ساعت شلوغ پلتفرم و مشاوره اختصاصی.</li>
        </ul>
    </div>

    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.karnex.ir/dashboard" style="height:50px;v-text-anchor:middle;width:180px;" arcsize="20%" stroke="f" fillcolor="#10b981">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">ورود به داشبورد</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="https://www.karnex.ir/dashboard" class="bulletproof-button" style="background: linear-gradient(135deg, #10b981, #059669); background-color: #10b981;">ورود به داشبورد</a>
        <!--<![endif]-->
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        در صورت نیاز به دریافت فاکتور رسمی با فرمت مالیات، می‌توانید بخش 
        <a href="https://www.karnex.ir/dashboard/account?section=billing" style="color: #10b981; text-decoration: none; font-weight: bold;">تراکنش‌های داشبورد</a>
        را مشاهده فرمایید.
    </p>
  `;

  return emailLayout(content, `فعال‌سازی اشتراک ${data.planName}`, 'success');
};

/**
 * 6. Contact Form Auto-reply to User
 */
export const getContactUserTemplate = (name: string) => {
  const content = `
    <h2 style="color: #4b5563; font-size: 20px; font-weight: 800; margin-top: 0;">سلام ${name} عزیز،</h2>
    <p>پیام شما با موفقیت در سیستم تیکتینگ پشتیبانی کارنکس ثبت شد.</p>
    <p>تیم پشتیبانی ما پیام شما را با دقت بررسی کرده و در اسرع وقت (معمولاً در کمتر از ۲۴ ساعت کاری) به آدرس ایمیل شما پاسخ خواهد داد.</p>
    
    <div class="info-box" style="background-color: #f3f4f6; border-right-color: #4b5563;">
        <p style="margin: 0; font-size: 14px; color: #374151; font-weight: 500;">
            📥 برای ما ارزش فراوانی دارد که نظرات، پیشنهادها یا مشکلات خود را جهت بهبود کارنکس با ما در میان می‌گذارید.
        </p>
    </div>

    <p>در صورتی که سوال شما عمومی است یا نیاز به راهنمایی فوری دارید، بخش پرسش‌های متداول و پایگاه دانش ما آماده پاسخگویی به شماست:</p>
    
    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.karnex.ir/dashboard/help" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="20%" stroke="f" fillcolor="#4b5563">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">مشاهده بخش راهنما</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="https://www.karnex.ir/dashboard/help" class="bulletproof-button" style="background: linear-gradient(135deg, #4b5563, #1f2937); background-color: #4b5563;">مشاهده بخش راهنما</a>
        <!--<![endif]-->
    </div>
  `;

  return emailLayout(content, 'دریافت پیام شما - پشتیبانی کارنکس', 'support');
};

/**
 * 7. Contact Form Notification to Admin
 */
export const getContactAdminTemplate = (data: ContactFormData) => {
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
        <span class="badge badge-warning" style="background-color: #fee2e2; color: #991b1b;">پیام جدید فرم تماس</span>
        <h2 style="color: #1f2937; font-size: 20px; font-weight: 800; margin: 10px 0 0 0;">ورود پیام جدید تماس با ما</h2>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1f2937; font-size: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; font-weight: 700;">
            📋 مشخصات فرستنده پیام
        </h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
            <tr>
                <td style="color: #64748b; padding: 4px 0; width: 30%;">نام کامل:</td>
                <td style="font-weight: 700; color: #0f172a;">${data.name}</td>
            </tr>
            <tr>
                <td style="color: #64748b; padding: 4px 0;">آدرس ایمیل:</td>
                <td style="text-align: left; font-family: monospace; color: #4f46e5; direction: ltr;"><a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none;">${data.email}</a></td>
            </tr>
            <tr>
                <td style="color: #64748b; padding: 4px 0;">موضوع پیام:</td>
                <td style="font-weight: 700; color: #0f172a;">${data.subject}</td>
            </tr>
        </table>
    </div>

    <div class="card" style="background-color: #fafafa; border-style: dashed;">
        <span class="label">متن پیام ارسالی:</span>
        <div style="font-size: 14px; color: #334155; white-space: pre-wrap; line-height: 1.8; font-family: inherit;">${data.message}</div>
    </div>

    <div class="bulletproof-button-container">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="mailto:${data.email}?subject=پاسخ به: ${data.subject}" style="height:50px;v-text-anchor:middle;width:180px;" arcsize="20%" stroke="f" fillcolor="#4b5563">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Tahoma,sans-serif;font-size:15px;font-weight:bold;">پاسخ سریع به کاربر</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="mailto:${data.email}?subject=پاسخ به: ${data.subject}" class="bulletproof-button" style="background: linear-gradient(135deg, #4b5563, #1f2937); background-color: #4b5563;">پاسخ سریع به کاربر</a>
        <!--<![endif]-->
    </div>
  `;

  return emailLayout(content, `کارت تماس جدید: ${data.subject}`, 'support');
};
