import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

objects = ['מיטה', 'כדור', 'בית', 'שמש', 'פרח', 'ספר']
letters = ['מ', 'כ', 'ב', 'ש', 'פ', 'ס']

for obj in objects:
    for letter in letters:
        text = f"זה {obj}, אם זה מתחיל באות {letter} הזז את השרביט לכאן"
        key = f"obj_desc_{obj}_{letter}"
        output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
        
        print(f"Generating {key}: {text}")
        cmd = [
            "edge-tts",
            "--voice", "he-IL-HilaNeural",
            "--text", text,
            "--write-media", output_path
        ]
        subprocess.run(cmd, check=True)

print("Audio generation fix5 complete.")
