** USD Piggybank **

A small, serverless personal product to track USD/BRL, store historical data, trigger smart alerts, and visualize everything in a public dashboard...  

all running 100% for free using GitHub Actions. :)

* Philosophy:
Discipline beats perfect timing.
This project helps with decision support, not automated buying.


* WHAT THIS PROJECT DOES

- Fetches USD/BRL exchange rate twice a day
- Stores historical data in JSON (versioned in the repo)
- Sends alerts via Discord webhook (configurable rules)
- Publishes a live dashboard using GitHub Pages
- Runs fully serverless with GitHub Actions (no VM, no cloud bill)


* LIVE DEMO

* Dashboard:
https://momoantunes.github.io/USD-Piggybank/

The dashboard is automatically updated every time new data is collected.


* ARCHITECTURE OVERVIEW

GitHub Cron (2x/day)
        |
        v
Python Collector
 - AwesomeAPI (spot)
 - BCB PTAX (fallback)
        |
        +--> data/usdbrl.json (history)
        |
        +--> Discord Webhook (alerts)
        |
        v
GitHub Pages
Static Dashboard


* KEY DESIGN CHOICES

- No database: JSON + Git versioning is enough
- No servers: GitHub Actions handles scheduling
- Fallback data source for resilience against API rate limits


* ALERT LOGIC (DECISION SUPPORT)

Alerts are rule-based and designed to reduce noise.

Available triggers:
- Price below target (BUY_BELOW)
- Significant drop percentage (ALERT_DROP_PCT)
- Significant rise percentage (ALERT_RISE_PCT)
- Optional ALWAYS_NOTIFY flag (useful for testing)

** Alerts do NOT execute trades. All decisions remain manual and conscious. **


* DASHBOARD FEATURES

- Latest USD/BRL quote
- Variation vs previous check
- Data source indicator (spot or PTAX fallback)
- Simple line chart with recent history
- Fully static (HTML + JS)


* TECH STACK

- Python 3.11
- GitHub Actions
- GitHub Pages
- Discord Webhooks

Data sources:
- AwesomeAPI (spot)
- Banco Central do Brasil - PTAX (fallback)


* CONFIGURATION

Configuration is done via GitHub Actions variables and secrets.

Secrets:
- DISCORD_WEBHOOK_URL

Variables:
- BUY_BELOW (example: 5.10)
- ALERT_DROP_PCT (example: 0.8)
- ALERT_RISE_PCT (example: 1.0)
- ALWAYS_NOTIFY (true or false)


* LOCAL DEVELOPMENT

pip install -r requirements.txt
python src/main.py

You can also run the workflow manually via:
Actions -> USD Piggybank - 2x/day -> Run workflow


* ROADMAP (IDEAS)

- Telegram notifications
- Daily / weekly digest
- Volatility and min/max indicators
- Manual cofrinho tracking (non-automated)
- Multi-currency support (EUR, BTC, etc.)


* WHY THIS EXISTS

This project was built as a personal financial radar and a portfolio piece to demonstrate automation design, resilience, serverless thinking, and pragmatic engineering decisions.

** Feel free to fork, adapt, or use it as inspiration. **
