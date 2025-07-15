import matplotlib.pyplot as plt

def simulate_prime_collision(n):
    grid = [[]]  # Main line (depth 0) starts empty
    frontiers = []  # Store frontier numbers (primes)

    for num in range(2, n + 1):
        col = 0  # Start at position 1 (index 0)
        depth = 0  # Start at main line

        # Extend grid columns if needed
        while len(grid[depth]) <= col:
            grid[depth].append(0)

        # Try to place the number
        while True:
            if grid[depth][col] == 0:  # Empty spot, place the number
                grid[depth][col] = num
                # Check if this is a frontier (new column on main line)
                if depth == 0 and col == len(grid[0]) - 1:
                    frontiers.append(num)
                break
            else:
                # Position occupied, try to push deeper
                depth += 1
                if depth >= len(grid):
                    grid.append([0] * len(grid[0]))  # Add new depth level
                while len(grid[depth]) <= col:
                    grid[depth].append(0)

                if grid[depth][col] == 0:
                    # Push the number from (depth-1, col) to (depth, col)
                    grid[depth][col] = grid[depth - 1][col]
                    grid[depth - 1][col] = 0
                    depth -= 1  # Go back up to place num
                else:
                    # Can't push deeper, move right and reset depth
                    col += 1
                    depth = 0
                    # Extend all rows to match the new column
                    for row in grid:
                        while len(row) <= col:
                            row.append(0)

    return frontiers, grid

def visualize_results(n, frontiers):
    plt.figure(figsize=(12, 2))
    for prime in frontiers:
        plt.text(prime, 1, str(prime), ha='center', va='center', color='red', fontsize=10)
    plt.ylim(0.5, 1.5)
    plt.yticks([])
    plt.xlabel('Number')
    plt.title(f'Numbers Pushing into New Frontier (Primes, 2 to {n})')
    plt.show()

    print(f"Numbers that pushed into new frontier (primes): {frontiers}")

# Run simulation for numbers 2 to 3
n = 100
frontiers, grid = simulate_prime_collision(n)
visualize_results(n, frontiers)