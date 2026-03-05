FORBIDDEN_HINTS = [
    'dog',
    'cat',
    'pet',
    'animal',
    'vet',
    'vaccin',
    'livestock',
    'chicken',
    'cow',
    'goat',
    'agricultural economics',
    'farm economics',
    'commodity price',
    'crop price',
    'market price',
    'landscape architecture',
    'hardscape',
    'patio design',
    'retaining wall',
    'landscape plan',
]


def is_plant_topic_allowed(text: str) -> bool:
    normalized = (text or '').lower().strip()
    if not normalized:
        return True

    for hint in FORBIDDEN_HINTS:
        if hint in normalized:
            return False

    return True


REFUSAL_MESSAGE = (
    "Sorry — I can only help with the Plant Care & Botany Guide (diagnosing plant diseases from leaf descriptions, "
    "watering schedules, and soil pH recommendations for houseplants or garden crops). I can’t help with animal care, "
    "agricultural economics, or landscape architecture."
)


def make_assistant_reply(prompt: str) -> str:
    if not is_plant_topic_allowed(prompt):
        return REFUSAL_MESSAGE

    return "\n".join(
        [
            "Tell me what plant/crop it is and describe the leaves (spots, color changes, curling, mushy areas), plus light and watering frequency.",
            "Quick checks:",
            "- If leaves are yellowing + soil stays wet: reduce watering, check drainage, and consider root rot.",
            "- If crispy brown edges + dry soil: water more consistently and raise humidity (for houseplants).",
            "- If powdery white coating: likely powdery mildew; improve airflow and avoid wetting foliage.",
            "Watering schedule rule of thumb: water when the top 2–3 cm of soil is dry (pots) or when the top ~5 cm is dry (beds), adjusting for season.",
            "Soil pH (general): most houseplants like ~6.0–7.0; blueberries prefer ~4.5–5.5; tomatoes often do well around ~6.0–6.8.",
        ]
    )
