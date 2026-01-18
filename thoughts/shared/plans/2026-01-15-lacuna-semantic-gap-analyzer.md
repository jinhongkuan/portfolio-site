# Lacuna: Semantic Gap Stock Analyzer

## Overview

Lacuna is a web application that generates semantic gap analysis reports for publicly traded companies. (*Lacuna*: Latin for "gap" or "missing portion"—used in manuscripts to denote absent text.) Users enter a stock ticker, and the system extracts "promise" claims from marketing/investor materials and "capability" reality from SEC filings and technical documentation, then scores the divergence and overlays predictions on historical stock charts.

## Desired End State

A deployed web application where:
1. User enters a stock ticker (e.g., QUBT, DASH)
2. System generates a semantic gap report with:
   - Promise vs Reality term analysis
   - Gap scores (0-10)
   - Valuation assessment (overvalued/undervalued/fair)
   - Risk factor predictions
3. Interactive stock chart displays with prediction markers from historical reports
4. Reports cached with 7-day cooldown (loads existing report if within window)

### Verification:
- Can generate report for QUBT that matches simulated output
- Can generate report for DASH with gig economy gaps
- Stock chart renders with clickable prediction markers
- Report generation respects 7-day cooldown

## What We're NOT Doing

- Real-time monitoring or alerts
- Automated trading or broker integration
- Multi-company comparison views
- Temporal tracking across quarters (v2 feature)
- User accounts or authentication (v1 is single-user/demo)
- Mobile-optimized UI (desktop-first)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Charts**: Lightweight Charts (TradingView) or Recharts
- **Backend**: Next.js API routes
- **LLM**: OpenAI GPT-4 (or Claude via API)
- **Knowledge Graph**: ai-knowledge-graph (Python, called as subprocess or microservice)
- **Stock Data**: yfinance (Python) or Alpha Vantage API
- **Database**: SQLite (simple, file-based) for report caching
- **Deployment**: Vercel (frontend) + Railway/Fly.io (Python backend)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Ticker Input │  │ Report View  │  │ Stock Chart  │          │
│  │              │  │              │  │ + Markers    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js API Routes)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/report/generate                                       │
│  GET  /api/report/[ticker]                                       │
│  GET  /api/stock/[ticker]/history                                │
│  GET  /api/stock/[ticker]/predictions                            │
│                                                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON BACKEND (FastAPI)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Data Fetchers   │  │ Graph Extractor │  │ Gap Analyzer    │ │
│  │ - SEC EDGAR     │  │ - ai-kg wrapper │  │ - Scoring       │ │
│  │ - yfinance      │  │ - Custom prompts│  │ - Valuation     │ │
│  │ - Web scraper   │  │                 │  │ - Risk mapping  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    SQLite Database                          ││
│  │  - reports (ticker, date, content, gap_score, signal)       ││
│  │  - predictions (ticker, date, predicted_signal, outcome)    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
-- ═══════════════════════════════════════════════════════════════
-- CONFIGURATION TABLES (No hardcoded values in code)
-- ═══════════════════════════════════════════════════════════════

-- Global application settings
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    value_type TEXT DEFAULT 'string',  -- 'string', 'int', 'float', 'json', 'bool'
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sector-specific valuation parameters
CREATE TABLE sector_config (
    sector TEXT PRIMARY KEY,
    median_ps_ratio REAL NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Failure mode patterns (configurable)
CREATE TABLE failure_modes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_name TEXT UNIQUE NOT NULL,
    triggers TEXT NOT NULL,  -- JSON array of trigger types
    outcomes TEXT NOT NULL,  -- JSON array of expected outcomes
    typical_timeline TEXT,
    base_probability REAL DEFAULT 0.3,
    probability_increment REAL DEFAULT 0.2,
    is_active BOOLEAN DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LLM model configuration
CREATE TABLE llm_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purpose TEXT UNIQUE NOT NULL,  -- 'promise_extraction', 'capability_extraction', 'gap_analysis'
    model_name TEXT NOT NULL,
    temperature REAL DEFAULT 0.1,
    max_tokens INTEGER,
    is_active BOOLEAN DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════
-- DATA TABLES
-- ═══════════════════════════════════════════════════════════════

-- reports table
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gap_score REAL,
    signal TEXT,  -- 'OVERVALUED', 'UNDERVALUED', 'FAIR'
    fair_value REAL,
    current_price REAL,
    report_json TEXT,  -- Full report as JSON
    UNIQUE(ticker, DATE(generated_at))
);

-- predictions table (for chart markers)
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    prediction_date TIMESTAMP NOT NULL,
    gap_score REAL,
    signal TEXT,
    predicted_downside REAL,  -- e.g., -45%
    price_at_prediction REAL,
    -- Filled in later for validation
    actual_outcome TEXT,  -- 'CORRECT', 'INCORRECT', 'PENDING'
    price_after_90_days REAL,
    UNIQUE(ticker, DATE(prediction_date))
);

-- Index for fast lookups
CREATE INDEX idx_reports_ticker ON reports(ticker);
CREATE INDEX idx_predictions_ticker ON predictions(ticker);

-- ═══════════════════════════════════════════════════════════════
-- CALIBRATION / TRAINING DATA TABLES
-- ═══════════════════════════════════════════════════════════════

-- Training dataset: historical companies with known outcomes
CREATE TABLE training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    analysis_date DATE NOT NULL,
    gap_score REAL NOT NULL,
    gap_details TEXT,  -- JSON of individual gap scores
    price_at_analysis REAL NOT NULL,
    sector TEXT,
    ps_ratio_at_analysis REAL,
    -- Outcomes (filled in after waiting period)
    price_after_30_days REAL,
    price_after_90_days REAL,
    price_after_180_days REAL,
    actual_return_30d REAL,  -- % change
    actual_return_90d REAL,
    actual_return_180d REAL,
    -- Events that occurred
    short_report_occurred BOOLEAN DEFAULT 0,
    lawsuit_occurred BOOLEAN DEFAULT 0,
    regulatory_action_occurred BOOLEAN DEFAULT 0,
    earnings_miss_occurred BOOLEAN DEFAULT 0,
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker, analysis_date)
);

-- Calibration runs: track parameter optimization history
CREATE TABLE calibration_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    training_samples INTEGER,
    validation_samples INTEGER,
    -- Optimized parameters
    gap_discount_max REAL,
    overvalued_threshold REAL,
    undervalued_threshold REAL,
    -- Performance metrics
    accuracy REAL,  -- % of correct signal predictions
    precision_overvalued REAL,
    recall_overvalued REAL,
    mean_absolute_error REAL,
    sharpe_ratio REAL,  -- If trading on signals
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT 0  -- Only one active calibration
);

-- Per-sector calibration (learned from data)
CREATE TABLE sector_calibration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calibration_run_id INTEGER REFERENCES calibration_runs(id),
    sector TEXT NOT NULL,
    learned_ps_ratio REAL,
    sample_count INTEGER,
    confidence REAL,  -- Statistical confidence
    UNIQUE(calibration_run_id, sector)
);

-- Failure mode calibration (learned probabilities)
CREATE TABLE failure_mode_calibration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calibration_run_id INTEGER REFERENCES calibration_runs(id),
    mode_name TEXT NOT NULL,
    learned_base_probability REAL,
    learned_increment REAL,
    true_positive_rate REAL,
    false_positive_rate REAL,
    sample_count INTEGER,
    UNIQUE(calibration_run_id, mode_name)
);

CREATE INDEX idx_training_ticker ON training_data(ticker);
CREATE INDEX idx_training_sector ON training_data(sector);

-- ═══════════════════════════════════════════════════════════════
-- DEFAULT DATA (Seed on init - will be updated by calibration)
-- ═══════════════════════════════════════════════════════════════

-- Global config defaults
INSERT INTO config (key, value, value_type, description) VALUES
    ('report_cooldown_days', '7', 'int', 'Days between report regeneration'),
    ('gap_discount_max', '0.30', 'float', 'Maximum valuation discount for high gap score'),
    ('overvalued_threshold', '1.25', 'float', 'Price/fair_value ratio above which stock is OVERVALUED'),
    ('undervalued_threshold', '0.75', 'float', 'Price/fair_value ratio below which stock is UNDERVALUED'),
    ('text_chunk_limit', '30000', 'int', 'Max characters per LLM prompt'),
    ('filing_text_limit', '100000', 'int', 'Max characters from SEC filing'),
    ('marketing_text_limit', '50000', 'int', 'Max characters from marketing materials'),
    ('outcome_validation_days', '90', 'int', 'Days after prediction to validate outcome'),
    ('default_sector_ps', '5.0', 'float', 'Default P/S ratio when sector unknown'),
    -- Gap analysis parameters
    ('max_key_terms', '7', 'int', 'Max marketing terms to analyze'),
    ('min_trigger_match', '2', 'int', 'Min triggers to match for failure mode'),
    ('max_failure_probability', '0.9', 'float', 'Cap on failure mode probability'),
    ('critical_gap_threshold', '8.0', 'float', 'Gap score threshold for CRITICAL risk'),
    ('high_gap_threshold', '6.0', 'float', 'Gap score threshold for HIGH risk');

-- Sector P/S ratios
INSERT INTO sector_config (sector, median_ps_ratio, description) VALUES
    ('Technology', 8.0, 'Software, hardware, IT services'),
    ('Consumer Cyclical', 2.5, 'Retail, automotive, travel'),
    ('Healthcare', 5.0, 'Pharma, biotech, medical devices'),
    ('Financial Services', 3.0, 'Banks, insurance, fintech'),
    ('Communication Services', 4.0, 'Telecom, media, entertainment'),
    ('Industrials', 2.0, 'Manufacturing, aerospace, logistics'),
    ('Energy', 1.5, 'Oil, gas, renewables'),
    ('Real Estate', 6.0, 'REITs, property management'),
    ('Consumer Defensive', 2.0, 'Food, beverages, household products'),
    ('Utilities', 2.5, 'Electric, gas, water utilities'),
    ('Basic Materials', 1.5, 'Mining, chemicals, forestry');

-- Failure mode patterns
INSERT INTO failure_modes (mode_name, triggers, outcomes, typical_timeline, base_probability, probability_increment) VALUES
    ('promotional_stock',
     '["partnership_exaggeration", "unverified_technology", "revenue_disconnect"]',
     '["short_seller_report", "securities_lawsuit", "stock_crash"]',
     '6-18 months', 0.3, 0.2),
    ('labor_dispute',
     '["flexibility_illusion", "algorithmic_control", "contractor_misclass"]',
     '["regulatory_action", "class_action", "cost_increase"]',
     '12-24 months', 0.3, 0.2),
    ('custody_risk',
     '["control_illusion", "withdrawal_limits", "opaque_holdings"]',
     '["bank_run", "insolvency", "fund_lockup"]',
     '6-18 months', 0.3, 0.2),
    ('regulatory_action',
     '["safety_claims", "compliance_gaps", "user_harm"]',
     '["fines", "consent_decree", "operational_restrictions"]',
     '12-36 months', 0.25, 0.15);

-- LLM configuration
INSERT INTO llm_config (purpose, model_name, temperature, max_tokens) VALUES
    ('promise_extraction', 'gpt-4-turbo-preview', 0.1, 4096),
    ('capability_extraction', 'gpt-4-turbo-preview', 0.1, 4096),
    ('identify_terms', 'gpt-4-turbo-preview', 0.1, 1024),
    ('analyze_gap', 'gpt-4-turbo-preview', 0.2, 2048);
```

## Implementation Phases

---

## Phase 1: Project Setup & Data Infrastructure

### Overview
Set up the monorepo structure, install dependencies, and build the data fetching layer.

### Changes Required:

#### 1. Project Structure

```
lacuna/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── page.tsx         # Main ticker input page
│   │   ├── report/
│   │   │   └── [ticker]/
│   │   │       └── page.tsx # Report view
│   │   └── api/
│   │       ├── report/
│   │       │   ├── generate/route.ts
│   │       │   └── [ticker]/route.ts
│   │       └── stock/
│   │           └── [ticker]/
│   │               ├── history/route.ts
│   │               └── predictions/route.ts
│   ├── components/
│   │   ├── TickerInput.tsx
│   │   ├── ReportCard.tsx
│   │   ├── GapTable.tsx
│   │   ├── StockChart.tsx
│   │   └── PredictionMarker.tsx
│   ├── lib/
│   │   └── api.ts           # Backend API client
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app
│   │   ├── routers/
│   │   │   ├── report.py
│   │   │   └── stock.py
│   │   ├── services/
│   │   │   ├── data_fetcher.py
│   │   │   ├── graph_extractor.py
│   │   │   ├── gap_analyzer.py
│   │   │   └── valuation.py
│   │   ├── prompts/
│   │   │   ├── promise_extraction.py
│   │   │   └── capability_extraction.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   └── db/
│   │       ├── database.py
│   │       └── models.py
│   ├── requirements.txt
│   └── pyproject.toml
│
├── ai-knowledge-graph/       # Submodule or vendored
│   └── ...
│
└── README.md
```

#### 2. Backend Dependencies

**File**: `backend/requirements.txt`

```
fastapi==0.109.0
uvicorn==0.27.0
yfinance==0.2.36
sec-edgar-downloader==5.0.2
openai==1.12.0
networkx==3.2.1
pyvis==0.3.2
pydantic==2.6.0
sqlalchemy==2.0.25
aiosqlite==0.19.0
httpx==0.26.0
beautifulsoup4==4.12.3
python-dotenv==1.0.1
```

#### 3. Configuration Service (Central Config from DB)

**File**: `backend/app/services/config_service.py`

```python
"""
Centralized configuration service.
All configurable values are read from the database - no hardcoded constants.
"""
from typing import Any, Dict, List, Optional
import json
from functools import lru_cache
from app.db.database import get_db

class ConfigService:
    """
    Reads all configuration from database tables.
    Uses caching to avoid repeated DB queries.
    """

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._cache_loaded = False

    async def load_cache(self):
        """Load all config into memory cache."""
        if self._cache_loaded:
            return

        async with get_db() as db:
            # Load global config
            cursor = await db.execute("SELECT key, value, value_type FROM config")
            rows = await cursor.fetchall()
            for row in rows:
                self._cache[row["key"]] = self._parse_value(row["value"], row["value_type"])

            # Load sector config
            cursor = await db.execute("SELECT sector, median_ps_ratio FROM sector_config")
            rows = await cursor.fetchall()
            self._cache["sector_ps_ratios"] = {row["sector"]: row["median_ps_ratio"] for row in rows}

            # Load failure modes
            cursor = await db.execute(
                "SELECT mode_name, triggers, outcomes, typical_timeline, base_probability, probability_increment "
                "FROM failure_modes WHERE is_active = 1"
            )
            rows = await cursor.fetchall()
            self._cache["failure_modes"] = {
                row["mode_name"]: {
                    "triggers": json.loads(row["triggers"]),
                    "outcomes": json.loads(row["outcomes"]),
                    "typical_timeline": row["typical_timeline"],
                    "base_probability": row["base_probability"],
                    "probability_increment": row["probability_increment"]
                }
                for row in rows
            }

            # Load LLM config
            cursor = await db.execute(
                "SELECT purpose, model_name, temperature, max_tokens FROM llm_config WHERE is_active = 1"
            )
            rows = await cursor.fetchall()
            self._cache["llm_config"] = {
                row["purpose"]: {
                    "model": row["model_name"],
                    "temperature": row["temperature"],
                    "max_tokens": row["max_tokens"]
                }
                for row in rows
            }

        self._cache_loaded = True

    def _parse_value(self, value: str, value_type: str) -> Any:
        """Parse config value based on its type."""
        if value_type == "int":
            return int(value)
        elif value_type == "float":
            return float(value)
        elif value_type == "bool":
            return value.lower() in ("true", "1", "yes")
        elif value_type == "json":
            return json.loads(value)
        return value

    async def get(self, key: str, default: Any = None) -> Any:
        """Get a config value by key."""
        await self.load_cache()
        return self._cache.get(key, default)

    async def get_sector_ps(self, sector: str) -> float:
        """Get P/S ratio for a sector."""
        await self.load_cache()
        default_ps = self._cache.get("default_sector_ps", 5.0)
        return self._cache.get("sector_ps_ratios", {}).get(sector, default_ps)

    async def get_failure_modes(self) -> Dict:
        """Get all active failure mode patterns."""
        await self.load_cache()
        return self._cache.get("failure_modes", {})

    async def get_llm_config(self, purpose: str) -> Dict:
        """Get LLM configuration for a specific purpose."""
        await self.load_cache()
        default = {"model": "gpt-4-turbo-preview", "temperature": 0.1, "max_tokens": 4096}
        return self._cache.get("llm_config", {}).get(purpose, default)

    async def refresh_cache(self):
        """Force refresh the config cache."""
        self._cache_loaded = False
        self._cache = {}
        await self.load_cache()

    async def update_config(self, key: str, value: Any, value_type: str = "string"):
        """Update a config value in the database."""
        async with get_db() as db:
            await db.execute(
                "UPDATE config SET value = ?, value_type = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
                (str(value), value_type, key)
            )
            await db.commit()
        await self.refresh_cache()


# Singleton instance
config_service = ConfigService()
```

#### 4. Data Fetcher Service

**File**: `backend/app/services/data_fetcher.py`

```python
"""
Fetches data from multiple sources:
- SEC EDGAR for 10-K, 10-Q, S-1 filings
- Company websites for ToS, marketing materials
- yfinance for stock data

All limits read from config_service - no hardcoded values.
"""
import yfinance as yf
from sec_edgar_downloader import Downloader
from bs4 import BeautifulSoup
import httpx
from pathlib import Path
import os

from app.services.config_service import config_service

class DataFetcher:
    def __init__(self, cache_dir: str = "./data_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.sec_downloader = Downloader("Lacuna", "user@example.com")

    async def get_stock_data(self, ticker: str, period: str = "2y") -> dict:
        """Fetch historical stock data."""
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        info = stock.info

        return {
            "ticker": ticker,
            "history": hist.to_dict(),
            "info": {
                "current_price": info.get("currentPrice"),
                "market_cap": info.get("marketCap"),
                "ps_ratio": info.get("priceToSalesTrailing12Months"),
                "revenue": info.get("totalRevenue"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
            }
        }

    async def get_sec_filings(self, ticker: str) -> dict:
        """Download and parse SEC filings."""
        filings = {}
        filing_limit = await config_service.get("filing_text_limit")

        for filing_type in ["10-K", "10-Q", "S-1"]:
            try:
                self.sec_downloader.get(filing_type, ticker, limit=1)
                # Parse the downloaded filing
                filing_path = self.cache_dir / "sec-edgar-filings" / ticker / filing_type
                if filing_path.exists():
                    filings[filing_type] = await self._parse_filing(filing_path, filing_limit)
            except Exception as e:
                filings[filing_type] = None

        return filings

    async def get_marketing_materials(self, ticker: str, company_url: str) -> str:
        """Scrape marketing/about pages from company website."""
        marketing_limit = await config_service.get("marketing_text_limit")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(company_url, timeout=30)
                soup = BeautifulSoup(response.text, 'html.parser')
                # Extract text from main content areas
                text = soup.get_text(separator='\n', strip=True)
                return text[:marketing_limit]
            except Exception as e:
                return ""

    async def _parse_filing(self, filing_path: Path, limit: int) -> str:
        """Extract text from SEC filing."""
        # Find the primary document
        for file in filing_path.rglob("*.htm*"):
            with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
                return soup.get_text(separator='\n', strip=True)[:limit]
        return ""
```

### Success Criteria:

#### Automated Verification:
- [ ] `pip install -r requirements.txt` succeeds
- [ ] `python -c "from app.services.data_fetcher import DataFetcher"` works
- [ ] Unit test passes: `pytest backend/tests/test_data_fetcher.py`

#### Manual Verification:
- [ ] Can fetch QUBT stock data via yfinance
- [ ] Can download QUBT 10-K from SEC EDGAR
- [ ] Data cache directory populates correctly

---

## Phase 2: Graph Extraction & Custom Prompts

### Overview
Integrate ai-knowledge-graph library and create custom prompts for promise/capability extraction.

### Changes Required:

#### 1. Custom Prompts

**File**: `backend/app/prompts/promise_extraction.py`

```python
PROMISE_EXTRACTION_PROMPT = """
You are analyzing company communications to extract PROMISES and CLAIMS made to customers, investors, or users.

Extract Subject-Predicate-Object triplets for:
1. Capability claims ("Our technology can...", "Users will be able to...")
2. Outcome promises ("Achieve financial freedom", "Take control of your...")
3. Partnership/relationship claims ("Working with NASA", "Strategic partnership with...")
4. Competitive advantage claims ("First and only", "Industry-leading", "Revolutionary")
5. Financial projections or growth claims

For each claim, extract:
- Subject: The entity making or benefiting from the claim
- Predicate: The action or relationship verb
- Object: What is being claimed/promised

Be especially attentive to:
- Superlatives ("best", "only", "first", "leading")
- Vague qualifiers ("significant", "substantial", "strategic")
- Future-tense promises without specific commitments
- Implied capabilities that aren't explicitly verified

Format as JSON array:
[
  {"subject": "...", "predicate": "...", "object": "...", "confidence": 0.0-1.0, "source_quote": "..."}
]

TEXT TO ANALYZE:
{text}
"""

PROMISE_CATEGORIES = [
    "technology_capability",
    "user_benefit",
    "partnership",
    "competitive_advantage",
    "financial_projection"
]
```

**File**: `backend/app/prompts/capability_extraction.py`

```python
CAPABILITY_EXTRACTION_PROMPT = """
You are analyzing company SEC filings and legal documents to extract ACTUAL CAPABILITIES and LIMITATIONS.

Extract Subject-Predicate-Object triplets for:
1. Actual revenue and financial metrics (specific numbers)
2. Verified contracts and their actual values
3. Platform/company controls and unilateral powers
4. User limitations and restrictions
5. Risk factors and disclaimers
6. Definitional controls ("as defined by", "at sole discretion")

For each finding, extract:
- Subject: The entity with the capability/limitation
- Predicate: The action or relationship
- Object: The specific capability or limitation

Be especially attentive to:
- Specific dollar amounts vs vague claims
- "May", "could", "subject to" qualifiers
- Unilateral powers ("sole discretion", "may change without notice")
- Actual contract values vs implied partnerships
- Risk factor disclosures that contradict marketing

Format as JSON array:
[
  {"subject": "...", "predicate": "...", "object": "...", "confidence": 0.0-1.0, "source_quote": "..."}
]

TEXT TO ANALYZE:
{text}
"""

REALITY_INDICATORS = [
    "actual_revenue",
    "verified_contract",
    "platform_control",
    "user_limitation",
    "risk_disclosure"
]
```

#### 2. Graph Extractor Service

**File**: `backend/app/services/graph_extractor.py`

```python
"""
Wraps ai-knowledge-graph and applies custom prompts.
"""
import json
from openai import OpenAI
from typing import List, Dict
import networkx as nx

from app.prompts.promise_extraction import PROMISE_EXTRACTION_PROMPT
from app.prompts.capability_extraction import CAPABILITY_EXTRACTION_PROMPT

class GraphExtractor:
    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        self.client = OpenAI(api_key=api_key)
        self.model = model

    async def extract_promise_graph(self, text: str) -> List[Dict]:
        """Extract promise/claim triplets from marketing text."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You extract semantic claims as SPO triplets."},
                {"role": "user", "content": PROMISE_EXTRACTION_PROMPT.format(text=text[:30000])}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        try:
            result = json.loads(response.choices[0].message.content)
            return result.get("triplets", result) if isinstance(result, dict) else result
        except json.JSONDecodeError:
            return []

    async def extract_capability_graph(self, text: str) -> List[Dict]:
        """Extract actual capability triplets from SEC filings."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You extract verifiable facts as SPO triplets."},
                {"role": "user", "content": CAPABILITY_EXTRACTION_PROMPT.format(text=text[:30000])}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        try:
            result = json.loads(response.choices[0].message.content)
            return result.get("triplets", result) if isinstance(result, dict) else result
        except json.JSONDecodeError:
            return []

    def build_networkx_graph(self, triplets: List[Dict]) -> nx.DiGraph:
        """Convert triplets to NetworkX graph for analysis."""
        G = nx.DiGraph()

        for t in triplets:
            G.add_node(t["subject"], type="entity")
            G.add_node(t["object"], type="entity")
            G.add_edge(
                t["subject"],
                t["object"],
                predicate=t["predicate"],
                confidence=t.get("confidence", 1.0),
                source=t.get("source_quote", "")
            )

        return G
```

### Success Criteria:

#### Automated Verification:
- [ ] Unit test passes: `pytest backend/tests/test_graph_extractor.py`
- [ ] Can extract triplets from sample QUBT press release text
- [ ] JSON output is valid and parseable

#### Manual Verification:
- [ ] Promise extraction identifies key claims (e.g., "quantum advantage")
- [ ] Capability extraction identifies actual revenue figures
- [ ] Triplet confidence scores are reasonable

---

## Phase 3: Gap Analysis & Scoring Engine

### Overview
Build the core gap analysis logic that compares promise and capability graphs.

### Changes Required:

#### 1. Gap Analyzer Service

**File**: `backend/app/services/gap_analyzer.py`

```python
"""
Core semantic gap analysis engine.
Compares promise graph to capability graph and scores divergence.
"""
from typing import List, Dict, Tuple
from dataclasses import dataclass
from openai import OpenAI
import json

@dataclass
class GapAnalysis:
    term: str
    promise_claim: str
    reality_finding: str
    gap_score: float  # 0-10
    gap_type: str  # 'inferential_monopoly', 'unverified_claim', 'definitional_control', etc.
    risk_category: str
    source_quotes: Dict[str, str]

@dataclass
class OverallAssessment:
    aggregate_gap_score: float
    signal: str  # 'OVERVALUED', 'UNDERVALUED', 'FAIR'
    fair_value: float
    current_price: float
    mispricing_percent: float
    key_gaps: List[GapAnalysis]
    risk_factors: List[str]
    failure_modes: List[Dict]
    valuation_calculation: Optional[Dict] = None  # Full calculation breakdown for transparency


class GapAnalyzer:
    def __init__(self, api_key: str, config_service: ConfigService):
        self.client = OpenAI(api_key=api_key)
        self.config = config_service
        self._failure_patterns = None  # Lazy loaded from config

    async def analyze_gaps(
        self,
        promise_triplets: List[Dict],
        capability_triplets: List[Dict],
        company_info: Dict
    ) -> OverallAssessment:
        """
        Main analysis function. Compares promises to capabilities,
        scores gaps, and generates assessment.
        """
        # Step 1: Identify key terms to compare
        key_terms = await self._identify_key_terms(promise_triplets)

        # Step 2: For each key term, find promise and reality
        gaps = []
        for term in key_terms:
            gap = await self._analyze_single_term(
                term,
                promise_triplets,
                capability_triplets
            )
            if gap:
                gaps.append(gap)

        # Step 3: Calculate aggregate score
        if gaps:
            aggregate_score = sum(g.gap_score for g in gaps) / len(gaps)
        else:
            aggregate_score = 0.0

        # Step 4: Map to failure modes
        failure_modes = await self._map_failure_modes(gaps)

        # Step 5: Calculate valuation signal
        valuation = await self._calculate_valuation(
            aggregate_score,
            company_info
        )

        # Step 6: Generate risk factors
        risk_factors = await self._generate_risk_factors(gaps, failure_modes)

        return OverallAssessment(
            aggregate_gap_score=aggregate_score,
            signal=valuation["signal"],
            fair_value=valuation["fair_value"],
            current_price=valuation["current_price"],
            mispricing_percent=valuation["mispricing"],
            key_gaps=gaps,
            risk_factors=risk_factors,
            failure_modes=failure_modes,
            # Include full calculation breakdown for transparency
            valuation_calculation=valuation.get("calculation")
        )

    async def _identify_key_terms(self, promise_triplets: List[Dict]) -> List[str]:
        """Use LLM to identify the most significant claimed terms."""
        triplet_text = json.dumps(promise_triplets, indent=2)

        # Get LLM config from database
        llm_config = await self.config.get_llm_config("identify_terms")

        response = self.client.chat.completions.create(
            model=llm_config["model"],
            messages=[
                {"role": "system", "content": "Identify the 5-7 most significant marketing claims that could be verified or contradicted."},
                {"role": "user", "content": f"From these claims, identify key terms to verify:\n{triplet_text}"}
            ],
            response_format={"type": "json_object"},
            temperature=llm_config["temperature"]
        )

        try:
            result = json.loads(response.choices[0].message.content)
            max_terms = await self.config.get("max_key_terms", 7)
            return result.get("terms", [])[:max_terms]
        except:
            return []

    async def _analyze_single_term(
        self,
        term: str,
        promises: List[Dict],
        capabilities: List[Dict]
    ) -> GapAnalysis:
        """Analyze gap for a single term."""

        prompt = f"""
        Analyze the semantic gap for the term: "{term}"

        PROMISES (from marketing/investor materials):
        {json.dumps([p for p in promises if term.lower() in json.dumps(p).lower()], indent=2)}

        REALITY (from SEC filings/legal documents):
        {json.dumps([c for c in capabilities if term.lower() in json.dumps(c).lower()], indent=2)}

        Provide analysis as JSON:
        {{
            "term": "{term}",
            "promise_summary": "What is being claimed",
            "reality_summary": "What the evidence shows",
            "gap_score": 0.0-10.0 (10 = maximum divergence),
            "gap_type": "unverified_claim|inferential_monopoly|definitional_control|partnership_exaggeration|revenue_disconnect",
            "risk_category": "regulatory|legal|financial|reputational",
            "reasoning": "Why this score"
        }}
        """

        # Get LLM config from database
        llm_config = await self.config.get_llm_config("analyze_gap")

        response = self.client.chat.completions.create(
            model=llm_config["model"],
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=llm_config["temperature"]
        )

        try:
            result = json.loads(response.choices[0].message.content)
            return GapAnalysis(
                term=result["term"],
                promise_claim=result["promise_summary"],
                reality_finding=result["reality_summary"],
                gap_score=float(result["gap_score"]),
                gap_type=result["gap_type"],
                risk_category=result["risk_category"],
                source_quotes={}
            )
        except:
            return None

    async def _map_failure_modes(self, gaps: List[GapAnalysis]) -> List[Dict]:
        """Match gap patterns to known failure modes."""
        matched_modes = []
        gap_types = [g.gap_type for g in gaps]

        # Load failure patterns from config (cached)
        failure_patterns = await self.config.get_failure_modes()
        min_triggers = await self.config.get("min_trigger_match", 2)
        max_probability = await self.config.get("max_failure_probability", 0.9)

        for mode_name, mode_def in failure_patterns.items():
            triggers_matched = sum(1 for t in mode_def["triggers"] if t in gap_types)
            if triggers_matched >= min_triggers:
                # Use calibrated base_probability and probability_increment from DB
                base_prob = mode_def.get("base_probability", 0.3)
                prob_increment = mode_def.get("probability_increment", 0.2)
                probability = min(max_probability, base_prob + (triggers_matched * prob_increment))
                matched_modes.append({
                    "mode": mode_name,
                    "probability": probability,
                    "timeline": mode_def["typical_timeline"],
                    "expected_outcomes": mode_def["outcomes"],
                    "triggers_matched": triggers_matched,
                    # Include calculation details for transparency
                    "calculation": {
                        "formula": f"min({max_probability}, {base_prob} + {triggers_matched} × {prob_increment})",
                        "base_probability": base_prob,
                        "increment_per_trigger": prob_increment,
                        "triggers_counted": triggers_matched
                    }
                })

        return sorted(matched_modes, key=lambda x: x["probability"], reverse=True)

    async def _calculate_valuation(self, gap_score: float, company_info: Dict) -> Dict:
        """Calculate gap-adjusted valuation with transparent methodology."""
        current_price = company_info.get("current_price", 0)
        ps_ratio = company_info.get("ps_ratio", 0)
        sector = company_info.get("sector", "technology")

        # Get sector P/S from config
        sector_median_ps = await self.config.get_sector_ps(sector)

        if not current_price or not ps_ratio:
            return {
                "signal": "INSUFFICIENT_DATA",
                "fair_value": 0,
                "current_price": current_price,
                "mispricing": 0,
                "calculation": None
            }

        # Get calibrated parameters from config
        gap_discount_max = await self.config.get("gap_discount_max", 0.30)
        overvalued_threshold = await self.config.get("overvalued_threshold", 1.25)
        undervalued_threshold = await self.config.get("undervalued_threshold", 0.75)

        # Gap discount: 0 to gap_discount_max based on gap severity
        gap_discount = (gap_score / 10) * gap_discount_max
        gap_multiplier = 1 - gap_discount

        # Adjusted P/S
        adjusted_ps = sector_median_ps * gap_multiplier

        # Revenue per share (derived from current P/S)
        revenue_per_share = current_price / ps_ratio if ps_ratio > 0 else 0

        # Fair value
        fair_value = revenue_per_share * adjusted_ps

        # Signal determination
        if current_price > fair_value * overvalued_threshold:
            signal = "OVERVALUED"
        elif current_price < fair_value * undervalued_threshold:
            signal = "UNDERVALUED"
        else:
            signal = "FAIR"

        mispricing = ((current_price - fair_value) / fair_value * 100) if fair_value > 0 else 0

        return {
            "signal": signal,
            "fair_value": round(fair_value, 2),
            "current_price": current_price,
            "mispricing": round(mispricing, 1),
            # Full calculation breakdown for report transparency
            "calculation": {
                "step_1_gap_discount": {
                    "formula": f"(gap_score / 10) × gap_discount_max",
                    "values": f"({gap_score} / 10) × {gap_discount_max}",
                    "result": round(gap_discount, 3),
                    "interpretation": f"Gap of {gap_score}/10 implies {round(gap_discount * 100, 1)}% discount"
                },
                "step_2_gap_multiplier": {
                    "formula": "1 - gap_discount",
                    "values": f"1 - {round(gap_discount, 3)}",
                    "result": round(gap_multiplier, 3),
                    "interpretation": f"Apply {round(gap_multiplier, 2)}x multiplier to fair P/S"
                },
                "step_3_adjusted_ps": {
                    "formula": "sector_median_ps × gap_multiplier",
                    "values": f"{sector_median_ps} × {round(gap_multiplier, 3)}",
                    "result": round(adjusted_ps, 2),
                    "interpretation": f"Gap-adjusted P/S ratio: {round(adjusted_ps, 2)}"
                },
                "step_4_fair_value": {
                    "formula": "revenue_per_share × adjusted_ps",
                    "values": f"${round(revenue_per_share, 2)} × {round(adjusted_ps, 2)}",
                    "result": round(fair_value, 2),
                    "interpretation": f"Fair value: ${round(fair_value, 2)}"
                },
                "step_5_signal": {
                    "current_vs_fair": f"${current_price} vs ${round(fair_value, 2)}",
                    "ratio": round(current_price / fair_value, 2) if fair_value > 0 else 0,
                    "thresholds": f"OVERVALUED if >{overvalued_threshold}x, UNDERVALUED if <{undervalued_threshold}x",
                    "result": signal
                },
                "parameters_used": {
                    "gap_discount_max": gap_discount_max,
                    "sector_median_ps": sector_median_ps,
                    "overvalued_threshold": overvalued_threshold,
                    "undervalued_threshold": undervalued_threshold,
                    "source": "calibrated from training data"
                }
            }
        }

    async def _generate_risk_factors(self, gaps: List[GapAnalysis], failure_modes: List[Dict]) -> List[str]:
        """Generate human-readable risk factors."""
        risks = []

        # Get thresholds from config
        critical_threshold = await self.config.get("critical_gap_threshold", 8)
        high_threshold = await self.config.get("high_gap_threshold", 6)

        for gap in gaps:
            if gap.gap_score >= critical_threshold:
                risks.append(f"CRITICAL: {gap.term} - {gap.gap_type.replace('_', ' ').title()} (score: {gap.gap_score}/10)")
            elif gap.gap_score >= high_threshold:
                risks.append(f"HIGH: {gap.term} - {gap.gap_type.replace('_', ' ').title()} (score: {gap.gap_score}/10)")

        for mode in failure_modes[:3]:
            calc = mode.get("calculation", {})
            risks.append(
                f"{mode['mode'].replace('_', ' ').title()}: "
                f"{int(mode['probability']*100)}% probability within {mode['timeline']} "
                f"[{calc.get('formula', '')}]"
            )

        return risks
```

### Success Criteria:

#### Automated Verification:
- [ ] Unit test passes: `pytest backend/tests/test_gap_analyzer.py`
- [ ] Can process QUBT sample data and return valid assessment
- [ ] Gap scores are in 0-10 range

#### Manual Verification:
- [ ] QUBT analysis returns gap score > 8 (matching simulation)
- [ ] Failure modes correctly identify "promotional_stock" pattern
- [ ] Valuation signal returns "OVERVALUED" for QUBT

---

## Phase 4: Report Generation & API

### Overview
Build the FastAPI endpoints and report generation logic.

### Changes Required:

#### 1. Report Generator

**File**: `backend/app/services/report_generator.py`

```python
"""
Generates formatted reports from gap analysis.
"""
from typing import Dict
from datetime import datetime
from app.services.gap_analyzer import OverallAssessment, GapAnalysis

class ReportGenerator:

    def generate_report(
        self,
        ticker: str,
        assessment: OverallAssessment,
        company_info: Dict
    ) -> Dict:
        """Generate full report as structured JSON."""

        return {
            "meta": {
                "ticker": ticker,
                "company_name": company_info.get("name", ticker),
                "generated_at": datetime.utcnow().isoformat(),
                "version": "1.0"
            },
            "summary": {
                "gap_score": round(assessment.aggregate_gap_score, 1),
                "signal": assessment.signal,
                "current_price": assessment.current_price,
                "fair_value": assessment.fair_value,
                "mispricing_percent": assessment.mispricing_percent
            },
            "gaps": [
                {
                    "term": gap.term,
                    "promise": gap.promise_claim,
                    "reality": gap.reality_finding,
                    "gap_score": round(gap.gap_score, 1),
                    "gap_type": gap.gap_type,
                    "risk_category": gap.risk_category
                }
                for gap in assessment.key_gaps
            ],
            "risk_factors": assessment.risk_factors,
            "failure_modes": assessment.failure_modes,
            "valuation": {
                "current_ps_ratio": company_info.get("ps_ratio"),
                "sector_median_ps": company_info.get("sector_median_ps"),
                "gap_discount": f"{(assessment.aggregate_gap_score / 10) * 30:.1f}%",
                "adjusted_ps": company_info.get("sector_median_ps", 10) * (1 - (assessment.aggregate_gap_score / 10) * 0.30)
            }
        }

    def format_text_report(self, report: Dict) -> str:
        """Format report as readable text (for display)."""
        lines = [
            "═" * 65,
            f"SEMANTIC GAP ALERT: {report['meta']['ticker']} ({report['meta']['company_name']})",
            f"Generated: {report['meta']['generated_at'][:10]}",
            "═" * 65,
            "",
            f"⚠️  SIGNAL: {report['summary']['signal']}",
            "",
            f"Gap Score:        {report['summary']['gap_score']} / 10",
            f"Current Price:    ${report['summary']['current_price']:.2f}",
            f"Fair Value:       ${report['summary']['fair_value']:.2f}",
            f"Implied Move:     {report['summary']['mispricing_percent']:+.1f}%",
            "",
            "─" * 65,
            "KEY FINDINGS",
            "─" * 65,
            ""
        ]

        for gap in report["gaps"]:
            status = "❌" if gap["gap_score"] >= 7 else "⚠️" if gap["gap_score"] >= 5 else "✓"
            lines.extend([
                f'{status} "{gap["term"]}" - {gap["gap_type"].upper().replace("_", " ")}',
                f'   Promise: {gap["promise"]}',
                f'   Reality: {gap["reality"]}',
                f'   Gap: {gap["gap_score"]}/10',
                ""
            ])

        lines.extend([
            "─" * 65,
            "RISK FACTORS",
            "─" * 65,
            ""
        ])

        for risk in report["risk_factors"]:
            lines.append(f"• {risk}")

        lines.append("")
        lines.append("═" * 65)

        return "\n".join(lines)
```

#### 2. FastAPI Main App

**File**: `backend/app/main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import os

from app.routers import report, stock
from app.db.database import init_db

app = FastAPI(
    title="Lacuna API",
    description="Semantic Gap Stock Analyzer",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://lacuna.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router, prefix="/api/report", tags=["reports"])
app.include_router(stock.router, prefix="/api/stock", tags=["stock"])

@app.on_event("startup")
async def startup():
    await init_db()

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

#### 3. Report Router

**File**: `backend/app/routers/report.py`

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import Optional

from app.services.data_fetcher import DataFetcher
from app.services.graph_extractor import GraphExtractor
from app.services.gap_analyzer import GapAnalyzer
from app.services.report_generator import ReportGenerator
from app.db.database import get_db
from app.db.models import Report, Prediction
import os

router = APIRouter()

data_fetcher = DataFetcher()
graph_extractor = GraphExtractor(api_key=os.getenv("OPENAI_API_KEY"))
gap_analyzer = GapAnalyzer(api_key=os.getenv("OPENAI_API_KEY"))
report_generator = ReportGenerator()

REPORT_COOLDOWN_DAYS = 7


@router.get("/{ticker}")
async def get_report(ticker: str):
    """Get most recent report for ticker."""
    ticker = ticker.upper()

    async with get_db() as db:
        report = await db.execute(
            "SELECT * FROM reports WHERE ticker = ? ORDER BY generated_at DESC LIMIT 1",
            (ticker,)
        )
        row = await report.fetchone()

        if row:
            return {
                "ticker": ticker,
                "report": json.loads(row["report_json"]),
                "generated_at": row["generated_at"],
                "can_regenerate": _can_regenerate(row["generated_at"])
            }

    raise HTTPException(status_code=404, detail=f"No report found for {ticker}")


@router.post("/generate/{ticker}")
async def generate_report(ticker: str, force: bool = False):
    """Generate new report for ticker (respects 7-day cooldown)."""
    ticker = ticker.upper()

    # Check cooldown
    async with get_db() as db:
        existing = await db.execute(
            "SELECT generated_at FROM reports WHERE ticker = ? ORDER BY generated_at DESC LIMIT 1",
            (ticker,)
        )
        row = await existing.fetchone()

        if row and not force and not _can_regenerate(row["generated_at"]):
            days_remaining = REPORT_COOLDOWN_DAYS - (datetime.utcnow() - datetime.fromisoformat(row["generated_at"])).days
            raise HTTPException(
                status_code=429,
                detail=f"Report cooldown active. {days_remaining} days until next generation allowed."
            )

    # Fetch data
    stock_data = await data_fetcher.get_stock_data(ticker)
    sec_filings = await data_fetcher.get_sec_filings(ticker)

    # Combine filing text
    filing_text = "\n\n".join(filter(None, sec_filings.values()))

    # For marketing, we'd scrape company website (simplified here)
    marketing_text = sec_filings.get("S-1", "") or sec_filings.get("10-K", "")

    # Extract graphs
    promise_triplets = await graph_extractor.extract_promise_graph(marketing_text)
    capability_triplets = await graph_extractor.extract_capability_graph(filing_text)

    # Analyze gaps
    company_info = {
        "current_price": stock_data["info"]["current_price"],
        "ps_ratio": stock_data["info"]["ps_ratio"],
        "sector_median_ps": _get_sector_median_ps(stock_data["info"]["sector"]),
        "name": ticker  # Would fetch actual name
    }

    assessment = await gap_analyzer.analyze_gaps(
        promise_triplets,
        capability_triplets,
        company_info
    )

    # Generate report
    report = report_generator.generate_report(ticker, assessment, company_info)

    # Save to database
    async with get_db() as db:
        await db.execute(
            """INSERT INTO reports (ticker, generated_at, gap_score, signal, fair_value, current_price, report_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                ticker,
                datetime.utcnow().isoformat(),
                assessment.aggregate_gap_score,
                assessment.signal,
                assessment.fair_value,
                assessment.current_price,
                json.dumps(report)
            )
        )

        # Also save as prediction for chart markers
        await db.execute(
            """INSERT INTO predictions (ticker, prediction_date, gap_score, signal, predicted_downside, price_at_prediction)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                ticker,
                datetime.utcnow().isoformat(),
                assessment.aggregate_gap_score,
                assessment.signal,
                assessment.mispricing_percent,
                assessment.current_price
            )
        )

        await db.commit()

    return {
        "ticker": ticker,
        "report": report,
        "generated_at": datetime.utcnow().isoformat()
    }


def _can_regenerate(generated_at: str) -> bool:
    """Check if cooldown has passed."""
    gen_date = datetime.fromisoformat(generated_at)
    return datetime.utcnow() - gen_date > timedelta(days=REPORT_COOLDOWN_DAYS)


def _get_sector_median_ps(sector: str) -> float:
    """Return sector median P/S ratio."""
    # Simplified - would use actual data
    sector_medians = {
        "Technology": 8.0,
        "Consumer Cyclical": 2.5,
        "Healthcare": 5.0,
        "Financial Services": 3.0,
    }
    return sector_medians.get(sector, 5.0)
```

### Success Criteria:

#### Automated Verification:
- [ ] `uvicorn app.main:app --reload` starts without errors
- [ ] `curl http://localhost:8000/health` returns healthy
- [ ] API tests pass: `pytest backend/tests/test_api.py`

#### Manual Verification:
- [ ] POST `/api/report/generate/QUBT` returns full report
- [ ] GET `/api/report/QUBT` returns cached report
- [ ] Second POST within 7 days returns 429 error
- [ ] Report JSON matches expected structure

---

## Phase 5: Frontend - Ticker Input & Report Display

### Overview
Build the Next.js frontend with ticker input and report display.

### Changes Required:

#### 1. Main Page with Ticker Input

**File**: `frontend/app/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');

    try {
      // First check if report exists
      const checkRes = await fetch(`/api/report/${ticker.toUpperCase()}`);

      if (checkRes.ok) {
        // Report exists, navigate to it
        router.push(`/report/${ticker.toUpperCase()}`);
      } else if (checkRes.status === 404) {
        // No report, generate one
        const genRes = await fetch(`/api/report/generate/${ticker.toUpperCase()}`, {
          method: 'POST'
        });

        if (genRes.ok) {
          router.push(`/report/${ticker.toUpperCase()}`);
        } else {
          const data = await genRes.json();
          setError(data.detail || 'Failed to generate report');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-amber-500">
            Lacuna
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Semantic Gap Stock Analyzer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter stock ticker (e.g., QUBT)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-center text-xl tracking-wider"
              maxLength={5}
            />
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </form>

          <div className="mt-6 text-center text-zinc-500 text-sm">
            <p>Detects semantic gaps between marketing promises</p>
            <p>and operational reality in SEC filings.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
```

#### 2. Report Page

**File**: `frontend/app/report/[ticker]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StockChart from '@/components/StockChart';
import GapTable from '@/components/GapTable';
import RiskFactors from '@/components/RiskFactors';
import ValuationBreakdown from '@/components/ValuationBreakdown';

interface ValuationStep {
  formula: string;
  values: string;
  result: number;
  interpretation: string;
}

interface ValuationCalculation {
  step_1_gap_discount: ValuationStep;
  step_2_gap_multiplier: ValuationStep;
  step_3_adjusted_ps: ValuationStep;
  step_4_fair_value: ValuationStep;
  step_5_signal: {
    current_vs_fair: string;
    ratio: number;
    thresholds: string;
    result: string;
  };
  parameters_used: {
    gap_discount_max: number;
    sector_median_ps: number;
    overvalued_threshold: number;
    undervalued_threshold: number;
    source: string;
  };
}

interface Report {
  meta: { ticker: string; company_name: string; generated_at: string };
  summary: { gap_score: number; signal: string; current_price: number; fair_value: number; mispricing_percent: number };
  gaps: Array<{ term: string; promise: string; reality: string; gap_score: number; gap_type: string }>;
  risk_factors: string[];
  failure_modes: Array<{ mode: string; probability: number; timeline: string; calculation?: { formula: string } }>;
  valuation_calculation?: ValuationCalculation;
}

export default function ReportPage() {
  const params = useParams();
  const ticker = params.ticker as string;

  const [report, setReport] = useState<Report | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchReport();
    fetchPredictions();
  }, [ticker]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/report/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setCanRegenerate(data.can_regenerate);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    const res = await fetch(`/api/stock/${ticker}/predictions`);
    if (res.ok) {
      const data = await res.json();
      setPredictions(data.predictions);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/report/generate/${ticker}`, { method: 'POST' });
      if (res.ok) {
        await fetchReport();
        await fetchPredictions();
      }
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  }

  if (!report) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Report not found</div>;
  }

  const signalColor = {
    'OVERVALUED': 'bg-red-600',
    'UNDERVALUED': 'bg-green-600',
    'FAIR': 'bg-zinc-600'
  }[report.summary.signal] || 'bg-zinc-600';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-500">{ticker}</h1>
            <p className="text-zinc-500">Generated: {report.meta.generated_at.slice(0, 10)}</p>
          </div>
          <Badge className={`${signalColor} text-lg px-4 py-2`}>
            {report.summary.signal}
          </Badge>
        </div>

        {/* Summary Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-zinc-500 text-sm">Gap Score</p>
                <p className="text-2xl font-bold text-amber-500">{report.summary.gap_score}/10</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Current Price</p>
                <p className="text-2xl font-mono">${report.summary.current_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Fair Value</p>
                <p className="text-2xl font-mono">${report.summary.fair_value.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-sm">Mispricing</p>
                <p className={`text-2xl font-mono ${report.summary.mispricing_percent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {report.summary.mispricing_percent > 0 ? '+' : ''}{report.summary.mispricing_percent.toFixed(1)}%
                </p>
              </div>
              <div>
                <Button
                  onClick={handleRegenerate}
                  disabled={!canRegenerate || regenerating}
                  variant="outline"
                  className="border-zinc-700"
                >
                  {regenerating ? 'Generating...' : canRegenerate ? 'Regenerate' : '7-day cooldown'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valuation Calculation Breakdown */}
        {report.valuation_calculation && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-zinc-300">Valuation Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <ValuationBreakdown calculation={report.valuation_calculation} />
            </CardContent>
          </Card>
        )}

        {/* Stock Chart with Prediction Markers */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-300">Price History & Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <StockChart ticker={ticker} predictions={predictions} />
          </CardContent>
        </Card>

        {/* Gap Analysis Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-300">Semantic Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <GapTable gaps={report.gaps} />
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-300">Risk Factors & Failure Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskFactors
              riskFactors={report.risk_factors}
              failureModes={report.failure_modes}
            />
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
```

### Success Criteria:

#### Automated Verification:
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] TypeScript compilation succeeds

#### Manual Verification:
- [ ] Home page renders with ticker input
- [ ] Entering "QUBT" navigates to report page
- [ ] Report displays all sections correctly
- [ ] Regenerate button respects 7-day cooldown

---

## Phase 6: Stock Chart with Prediction Markers

### Overview
Implement the interactive stock chart with historical prediction markers.

### Changes Required:

#### 1. Stock Chart Component

**File**: `frontend/components/StockChart.tsx`

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts';

interface Prediction {
  prediction_date: string;
  gap_score: number;
  signal: string;
  predicted_downside: number;
  price_at_prediction: number;
  actual_outcome?: string;
}

interface StockChartProps {
  ticker: string;
  predictions: Prediction[];
}

export default function StockChart({ ticker, predictions }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    fetchStockHistory();
  }, [ticker]);

  const fetchStockHistory = async () => {
    const res = await fetch(`/api/stock/${ticker}/history`);
    if (res.ok) {
      const data = await res.json();
      setChartData(data.history);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#18181b' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#3f3f46',
      },
      rightPriceScale: {
        borderColor: '#3f3f46',
      },
    });

    // Main price line
    const lineSeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
    });

    lineSeries.setData(
      chartData.map((d: any) => ({
        time: d.date,
        value: d.close,
      }))
    );

    // Add prediction markers
    const markers = predictions.map((pred) => {
      const color = pred.signal === 'OVERVALUED' ? '#ef4444' :
                    pred.signal === 'UNDERVALUED' ? '#22c55e' : '#a1a1aa';
      return {
        time: pred.prediction_date.slice(0, 10),
        position: 'aboveBar' as const,
        color: color,
        shape: 'circle' as const,
        text: `Gap: ${pred.gap_score.toFixed(1)}`,
        size: 2,
      };
    });

    lineSeries.setMarkers(markers);

    // Click handler for markers
    chart.subscribeClick((param) => {
      if (param.time) {
        const clickedPred = predictions.find(
          (p) => p.prediction_date.slice(0, 10) === param.time
        );
        if (clickedPred) {
          setSelectedPrediction(clickedPred);
        }
      }
    });

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData, predictions]);

  return (
    <div className="space-y-4">
      <div ref={chartContainerRef} className="w-full" />

      {/* Prediction detail popup */}
      {selectedPrediction && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-sm">
                Prediction from {selectedPrediction.prediction_date.slice(0, 10)}
              </p>
              <p className="text-xl font-bold">
                <span className={
                  selectedPrediction.signal === 'OVERVALUED' ? 'text-red-400' :
                  selectedPrediction.signal === 'UNDERVALUED' ? 'text-green-400' : 'text-zinc-400'
                }>
                  {selectedPrediction.signal}
                </span>
              </p>
            </div>
            <button
              onClick={() => setSelectedPrediction(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-zinc-500">Gap Score</p>
              <p className="text-amber-500 font-mono">{selectedPrediction.gap_score.toFixed(1)}/10</p>
            </div>
            <div>
              <p className="text-zinc-500">Price at Prediction</p>
              <p className="font-mono">${selectedPrediction.price_at_prediction.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Predicted Move</p>
              <p className={`font-mono ${selectedPrediction.predicted_downside > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {selectedPrediction.predicted_downside > 0 ? '+' : ''}{selectedPrediction.predicted_downside.toFixed(1)}%
              </p>
            </div>
          </div>
          {selectedPrediction.actual_outcome && (
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <p className="text-zinc-500 text-sm">Outcome (90 days later)</p>
              <p className={
                selectedPrediction.actual_outcome === 'CORRECT' ? 'text-green-400' : 'text-red-400'
              }>
                {selectedPrediction.actual_outcome}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Overvalued Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Undervalued Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-zinc-500"></span>
          <span>Fair Value Signal</span>
        </div>
      </div>
    </div>
  );
}
```

#### 2. Stock History API Route

**File**: `frontend/app/api/stock/[ticker]/history/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    const res = await fetch(`${BACKEND_URL}/api/stock/${ticker}/history`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
}
```

#### 3. Predictions API Route

**File**: `frontend/app/api/stock/[ticker]/predictions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    const res = await fetch(`${BACKEND_URL}/api/stock/${ticker}/predictions`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Chart component renders without errors
- [ ] TypeScript types are correct
- [ ] API routes return valid data

#### Manual Verification:
- [ ] Stock chart displays 2-year price history
- [ ] Prediction markers appear at correct dates
- [ ] Clicking a marker shows prediction details
- [ ] Marker colors match signal type (red/green/gray)

---

## Phase 7: Supporting Components & Polish

### Overview
Build remaining UI components and add polish.

### Changes Required:

#### 1. Gap Table Component

**File**: `frontend/components/GapTable.tsx`

```tsx
interface Gap {
  term: string;
  promise: string;
  reality: string;
  gap_score: number;
  gap_type: string;
}

export default function GapTable({ gaps }: { gaps: Gap[] }) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-green-400';
  };

  const getIcon = (score: number) => {
    if (score >= 7) return '❌';
    if (score >= 5) return '⚠️';
    return '✓';
  };

  return (
    <div className="space-y-4">
      {gaps.map((gap, idx) => (
        <div key={idx} className="border border-zinc-800 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span>{getIcon(gap.gap_score)}</span>
              <span className="font-semibold text-zinc-200">"{gap.term}"</span>
              <span className="text-xs text-zinc-500 uppercase bg-zinc-800 px-2 py-1 rounded">
                {gap.gap_type.replace(/_/g, ' ')}
              </span>
            </div>
            <span className={`font-mono font-bold ${getScoreColor(gap.gap_score)}`}>
              {gap.gap_score.toFixed(1)}/10
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 mb-1">Promise</p>
              <p className="text-zinc-300">{gap.promise}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Reality</p>
              <p className="text-zinc-300">{gap.reality}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 2. Risk Factors Component

**File**: `frontend/components/RiskFactors.tsx`

```tsx
interface FailureMode {
  mode: string;
  probability: number;
  timeline: string;
  expected_outcomes?: string[];
}

interface RiskFactorsProps {
  riskFactors: string[];
  failureModes: FailureMode[];
}

export default function RiskFactors({ riskFactors, failureModes }: RiskFactorsProps) {
  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return 'bg-red-600';
    if (prob >= 0.5) return 'bg-amber-600';
    return 'bg-zinc-600';
  };

  return (
    <div className="space-y-6">
      {/* Risk Factors List */}
      <div>
        <h4 className="text-zinc-400 text-sm uppercase mb-3">Risk Factors</h4>
        <ul className="space-y-2">
          {riskFactors.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2 text-zinc-300">
              <span className="text-amber-500">•</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Failure Modes */}
      {failureModes.length > 0 && (
        <div>
          <h4 className="text-zinc-400 text-sm uppercase mb-3">Predicted Failure Modes</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {failureModes.map((mode, idx) => (
              <div key={idx} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-zinc-200">
                    {mode.mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getProbabilityColor(mode.probability)}`}>
                    {(mode.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">Timeline: {mode.timeline}</p>
                {mode.expected_outcomes && (
                  <div className="mt-2">
                    <p className="text-zinc-500 text-xs">Expected outcomes:</p>
                    <p className="text-zinc-400 text-sm">
                      {mode.expected_outcomes.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:
- [ ] All components render without errors
- [ ] Full build succeeds: `npm run build`

#### Manual Verification:
- [ ] Gap table displays all gaps with correct formatting
- [ ] Risk factors display with proper styling
- [ ] Failure modes show probability badges
- [ ] Overall UI is cohesive and readable

---

## Phase 8: Deployment & Testing

### Overview
Deploy the application and perform end-to-end testing.

### Changes Required:

#### 1. Docker Configuration

**File**: `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Environment Configuration

**File**: `backend/.env.example`

```
OPENAI_API_KEY=sk-...
DATABASE_URL=sqlite:///./lacuna.db
```

**File**: `frontend/.env.example`

```
BACKEND_URL=http://localhost:8000
```

#### 3. End-to-End Test

**File**: `backend/tests/e2e/test_full_flow.py`

```python
import pytest
import httpx

BASE_URL = "http://localhost:8000"

@pytest.mark.asyncio
async def test_full_report_generation():
    async with httpx.AsyncClient() as client:
        # Generate report for QUBT
        res = await client.post(f"{BASE_URL}/api/report/generate/QUBT")
        assert res.status_code == 200

        data = res.json()
        assert "report" in data
        assert data["report"]["summary"]["gap_score"] >= 0
        assert data["report"]["summary"]["signal"] in ["OVERVALUED", "UNDERVALUED", "FAIR"]

        # Verify prediction was saved
        pred_res = await client.get(f"{BASE_URL}/api/stock/QUBT/predictions")
        assert pred_res.status_code == 200
        predictions = pred_res.json()["predictions"]
        assert len(predictions) > 0
```

### Success Criteria:

#### Automated Verification:
- [ ] Docker build succeeds
- [ ] E2E tests pass
- [ ] Health check returns 200

#### Manual Verification:
- [ ] Deploy to staging environment
- [ ] Generate report for QUBT
- [ ] Generate report for DASH
- [ ] Verify stock charts load
- [ ] Verify prediction markers appear
- [ ] Verify 7-day cooldown works

---

## Phase 9: Parameter Calibration (Learn from Historical Data)

### Overview
Train model parameters using **linear regression** on historical data from ~50 companies with known outcomes. This approach provides:
- **Interpretable coefficients**: Each gap point → X% expected return impact
- **Statistical significance**: p-values and confidence intervals
- **Transparent methodology**: Users can see the learned relationships

### Calibration Methodology

```
Model: expected_return_90d = α + β₁(gap_score) + β₂(log_ps_ratio) + Σβₛ(sector_dummy) + ε

Where:
- β₁ = gap coefficient (expected: negative, ~-2% to -4% per gap point)
- β₂ = valuation coefficient (expected: negative for high P/S)
- βₛ = sector-specific intercept adjustments

Derived parameters:
- gap_discount_max = |β₁| × 10  (max discount for gap score of 10)
- Thresholds set at 1.5 standard deviations from predicted return
```

### Changes Required:

#### 1. Calibration Service (Regression-Based)

**File**: `backend/app/services/calibration_service.py`

```python
"""
Parameter calibration service using linear regression.
Learns interpretable coefficients for gap scores and valuation metrics.
"""
import numpy as np
import pandas as pd
import statsmodels.api as sm
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

from app.db.database import get_db
from app.services.config_service import config_service

@dataclass
class RegressionCoefficient:
    """A single learned coefficient with statistical context."""
    name: str
    value: float
    std_error: float
    t_statistic: float
    p_value: float
    conf_int_low: float
    conf_int_high: float

    @property
    def is_significant(self) -> bool:
        """Significant at 95% confidence level."""
        return self.p_value < 0.05

    def interpretation(self) -> str:
        """Human-readable interpretation."""
        if self.name == "gap_score":
            return f"Each 1-point increase in gap score → {self.value:.2f}% change in 90-day return (p={self.p_value:.4f})"
        elif self.name == "log_ps_ratio":
            return f"Each 1-unit increase in log(P/S) → {self.value:.2f}% change in 90-day return (p={self.p_value:.4f})"
        else:
            return f"{self.name}: {self.value:.2f} (p={self.p_value:.4f})"


@dataclass
class CalibrationResult:
    """Full calibration output with regression results."""
    # Learned coefficients
    gap_coefficient: RegressionCoefficient
    ps_ratio_coefficient: RegressionCoefficient
    sector_coefficients: Dict[str, RegressionCoefficient]
    intercept: float

    # Derived trading parameters
    gap_discount_max: float  # |gap_coefficient| × 10
    overvalued_threshold: float
    undervalued_threshold: float

    # Model quality metrics
    r_squared: float
    adjusted_r_squared: float
    f_statistic: float
    f_pvalue: float

    # Validation metrics
    validation_rmse: float
    validation_mae: float
    directional_accuracy: float  # % of correct direction predictions

    # Sample info
    training_samples: int
    validation_samples: int

    def model_equation(self) -> str:
        """Return the learned model as a readable equation."""
        equation = f"Expected Return = {self.intercept:.2f}"
        equation += f" + ({self.gap_coefficient.value:.2f} × gap_score)"
        equation += f" + ({self.ps_ratio_coefficient.value:.2f} × log_ps_ratio)"
        for sector, coef in self.sector_coefficients.items():
            if coef.value != 0:
                equation += f" + ({coef.value:.2f} × is_{sector})"
        return equation


class CalibrationService:
    """
    Learns gap-to-return relationships via OLS regression.

    Key insight: Instead of black-box optimization, we directly model
    the relationship between semantic gaps and stock returns, giving us
    interpretable, testable coefficients.
    """

    def __init__(self):
        self.training_df: Optional[pd.DataFrame] = None
        self.validation_df: Optional[pd.DataFrame] = None
        self.model: Optional[sm.OLS] = None
        self.results: Optional[sm.regression.linear_model.RegressionResultsWrapper] = None

    async def load_training_data(self, min_samples: int = 50):
        """Load historical training data with known outcomes."""
        async with get_db() as db:
            cursor = await db.execute("""
                SELECT ticker, analysis_date, gap_score,
                       price_at_analysis, sector, ps_ratio_at_analysis,
                       actual_return_90d, short_report_occurred,
                       lawsuit_occurred, regulatory_action_occurred
                FROM training_data
                WHERE actual_return_90d IS NOT NULL
                  AND gap_score IS NOT NULL
                  AND ps_ratio_at_analysis IS NOT NULL
                  AND ps_ratio_at_analysis > 0
                ORDER BY analysis_date DESC
            """)
            rows = await cursor.fetchall()

            if len(rows) < min_samples:
                raise ValueError(f"Need at least {min_samples} samples, found {len(rows)}")

            # Convert to DataFrame
            df = pd.DataFrame([dict(r) for r in rows])

            # Feature engineering
            df['log_ps_ratio'] = np.log(df['ps_ratio_at_analysis'])

            # Create sector dummies (drop first to avoid multicollinearity)
            sector_dummies = pd.get_dummies(df['sector'], prefix='sector', drop_first=True)
            df = pd.concat([df, sector_dummies], axis=1)

            # 80/20 train/validation split (time-based to avoid leakage)
            split_idx = int(len(df) * 0.8)
            self.training_df = df.iloc[:split_idx].copy()
            self.validation_df = df.iloc[split_idx:].copy()

            return len(self.training_df), len(self.validation_df)

    def _get_feature_columns(self, df: pd.DataFrame) -> List[str]:
        """Get feature columns for regression."""
        base_features = ['gap_score', 'log_ps_ratio']
        sector_cols = [c for c in df.columns if c.startswith('sector_')]
        return base_features + sector_cols

    async def calibrate(self) -> CalibrationResult:
        """
        Run OLS regression to learn gap coefficients.

        Returns interpretable coefficients with statistical significance.
        """
        train_n, val_n = await self.load_training_data()

        # Prepare features
        feature_cols = self._get_feature_columns(self.training_df)
        X_train = self.training_df[feature_cols]
        X_train = sm.add_constant(X_train)  # Add intercept
        y_train = self.training_df['actual_return_90d']

        # Fit OLS regression
        self.model = sm.OLS(y_train, X_train)
        self.results = self.model.fit()

        # Extract coefficients with statistics
        gap_coef = self._extract_coefficient('gap_score')
        ps_coef = self._extract_coefficient('log_ps_ratio')

        # Sector coefficients
        sector_coefs = {}
        for col in feature_cols:
            if col.startswith('sector_'):
                sector_name = col.replace('sector_', '')
                sector_coefs[sector_name] = self._extract_coefficient(col)

        # Derive trading parameters from coefficients
        # gap_discount_max: if gap_coefficient = -3.2, then gap of 10 → -32% return
        # We convert this to a discount factor for fair value calculation
        gap_discount_max = min(0.5, abs(gap_coef.value) * 10 / 100)  # Cap at 50%

        # Thresholds: set at 1.5 standard deviations from mean predicted return
        y_pred_train = self.results.predict(X_train)
        residual_std = np.std(y_train - y_pred_train)

        # Overvalued threshold: predict return < -1.5σ below mean
        # Undervalued threshold: predict return > +1.5σ above mean
        mean_return = y_train.mean()
        overvalued_threshold = 1.0 + (1.5 * residual_std / 100)  # Convert to price ratio
        undervalued_threshold = 1.0 - (1.5 * residual_std / 100)

        # Validate on held-out data
        val_metrics = self._validate()

        return CalibrationResult(
            gap_coefficient=gap_coef,
            ps_ratio_coefficient=ps_coef,
            sector_coefficients=sector_coefs,
            intercept=self.results.params.get('const', 0),
            gap_discount_max=gap_discount_max,
            overvalued_threshold=overvalued_threshold,
            undervalued_threshold=undervalued_threshold,
            r_squared=self.results.rsquared,
            adjusted_r_squared=self.results.rsquared_adj,
            f_statistic=self.results.fvalue,
            f_pvalue=self.results.f_pvalue,
            validation_rmse=val_metrics['rmse'],
            validation_mae=val_metrics['mae'],
            directional_accuracy=val_metrics['directional_accuracy'],
            training_samples=train_n,
            validation_samples=val_n
        )

    def _extract_coefficient(self, name: str) -> RegressionCoefficient:
        """Extract a coefficient with full statistical context."""
        idx = list(self.results.params.index).index(name) if name in self.results.params.index else None

        if idx is None:
            return RegressionCoefficient(
                name=name, value=0, std_error=0, t_statistic=0,
                p_value=1.0, conf_int_low=0, conf_int_high=0
            )

        conf_int = self.results.conf_int().loc[name]

        return RegressionCoefficient(
            name=name,
            value=self.results.params[name],
            std_error=self.results.bse[name],
            t_statistic=self.results.tvalues[name],
            p_value=self.results.pvalues[name],
            conf_int_low=conf_int[0],
            conf_int_high=conf_int[1]
        )

    def _validate(self) -> Dict[str, float]:
        """Validate model on held-out data."""
        feature_cols = self._get_feature_columns(self.validation_df)
        X_val = self.validation_df[feature_cols]
        X_val = sm.add_constant(X_val)
        y_val = self.validation_df['actual_return_90d']

        y_pred = self.results.predict(X_val)

        # Metrics
        residuals = y_val - y_pred
        rmse = np.sqrt(np.mean(residuals ** 2))
        mae = np.mean(np.abs(residuals))

        # Directional accuracy: did we predict the correct sign?
        correct_direction = np.sum(np.sign(y_pred) == np.sign(y_val))
        directional_accuracy = correct_direction / len(y_val)

        return {
            'rmse': rmse,
            'mae': mae,
            'directional_accuracy': directional_accuracy
        }

    def predict_return(self, gap_score: float, ps_ratio: float, sector: str) -> Dict:
        """
        Predict expected return for a new company.
        Returns prediction with confidence interval.
        """
        if self.results is None:
            raise ValueError("Model not calibrated. Run calibrate() first.")

        # Build feature vector
        features = {
            'const': 1,
            'gap_score': gap_score,
            'log_ps_ratio': np.log(ps_ratio)
        }

        # Add sector dummies
        for col in self._get_feature_columns(self.training_df):
            if col.startswith('sector_'):
                sector_name = col.replace('sector_', '')
                features[col] = 1 if sector == sector_name else 0

        X = pd.DataFrame([features])

        # Prediction with confidence interval
        prediction = self.results.get_prediction(X)
        pred_summary = prediction.summary_frame(alpha=0.05)

        return {
            'expected_return': pred_summary['mean'].values[0],
            'conf_int_low': pred_summary['obs_ci_lower'].values[0],
            'conf_int_high': pred_summary['obs_ci_upper'].values[0],
            'interpretation': self._interpret_prediction(
                pred_summary['mean'].values[0],
                gap_score,
                ps_ratio
            )
        }

    def _interpret_prediction(self, expected_return: float, gap_score: float, ps_ratio: float) -> str:
        """Generate human-readable interpretation of prediction."""
        gap_contribution = self.results.params['gap_score'] * gap_score
        ps_contribution = self.results.params['log_ps_ratio'] * np.log(ps_ratio)

        parts = []
        parts.append(f"Expected 90-day return: {expected_return:.1f}%")
        parts.append(f"  - Gap score ({gap_score:.1f}) contributes: {gap_contribution:.1f}%")
        parts.append(f"  - P/S ratio ({ps_ratio:.1f}) contributes: {ps_contribution:.1f}%")

        return "\n".join(parts)

    async def save_calibration(self, result: CalibrationResult):
        """Save calibration results to database and update active config."""
        async with get_db() as db:
            # Insert calibration run with full coefficient data
            await db.execute("""
                INSERT INTO calibration_runs (
                    run_date, training_samples, validation_samples,
                    gap_coefficient, gap_coefficient_pvalue,
                    ps_coefficient, ps_coefficient_pvalue,
                    r_squared, adjusted_r_squared, f_statistic, f_pvalue,
                    validation_rmse, validation_mae, directional_accuracy,
                    gap_discount_max, overvalued_threshold, undervalued_threshold,
                    full_results_json, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                datetime.utcnow().isoformat(),
                result.training_samples,
                result.validation_samples,
                result.gap_coefficient.value,
                result.gap_coefficient.p_value,
                result.ps_ratio_coefficient.value,
                result.ps_ratio_coefficient.p_value,
                result.r_squared,
                result.adjusted_r_squared,
                result.f_statistic,
                result.f_pvalue,
                result.validation_rmse,
                result.validation_mae,
                result.directional_accuracy,
                result.gap_discount_max,
                result.overvalued_threshold,
                result.undervalued_threshold,
                json.dumps({
                    'model_equation': result.model_equation(),
                    'gap_interpretation': result.gap_coefficient.interpretation(),
                    'sector_coefficients': {
                        k: {'value': v.value, 'p_value': v.p_value}
                        for k, v in result.sector_coefficients.items()
                    }
                })
            ))

            # Deactivate previous calibrations
            await db.execute("""
                UPDATE calibration_runs SET is_active = 0
                WHERE run_date < (SELECT MAX(run_date) FROM calibration_runs)
            """)

            # Update global config with learned values
            await db.execute(
                "UPDATE config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'gap_discount_max'",
                (str(result.gap_discount_max),)
            )
            await db.execute(
                "UPDATE config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'overvalued_threshold'",
                (str(result.overvalued_threshold),)
            )
            await db.execute(
                "UPDATE config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'undervalued_threshold'",
                (str(result.undervalued_threshold),)
            )
            await db.execute(
                "UPDATE config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'gap_coefficient'",
                (str(result.gap_coefficient.value),)
            )

            await db.commit()

        # Refresh config cache
        await config_service.refresh_cache()


# Singleton
calibration_service = CalibrationService()
```

#### 2. Updated Database Schema for Calibration

**Add to schema in Phase 1:**

```sql
-- Calibration runs with regression results
CREATE TABLE calibration_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    training_samples INTEGER,
    validation_samples INTEGER,

    -- Learned coefficients
    gap_coefficient REAL NOT NULL,        -- β₁: gap_score coefficient
    gap_coefficient_pvalue REAL,          -- statistical significance
    ps_coefficient REAL,                  -- β₂: log(P/S) coefficient
    ps_coefficient_pvalue REAL,

    -- Model quality
    r_squared REAL,
    adjusted_r_squared REAL,
    f_statistic REAL,
    f_pvalue REAL,

    -- Validation metrics
    validation_rmse REAL,
    validation_mae REAL,
    directional_accuracy REAL,            -- % correct direction predictions

    -- Derived trading parameters
    gap_discount_max REAL,
    overvalued_threshold REAL,
    undervalued_threshold REAL,

    -- Full results (JSON blob for detailed analysis)
    full_results_json TEXT,

    is_active BOOLEAN DEFAULT 0
);
```

#### 3. Training Data Collection Script

**File**: `backend/scripts/collect_training_data.py`

```python
"""
Script to collect training data from historical companies.
Run this to build the dataset before calibration.

Usage:
    python -m scripts.collect_training_data
"""
import asyncio
import yfinance as yf
from datetime import datetime, timedelta
from app.db.database import get_db, init_db
import os

# Companies to analyze (mix of known good and bad outcomes)
TRAINING_TICKERS = [
    # Known overpromisers / crashes (high gap expected)
    "QUBT", "NKLA", "RIDE", "WKHS", "HYLN",  # EV/Tech hype
    "SPCE", "JOBY", "ACHR",  # Aviation hype
    "HOOD", "SOFI",  # Fintech volatility

    # Gig economy (moderate gaps)
    "UBER", "LYFT", "DASH",

    # Solid companies (low gap expected)
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",

    # B2B SaaS (mixed)
    "CRM", "NOW", "SNOW", "PLTR", "MDB",

    # Healthcare
    "TDOC", "HIMS", "DOCS",

    # EV (high variance)
    "RIVN", "LCID", "FSR",

    # Quantum (very high gap expected)
    "IONQ", "RGTI",

    # Add more to reach 50+
    "ZM", "DOCU", "PTON", "BYND", "CRWD", "NET", "DDOG",
    "PATH", "U", "RBLX", "ABNB", "COIN",
]

async def collect_single(ticker: str, analysis_date: datetime) -> dict:
    """Collect data for a single ticker at a point in time."""
    try:
        stock = yf.Ticker(ticker)

        # Get historical prices
        start_date = analysis_date - timedelta(days=30)
        end_date = analysis_date + timedelta(days=200)
        hist = stock.history(start=start_date, end=end_date)

        if len(hist) < 100:
            print(f"Insufficient history for {ticker}")
            return None

        # Price at analysis date
        analysis_prices = hist.loc[hist.index <= analysis_date]
        if len(analysis_prices) == 0:
            return None
        price_at_analysis = analysis_prices.iloc[-1]["Close"]

        # Future prices
        future = hist.loc[hist.index > analysis_date]
        price_30d = future.iloc[20]["Close"] if len(future) > 20 else None
        price_90d = future.iloc[60]["Close"] if len(future) > 60 else None
        price_180d = future.iloc[120]["Close"] if len(future) > 120 else None

        # Calculate returns
        def calc_return(future_price):
            if future_price and price_at_analysis:
                return ((future_price - price_at_analysis) / price_at_analysis) * 100
            return None

        # Get company info
        info = stock.info
        sector = info.get("sector", "Technology")
        ps_ratio = info.get("priceToSalesTrailing12Months")

        if not ps_ratio or ps_ratio <= 0:
            print(f"No valid P/S ratio for {ticker}")
            return None

        # Estimate gap score (heuristic for bootstrapping)
        # In production, this would come from actual gap analysis
        gap_score = estimate_gap_score(ticker, info)

        return {
            "ticker": ticker,
            "analysis_date": analysis_date.strftime("%Y-%m-%d"),
            "gap_score": gap_score,
            "price_at_analysis": price_at_analysis,
            "sector": sector,
            "ps_ratio_at_analysis": ps_ratio,
            "price_after_30_days": price_30d,
            "price_after_90_days": price_90d,
            "price_after_180_days": price_180d,
            "actual_return_30d": calc_return(price_30d),
            "actual_return_90d": calc_return(price_90d),
            "actual_return_180d": calc_return(price_180d),
        }

    except Exception as e:
        print(f"Error collecting {ticker}: {e}")
        return None


def estimate_gap_score(ticker: str, info: dict) -> float:
    """
    Estimate gap score from available signals.

    This is a bootstrap heuristic. Once we have real gap analysis
    running, we replace these estimates with actual scores.

    Signals used:
    - P/S ratio (high = potential overpromise)
    - Profit margins (negative = gap between promise and delivery)
    - Revenue scale (small revenue + high valuation = gap)
    - Industry (some sectors prone to hype)
    """
    score = 5.0  # Start neutral

    ps = info.get("priceToSalesTrailing12Months", 0)
    revenue = info.get("totalRevenue", 0)
    profit_margin = info.get("profitMargins", 0)
    industry = info.get("industry", "").lower()

    # High P/S with low revenue = classic overpromise pattern
    if ps > 50:
        score += 2.5
    elif ps > 20:
        score += 1.5
    elif ps > 10:
        score += 0.5

    # Small revenue with any meaningful valuation
    if revenue and revenue < 100_000_000:  # <$100M
        score += 1.0

    # Deep losses suggest gap between promise and current capability
    if profit_margin and profit_margin < -0.5:  # >50% loss margin
        score += 1.5
    elif profit_margin and profit_margin < -0.2:
        score += 0.5

    # Industry-specific adjustments (based on historical hype patterns)
    hype_industries = ["quantum", "space", "ev ", "electric vehicle", "cannabis", "crypto"]
    if any(x in industry for x in hype_industries):
        score += 1.5

    moderate_hype = ["software", "saas", "cloud"]
    if any(x in industry for x in moderate_hype) and ps > 15:
        score += 0.5

    # Known specific tickers (from our QUBT analysis etc)
    high_gap_tickers = ["QUBT", "NKLA", "RIDE", "SPCE", "IONQ", "RGTI"]
    if ticker in high_gap_tickers:
        score += 2.0

    return min(10.0, max(0.0, score))


async def main():
    await init_db()

    # Multiple analysis dates to increase sample size
    analysis_dates = [
        datetime(2024, 1, 15),
        datetime(2024, 4, 15),
        datetime(2024, 7, 15),
    ]

    collected = 0
    async with get_db() as db:
        for ticker in TRAINING_TICKERS:
            for date in analysis_dates:
                data = await collect_single(ticker, date)
                if data and data.get("actual_return_90d") is not None:
                    await db.execute("""
                        INSERT OR REPLACE INTO training_data (
                            ticker, analysis_date, gap_score, price_at_analysis,
                            sector, ps_ratio_at_analysis,
                            price_after_30_days, price_after_90_days, price_after_180_days,
                            actual_return_30d, actual_return_90d, actual_return_180d
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        data["ticker"], data["analysis_date"], data["gap_score"],
                        data["price_at_analysis"], data["sector"], data["ps_ratio_at_analysis"],
                        data["price_after_30_days"], data["price_after_90_days"], data["price_after_180_days"],
                        data["actual_return_30d"], data["actual_return_90d"], data["actual_return_180d"]
                    ))
                    collected += 1
                    print(f"✓ {ticker} @ {date.date()}: gap={data['gap_score']:.1f}, return_90d={data['actual_return_90d']:.1f}%")

        await db.commit()

    print(f"\nCollected {collected} samples")


if __name__ == "__main__":
    asyncio.run(main())
```

#### 4. Calibration API Endpoint

**File**: `backend/app/routers/calibration.py`

```python
from fastapi import APIRouter, HTTPException
from app.services.calibration_service import calibration_service
from app.db.database import get_db

router = APIRouter()

@router.post("/run")
async def run_calibration():
    """
    Run regression-based parameter calibration.

    Returns learned coefficients with statistical significance
    and model quality metrics.
    """
    try:
        result = await calibration_service.calibrate()
        await calibration_service.save_calibration(result)

        return {
            "status": "success",
            "model": {
                "equation": result.model_equation(),
                "r_squared": round(result.r_squared, 4),
                "adjusted_r_squared": round(result.adjusted_r_squared, 4),
            },
            "coefficients": {
                "gap_score": {
                    "value": round(result.gap_coefficient.value, 4),
                    "p_value": round(result.gap_coefficient.p_value, 4),
                    "significant": result.gap_coefficient.is_significant,
                    "interpretation": result.gap_coefficient.interpretation(),
                    "confidence_interval": [
                        round(result.gap_coefficient.conf_int_low, 4),
                        round(result.gap_coefficient.conf_int_high, 4)
                    ]
                },
                "log_ps_ratio": {
                    "value": round(result.ps_ratio_coefficient.value, 4),
                    "p_value": round(result.ps_ratio_coefficient.p_value, 4),
                    "significant": result.ps_ratio_coefficient.is_significant,
                    "interpretation": result.ps_ratio_coefficient.interpretation(),
                }
            },
            "derived_parameters": {
                "gap_discount_max": round(result.gap_discount_max, 4),
                "overvalued_threshold": round(result.overvalued_threshold, 4),
                "undervalued_threshold": round(result.undervalued_threshold, 4),
            },
            "validation": {
                "rmse": round(result.validation_rmse, 2),
                "mae": round(result.validation_mae, 2),
                "directional_accuracy": f"{result.directional_accuracy * 100:.1f}%",
            },
            "samples": {
                "training": result.training_samples,
                "validation": result.validation_samples,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def get_calibration_history():
    """Get history of calibration runs with their coefficients."""
    async with get_db() as db:
        cursor = await db.execute("""
            SELECT id, run_date, training_samples, validation_samples,
                   gap_coefficient, gap_coefficient_pvalue,
                   ps_coefficient, ps_coefficient_pvalue,
                   r_squared, directional_accuracy,
                   gap_discount_max, is_active
            FROM calibration_runs
            ORDER BY run_date DESC
            LIMIT 10
        """)
        rows = await cursor.fetchall()
        return {
            "calibrations": [
                {
                    **dict(r),
                    "gap_significant": r["gap_coefficient_pvalue"] < 0.05 if r["gap_coefficient_pvalue"] else False
                }
                for r in rows
            ]
        }


@router.get("/current")
async def get_current_params():
    """Get current active parameters with their source."""
    from app.services.config_service import config_service

    # Get the active calibration run
    async with get_db() as db:
        cursor = await db.execute("""
            SELECT * FROM calibration_runs WHERE is_active = 1 ORDER BY run_date DESC LIMIT 1
        """)
        active_run = await cursor.fetchone()

    params = {
        "gap_discount_max": await config_service.get("gap_discount_max"),
        "gap_coefficient": await config_service.get("gap_coefficient"),
        "overvalued_threshold": await config_service.get("overvalued_threshold"),
        "undervalued_threshold": await config_service.get("undervalued_threshold"),
    }

    if active_run:
        params["calibration_info"] = {
            "run_date": active_run["run_date"],
            "r_squared": active_run["r_squared"],
            "gap_coefficient_pvalue": active_run["gap_coefficient_pvalue"],
            "directional_accuracy": active_run["directional_accuracy"],
        }

    return params


@router.post("/predict")
async def predict_return(gap_score: float, ps_ratio: float, sector: str = "Technology"):
    """
    Predict expected return for given inputs using the calibrated model.

    Useful for understanding model behavior and debugging.
    """
    try:
        # Ensure model is loaded
        if calibration_service.results is None:
            await calibration_service.load_training_data()
            await calibration_service.calibrate()

        prediction = calibration_service.predict_return(gap_score, ps_ratio, sector)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 5. Update GapAnalyzer to Use Regression Prediction

**Add to `gap_analyzer.py`:**

```python
async def _calculate_valuation(self, gap_score: float, company_info: Dict) -> Dict:
    """
    Calculate gap-adjusted valuation using learned regression coefficients.
    """
    current_price = company_info.get("current_price", 0)
    ps_ratio = company_info.get("ps_ratio", 0)
    sector = company_info.get("sector", "Technology")

    if not current_price or not ps_ratio:
        return {"signal": "INSUFFICIENT_DATA", "fair_value": 0, ...}

    # Get learned coefficient from calibration
    gap_coefficient = await self.config.get("gap_coefficient", -2.5)  # Default if not calibrated
    gap_discount_max = await self.config.get("gap_discount_max", 0.25)
    overvalued_threshold = await self.config.get("overvalued_threshold", 1.15)
    undervalued_threshold = await self.config.get("undervalued_threshold", 0.85)
    sector_median_ps = await self.config.get_sector_ps(sector)

    # Method 1: Direct return prediction (if calibration service available)
    # expected_return = gap_coefficient * gap_score + ps_coefficient * log(ps_ratio) + ...

    # Method 2: Gap-adjusted fair value (simpler, used in reports)
    gap_discount = (gap_score / 10) * gap_discount_max
    gap_multiplier = 1 - gap_discount
    adjusted_ps = sector_median_ps * gap_multiplier
    revenue_per_share = current_price / ps_ratio if ps_ratio > 0 else 0
    fair_value = revenue_per_share * adjusted_ps

    # Signal determination
    if current_price > fair_value * overvalued_threshold:
        signal = "OVERVALUED"
    elif current_price < fair_value * undervalued_threshold:
        signal = "UNDERVALUED"
    else:
        signal = "FAIR"

    mispricing = ((current_price - fair_value) / fair_value * 100) if fair_value > 0 else 0

    return {
        "signal": signal,
        "fair_value": round(fair_value, 2),
        "current_price": current_price,
        "mispricing": round(mispricing, 1),
        "calculation": {
            "method": "regression-calibrated",
            "gap_coefficient_used": gap_coefficient,
            "gap_discount_applied": f"{gap_discount * 100:.1f}%",
            "interpretation": f"Gap score of {gap_score} implies {gap_coefficient * gap_score:.1f}% expected return impact",
            "parameters_source": "learned from historical data via OLS regression"
        }
    }
```

### Success Criteria:

#### Automated Verification:
- [ ] Training data collection script runs without errors
- [ ] Calibration completes and returns valid regression results
- [ ] Gap coefficient is statistically significant (p < 0.05)
- [ ] Gap coefficient is negative (higher gaps → lower returns)
- [ ] R² > 0.1 (model explains some variance)
- [ ] Parameters saved to database

#### Manual Verification:
- [ ] Gap coefficient interpretation makes sense (e.g., "-2.8% per gap point")
- [ ] Directional accuracy on validation set > 55%
- [ ] Running `/api/calibration/predict` returns sensible predictions
- [ ] Report calculations show "regression-calibrated" source

### Example Output:

```json
{
  "status": "success",
  "model": {
    "equation": "Expected Return = 12.34 + (-2.87 × gap_score) + (-8.23 × log_ps_ratio) + ...",
    "r_squared": 0.2341
  },
  "coefficients": {
    "gap_score": {
      "value": -2.87,
      "p_value": 0.0023,
      "significant": true,
      "interpretation": "Each 1-point increase in gap score → -2.87% change in 90-day return",
      "confidence_interval": [-4.12, -1.62]
    }
  },
  "derived_parameters": {
    "gap_discount_max": 0.287,
    "overvalued_threshold": 1.18,
    "undervalued_threshold": 0.82
  }
}
```

This tells us: **"A company with gap score 9 is expected to underperform by ~26% over 90 days, all else equal."**

---

## Testing Strategy

### Unit Tests
- Data fetcher: Mock yfinance and SEC EDGAR responses
- Graph extractor: Test with sample text, verify triplet format
- Gap analyzer: Test scoring logic with known inputs
- Report generator: Verify JSON structure

### Integration Tests
- Full pipeline: Data fetch → extraction → analysis → report
- Database: Verify report caching and cooldown logic
- API: Test all endpoints with valid and invalid inputs

### Manual Testing
1. Generate report for QUBT, verify matches simulated output
2. Generate report for DASH, verify gig economy gaps detected
3. Test chart interaction (zoom, markers, popup)
4. Test cooldown enforcement
5. Test with invalid ticker

---

## References

- ai-knowledge-graph: https://github.com/robert-mcdermott/ai-knowledge-graph
- SEC EDGAR: https://www.sec.gov/edgar
- yfinance: https://github.com/ranaroussi/yfinance
- Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- Semantic Gap Thesis: `src/pages/field-notes/on-tech-debt-and-market-failure.md`
- QUBT Analysis: Conversation simulation (January 2026)
