# 🗣️ User Interview Script + Capture Sheet — For Your 4 Organic Users

> **From `docs/launch/USER_INTERVIEW_SCRIPT.md` + `POST_LAUNCH_PLAYBOOK.md`**
> **Goal:** 15 min per user. Find the *real* friction in Genesis → activation. No feature requests.

---

## 📋 Pre-Interview Checklist (5 min before call)

- [ ] Open user in **Admin → Users** (organic scoreboard, not test)
- [ ] Open their **PostHog Person** (filter `is_internal = false`)
- [ ] Note: signup date, project created?, tour completed?, checkout started?
- [ ] Have this script + a blank capture row ready (paper / Notion / Google Sheet)

---

## 🎬 The 15-Minute Flow

| Time | Segment | Your Job |
|------|---------|----------|
| 0–2 min | **Warm-up & Context** | "Thanks for trying Karnex. I'm the founder, just learning — not selling." |
| 2–5 min | **Origin Story** | "Walk me through the moment you decided to sign up. What were you trying to do that day?" |
| 5–10 min | **The Genesis Walkthrough** | "Can you share your screen and show me what you did after signup? Talk aloud." |
| 10–13 min | **The Friction Points** | "Where did you get stuck / confused / bored? Be honest — I built it, I can take it." |
| 13–15 min | **Willingness to Pay** | "If this worked perfectly for your need, what would you pay monthly? Why that number?" |

---

## ❓ Exact Questions (Copy-Paste Into Call Notes)

### Origin (2–5 min)
1. "What triggered you to search for something like Karnex that day?"
2. "Had you tried ChatGPT / Notion / consultants before? What was missing?"
3. "What's your startup idea in one sentence? (So I know the context)"

### Genesis Walkthrough (5–10 min) — **SCREEN SHARE ON**
4. "Start from the dashboard. What did you click first?"
5. "When you saw the 'Start Project' / Genesis flow, what did you expect?"
6. "At each step (Idea → Type → Audience → Plan), what was clear vs confusing?"
7. "Did the AI suggestions feel useful / generic / wrong? Any specific example?"
8. "Did you finish the tour / see the 'activation_completed' screen?"
9. "If you created a project: open it. What's the first thing you looked at?"

### Friction (10–13 min)
10. "What made you *not* come back the next day?" (if they didn't)
11. "What's the one thing you wish the AI had done but didn't?"
12. "Any moment you thought 'I'll just do this in Notion/Excel instead'?"
13. "Mobile or desktop? Any layout / RTL / Persian text issues?"

### Willingness to Pay (13–15 min)
14. "If Karnex *perfectly* gave you a investor-ready pitch deck + roadmap + copilot for *your specific idea*, what's a fair monthly price in Toman?"
15. "What would make you pay *today* vs 'maybe later'?"
16. "Who else on your team would use this? (Co-founder? Developer? No one?)"

---

## 📝 Capture Sheet — One Row Per User

> **Make this a Google Sheet: "Karnex User Interviews [Week 1]" — Columns A–R**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **User ID** | **Email** | **Signup Date** | **Project Created?** | **Tour Done?** | **Origin Trigger** | **Idea One-Liner** | **Genesis Step Stuck** | **AI Quality (1-5)** | **Tour Confusing?** | **Mobile/Desktop** | **RTL/Text Issues** | **WTP (Toman/mo)** | **Pay Trigger** | **Team Size** | **Quote / Insight** | **Follow-up Action** | **Priority Fix** |

### Example Row (Fill Yours)

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| U_001 | ali@x.com | 2026-07-24 | Yes | No | "Saw IG reel, had idea for food app" | "Food delivery for office parks" | **Audience step** — AI suggested wrong segments | 3 | "Tour skipped steps" | Desktop | "Persian numbers mixed" | 150,000 | "If pitch deck auto-generated" | 1 (solo) | "Audience step felt like homework" | Email Ali with fixed audience suggestions | Fix audience AI + tour skip bug |

---

## 🎯 Post-Interview: The 30-Minute Synthesis

After all 4 calls, **cluster the rows by columns H, J, Q**:

| Cluster | How Many Users | The Fix (Week 2) |
|---------|----------------|------------------|
| e.g. "Audience step AI suggestions wrong" | 3/4 | Rewrite audience prompt in `lib/ai/prompt-service.ts` |
| e.g. "Tour skipped / didn't fire activation" | 2/4 | Fix tour step persistence in `lib/tour/store.ts` |
| e.g. "Persian numbers / RTL layout broken on mobile" | 2/4 | Audit `tailwind.config.ts` logical props + `lib/utils.ts` |

**Only fix the top 2 clusters.** That's your Week 2 `fix-friction` task.

---

## 📞 How to Reach Them (This Week)

| Channel | Message Template |
|---------|------------------|
| **Email** (from `support@karnex.ir`) | Subject: "۱۵ دقیقه گفتگو با بنیان‌گذار کارنکس — کمکت می‌کنم ایده‌ات پیش بره" + Calendly link |
| **In-app** (if they're logged in) | Use the feedback widget: "Founder here — 15 min call? I'll send you a 50k Toman coffee gift card." |
| **WhatsApp/Telegram** (if they gave phone) | Voice note: "سلام علی، آریو از کارنکسم. ۱۵ دقیقه وقت داری بگوی چی برات کار کرد/نکرد؟" |

---

## 🎁 Incentive (Low Cost, High Signal)

> "به عنوان تشکر، یک کد تخفیف ۵۰٪ سه‌ماهه پلن پرو (یا کافنه ۵۰ هزار تومانی) می‌فرستم — فقط برای اینکه صادقانه بگویی چه‌چیزی آزار داده."
> **Cost:** ~50k Toman / user. **Value:** Real product truth.

---

*Print this page. Take it to every call. Fill the sheet live. Week 1 = done.*