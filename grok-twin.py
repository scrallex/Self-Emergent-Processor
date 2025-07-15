import asyncio
import pygame
import math

# Initialize Pygame
pygame.init()
WIDTH, HEIGHT = 1200, 900
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.HWSURFACE | pygame.DOUBLEBUF)
pygame.display.set_caption("Number Distribution Visualization")
clock = pygame.time.Clock()
FPS = 60

# Colors with alpha for transparency
BLACK = (0, 0, 0, 255)
BLUE = (0, 0, 255, 255)  # Primes
YELLOW = (255, 255, 0, 255)  # Composites between twin primes
WHITE = (255, 255, 255, 255)
RED = (255, 0, 0, 255)  # Squares
GREEN = (0, 255, 0, 255)  # Cubics

# Prime factorization function
def prime_factors(n):
    factors = []
    i = 2
    while i * i <= n:
        while n % i == 0:
            factors.append(i)
            n //= i
        i += 1
    if n > 1:
        factors.append(n)
    return factors

# 3D point class
class Point3D:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

# Generate distribution up to 1000
def generate_distribution(max_n):
    points = {}
    twin_primes = [(3, 5), (5, 7), (11, 13), (17, 19), (29, 31), (41, 43), (59, 61), (71, 73), (101, 103), (107, 109),
                   (137, 139), (149, 151), (179, 181), (191, 193), (197, 199), (227, 229), (239, 241), (269, 271),
                   (281, 283), (311, 313), (347, 349), (419, 421), (431, 433), (461, 463), (521, 523), (569, 571),
                   (599, 601), (617, 619), (641, 643), (659, 661), (809, 811), (821, 823), (827, 829), (857, 859),
                   (881, 883), (907, 911), (929, 931), (947, 949), (967, 971), (983, 991)]
    cubics = [i**3 for i in range(1, int(1000**(1/3)) + 1) if i**3 <= 1000]
    for n in range(1, max_n + 1):
        factors = prime_factors(n)
        if n == 1:
            points[n] = Point3D(0, 0, 0)
        elif len(factors) == 1:  # Prime
            x = factors[0] / 1000.0
            points[n] = Point3D(x, 0, 0)
        elif len(factors) == 2 and factors[0] == factors[1]:  # Square
            x = factors[0] / 1000.0
            points[n] = Point3D(x, x, 0)
        else:  # Composite or higher power
            x = factors[0] / 1000.0 if factors else 0
            y = (factors[1] / 1000.0 if len(factors) > 1 else 0)
            z = (factors[2] / 1000.0 if len(factors) > 2 else 0)
            mag = math.sqrt(x*x + y*y + z*z)
            if mag > 1:
                x, y, z = x/mag, y/mag, z/mag
            points[n] = Point3D(x, y, z)
    return points, twin_primes, cubics

# Camera and interaction
angle_x, angle_y = 0, 0
zoom = 1.0
pan_x, pan_y = 0, 0
paused = False
current_n = 1
max_n = 1000
points, twin_primes, cubics = generate_distribution(max_n)

# Slider
slider_rect = pygame.Rect(50, HEIGHT - 50, WIDTH - 100, 20)
slider_pos = 50

def is_between_twin_primes(n, twin_primes):
    for p1, p2 in twin_primes:
        if p1 < n < p2 and len(prime_factors(n)) > 1:
            return True
    return False

def project_3d_to_2d(point):
    x = (point.x - 0.5) * zoom + pan_x
    y = (point.y - 0.5) * zoom + pan_y
    z = point.z - 0.5
    xz = x * math.cos(angle_y) + z * math.sin(angle_y)
    z = -x * math.sin(angle_y) + z * math.cos(angle_y)
    x = xz
    yz = y * math.cos(angle_x) - z * math.sin(angle_x)
    z = y * math.sin(angle_x) + z * math.cos(angle_x)
    y = yz
    scale = 300 * zoom
    screen_x = WIDTH // 2 + x * scale / (z + 2)
    screen_y = HEIGHT // 2 + y * scale / (z + 2)
    return (screen_x, screen_y)

def setup():
    screen.fill(BLACK)

def update_loop():
    global angle_x, angle_y, zoom, pan_x, pan_y, paused, current_n, slider_pos
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            return
        if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
            paused = not paused
        if event.type == pygame.MOUSEMOTION and event.buttons[0]:
            angle_y += event.rel[0] * 0.005
            angle_x += event.rel[1] * 0.005
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 4:  # Wheel up
            zoom *= 1.1
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 5:  # Wheel down
            zoom /= 1.1
        if event.type == pygame.MOUSEBUTTONDOWN and slider_rect.collidepoint(event.pos):
            paused = True
            slider_pos = max(50, min(WIDTH - 50, event.pos[0]))

    if not paused and current_n < max_n:
        current_n += 1
        slider_pos = 50 + (WIDTH - 100) * (current_n - 1) / (max_n - 1)

    screen.fill(BLACK)
    for i in range(1, min(current_n, max_n)):
        if i in points:
            p = project_3d_to_2d(points[i])
            if all(0 <= c <= WIDTH and 0 <= d <= HEIGHT for c, d in (p,)):
                if i == 1:
                    pygame.draw.circle(screen, WHITE, p, 5)  # Origin
                elif len(prime_factors(i)) == 1:  # Prime
                    pygame.draw.circle(screen, BLUE, p, 5)
                elif len(prime_factors(i)) == 2 and prime_factors(i)[0] == prime_factors(i)[1]:  # Square
                    pygame.draw.circle(screen, RED, p, 5)
                elif i in cubics:  # Cubic
                    pygame.draw.circle(screen, GREEN, p, 5)
                elif is_between_twin_primes(i, twin_primes):  # Composite between twin primes
                    pygame.draw.circle(screen, YELLOW, p, 5)

    pygame.draw.rect(screen, WHITE, slider_rect, 2)
    slider_x = max(50, min(WIDTH - 50, slider_pos))
    pygame.draw.rect(screen, WHITE, (slider_x - 5, HEIGHT - 55, 10, 30))
    current_n = int((slider_x - 50) / (WIDTH - 100) * (max_n - 1)) + 1

    pygame.display.flip()
    clock.tick(FPS)

async def main():
    setup()
    while True:
        update_loop()
        await asyncio.sleep(1.0 / FPS)

if __name__ == "__main__":
    asyncio.run(main())