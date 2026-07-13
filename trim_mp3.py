import os

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')

def trim_half():
    count = 0
    for filename in os.listdir(ASSETS_DIR):
        if filename.startswith('phonetic_') and filename.endswith('.mp3'):
            filepath = os.path.join(ASSETS_DIR, filename)
            
            # Read the whole file
            with open(filepath, 'rb') as f:
                data = f.read()
            
            # Trim an additional 15% from the end (keep the first 85% of current bytes)
            new_size = int(len(data) * 0.85)
            new_data = data[:new_size]
            
            with open(filepath, 'wb') as f:
                f.write(new_data)
                
            count += 1
            print(f"Trimmed {filename} from {len(data)} to {len(new_data)} bytes")
            
    print(f"Trimmed {count} files.")

if __name__ == "__main__":
    trim_half()
