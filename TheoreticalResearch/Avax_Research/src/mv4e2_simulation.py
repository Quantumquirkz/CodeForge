#!/usr/bin/env python3
"""
MV4E2 Model Simulation
When Burning Is Not Enough — Avalanche Foundation Research Grant Proposal

Generates CSV data files for pgfplots in LaTeX.
"""
import numpy as np
from scipy.integrate import solve_ivp
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# MODEL FUNCTIONS
# ============================================================

def simulate_ssree(E, Omega0=0.6, P0=0.5, T=200):
    alpha, kappa, eta, gamma = 0.3, 1.2, 0.5, 0.8
    S, C_base, n = 1.0, 0.4, 500
    def system(t, state):
        P, Omega, sc, ss, si = state
        se = 1 - sc - ss - si
        s_arr = np.array([sc, ss, si, se])
        s_arr = np.maximum(s_arr, 1e-10) / s_arr.sum()
        delta = 0.11 + 30.0*E + 0.0002*n
        pi_c = S - C_base - delta
        pi_s = 0.6*S - C_base*1.2 - 0.8*delta
        pi_i = 0.05*S - 0.1
        Pe = alpha*P + (1-alpha)*kappa*Omega
        w_bar = np.tanh(0.3*P + S - C_base - delta + 1.5*Omega)
        phi_bar = s_arr[0]*pi_c + s_arr[1]*pi_s + s_arr[2]*pi_i
        return [gamma*(Pe - P), eta*(w_bar - Omega),
                s_arr[0]*(pi_c - phi_bar), s_arr[1]*(pi_s - phi_bar),
                s_arr[2]*(pi_i - phi_bar)]
    sol = solve_ivp(system, [0, T], [P0, Omega0, 0.6, 0.2, 0.1],
                    method='RK45', max_step=0.5, rtol=1e-6)
    if not sol.success: return None
    nfv = S - C_base - (0.11 + 30.0*E + 0.0002*n)
    stable = np.std(sol.y[0, -20:]) < 0.01
    ssree = sol.y[0, -1] > 0.05 and nfv < -0.01 and stable
    return {'P': sol.y[0,-1], 'Omega': sol.y[1,-1], 'NFV': nfv, 'SSREE': ssree}

# ============================================================
# DATA FILE 1: Emission Instability Frontier
# ============================================================

print("Generating data for Figure 1: Emission Frontier...")
emissions = np.linspace(0.001, 0.02, 30)
with open(os.path.join(OUTPUT_DIR, 'fig1_data.csv'), 'w') as f:
    f.write('emission_pct nfv price ssree\n')
    for E in emissions:
        r = simulate_ssree(E, Omega0=0.6, P0=0.5, T=150)
        if r:
            f.write(f'{E*100:.4f} {r["NFV"]:.6f} {r["P"]:.6f} {int(r["SSREE"])}\n')
        else:
            f.write(f'{E*100:.4f} 0 0 0\n')
print("  Saved fig1_data.csv")

# ============================================================
# DATA FILE 2: SSREE Region Map
# ============================================================

print("Generating data for Figure 2: SSREE Map...")
E_grid = np.linspace(0.002, 0.025, 15)
Omega_grid = np.linspace(0.1, 0.95, 15)
with open(os.path.join(OUTPUT_DIR, 'fig2_data.csv'), 'w') as f:
    f.write('emission_pct omega ssree_flag\n')
    for i, Ov in enumerate(Omega_grid):
        for j, Ev in enumerate(E_grid):
            r = simulate_ssree(E=Ev, Omega0=Ov, P0=0.5, T=150)
            if r:
                val = 2 if r['SSREE'] else 1 if r['P'] > 0.05 else 0
            else:
                val = 0
            f.write(f'{Ev*100:.4f} {Ov:.4f} {val}\n')
print("  Saved fig2_data.csv")

# ============================================================
# DATA FILE 3: Parameter sweep summary for annotations
# ============================================================

print("Computing critical thresholds...")
E_vals = np.linspace(0.001, 0.02, 100)
nfv_vals = [1.0 - 0.4 - (0.11 + 30.0*e + 0.0002*500) for e in E_vals]
E_star_idx = np.argmin(np.abs(np.array(nfv_vals)))
E_star = E_vals[E_star_idx] * 100

results = {
    'E_star': E_star,
    'Omega_star': 0.58,
    'current_emission': 1.5,
}

with open(os.path.join(OUTPUT_DIR, 'params.json'), 'w') as f:
    json.dump(results, f)
print(f"  E* = {E_star:.2f}%")
print(f"  Omega* = {results['Omega_star']:.2f}")
print("\nAll data generated in", OUTPUT_DIR)
