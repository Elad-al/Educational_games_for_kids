import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

phrases = {
    # Intros
    "sort_intro_1": "גרור כל צעצוע לסל בצבע המתאים! לחץ על הסל להסבר",
    "sort_intro_2": "מיין את הצעצועים לפי מספרים וצבעים! לחץ על הסל להסבר",
    "sort_intro_3": "מיין את הצורות לסלים המתאימים! לחץ על הסל להסבר",
    "sort_intro_4": "מיין את הצעצועים! שים לב, חלק מהפריטים לא שייכים!",

    # Feedback
    "sort_full": "הסל הזה כבר מלא!",
    "sort_try_other": "אוי, נסה לגרור למקום אחר!",
}

colors = ['אדום', 'כחול', 'ירוק', 'כתום', 'סגול', 'צהוב', 'ורוד']
for c in colors:
    phrases[f"sort_color_{c}"] = f"גרור לכאן את כל הצעצועים בצבע {c}!"

shapes = ['עיגולים', 'ריבועים', 'משולשים']
for s in shapes:
    phrases[f"sort_shape_{s}"] = f"גרור לכאן את כל ה{s}!"

cats = ['חיות', 'כלי רכב', 'פירות', 'חלל', 'ים']
for c in cats:
    phrases[f"sort_cat_{c}"] = f"גרור לכאן את כל ה{c}!"

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

print("Audio generation part 3 complete.")
