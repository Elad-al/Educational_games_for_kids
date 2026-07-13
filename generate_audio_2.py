import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

phrases = {
    # Additional feedback
    "lit_wrong_shadow": "אוי, נסה לגרור אל צללית האות!",
    "lit_wrong_find": "נסה לחפש אות אחרת!",
    "lit_wrong_wand": "אוי, החפץ הזה מתחיל באות אחרת!",
}

hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשתץףןםך"

for char in hebrew_letters:
    # Literacy mode 1
    phrases[f"lit_shadow_{char}"] = f"גרור את האות {char} אל הצללית שלה!"
    # Literacy mode 2
    phrases[f"lit_find_{char}"] = f"איפה האות {char}?"
    # Literacy mode 3
    phrases[f"lit_wand_{char}"] = f"גרור את השרביט אל החפץ שמתחיל באות {char}!"

for key, text in phrases.items():
    output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
    if not os.path.exists(output_path):
        print(f"Generating {key}: {text}")
        cmd = [
            "edge-tts",
            "--voice", "he-IL-HilaNeural",
            "--text", text,
            "--write-media", output_path
        ]
        subprocess.run(cmd, check=True)

print("Audio generation part 2 complete.")
