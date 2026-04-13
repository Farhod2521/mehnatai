"""
NLP Sentiment Analysis Service.

Production: Use multilingual BERT (mBERT) fine-tuned on Uzbek data.
Dev/stub: Simple keyword-based heuristic until ML model is integrated.

Docs reference: mBERT (bert-base-multilingual-cased), F1-score ≥ 0.82
"""

from app.models.evaluation import SentimentEnum

# Simple keyword lists for Uzbek language (stub until mBERT is integrated)
_POSITIVE_WORDS = {
    "yaxshi", "ajoyib", "zo'r", "a'lo", "mukammal", "qoniqarli",
    "professional", "tez", "samarali", "tavsiya", "kuchli", "usta",
    "ishonchli", "mas'uliyatli", "innovatsion", "ijodiy", "faol",
}

_NEGATIVE_WORDS = {
    "yomon", "sust", "sekin", "kam", "noto'g'ri", "xato", "muammo",
    "rivojlanish kerak", "past", "qoniqarsiz", "kechikish", "g'amxo'r emas",
    "e'tiborsiz", "befarq", "umidsiz",
}


def analyze_sentiment(text: str) -> SentimentEnum:
    """
    Stub sentiment analysis using keyword matching.
    Replace with actual mBERT inference in production.
    """
    text_lower = text.lower()

    pos_count = sum(1 for w in _POSITIVE_WORDS if w in text_lower)
    neg_count = sum(1 for w in _NEGATIVE_WORDS if w in text_lower)

    if pos_count > neg_count:
        return SentimentEnum.ijobiy
    elif neg_count > pos_count:
        return SentimentEnum.salbiy
    return SentimentEnum.neytral
