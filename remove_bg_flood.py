import sys
from PIL import Image, ImageDraw

def remove_background(image_path):
    img = Image.open(image_path).convert("RGBA")
    
    # Flood fill the outer white area with transparent
    # We will use ImageDraw.floodfill. 
    # But wait, floodfill in Pillow replaces color, not alpha easily?
    # Yes, we can flood fill with (255, 255, 255, 0).
    
    # Let's ensure the top-left pixel is actually white.
    # We'll flood fill starting from (0,0) with fully transparent pixels.
    # Pillow's floodfill doesn't support tolerance natively in an easy way for RGBA sometimes, but let's try.
    
    # Actually, the simplest way is a BFS flood fill manually with a slight tolerance to avoid edge artifacts.
    width, height = img.size
    pixels = img.load()
    
    # Target color is roughly white
    def is_white(c):
        return c[0] > 230 and c[1] > 230 and c[2] > 230
        
    start_c = pixels[0, 0]
    if not is_white(start_c):
        print("Top-left pixel is not white, skipping flood fill.")
        return
        
    visited = set()
    queue = [(0, 0)]
    
    # BFS
    while queue:
        x, y = queue.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        c = pixels[x, y]
        if is_white(c):
            # Make it transparent
            pixels[x, y] = (255, 255, 255, 0)
            
            if x > 0: queue.append((x-1, y))
            if x < width - 1: queue.append((x+1, y))
            if y > 0: queue.append((x, y-1))
            if y < height - 1: queue.append((x, y+1))
            
    img.save(image_path, "PNG")
    print(f"Removed background from {image_path}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        remove_background(sys.argv[1])
