# Lacuna: Semantic Gap Trading Thesis

**Author:** Jin Hong Kuan
**Date:** January 2026
**Version:** 1.0

---

## Executive Summary

Lacuna exploits a systematic mispricing pattern in public equities: companies that control the vocabulary used to describe their value proposition create "semantic gaps" between marketing promises and operational reality. These gaps are predictive of future stock underperformance.

---

## Core Intuition

### The Semantic Gap

When a company claims "partnership with NASA" but the contract is worth $26,000, or promises "quantum advantage" without peer-reviewed validation, they exercise what we term **inferential monopoly**—controlling how stakeholders interpret key terms.

This creates measurable divergence between:
- **Promise Graph**: Claims extracted from investor presentations, press releases, marketing
- **Capability Graph**: Facts from SEC filings, technical documentation, financial statements

### Why It Predicts Returns

1. **Information asymmetry**: Retail investors rely on marketing; institutional investors dig into filings
2. **Correction catalyst**: Short reports, earnings misses, and lawsuits expose gaps
3. **Mean reversion**: Valuation eventually reflects operational reality

---

## Calibration Method

### Model Specification

We regress 90-day forward returns against gap scores and valuation metrics:

$$
R_{90d} = \alpha + \beta_1 \cdot \text{GapScore} + \beta_2 \cdot \log(\text{P/S}) + \sum_s \beta_s \cdot \text{Sector}_s + \varepsilon
$$

Where:
- $R_{90d}$ = 90-day stock return (%)
- $\text{GapScore}$ = Semantic gap score (0-10 scale)
- $\text{P/S}$ = Price-to-Sales ratio
- $\text{Sector}_s$ = Sector dummy variables

### Coefficient Interpretation

| Coefficient | Expected Sign | Interpretation |
|-------------|---------------|----------------|
| $\beta_1$ (gap) | Negative | Each +1 gap point → X% lower return |
| $\beta_2$ (P/S) | Negative | Higher valuation → lower forward returns |

### Derived Trading Parameters

From the learned $\beta_1$:

$$
\text{GapDiscount}_{\max} = \frac{|\beta_1| \times 10}{100}
$$

**Example:** If $\beta_1 = -2.87$, then a gap score of 10 implies 28.7% expected underperformance, yielding $\text{GapDiscount}_{\max} = 0.287$.

### Signal Generation

$$
\text{FairValue} = \frac{\text{Price}}{\text{P/S}} \times \text{SectorMedianP/S} \times (1 - \text{GapDiscount})
$$

| Condition | Signal |
|-----------|--------|
| $\text{Price} > 1.15 \times \text{FairValue}$ | OVERVALUED |
| $\text{Price} < 0.85 \times \text{FairValue}$ | UNDERVALUED |
| Otherwise | FAIR |

---

## Data Sources

| Source | Purpose |
|--------|---------|
| SEC EDGAR | 10-K, 10-Q, S-1 filings (capability graph) |
| Company IR | Press releases, investor decks (promise graph) |
| yfinance | Stock prices, P/S ratios, sector classification |
| LLM (GPT-4) | Knowledge graph extraction via SPO triplets |

---

## Validation: QUBT Case Study

**Quantum Computing Inc. (QUBT)** — analyzed January 2026

| Metric | Finding |
|--------|---------|
| Gap Score | 9.2 / 10 |
| Signal | EXTREME OVERVALUATION |
| Key Gaps | "NASA partnership" = $26K contract; "quantum advantage" unverified |

**Subsequent Events (within 90 days):**
- Stock declined 80% from December peak
- Multiple short seller reports published
- Securities lawsuits filed

**Outcome:** Correctly predicted directional move and failure mode.

---

## Risk Factors

1. **Model risk**: Regression coefficients may not be stable across market regimes
2. **Data quality**: Gap scores depend on LLM extraction accuracy
3. **Timing risk**: Gaps can persist longer than expected before correction
4. **Liquidity risk**: Many high-gap companies are small-cap with wide spreads

---

## Implementation Notes

- **Holding period**: 1-4 quarters (allows gap to materialize)
- **Position sizing**: Inverse to gap score confidence interval width
- **Universe**: Focus on small/mid-cap with P/S > 10 and limited analyst coverage
- **Rebalancing**: Re-score quarterly as new filings become available

---

## Statistical Requirements

Before deploying:
- Gap coefficient ($\beta_1$) must be significant at $p < 0.05$
- Model $R^2 > 0.10$ (explains meaningful variance)
- Directional accuracy on validation set $> 55\%$
- Sharpe ratio on backtest $> 0.5$

---

## Appendix: Gap Score Components

The LLM-derived gap score aggregates divergence across key terms:

| Gap Type | Description | Weight |
|----------|-------------|--------|
| Unverified Claim | Promise without evidence | High |
| Inferential Monopoly | Controlling term definitions | High |
| Partnership Exaggeration | Overstating business relationships | Medium |
| Revenue Disconnect | Claimed value vs. actual revenue | High |
| Definitional Control | Redefining industry terms | Medium |

---

*This document outlines a research thesis. Past performance does not guarantee future results. Not investment advice.*
