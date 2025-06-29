import matplotlib.pyplot as plt

def simulate_prime_collision(n):
    boxes = []
    frontiers = []
    frontier_positions = []  # Track where each number lands

    for num in range(2, n + 1):
        current_boxes = [num]
        for occupant in boxes:
            if occupant:
                current_boxes.append(occupant)
            else:
                break
        # Check if new frontier is opened
        if len(current_boxes) > len(boxes):
            frontiers.append(num)
        boxes = current_boxes
        frontier_positions.append((num, len(boxes)))  # Store number and its box position

    return frontiers, frontier_positions, boxes

def find_prime_triplets(frontiers):
    triplets = []
    for i in range(len(frontiers) - 2):
        p1 = frontiers[i]
        p2 = frontiers[i + 1]
        p3 = frontiers[i + 2]
        if p2 == p1 + 2 and p3 == p1 + 6:
            triplets.append((p1, p2, p3))
    return triplets

def visualize_results(n, frontiers, frontier_positions, triplets):
    plt.figure(figsize=(12, 4))
    # Plot frontier expansions (primes)
    plt.scatter(frontiers, [1] * len(frontiers), c='red', label='Primes (Frontier Expansions)')
    # Highlight triplets
    for triplet in triplets:
        plt.scatter(triplet, [1, 1, 1], c='blue', s=100, marker='x', label='Triplet' if triplet == triplets[0] else "")
    plt.yticks([])
    plt.xlabel('Number')
    plt.title(f'Prime Frontier Expansions and Triplets (2 to {n})')
    plt.legend()
    plt.show()

    print(f"Primes (frontiers): {frontiers}")
    print(f"Triplets (p, p+2, p+6): {triplets}")

# Run simulation for numbers 2 to 100
n = 100
frontiers, frontier_positions, boxes = simulate_prime_collision(n)
triplets = find_prime_triplets(frontiers)
visualize_results(n, frontiers, frontier_positions, triplets)