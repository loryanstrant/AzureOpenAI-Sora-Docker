from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Tuple
from app.models.schemas import CostEstimate, Resolution

COSTS_PER_SEC = {
    "480x480": (Decimal("0.15"), Decimal("0.15")),
    "480x854": (Decimal("0.20"), Decimal("0.20")),
    "854x480": (Decimal("0.20"), Decimal("0.20")),
    "720x720": (Decimal("0.45"), Decimal("0.50")),
    "720x1280": (Decimal("0.45"), Decimal("0.50")),
    "1280x720": (Decimal("0.45"), Decimal("0.50")),
    "1080x1080": (Decimal("0.60"), Decimal("0.75")),
    "1080x1920": (Decimal("1.30"), Decimal("1.45")),
    "1920x1080": (Decimal("1.30"), Decimal("1.45")),
}

def _select_cost(resolution: Resolution) -> Tuple[Decimal, Decimal]:
    return COSTS_PER_SEC[resolution]

def _fmt(val: Decimal) -> float:
    return float(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

def estimate(resolution: Resolution, duration_seconds: int) -> CostEstimate:
    min_c, max_c = _select_cost(resolution)
    total_min = min_c * Decimal(duration_seconds)
    total_max = max_c * Decimal(duration_seconds)
    if total_min == total_max:
        cost = total_min
        min_val: Optional[float] = None
        max_val: Optional[float] = None
        breakdown = f"${_fmt(min_c)}/sec x {duration_seconds}s = ${_fmt(cost)}"
    else:
        avg = (total_min + total_max) / Decimal(2)
        cost = avg
        min_val = _fmt(total_min)
        max_val = _fmt(total_max)
        breakdown = f"${_fmt(min_c)}-${_fmt(max_c)}/sec x {duration_seconds}s = ${_fmt(avg)} (avg)"
    warning = None
    if cost >= Decimal("25"):
        warning = "High estimated cost"
    elif cost >= Decimal("15"):
        warning = "Significant estimated cost"
    elif cost >= Decimal("8"):
        warning = "Moderate estimated cost"
    return CostEstimate(
        resolution=resolution,
        duration_seconds=duration_seconds,
        cost_usd=_fmt(cost),
        min_cost_usd=min_val,
        max_cost_usd=max_val,
        breakdown=breakdown,
        warning=warning,
    )
