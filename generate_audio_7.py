import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

objects_and_letters = [
    ('מיטה', 'מ'),
    ('כדור', 'כ'),
    ('בית', 'ב'),
    ('שמש', 'ש'),
    ('פרח', 'פ'),
    ('ספר', 'ס')
]

for obj, letter in objects_and_letters:
    # Notice we spell out the phrase properly
    text = f"זה {obj}, זה מתחיל באות {letter}. נסה שוב!"
    key = f"wrong_wand_{obj}"
    output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
    
    print(f"Generating {key}: {text}")
    cmd = [
        "edge-tts",
        "--voice", "he-IL-HilaNeural",
        "--text", text,
        "--write-media", output_path
    ]
    subprocess.run(cmd, check=True)

print("Audio generation fix7 complete.")
