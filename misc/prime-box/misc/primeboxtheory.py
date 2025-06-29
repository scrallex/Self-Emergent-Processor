import matplotlib.pyplot as plt

def simulate_prime_collision(n):
    boxes = []  # List to represent boxes
    frontiers = []  # Track frontier expansions (primes)
    box_counts = []  # Track number of boxes used per step

    for num in range(2, n + 1):
        # Insert number at box 0, pushing others forward
        current_boxes = [num]
        for occupant in boxes:
            if occupant:  # If box has a number, push it forward
                current_boxes.append(occupant)
            else:  # Empty box, stop pushing
                break
        
        # Check if new frontier is opened
        if len(current_boxes) > len(boxes):
            frontiers.append(num)  # Prime: new box needed
        boxes = current_boxes  # Update boxes
        box_counts.append(len(boxes))  # Track box count

    return frontiers, box_counts, boxes

def visualize_results(n, frontiers, box_counts, boxes):
    # Plot 1: Frontier expansions (primes)
    plt.figure(figsize=(12, 6))
    
    plt.subplot(2, 1, 1)
    plt.scatter(frontiers, [1] * len(frontiers), c='red', label='Primes (Frontier Expansions)')
    plt.yticks([])  # Hide y-axis
    plt.xlabel('Number')
    plt.title(f'Prime Numbers as Frontier Expansions (2 to {n})')
    plt.legend()

    # Plot 2: Box count growth
    plt.subplot(2, 1, 2)
    plt.plot(range(2, n + 1), box_counts, label='Number of Boxes Used')
    plt.xlabel('Number')
    plt.ylabel('Box Count')
    plt.title('Box Count Growth Over Time')
    plt.legend()

    plt.tight_layout()
    plt.show()

    # Print final box state
    print(f"Final box state for n={n}: {boxes}")
    print(f"Primes (frontiers): {frontiers}")

# Run simulation for numbers 2 to 100
n = 100
frontiers, box_counts, boxes = simulate_prime_collision(n)
visualize_results(n, frontiers, box_counts, boxes)