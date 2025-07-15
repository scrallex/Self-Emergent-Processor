import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# Constants
m = 10**-6  # Mass of the spin-2 field (in units of H0)
G = 6.67430e-11  # Gravitational constant
c = 3e8  # Speed of light in m/s

# Equation of motion for gravitational waves (massive graviton)
def gw_propagation(t, y, m):
    # y[0] is the amplitude h(t), y[1] is the derivative of h(t)
    h, h_dot = y

    # The equation of motion for a massive spin-2 field
    h_ddot = -m**2 * h  # Equation with mass term (modifies the wave propagation)

    return [h_dot, h_ddot]

# Initial conditions
h0 = 1e-21  # Initial amplitude (small value)
h_dot0 = 0  # Initial derivative of amplitude (at rest)

y0 = [h0, h_dot0]

# Time span for the integration (in seconds)
t_span = (0, 1e6)  # Adjust as necessary for the simulation
t_eval = np.linspace(t_span[0], t_span[1], 1000)

# Solve the equation
sol = solve_ivp(gw_propagation, t_span, y0, t_eval=t_eval, args=(m,))

# Plot the result
plt.figure(figsize=(10, 6))
plt.plot(sol.t, sol.y[0], label="Gravitational Wave Amplitude $h(t)$")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.title("Gravitational Wave Propagation with Massive Spin-2 Field")
plt.legend()
plt.show()
