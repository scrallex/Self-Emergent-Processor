import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.animation import FuncAnimation
import time

# --- Core Functions ---

def get_primes(n):
    """Generate prime numbers up to n."""
    primes = []
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, n + 1):
        if is_prime[i]:
            primes.append(i)
            for multiple in range(i * i, n + 1, i):
                is_prime[multiple] = False
    return primes

def get_prime_factors(n, primes_list):
    """Get the prime factors of a number n."""
    factors = []
    d = n
    for p in primes_list:
        if p * p > d:
            break
        while d % p == 0:
            factors.append(p)
            d //= p
    if d > 1:
        factors.append(d)
    return factors

# --- Main Logic: Generate the Cumulative Path ---

def generate_cumulative_path(limit):
    """
    Generates a single, continuous path tracing the trajectory from 1 to the limit.
    """
    primes_list = get_primes(limit)
    # Map each prime to its 1-based index (2 -> 1, 3 -> 2, 5 -> 3, etc.)
    prime_to_index = {prime: i + 1 for i, prime in enumerate(primes_list)}

    # Store the final coordinate for each number
    coordinates = {1: (0, 0, 0)}
    # The full path is a list of interpolated points for smooth animation
    full_path = [(0, 0, 0)]
    
    for n in range(2, limit + 1):
        last_point = coordinates[n - 1]
        
        factors = get_prime_factors(n, primes_list)
        
        # Sort factors descending to use largest prime for the "most real" axis
        factors.sort(reverse=True)
        
        # Determine the new coordinate based on prime indices
        if len(factors) == 1: # Prime Number
            coord = (prime_to_index[n], 0, 0)
        elif len(factors) == 2: # 2D Composite
            coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], 0)
        elif len(factors) == 3: # 3D Composite (or prime power like 2^3)
            coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], prime_to_index[factors[2]])
        else: # Higher dimensions are folded back into 3D for visualization
            x = prime_to_index.get(factors[0], 0)
            y = prime_to_index.get(factors[1], 0)
            z = prime_to_index.get(factors[2], 0)
            # Add influence from higher factors
            for i in range(3, len(factors)):
                p_idx = prime_to_index.get(factors[i], 1)
                if i % 3 == 0: x += p_idx
                if i % 3 == 1: y += p_idx
                if i % 3 == 2: z += p_idx
            coord = (x,y,z)

        coordinates[n] = coord
        
        # Interpolate points between the last point and the new coordinate for a smooth path
        num_steps = 20
        for i in range(1, num_steps + 1):
            t = i / num_steps
            interpolated_point = (
                last_point[0] * (1 - t) + coord[0] * t,
                last_point[1] * (1 - t) + coord[1] * t,
                last_point[2] * (1 - t) + coord[2] * t
            )
            full_path.append(interpolated_point)
            
    return full_path, prime_to_index, coordinates

# --- Plotting and Animation ---

LIMIT = 29
path_points, prime_to_index, final_coords = generate_cumulative_path(LIMIT)
index_to_prime = {v: k for k, v in prime_to_index.items()}

# Setup the plot
plt.style.use('dark_background')
fig = plt.figure(figsize=(16, 12))
ax = fig.add_subplot(111, projection='3d')

max_coord_val = max(max(p) for p in final_coords.values()) + 1
prime_indices_on_axis = sorted(prime_to_index.values())
prime_labels_on_axis = [index_to_prime.get(i, '') for i in prime_indices_on_axis]

# The line object that will be updated
line, = ax.plot([], [], [], lw=2, color='gold')
head, = ax.plot([], [], [], 'o', color='red', markersize=8)
tail_trace = []

# Function to initialize the plot
def init():
    # Set up axes and grid
    ax.set_xlabel("X (Prime Index)")
    ax.set_ylabel("Y (Prime Index)")
    ax.set_zlabel("Z (Recursive Dimension)")
    
    ax.set_xticks(prime_indices_on_axis)
    ax.set_yticks(prime_indices_on_axis)
    ax.set_zticks(prime_indices_on_axis)
    ax.set_xticklabels(prime_labels_on_axis, rotation=45)
    ax.set_yticklabels(prime_labels_on_axis)
    ax.set_zticklabels(prime_labels_on_axis)
    
    ax.set_xlim(0, max_coord_val)
    ax.set_ylim(0, max_coord_val)
    ax.set_zlim(0, max_coord_val)
    ax.grid(True, linestyle='--', alpha=0.1)
    ax.view_init(elev=30, azim=-60)
    line.set_data([], [])
    line.set_3d_properties([])
    head.set_data([], [])
    head.set_3d_properties([])
    return line, head

# Function to update the plot for each frame of the animation
def update(frame):
    # Determine the current number and its final coordinate
    current_number = 0
    for num, end_point in final_coords.items():
        if frame < len(path_points) and path_points[frame] == end_point:
            current_number = num
            break
    if frame == len(path_points) -1:
        current_number = LIMIT

    # Update the title
    ax.set_title(f"Prime-Recursive Trajectory | Tracing Path to: {current_number}", fontsize=16)
    
    # Update the line data
    x_data = [p[0] for p in path_points[:frame+1]]
    y_data = [p[1] for p in path_points[:frame+1]]
    z_data = [p[2] for p in path_points[:frame+1]]
    
    line.set_data(x_data, y_data)
    line.set_3d_properties(z_data)
    
    # Update the head (current position)
    head.set_data([path_points[frame][0]], [path_points[frame][1]])
    head.set_3d_properties([path_points[frame][2]])
    
    return line, head

# Create the animation
ani = FuncAnimation(fig, update, frames=len(path_points), init_func=init, blit=False, interval=10)

plt.tight_layout()
plt.show()