import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.widgets import Slider, Button
from matplotlib.animation import FuncAnimation

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
    """Get the prime factors of a number n, sorted descending."""
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
    factors.sort(reverse=True)
    return factors

# --- Main Logic: Generate Coordinates and the Full Path ---

def generate_full_path(limit):
    """
    Generates coordinates for each number and a single, continuous,
    interpolated path tracing the trajectory from 1 to the limit.
    """
    primes_list = get_primes(limit)
    prime_to_index = {prime: i + 1 for i, prime in enumerate(primes_list)}

    # Store the final coordinate for each number
    coordinates = {1: (0, 0, 0)}
    # The full path is a list of interpolated points for smooth animation
    full_path = [(0, 0, 0)]
    
    # Store indices where each number's path segment ends
    number_end_indices = {1: 0}

    for n in range(2, limit + 1):
        last_point = coordinates[n - 1]
        
        factors = get_prime_factors(n, primes_list)
        
        # Determine the new coordinate based on prime indices
        if len(factors) == 1:
            coord = (prime_to_index[n], 0, 0)
        elif len(factors) == 2:
            coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], 0)
        elif len(factors) == 3:
            coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], prime_to_index[factors[2]])
        else: # Higher dimensions are folded back into 3D
            x = prime_to_index.get(factors[0], 0)
            y = prime_to_index.get(factors[1], 0)
            z = prime_to_index.get(factors[2], 0)
            for i in range(3, len(factors)):
                p_idx = prime_to_index.get(factors[i], 1)
                if i % 3 == 0: x += p_idx
                if i % 3 == 1: y += p_idx
                if i % 3 == 2: z += p_idx
            coord = (x, y, z)

        coordinates[n] = coord
        
        # Interpolate for a smooth path
        num_steps = 10
        for i in range(1, num_steps + 1):
            t = i / num_steps
            interpolated_point = (
                last_point[0] * (1 - t) + coord[0] * t,
                last_point[1] * (1 - t) + coord[1] * t,
                last_point[2] * (1 - t) + coord[2] * t
            )
            full_path.append(interpolated_point)
        
        number_end_indices[n] = len(full_path) - 1
            
    return full_path, number_end_indices

# --- Plotting and Interactive Controls ---

LIMIT = 200
path_points, number_end_indices = generate_full_path(LIMIT)

# Setup the plot
plt.style.use('dark_background')
fig = plt.figure(figsize=(16, 12))
ax = fig.add_subplot(111, projection='3d')
plt.subplots_adjust(bottom=0.25) # Make space for widgets

# Remove all axes, grid, and labels for a pure visualization
ax.set_axis_off()

# Create multiple line objects for different colored segments
x_axis_line, = ax.plot([], [], [], lw=2.5, color='red', alpha=0.8, label='X-axis path')
diagonal_line, = ax.plot([], [], [], lw=2.5, color='green', alpha=0.8, label='Diagonal path')
z_axis_line, = ax.plot([], [], [], lw=2.5, color='blue', alpha=0.8, label='Z-axis path')
other_line, = ax.plot([], [], [], lw=2.5, color='gold', alpha=0.8, label='Other path')

head, = ax.plot([], [], [], 'o', color='white', markersize=10)
corners, = ax.plot([], [], [], 'o', color='cyan', markersize=4, alpha=0.8)  # Small dots for corners
number_label = ax.text2D(0.05, 0.95, "", transform=ax.transAxes, color='white', fontsize=16)

# Add a legend
ax.legend(loc='upper right')

# Animation state
is_paused = True

# Function to draw the path up to a certain frame
def draw_path(frame_index):
    frame_index = int(frame_index)
    
    # Get all points up to the current frame
    points = path_points[:frame_index+1]
    
    # Separate points by their position characteristics
    x_axis_points = []
    diagonal_points = []
    z_axis_points = []
    other_points = []
    
    # Corner points for all turns
    corner_x = []
    corner_y = []
    corner_z = []
    
    # Check each point and categorize it
    for i, p in enumerate(points):
        x, y, z = p
        
        # Add corners at number endpoints
        if i > 0 and i < len(points) - 1:
            for num, idx in number_end_indices.items():
                if i == idx:
                    corner_x.append(x)
                    corner_y.append(y)
                    corner_z.append(z)
                    break
        
        # Categorize points based on their position
        if abs(y) < 0.1 and abs(z) < 0.1 and x > 0.1:  # On x-axis
            x_axis_points.append(p)
        elif abs(x - y) < 0.1 and abs(z) < 0.1 and x > 0.1 and y > 0.1:  # On 45-degree line (x=y)
            diagonal_points.append(p)
        elif abs(x) < 0.1 and abs(y) < 0.1 and z > 0.1:  # On z-axis
            z_axis_points.append(p)
        else:  # Other positions
            other_points.append(p)
    
    # Update the line objects with their respective points
    if x_axis_points:
        x_axis_x = [p[0] for p in x_axis_points]
        x_axis_y = [p[1] for p in x_axis_points]
        x_axis_z = [p[2] for p in x_axis_points]
        x_axis_line.set_data(x_axis_x, x_axis_y)
        x_axis_line.set_3d_properties(x_axis_z)
    else:
        x_axis_line.set_data([], [])
        x_axis_line.set_3d_properties([])
    
    if diagonal_points:
        diag_x = [p[0] for p in diagonal_points]
        diag_y = [p[1] for p in diagonal_points]
        diag_z = [p[2] for p in diagonal_points]
        diagonal_line.set_data(diag_x, diag_y)
        diagonal_line.set_3d_properties(diag_z)
    else:
        diagonal_line.set_data([], [])
        diagonal_line.set_3d_properties([])
    
    if z_axis_points:
        z_axis_x = [p[0] for p in z_axis_points]
        z_axis_y = [p[1] for p in z_axis_points]
        z_axis_z = [p[2] for p in z_axis_points]
        z_axis_line.set_data(z_axis_x, z_axis_y)
        z_axis_line.set_3d_properties(z_axis_z)
    else:
        z_axis_line.set_data([], [])
        z_axis_line.set_3d_properties([])
    
    if other_points:
        other_x = [p[0] for p in other_points]
        other_y = [p[1] for p in other_points]
        other_z = [p[2] for p in other_points]
        other_line.set_data(other_x, other_y)
        other_line.set_3d_properties(other_z)
    else:
        other_line.set_data([], [])
        other_line.set_3d_properties([])
    
    # Update the corners
    corners.set_data(corner_x, corner_y)
    corners.set_3d_properties(corner_z)
    
    # Update the head position
    if points:
        current_pos = points[-1]
        head.set_data([current_pos[0]], [current_pos[1]])
        head.set_3d_properties([current_pos[2]])
    
    # Update the number label
    current_number = slider_number.val
    number_label.set_text(f'Number: {current_number}')

    fig.canvas.draw_idle()

# Function to update the number slider based on the frame slider
def update_number_slider(frame_index):
    for num, end_idx in number_end_indices.items():
        if frame_index <= end_idx:
            slider_number.set_val(num)
            break

# --- UI Widgets ---

# Frame slider
ax_slider_frame = plt.axes([0.2, 0.1, 0.65, 0.03])
slider_frame = Slider(
    ax=ax_slider_frame,
    label='Path Evolution',
    valmin=0,
    valmax=len(path_points) - 1,
    valinit=0,
    color='cyan'
)
slider_frame.on_changed(draw_path)
slider_frame.on_changed(update_number_slider)


# Number slider (driven by the frame slider)
ax_slider_number = plt.axes([0.2, 0.05, 0.65, 0.03])
slider_number = Slider(
    ax=ax_slider_number,
    label='Current Number',
    valmin=1,
    valmax=LIMIT,
    valinit=1,
    valstep=1,
    color='magenta'
)

def update_frame_slider(number):
    number = int(number)
    if number in number_end_indices:
        frame_idx = number_end_indices[number]
        slider_frame.set_val(frame_idx)

slider_number.on_changed(update_frame_slider)


# Pause/Play button
ax_button = plt.axes([0.8, 0.15, 0.1, 0.04])
button = Button(ax_button, 'Play/Pause', color='gray', hovercolor='dimgray')

def toggle_pause(event):
    global is_paused
    is_paused = not is_paused
    if is_paused:
        button.label.set_text('Play')
    else:
        button.label.set_text('Pause')

button.on_clicked(toggle_pause)
fig.canvas.mpl_connect('key_press_event', lambda event: toggle_pause(event) if event.key == ' ' else None)


# Set initial plot limits based on the full path
all_x = [p[0] for p in path_points]
all_y = [p[1] for p in path_points]
all_z = [p[2] for p in path_points]
ax.set_xlim(min(all_x), max(all_x))
ax.set_ylim(min(all_y), max(all_y))
ax.set_zlim(min(all_z), max(all_z))

# Animation loop
def animate(i):
    if not is_paused:
        current_val = slider_frame.val
        if current_val < len(path_points) - 1:
            slider_frame.set_val(current_val + 1)
    return x_axis_line, diagonal_line, z_axis_line, other_line, head, corners

ani = FuncAnimation(fig, animate, blit=False, interval=1)

plt.show()