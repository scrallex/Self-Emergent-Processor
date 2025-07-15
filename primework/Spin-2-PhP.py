import numpy as np
import matplotlib.pyplot as plt

# Constants for Perihelion Precession
G = 6.67430e-11  # Gravitational constant
M_sun = 1.989e30  # Mass of the Sun (kg)
c = 3e8  # Speed of light in m/s

# Parameters for the orbit
a = 1.0  # Semi-major axis in AU (Astronomical Units)
e = 0.1  # Orbital eccentricity
m = 10**-6  # Mass of the spin-2 field (in units of H0)

# Define True Anomaly range (0 to 2pi, for one complete orbit)
true_anomaly = np.linspace(-np.pi, np.pi, 500)

# Placeholder for cumulative precession calculation
precession = np.zeros_like(true_anomaly)

# Simulate the precession effect in the presence of a spin-2 field
for i, anomaly in enumerate(true_anomaly):
    # Simplified model to add some precession effect (this can be more detailed)
    precession[i] = (m * np.cos(anomaly) * 1e-3)  # Placeholder precession equation

# Check for non-zero precession
print("First few precession values:", precession[:10])  # Debugging output

# Ensure that we have some variation in the precession
if np.all(precession == 0):
    print("Warning: No variation in precession. Check your model or parameters.")
else:
    print("Precession calculation completed. Values are being generated.")

# Plot the result
plt.figure(figsize=(10, 6))
plt.plot(true_anomaly, precession, label="Cumulative Precession")
plt.xlabel("True Anomaly (radians)")
plt.ylabel("Cumulative Precession (radians)")
plt.title("Perihelion Precession in the Presence of a Massive Spin-2 Field")
plt.legend()
plt.grid(True)
plt.show()
