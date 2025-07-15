import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# Constants
H0 = 70.0  # Hubble constant in km/s/Mpc
Omega_m = 0.3  # Matter density
Omega_lambda = 0.7  # Dark energy density (cosmological constant)
m = 10**-6  # Spin-2 field mass (m/H0)

# Define the Friedmann equations with the Q-field
def friedmann(t, y, m, H0, Omega_m, Omega_lambda):
    a, lam, lam_dot = y  # a(t) = scale factor, lam(t) = spin-2 field, lam_dot = time derivative of lam

    # Hubble parameter (H(t)) = a' / a
    H = np.sqrt((H0**2) * (Omega_m / a**3 + Omega_lambda + (lam**2 / a**3)))

    # Lambda equation of motion
    lam_ddot = -3 * H * lam_dot - m**2 * lam + (3 * m**2 / a**2) * lam

    # Friedmann equations (modified)
    a_dot = a * H
    lam_dot_dot = lam_ddot

    return [a_dot, lam_dot, lam_dot_dot]

# Initial conditions
a0 = 1.0  # Initial scale factor (normalized to 1 at present time)
lam0 = 0.68  # Initial value for the Q-field (can be adjusted)
lam_dot0 = 0.0  # Initial derivative of Q-field

y0 = [a0, lam0, lam_dot0]  # Initial conditions vector

# Time array (in Gyr, from 0 to 13.8 billion years)
t_span = (0, 13.8)  # from the Big Bang to present time in Gyr
t_eval = np.linspace(t_span[0], t_span[1], 1000)

# Solve the system of equations
sol = solve_ivp(friedmann, t_span, y0, t_eval=t_eval, args=(m, H0, Omega_m, Omega_lambda), rtol=1e-6)

# Extract results
a = sol.y[0]  # Scale factor a(t)
lam = sol.y[1]  # Spin-2 field lambda(t)
lam_dot = sol.y[2]  # Time derivative of the spin-2 field

# Plot the evolution of the scale factor and lambda field
plt.figure(figsize=(12, 6))

# Plot scale factor evolution
plt.subplot(1, 2, 1)
plt.plot(sol.t, a, label='Scale factor a(t)')
plt.xlabel('Time (Gyr)')
plt.ylabel('Scale factor a(t)')
plt.title('Scale Factor Evolution')
plt.legend()

# Plot evolution of the spin-2 field
plt.subplot(1, 2, 2)
plt.plot(sol.t, lam, label=r'$\lambda(t)$ (Spin-2 field)', color='r')
plt.xlabel('Time (Gyr)')
plt.ylabel(r'$\lambda(t)$')
plt.title('Evolution of the Spin-2 Field')
plt.legend()

plt.tight_layout()
plt.show()
