from typing import Optional


def percent_change(current: float, previous: Optional[float]) -> Optional[float]:
    if previous is None or previous == 0:
        return None
    return ((current - previous) / previous) * 100.0


def should_notify(
    current: float,
    previous: Optional[float],
    buy_below: Optional[float] = None,
    alert_drop_pct: Optional[float] = None,
    alert_rise_pct: Optional[float] = None,
    always_notify: bool = False,
) -> tuple[bool, list[str]]:
    """
    Retorna (notify, reasons)
    """
    reasons: list[str] = []

    if always_notify:
        return True, ["always_notify=true"]

    chg = percent_change(current, previous)
    if chg is not None:
        if alert_drop_pct is not None and chg <= -abs(alert_drop_pct):
            reasons.append(f"queda {chg:.2f}% <= -{abs(alert_drop_pct):.2f}%")
        if alert_rise_pct is not None and chg >= abs(alert_rise_pct):
            reasons.append(f"alta {chg:.2f}% >= +{abs(alert_rise_pct):.2f}%")

    if buy_below is not None and current <= buy_below:
        reasons.append(f"abaixo da meta de compra (<= {buy_below:.4f})")

    return (len(reasons) > 0), reasons
