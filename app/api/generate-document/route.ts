import { NextResponse } from 'next/server';

export const maxDuration = 60;

// Iranian legal document templates
const documentTemplates = {
  nda: {
    name: "قرارداد عدم افشا (NDA)",
    nameEn: "Non-Disclosure Agreement",
    sections: [
      {
        title: "مقدمه",
        content: `این قرارداد عدم افشا ("قرارداد") در تاریخ {{DATE}} میان:

طرف اول (افشاکننده): {{COMPANY_NAME}} به نمایندگی {{FOUNDER_NAME}}
طرف دوم (گیرنده): _____________________

منعقد می‌گردد.`
      },
      {
        title: "تعریف اطلاعات محرمانه",
        content: `اطلاعات محرمانه شامل کلیه اطلاعات فنی، تجاری، مالی و استراتژیک مربوط به {{PROJECT_NAME}} می‌باشد، از جمله اما نه محدود به:
- ایده‌های تجاری و طرح‌های کسب‌وکار
- اطلاعات مشتریان و بازار هدف
- کدهای نرم‌افزاری و الگوریتم‌ها
- داده‌های مالی و پیش‌بینی‌ها`
      },
      {
        title: "تعهدات گیرنده",
        content: `گیرنده متعهد می‌شود:
۱. اطلاعات محرمانه را فقط برای اهداف تعیین شده استفاده کند
۲. اطلاعات را به هیچ شخص ثالثی افشا نکند
۳. از اطلاعات به صورت شخصی بهره‌برداری نکند
۴. پس از اتمام همکاری، کلیه مدارک را عودت دهد`
      },
      {
        title: "مدت قرارداد",
        content: `این قرارداد از تاریخ امضا به مدت ۳ سال معتبر است. تعهد محرمانگی حتی پس از اتمام قرارداد ادامه خواهد داشت.`
      },
      {
        title: "خسارات",
        content: `در صورت نقض این قرارداد، گیرنده متعهد به جبران کلیه خسارات وارده به افشاکننده می‌باشد. این خسارات شامل خسارت مستقیم، غیرمستقیم و از دست رفتن فرصت‌های تجاری می‌شود.`
      },
      {
        title: "امضاء",
        content: `


افشاکننده: ___________________     گیرنده: ___________________
تاریخ: {{DATE}}                    تاریخ: ___________________`
      }
    ]
  },
  founders: {
    name: "توافق‌نامه شراکت بنیان‌گذاران",
    nameEn: "Founders Agreement",
    sections: [
      {
        title: "مقدمه",
        content: `این توافق‌نامه شراکت در تاریخ {{DATE}} میان بنیان‌گذاران پروژه {{PROJECT_NAME}} منعقد می‌گردد.

بنیان‌گذاران:
۱. {{FOUNDER_NAME}} - سهم: _____%
۲. _____________________ - سهم: _____%
۳. _____________________ - سهم: _____%`
      },
      {
        title: "شرح پروژه",
        content: `پروژه {{PROJECT_NAME}} با هدف {{PROJECT_DESCRIPTION}} تأسیس می‌شود.

مخاطبین هدف: {{AUDIENCE}}
مدل درآمدی: {{REVENUE_MODEL}}`
      },
      {
        title: "تقسیم سهام",
        content: `سهام پروژه به شرح زیر تقسیم می‌شود:
- مجموع کل سهام: ۱۰۰٪
- سهام هر بنیان‌گذار طبق جدول فوق تعیین می‌شود
- رقیق‌شدگی (Dilution) در صورت جذب سرمایه به نسبت اعمال می‌شود`
      },
      {
        title: "وظایف و مسئولیت‌ها",
        content: `هر بنیان‌گذار مسئول حوزه‌های زیر است:
۱. {{FOUNDER_NAME}}: ___________________
۲. _____________________: ___________________
۳. _____________________: ___________________`
      },
      {
        title: "دوره ماندگاری (Vesting)",
        content: `سهام بنیان‌گذاران طی ۴ سال با دوره Cliff یک‌ساله اعمال می‌شود:
- ۲۵٪ در پایان سال اول
- ۶.۲۵٪ هر سه‌ماه پس از آن`
      },
      {
        title: "تصمیم‌گیری",
        content: `تصمیمات کلیدی نیاز به موافقت ___% از بنیان‌گذاران دارد.
تصمیمات عملیاتی با موافقت CEO اتخاذ می‌شود.`
      },
      {
        title: "خروج و انتقال سهام",
        content: `در صورت خروج هر بنیان‌گذار:
- حق اولویت خرید (Right of First Refusal) برای سایر بنیان‌گذاران
- سهام Unvested به شرکت بازمی‌گردد
- سهام Vested با ارزش‌گذاری منصفانه محاسبه می‌شود`
      },
      {
        title: "امضاء",
        content: `


بنیان‌گذار ۱: ___________________
بنیان‌گذار ۲: ___________________
بنیان‌گذار ۳: ___________________

تاریخ: {{DATE}}`
      }
    ]
  },
  articles: {
    name: "اساسنامه شرکت",
    nameEn: "Articles of Association",
    sections: [
      {
        title: "فصل اول: کلیات",
        content: `ماده ۱ - نام شرکت: {{PROJECT_NAME}} (سهامی خاص)
ماده ۲ - موضوع شرکت: {{PROJECT_DESCRIPTION}}
ماده ۳ - مدت شرکت: نامحدود
ماده ۴ - مرکز اصلی: ___________________
ماده ۵ - سرمایه: مبلغ ___________________ ریال`
      },
      {
        title: "فصل دوم: سهام",
        content: `ماده ۶ - سهام شرکت به ___ سهم ___ ریالی تقسیم می‌شود
ماده ۷ - سهام شرکت با نام است
ماده ۸ - انتقال سهام با موافقت هیئت مدیره امکان‌پذیر است`
      },
      {
        title: "فصل سوم: ارکان شرکت",
        content: `ماده ۹ - ارکان شرکت عبارتند از:
۱. مجمع عمومی
۲. هیئت مدیره
۳. بازرس

ماده ۱۰ - هیئت مدیره از ___ نفر عضو تشکیل می‌شود
ماده ۱۱ - مدیرعامل توسط هیئت مدیره انتخاب می‌شود`
      },
      {
        title: "فصل چهارم: مجمع عمومی",
        content: `ماده ۱۲ - مجامع عمومی شامل:
- مجمع عمومی عادی (سالانه)
- مجمع عمومی فوق‌العاده

ماده ۱۳ - حد نصاب مجمع عمومی عادی: ۵۱٪ سهام
ماده ۱۴ - حد نصاب مجمع فوق‌العاده: ۷۵٪ سهام`
      },
      {
        title: "فصل پنجم: امور مالی",
        content: `ماده ۱۵ - سال مالی از اول فروردین تا پایان اسفند است
ماده ۱۶ - سود خالص پس از کسر ذخایر قانونی تقسیم می‌شود
ماده ۱۷ - ۵٪ سود سالانه به ذخیره قانونی منتقل می‌شود`
      },
      {
        title: "فصل ششم: انحلال",
        content: `ماده ۱۸ - شرکت در موارد زیر منحل می‌شود:
- تصمیم مجمع عمومی فوق‌العاده
- از دست دادن نصف سرمایه
- حکم دادگاه`
      },
      {
        title: "امضاء مؤسسین",
        content: `


{{FOUNDER_NAME}}: ___________________
_____________________: ___________________

تاریخ: {{DATE}}`
      }
    ]
  }
};

export async function POST(req: Request) {
  try {
    const { documentType, projectData } = await req.json();
    
    if (!documentType || !documentTemplates[documentType as keyof typeof documentTemplates]) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const template = documentTemplates[documentType as keyof typeof documentTemplates];
    
    // Replace placeholders with actual project data
    const today = new Date().toLocaleDateString('fa-IR');
    const replacePlaceholders = (content: string) => {
      return content
        .replace(/\{\{DATE\}\}/g, today)
        .replace(/\{\{PROJECT_NAME\}\}/g, projectData?.projectName || '[نام پروژه]')
        .replace(/\{\{COMPANY_NAME\}\}/g, projectData?.projectName || '[نام شرکت]')
        .replace(/\{\{FOUNDER_NAME\}\}/g, projectData?.founderName || '[نام بنیان‌گذار]')
        .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, projectData?.overview || '[شرح فعالیت]')
        .replace(/\{\{AUDIENCE\}\}/g, projectData?.audience || '[مخاطبین هدف]')
        .replace(/\{\{REVENUE_MODEL\}\}/g, projectData?.revenueModel || '[مدل درآمدی]');
    };

    const processedSections = template.sections.map(section => ({
      title: section.title,
      content: replacePlaceholders(section.content)
    }));

    // Generate the full document text
    const fullDocument = processedSections
      .map(s => `\n\n=== ${s.title} ===\n\n${s.content}`)
      .join('');

    return NextResponse.json({
      name: template.name,
      nameEn: template.nameEn,
      sections: processedSections,
      fullText: `
╔════════════════════════════════════════════════════════════════════╗
║                        ${template.name}                               ║
║                        ${template.nameEn}                             ║
╚════════════════════════════════════════════════════════════════════╝
${fullDocument}

═══════════════════════════════════════════════════════════════════════
این سند توسط کارنکس تولید شده است. برای استفاده رسمی، مشاوره حقوقی توصیه می‌شود.
═══════════════════════════════════════════════════════════════════════
`,
      generatedAt: today
    });

  } catch (error) {
    console.error("Document generation error:", error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
