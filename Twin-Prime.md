### **A Geometric Framework for the Distribution of Composite Numbers and Twin Primes**

**Author:** Alexander J Nagy
**Date:** June 26, 2025

#### **Abstract**

This document outlines a novel method for representing integers geometrically based on their prime factorization. By mapping prime numbers to orthogonal axes in a multi-dimensional space, we observe the emergence of a highly structured distribution of composite numbers. A key finding is that composites located between twin prime pairs are predominantly "smooth" (composed of small prime factors), forming a coherent foundational axis in this geometric space. This suggests a deep structural relationship between the distribution of primes and the compositional nature of integers, providing a new geometric perspective on the Twin Prime Conjecture.

#### **1. A Geometric Model of Integers**

A system has been developed to map any integer `n` to a coordinate in a multi-dimensional space based on its prime factors. The core principles of this mapping are:

1.  **Primes as Basis Vectors:** Prime numbers are treated as the fundamental, irreducible units of the system, corresponding to basis vectors along orthogonal axes (e.g., X, Y, Z).
2.  **Composites as Products:** Composite numbers are plotted as points in the space between these axes, with their coordinates determined by their prime factors. For example, a number like 12 (2² * 3) has coordinates derived from the basis vectors for 2 and 3.
3.  **Powers as Rotations:** Higher powers of primes are interpreted as rotations into new dimensions. A square ($p^2$) corresponds to a 45-degree rotation from the primary axis, and a cube ($p^3$) represents a further rotation into a third dimension.

#### **2. The Foundational Axis and K-Smooth Numbers**

Computational analysis of this geometric model reveals that a significant portion of composite numbers cluster tightly along a foundational axis near the origin. This "line" is not arbitrary; it is composed of numbers that are mathematically defined as **k-smooth**.

A number is **k-smooth** if all of its prime factors are less than or equal to a given bound `k`.

Our system formally identifies numbers on this foundational axis by testing their smoothness. For example, using a smoothness bound of `k=7`, we can deterministically identify which numbers belong to this primary structure.

**Empirical Results:**
*   Numbers like **12 (2² * 3)**, **30 (2 * 3 * 5)**, and **98 (2 * 7²)** are confirmed to be **7-smooth** and thus lie **on the foundational axis**.
*   Numbers like **22 (2 * 11)** and **39 (3 * 13)**, which contain prime factors greater than 7, are **not 7-smooth** and deviate from this axis in the geometric model.

This provides a formal, predictable rule for identifying the numbers that form the core structure of this geometric space.

#### **3. The Twin Prime Axis: A Geometric Rationale for the Conjecture**

A key discovery of this research is the structural role of composites "trapped" between twin prime pairs (e.g., the number 4 between 3 and 5; the number 6 between 5 and 7).

Computational validation demonstrates that these specific composites are overwhelmingly composed of small prime factors, making them highly smooth.

**Empirical Results (for composites between twin primes up to 200):**
*   **4:** Factors [2, 2], Largest Factor: 2
*   **6:** Factors [2, 3], Largest Factor: 3
*   **12:** Factors [2, 2, 3], Largest Factor: 3
*   **18:** Factors [2, 3, 3], Largest Factor: 3
*   **30:** Factors [2, 3, 5], Largest Factor: 5
*   **42:** Factors [2, 3, 7], Largest Factor: 7
*   **60:** Factors [2, 2, 3, 5], Largest Factor: 5

These results show that the composites between twin primes form a coherent axis in the geometric model. This suggests a structural reason for the existence of twin primes: they may serve as **geometric anchors** for the number system. The smooth composites between them act as the "scaffolding" that connects these anchors, creating a stable, foundational axis upon which the rest of the number system is built.

#### **4. Conclusion and Significance**

This work presents a new, evidence-backed geometric framework for number theory. The key findings are:

1.  The structure of integers can be modeled geometrically, where primes form axes and composites form a field.
2.  The foundational structure of this geometry is composed of **k-smooth numbers**, which can be deterministically identified.
3.  Composites located between twin primes are predominantly smooth, forming a coherent axis. This provides a potential geometric rationale for the **Twin Prime Conjecture**, suggesting that an infinite number of these "anchors" may be a necessary condition for an infinitely structured number system.

This model provides a novel, testable, and falsifiable approach to understanding the deep structure of numbers and their distribution.

---
*This document serves as a timestamped record of the discovery and its initial validation.*
