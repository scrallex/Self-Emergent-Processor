import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# Constants
G = 6.67430e-11  # Gravitational constant in m^3 kg^-1 s^-2
m = 1e-5         # Mass of the spin-2 field (in appropriate units, kg)
rho_c = 1e-2     # Background energy density (arbitrary, set to a small value for simplicity)

# Friedmann equations for the FLRW metric (simplified)
def friedmann(t, y):
    a, adot = y
    # Energy density of the massive spin-2 field (simplified)
    T00 = 1/2 * (adot**2 - m**2 * a**2) + rho_c  # Energy density, including cosmological constant term
    Tij = T00  # Assume isotropic pressure for simplicity

    # Friedmann equation (in simplified form)
    dda = -G * T00 * a  # Simplified acceleration term based on energy density

    # Return derivatives
    return [adot, dda]

# Initial conditions
a0 = 1.0  # Initial scale factor (start at present day, a(t=0) = 1)
adot0 = 0.0  # Initial velocity of the scale factor (static at t=0)
y0 = [a0, adot0]

# Time span for the solution
t_span = (0, 1e10)  # Time range from t=0 to t=1e10 years
t_eval = np.linspace(0, 1e10, 1000)  # Time points where we want the solution

# Solve the system of equations
sol = solve_ivp(friedmann, t_span, y0, t_eval=t_eval)

# Plot the results
plt.figure(figsize=(8, 6))
plt.plot(sol.t, sol.y[0], label="Scale Factor a(t)")
plt.xlabel("Time (s)")
plt.ylabel("Scale Factor a(t)")
plt.title("Evolution of the Universe with a Massive Spin-2 Field")
plt.grid(True)
plt.legend()
plt.show()
