"""
GPT-4o-mini integration — AI Tavsiyalar (HR Recommendations).

Xodimning USI, KPI, rahbar bahosi, 360° feedback va klaster
ma'lumotlariga asoslanib shaxsiylashtirilgan tavsiyalar generatsiya qiladi.
Agar OPENAI_API_KEY bo'sh bo'lsa — statik fallback ishlatiladi.
"""

from __future__ import annotations

from openai import AsyncOpenAI
from app.config import settings

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


SYSTEM_PROMPT = """Sen MehnatAI — O'zbekiston IT kompaniyasi uchun ishlab chiqilgan
sun'iy intellekt asosidagi HR yordamchisisiz.

Sening vazifang: xodimning ish ko'rsatkichlari (KPI, rahbar bahosi, 360° feedback,
USI indeksi) va K-Means klaster natijalariga asoslanib, har bir xodim uchun
SHAXSIYLASHTIRILGAN, ANIQ va AMALIY tavsiyalar berish.

Javob formati (DOIMO shu tartibda):
1. Bir qisqa jumlada xodimning umumiy holati (1 jumla)
2. Kuchli tomonlar: 1-2 ta aniq kuchli jihat
3. Tavsiyalar: 3-4 ta raqamlangan, har biri bir qatorda, aniq va o'lchanadigan

Qoidalar:
- O'zbek tilida yoz (lotin alifbosi)
- Professional, rag'batlantiruvchi ohang
- Har bir tavsiya aniq harakat yoki muddat o'z ichiga olsin
- Raqamlar va foizlarni ishlatib konkret bo'l
- Umumiy va bo'sh gaplardan saqa ("yaxshi ishlang", "harakat qiling")
- Jami 120-180 so'z

Misol YOMON tavsiya: "Ko'proq harakat qiling"
Misol YAXSHI tavsiya: "Har oyda kamida 2 ta texnik blog post yozing yoki GitHub'da ochiq loyihaga hissa qo'shing — bu portfolio va jamoaviy reytingingizni oshiradi"
"""


async def generate_gpt_recommendations(
    name: str,
    position: str,
    department: str,
    cluster: str,
    usi_score: float,
    usi_label: str,
    kpi_avg: float,
    rahbar_score: float,
    peer_360_score: float,
    predicted_usi: float,
    experience_years: int = 0,
) -> str:
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-..."):
        return _static_fallback(cluster, kpi_avg, peer_360_score, rahbar_score)

    cluster_uz = {
        "yulduz":      "⭐ Yulduz — Yuqori samarali xodim",
        "barqaror":    "📊 Barqaror — O'rta darajali xodim",
        "rivojlanish": "📈 Rivojlanish kerak — Past ko'rsatkichli xodim",
    }.get(cluster, cluster)

    trend_delta = round(predicted_usi - usi_score, 1)
    if trend_delta > 2:
        trend_text = f"o'sish kutilmoqda (+{trend_delta} ball)"
    elif trend_delta < -2:
        trend_text = f"pasayish xavfi bor ({trend_delta} ball)"
    else:
        trend_text = "barqaror holat"

    weak: list[str] = []
    strong: list[str] = []

    if kpi_avg >= 80:
        strong.append(f"KPI ({kpi_avg:.0f}/100)")
    elif kpi_avg >= 65:
        strong.append(f"KPI o'rtacha ({kpi_avg:.0f}/100)")
    else:
        weak.append(f"KPI past ({kpi_avg:.0f}/100) — kod sifati, muddatga rioya")

    if rahbar_score >= 80:
        strong.append(f"Rahbar bahosi yuqori ({rahbar_score:.0f}/100)")
    elif rahbar_score >= 60:
        strong.append(f"Rahbar bahosi o'rta ({rahbar_score:.0f}/100)")
    else:
        weak.append(f"Rahbar bahosi past ({rahbar_score:.0f}/100) — mustaqillik, tashabbuskorlik")

    if peer_360_score >= 75:
        strong.append(f"Jamoaviy muloqot ({peer_360_score:.0f}/100)")
    elif peer_360_score >= 60:
        strong.append(f"Jamoaviy muloqot o'rta ({peer_360_score:.0f}/100)")
    else:
        weak.append(f"360° baholash past ({peer_360_score:.0f}/100) — hamkorlik, muloqot")

    user_message = f"""Xodim profili:
━━━━━━━━━━━━━━━━━━━━━━━━
Ism: {name}
Lavozim: {position} | Bo'lim: {department}
Tajriba: {experience_years} yil
Klaster: {cluster_uz}
━━━━━━━━━━━━━━━━━━━━━━━━
Ko'rsatkichlar:
  USI (umumiy indeks): {usi_score:.1f}/100 — {usi_label}
  KPI o'rtachasi:      {kpi_avg:.1f}/100
  Rahbar bahosi:       {rahbar_score:.1f}/100
  360° jamoaviy baho:  {peer_360_score:.1f}/100
  3 oylik bashorat:    {predicted_usi:.1f}/100 ({trend_text})
━━━━━━━━━━━━━━━━━━━━━━━━
Kuchli tomonlar: {", ".join(strong) if strong else "aniqlanmagan"}
Rivojlanish zarur: {", ".join(weak) if weak else "barcha ko'rsatkichlar yaxshi"}
━━━━━━━━━━━━━━━━━━━━━━━━

Ushbu xodim uchun shaxsiylashtirilgan HR tavsiyalar yoz."""

    try:
        response = await _get_client().chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.72,
            max_tokens=450,
        )
        text = response.choices[0].message.content or ""
        return text.strip() or _static_fallback(cluster, kpi_avg, peer_360_score, rahbar_score)
    except Exception:
        return _static_fallback(cluster, kpi_avg, peer_360_score, rahbar_score)


def _static_fallback(
    cluster: str, kpi_avg: float, peer_360: float, rahbar: float
) -> str:
    if cluster == "yulduz":
        return (
            "Siz yuqori samarali xodimlar guruhidasiz — bu katta yutuq!\n\n"
            "Kuchli tomonlaringiz: texnik ko'nikmalar va jamoa ichidagi obro'ingiz.\n\n"
            "Tavsiyalar:\n"
            "1. Mentorlik dasturida qatnashing — junior xodimlarga haftalik 1-2 soat vaqt ajrating\n"
            "2. Arxitektura qarorlarida faol ishtirok eting, texnik hujjatlarni yozing\n"
            "3. Oylik texnik blogpost yoki ichki bilim almashish sessiyasi o'tkazing\n"
            "4. Konferensiya yoki hackathon'larda kompaniyani vakillik qiling"
        )
    if cluster == "barqaror":
        weak_str = ""
        if kpi_avg < 75:
            weak_str += "KPI ko'rsatkichlari (bug-fix tezligi, hujjatlashtirish), "
        if peer_360 < 70:
            weak_str += "jamoaviy muloqot ko'nikmalari, "
        if rahbar < 70:
            weak_str += "tashabbuskorlik va mustaqil qaror qabul qilish, "
        weak_str = weak_str.rstrip(", ") or "texnik chuqurlik"
        return (
            f"Barqaror natijalar ko'rsatyapsiz — bu yaxshi asos!\n\n"
            f"Rivojlanish imkoniyati: {weak_str}.\n\n"
            "Tavsiyalar:\n"
            "1. Har oyda kamida bitta yangi texnik ko'nikma o'rganing (kurs, kitob yoki amaliyot)\n"
            "2. Kod review jarayonida faolroq qatnashing — boshqalar kodiga izoh qoldiring\n"
            "3. Rahbaringiz bilan ikki haftada bir 1:1 uchrashuv rejalashtiring\n"
            "4. Keyingi chorakda aniq o'lchanadigan maqsad qo'ying (masalan, KPI +10 ball)"
        )
    return (
        "Rivojlanish yo'lida muhim qadamlar qo'yish vaqti!\n\n"
        "Tavsiyalar:\n"
        "1. Haftalik 1:1 uchrashuvlarni rahbar bilan boshlang — aniq maqsadlar belgilang\n"
        "2. Murakkablikdan emas, amaliyotdan boshlang — kichik vazifalar orqali tajriba to'plang\n"
        "3. Pair programming'da ishtirok eting — tajribali hamkasbingizdan o'rganing\n"
        "4. Har hafta bitta texnik maqola o'qing va jamoa bilan ulashing"
    )
