import os
from datetime import datetime

from quote import fetch_usd_brl
from history import load_history, save_history, append_entry, last_bid
from rules import percent_change, should_notify
from notify import notify_discord


def _get_float_env(name: str) -> float | None:
    v = os.getenv(name, "").strip()
    if not v:
        return None
    try:
        return float(v.replace(",", "."))
    except ValueError:
        return None


def _get_bool_env(name: str, default: bool = False) -> bool:
    v = os.getenv(name, "").strip().lower()
    if not v:
        return default
    return v in ("1", "true", "yes", "y", "on")


def format_message(entry: dict, prev_bid: float | None, reasons: list[str]) -> str:
    bid = entry["bid"]
    ts = entry["timestamp_iso"]
    chg = percent_change(bid, prev_bid)

    chg_txt = "N/A"
    if chg is not None:
        arrow = "⬆️" if chg > 0 else ("⬇️" if chg < 0 else "➡️")
        chg_txt = f"{arrow} {chg:+.2f}%"

    reasons_txt = "\n".join([f"- {r}" for r in reasons]) if reasons else "- (sem razão — modo always_notify)"

    return (
        f"**USD/BRL alert**\n"
        f"- Cotação (bid): **R$ {bid:.4f}**\n"
        f"- Variação vs última: **{chg_txt}**\n"
        f"- Timestamp (UTC): `{ts}`\n"
        f"- Fonte: {entry.get('source')}\n"
        f"\n"
        f" Motivos:\n{reasons_txt}\n"
        f"\n"
        f" Cofrinho: consistência > adivinhar fundo "
    )


def main() -> int:
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "").strip()

    # thresholds (config)
    buy_below = _get_float_env("BUY_BELOW")          # ex: 5.10
    alert_drop_pct = _get_float_env("ALERT_DROP_PCT")  # ex: 0.8
    alert_rise_pct = _get_float_env("ALERT_RISE_PCT")  # ex: 1.0
    always_notify = _get_bool_env("ALWAYS_NOTIFY", default=False)

    history = load_history()
    prev = last_bid(history)

    entry = fetch_usd_brl()
    history = append_entry(history, entry)
    save_history(history)

    if webhook_url:
        notify, reasons = should_notify(
            current=float(entry["bid"]),
            previous=prev,
            buy_below=buy_below,
            alert_drop_pct=alert_drop_pct,
            alert_rise_pct=alert_rise_pct,
            always_notify=always_notify,
        )
        if notify:
            msg = format_message(entry, prev, reasons)
            notify_discord(webhook_url, msg)
        else:
            print("Sem gatilho de alerta. Histórico atualizado.")
    else:
        print("DISCORD_WEBHOOK_URL não configurado; histórico atualizado sem notificação.")

    print(f"OK - saved quote: {entry['bid']} at {datetime.utcnow().isoformat()}Z")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
