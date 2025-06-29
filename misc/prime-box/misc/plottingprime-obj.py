import numpy as np
import os
import time
import sys

# --- Core Functions ---

def get_primes(n):
    """Generate prime numbers up to n."""
    print(f"Generating primes up to {n}...")
    primes = []
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, n + 1):
        if is_prime[i]:
            primes.append(i)
            for multiple in range(i * i, n + 1, i):
                is_prime[multiple] = False
    print(f"Found {len(primes)} prime numbers")
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

def generate_full_path(limit):
    """
    Generates coordinates for each number and a single, continuous,
    interpolated path tracing the trajectory from 1 to the limit.
    """
    print(f"Generating path for numbers 1 to {limit}...")
    start_time = time.time()
    
    primes_list = get_primes(limit)
    prime_to_index = {prime: i + 1 for i, prime in enumerate(primes_list)}

    # Store the final coordinate for each number
    coordinates = {1: (0, 0, 0)}
    # The full path is a list of interpolated points for smooth animation
    full_path = [(0, 0, 0)]
    
    # Store indices where each number's path segment ends
    number_end_indices = {1: 0}
    
    # Store the type of each point (for coloring in OBJ)
    point_types = ["origin"]  # First point is origin

    for n in range(2, limit + 1):
        if n % 100 == 0:
            print(f"Processing number {n}...")
        
        last_point = coordinates[n - 1]
        
        factors = get_prime_factors(n, primes_list)
        
        # Determine the new coordinate based on prime indices
        if len(factors) == 1:
            coord = (prime_to_index[n], 0, 0)
            point_type = "x_axis"
        elif len(factors) == 2:
            if factors[0] == factors[1]:  # Perfect square
                coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], 0)
                point_type = "diagonal"
            else:
                coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], 0)
                point_type = "other"
        elif len(factors) == 3:
            if factors[0] == factors[1] == factors[2]:  # Perfect cube
                coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], prime_to_index[factors[2]])
                point_type = "z_axis"
            else:
                coord = (prime_to_index[factors[0]], prime_to_index[factors[1]], prime_to_index[factors[2]])
                point_type = "other"
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
            point_type = "other"

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
            
            # Assign the point type (for the last point, use the target type)
            if i == num_steps:
                point_types.append(point_type)
            else:
                # For intermediate points, use the type of the segment
                if point_type == "x_axis" or point_types[-1] == "x_axis":
                    point_types.append("x_axis")
                elif point_type == "diagonal" or point_types[-1] == "diagonal":
                    point_types.append("diagonal")
                elif point_type == "z_axis" or point_types[-1] == "z_axis":
                    point_types.append("z_axis")
                else:
                    point_types.append("other")
        
        number_end_indices[n] = len(full_path) - 1
    
    elapsed_time = time.time() - start_time
    print(f"Path generation completed in {elapsed_time:.2f} seconds")
    print(f"Total points in path: {len(full_path)}")
            
    return full_path, number_end_indices, point_types

def export_to_obj(path_points, point_types, output_file):
    """
    Export the 3D path to an OBJ file format.
    
    Args:
        path_points: List of 3D points (x, y, z)
        point_types: List of point types for coloring
        output_file: Path to the output OBJ file
    """
    print(f"Exporting to OBJ file: {output_file}")
    start_time = time.time()
    
    # Define material colors
    mtl_content = """# Material definitions for prime path
newmtl x_axis_material
Ka 1.0 0.0 0.0
Kd 1.0 0.0 0.0
Ks 1.0 1.0 1.0
Ns 100.0

newmtl diagonal_material
Ka 0.0 1.0 0.0
Kd 0.0 1.0 0.0
Ks 1.0 1.0 1.0
Ns 100.0

newmtl z_axis_material
Ka 0.0 0.0 1.0
Kd 0.0 0.0 1.0
Ks 1.0 1.0 1.0
Ns 100.0

newmtl other_material
Ka 1.0 0.8 0.0
Kd 1.0 0.8 0.0
Ks 1.0 1.0 1.0
Ns 100.0

newmtl origin_material
Ka 1.0 1.0 1.0
Kd 1.0 1.0 1.0
Ks 1.0 1.0 1.0
Ns 100.0
"""
    
    # Write material file
    mtl_file = output_file.replace('.obj', '.mtl')
    with open(mtl_file, 'w') as f:
        f.write(mtl_content)
    
    # Group points by type for efficient material assignment
    type_to_indices = {
        "x_axis": [],
        "diagonal": [],
        "z_axis": [],
        "other": [],
        "origin": []
    }
    
    # Write OBJ file
    with open(output_file, 'w') as f:
        # Reference the material file
        f.write(f"mtllib {os.path.basename(mtl_file)}\n\n")
        
        # Write all vertices
        f.write("# Vertices\n")
        for i, (x, y, z) in enumerate(path_points):
            f.write(f"v {x} {y} {z}\n")
            
            # Store index by type (1-based indexing in OBJ)
            type_to_indices[point_types[i]].append(i + 1)
        
        f.write("\n# Lines with materials\n")
        
        # Write lines for each material group
        for point_type, indices in type_to_indices.items():
            if not indices:
                continue
                
            # Set material for this group
            f.write(f"usemtl {point_type}_material\n")
            
            # Write lines (connecting consecutive vertices)
            for i in range(len(indices) - 1):
                if indices[i] + 1 == indices[i + 1]:  # Check if consecutive
                    f.write(f"l {indices[i]} {indices[i + 1]}\n")
    
    elapsed_time = time.time() - start_time
    print(f"OBJ export completed in {elapsed_time:.2f} seconds")
    print(f"OBJ file saved to: {output_file}")
    print(f"MTL file saved to: {mtl_file}")

# --- Main Execution ---

def main():
    # Set the limit (number of integers to process)
    limit = 1000000  # Default value
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            print(f"Invalid limit: {sys.argv[1]}. Using default: {limit}")
    
    print(f"Processing prime number trajectories up to {limit}...")
    
    # Generate the path
    path_points, number_end_indices, point_types = generate_full_path(limit)
    
    # Export to OBJ
    output_file = f"prime_trajectory_{limit}.obj"
    export_to_obj(path_points, point_types, output_file)
    
    print("Processing complete!")

if __name__ == "__main__":
    main()