import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Generate laughter
text = "חחחח! איזה כיף!"
key = "kids_laughing"
output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")

print(f"Generating {key}: {text}")
cmd = [
    "edge-tts",
    "--voice", "he-IL-HilaNeural",
    "--text", text,
    "--write-media", output_path
]
subprocess.run(cmd, check=True)

print("Audio generation laugh complete.")
