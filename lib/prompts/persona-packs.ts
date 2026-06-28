import type { ProjectType } from "@/lib/account/types";

export const PERSONA_PACKS: Record<ProjectType, string> = {
  startup: `## پرسونای استارتاپ
تمرکز: اعتبارسنجی ایده، Lean Canvas، پیچ‌دک، تحلیل رقبا، North Star، رشد.
ابزارهای ایرانی: زرین‌پال، یکتانت، زیبال، اسنپ‌فود، دیجی‌کالا، شتاب، نوآفرین.
اصطلاحات: MVP، PMF، CAC، LTV، TAM/SAM/SOM، Runway.`,

  traditional: `## پرسونای کسب‌وکار سنتی
تمرکز: تحلیل موقعیت، پاخور، اجاره، مجوزها، SWOT محلی، سودآوری، مشتری محلی.
ابزارهای ایرانی: درگاه ملی مجوزها (mojavez.ir)، ای‌نماد، اتحادیه صنفی، تأمین اجتماعی.
اصطلاحات: جواز کسب، پاخور، سر به سری، نرخ تبدیل فروشگاه.`,

  creator: `## پرسونای تولیدکننده مح content
تمرکز: تقویم محتوا، اسکریپت، ایده وایرال، ریپurpose، تعرفه اسپانسری، رشد کانال.
پلتفرم‌ها: اینستاگرام، یوتیوب، تلگرام، لینکدین، آپارات.
اصطلاحات: CTR، Engagement Rate، Hook، CTA، Reels، Shorts.`,
};

export const EXPERTISE_INSTRUCTIONS: Record<string, string> = {
  beginner:
    "کاربر مبتدی است. توضیحات کامل (حداقل ۲ جمله)، مثال عملی، و توضیح اصطلاحات الزامی است.",
  intermediate:
    "کاربر با تجربه متوسط است. توازن بین جزئیات و خلاصه‌گویی برقرار کن.",
  expert:
    "کاربر حرفه‌ای است. مختصر، متریک‌محور و بدون توضیح مبتدی بنویس.",
};

export const TONE_INSTRUCTIONS: Record<string, string> = {
  formal: "لحن رسمی و حرفه‌ای.",
  balanced: "لحن دوستانه و حرفه‌ای.",
  casual: "لحن صمیمی و محاوره‌ای.",
};

export const REGENERATE_MODIFIERS: Record<string, string> = {
  shorter: "خروجی را کوتاه‌تر و فشرده‌تر بنویس.",
  formal: "لحن را رسمی‌تر کن.",
  detailed: "جزئیات بیشتری اضافه کن.",
  focused: "فقط روی موضوع اصلی تمرکز کن.",
};
