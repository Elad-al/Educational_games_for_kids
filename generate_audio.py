import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

phrases = {
    # Feedback
    "try_again": "נסה שוב",
    "oh_try_again": "אוי, נסה שוב",
    "basket_full": "הסל מלא",
    "not_here": "זה לא שייך לפה!",
    "success": "כל הכבוד! הצלחת!",
    
    # Praises
    "praise_1": "יפה!",
    "praise_2": "מצוין!",
    "praise_3": "נהדר!",
    "praise_4": "כל הכבוד!",
    
    # Numbers
    "num_1": "אחת",
    "num_2": "שתיים",
    "num_3": "שלוש",
    "num_4": "ארבע",
    "num_5": "חמש",
}

# Sorting game categories
categories = [
    'פירות', 'חיות', 'כלי רכב', 'בגדים', 'צעצועים',
    'רהיטים', 'אוכל', 'כלי עבודה', 'כלי נגינה', 'כלי כתיבה'
]
for cat in categories:
    phrases[f"sort_{cat}"] = f"גרור את ה{cat} לסל!"

# Alphabet
hebrew_letters = "אבגדהוזחטיכלמנסעפצקרשת"
for char in hebrew_letters:
    phrases[f"lit_{char}"] = f"גרור את האות {char} למקום הנכון!"
    
# Final letters
final_letters = "ץףןםך"
for char in final_letters:
    phrases[f"lit_{char}"] = f"גרור את האות סופית {char} למקום הנכון!"

# Generate all
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

print("Audio generation complete.")
