# When Burning Is Not Enough

**Negative Fundamental Value, Evolutionary Games, and Self-Fulfilling Prophecies in the Avalanche Ecosystem**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

Research grant proposal submitted to the **Avalanche Foundation Research Grant Program — Area 1: Cryptoasset Pricing and Valuation** (May 2026).

We propose the **MV4E2** model (Model of Value by Evolutionary Equilibrium with Endogenous Expectations), which integrates:
1. **Rent dissipation** — token issuance as inflationary tax on validators
2. **Evolutionary games** — validator strategy dynamics with multiple equilibria
3. **Self-referential expectations** — price anchored on social contagion, not fundamentals

**Key finding:** Avalanche's current emission rate (~1.5% annual) sits at the upper boundary of a *Sustained Self-Referential Expectation Equilibrium (SSREE)* band where price exceeds net fundamental value (NFV). At the critical contagion threshold Ω* ≈ 0.58, this equilibrium collapses.

## Repository Structure

```
Avax_Research/
├── README.md              # This file
├── LICENSE                # MIT License
├── Makefile               # Build automation
├── requirements.txt       # Python dependencies
├── .gitignore             # Git ignore rules
├── proposal/              # LaTeX proposal document
│   ├── proposal.tex       # Main proposal (submit-ready)
│   └── figures/           # Generated figures (via src/)
├── src/                   # Source code
│   ├── mv4e2_simulation.py  # Agent-based simulation engine
│   └── mv4e2_notebook.ipynb # Reproducible research notebook
├── data/                  # Generated simulation data
│   ├── fig1_data.csv      # Emission Instability Frontier
│   ├── fig2_data.csv      # SSREE Phase Diagram
│   └── params.json        # Estimated critical parameters
├── literature/            # Reference papers and notes
└── docs/                  # Supporting documentation
```

## Reproduction

```bash
# Install dependencies
pip install -r requirements.txt

# Generate all simulation data
python3 src/mv4e2_simulation.py

# Compile the proposal PDF
cd proposal && pdflatex proposal.tex

# Or use the Makefile
make all
```

## Model

### Rent Dissipation
$$R_i(t) = S_i(t) - C_i(t) - \delta(E(t), N(t))$$

### Self-Referential Expectation Equilibrium
$$P^e(t+1) = \alpha P(t) + (1-\alpha)\,\kappa\,\Omega(t)$$

### Evolutionary Dynamics
$$\frac{ds_k}{dt} = s_k[\pi(s_k, \mathbf{s}_{-k}) - \bar{\phi}(t)]$$

## Key Parameters

| Parameter | Estimate | Description |
|-----------|----------|-------------|
| Critical emission $E^*$ | 1.3% | NFV becomes negative above this |
| Critical contagion $\Omega^*$ | 0.58 | SREE collapses below this |
| SREE band | 0.5%–1.5% | Price > NFV within this range |
| Current emission | ~1.5% | At upper SREE boundary (risk zone) |

## Author

**Jhuomar Boskoll Quintero** — Independent Scholar, Panama City, Panama  
jhuomar3105@gmail.com | [github.com/Quantumquirkz](https://github.com/Quantumquirkz)

## References

- Burniske, C. (2017). Cryptoasset Valuations.
- Chen, A. (2025). Post-Halving Security Contraction in Bitcoin. *J. Cryptoeconomics*.
- Hardin, G. (1968). The Tragedy of the Commons. *Science*, 162, 1243–1248.
- Samuelson, L. (2016). *Evolutionary Games and Equilibrium Selection*. MIT Press.
- Shiller, R. (2019). *Narrative Economics*. Princeton Univ. Press.
- Team Rocket et al. (2019). Snowflake to Avalanche. arXiv:1906.08936.

---

*Submitted to the Avalanche Foundation Research Grant Program — May 2026*
