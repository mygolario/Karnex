# Post-Launch Playbook — کارنکس (هفته ۱ به بعد)

این سند سیستم عملیاتی بعد از لانچ است. **ویژگی جدید نساز** تا وقتی فانل اندازه‌گیری نشده و بازخورد واقعی جمع نشده.

## ابزارهایی که الان داری

| ابزار | کاربرد |
|--------|--------|
| Vercel Analytics | بازدید، صفحات، ریفرر، دستگاه |
| PostHog | فانل محصول (signup → project → activation → pay) |
| Vercel Events | همان رویدادهای تبدیل کلیدی (آینهٔ PostHog) |
| Sentry | خطاهای runtime |
| ادمین کارنکس | ثبت‌نام، درآمد، فیدبک |
| ویجت بازخورد داخل داشبورد | نظر ستاره‌ای از کاربر لاگین‌شده |

---

## کار یک‌باره (امروز)

1. ~~پروژه PostHog EU~~ — فعال: [Karnex](https://eu.posthog.com/project/107791) (کلید در `.env` و Vercel Production/Preview).
2. ~~Env روی Vercel~~ — `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` ست شده. اگر کلید عوض شد: `.\scripts\push-posthog-vercel-env.ps1` سپس redeploy.
3. بعد از هر تغییر `NEXT_PUBLIC_*` یک Production deploy بزن؛ روی سایت cookie consent را Accept کن تا PostHog لود شود.
4. داشبورد آماده: [Week 1 Launch Funnel](https://eu.posthog.com/project/107791/dashboard/847356) — ترتیب فانل:
   1. `signup_completed`
   2. `project_created`
   3. `activation_completed` (اتمام تور داشبورد)
   4. `checkout_started`
   5. `payment_completed`

---

## لینک‌های UTM (کپی–پیست)

**قانون:** از این به بعد هیچ لینک خالی در اینستاگرام / لینکدین / تلگرام نگذار.

### اینستاگرام

```
https://www.karnex.ir/?utm_source=instagram&utm_medium=reel&utm_campaign=launch_week1&utm_content=teaser_30s
https://www.karnex.ir/?utm_source=instagram&utm_medium=post&utm_campaign=launch_week1&utm_content=carousel_features
https://www.karnex.ir/?utm_source=instagram&utm_medium=story&utm_campaign=launch_week1&utm_content=cta_signup
```

### لینکدین

```
https://www.karnex.ir/?utm_source=linkedin&utm_medium=post&utm_campaign=launch_week1&utm_content=founder_announcement
https://www.karnex.ir/?utm_source=linkedin&utm_medium=post&utm_campaign=launch_week1&utm_content=product_demo
```

### تلگرام

```
https://www.karnex.ir/?utm_source=telegram&utm_medium=channel&utm_campaign=launch_week1&utm_content=announce
```

### برند / جستجو (برای ردیابی کمپین دستی)

```
https://www.karnex.ir/?utm_source=google&utm_medium=organic&utm_campaign=brand&utm_content=direct_share
```

نام `utm_content` را برای هر پست عوض کن تا بفهمی کدام ریلز/پست تبدیل کرده.

---

## روزانه (۱۵ دقیقه)

- [ ] ایمیل `support@karnex.ir` + تیکت‌های ادمین
- [ ] Sentry / Vercel Logs — فقط ۵ خطای پرتکرار را یادداشت کن
- [ ] ادمین → فیدبک‌های جدید را بخوان؛ به ۲–۳ نفر اول شخصاً پیام بده
- [ ] ثبت‌نام‌های جدید را در ادمین چک کن

## هفتگی (۶۰ دقیقه)

- [ ] فانل PostHog: visitor → signup → project → activation → paid
- [ ] کانال‌ها از UTM: کدام `utm_source` / `utm_content` بیشترین signup داشته؟
- [ ] هزینه OpenRouter در برابر درآمد
- [ ] فقط باگ و اصطکاک UX — **نه** قابلیت/ستون جدید
- [ ] نظرات ساختگی را با نظر واقعی جایگزین کن (وقتی داشتی)

---

## رویدادهای فانل (مرجع)

| رویداد | معنی |
|--------|------|
| `signup_completed` | کاربر جدید در Prisma ساخته شد |
| `project_created` | اولین/هر پروژهٔ Genesis ساخته شد |
| `activation_completed` | تور داشبورد تمام شد |
| `checkout_started` | درخواست پرداخت زیبال صادر شد |
| `payment_completed` | رسید پرداخت موفق |
| `feedback_submitted` | ویجت فیدبک ارسال شد |

---

## معیار «خوب» هفته ۲–۴

- نرخ ورود از صفحهٔ اصلی به signup (حدودی از Vercel pages)
- ٪ ثبت‌نام‌هایی که ظرف ۲۴ ساعت پروژه می‌سازند
- ٪ کسانی که تور داشبورد را تمام می‌کنند / بوم را باز می‌کنند
- حتی **۱–۲ پرداخت** واقعی = برد هفتهٔ اول

## فاز ۲ (بعداً — الان نساز)

- ایمیل‌های Day 2 / 5 / 7 بعد از welcome
- رویدادهای تبدیل در GA4 (اگر `NEXT_PUBLIC_GA_ID` ست است)
- NPS بعد از چند جلسه
- Feature flag ریموت فقط وقتی A/B روی متن قیمت می‌زنی
