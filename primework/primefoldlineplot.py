import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

# Prime ticks (first 10 primes for x and y)
primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
squares = [p**2 for p in primes]

# Create 3D plot
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Axes labels
ax.set_xlabel('Prime X')
ax.set_ylabel('Prime Y')
ax.set_zlabel('Value (Z)')

# Plot prime ticks on X and Y axes at Z=0
for p in primes:
    ax.scatter(p, 0, 0, color='blue')  # X-axis
    ax.scatter(0, p, 0, color='red')   # Y-axis

# Plot prime^2 on Z-axis (diagonal interaction)
for p in primes:
    ax.scatter(p, p, p**2, color='green', s=60)

# Special composite (12 = 3 * 4, or 2^2 * 3) placed off-plane
ax.scatter(3, 4, 12, color='purple', s=100, marker='^', label='12 (Composite Off-Axis)')

# Simulate 2^3 = 8 going "normal" to the plane
ax.scatter(2, 2, 8, color='orange', s=80, marker='x', label='8 (2^3 - Normal Off-Diagonal)')

# Grid and legend
ax.grid(True)
ax.legend()

# Set axes limits
ax.set_xlim([0, 30])
ax.set_ylim([0, 30])
ax.set_zlim([0, 900])

plt.title("Prime Coordinate System with Composite Curvature")
plt.tight_layout()
plt.show()
