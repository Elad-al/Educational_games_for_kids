import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

hebrew_letters = [
    ('א', 'אלף'), ('ב', 'בית'), ('ג', 'גימל'), ('ד', 'דלת'), ('ה', 'הא'),
    ('ו', 'וו'), ('ז', 'זיין'), ('ח', 'חת'), ('ט', 'טת'), ('י', 'יוד'),
    ('כ', 'כף'), ('ל', 'למד'), ('מ', 'מם'), ('נ', 'נון'), ('ס', 'סמך'),
    ('ע', 'עין'), ('פ', 'פא'), ('צ', 'צדיק'), ('ק', 'קוף'), ('ר', 'ריש'),
    ('ש', 'שין'), ('ת', 'תיו'),
    ('ץ', 'צדיק סופית'), ('ף', 'פא סופית'), ('ן', 'נון סופית'), ('ם', 'מם סופית'), ('ך', 'כף סופית')
]

for char, name in hebrew_letters:
    # Notice we spell out the letter name so the TTS pronounces it correctly
    text = f"זאת האות {name}. נסה שוב!"
    key = f"wrong_letter_{char}"
    output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
    
    print(f"Generating {key}: {text}")
    cmd = [
        "edge-tts",
        "--voice", "he-IL-HilaNeural",
        "--text", text,
        "--write-media", output_path
    ]
    subprocess.run(cmd, check=True)

print("Audio generation fix6 complete.")
