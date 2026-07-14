import os
import subprocess

OUTPUT_DIR = "public/assets/audio/generated"
os.makedirs(OUTPUT_DIR, exist_ok=True)

phrases = {
    # Fix 2: feminine win phrase (replaces success.mp3)
    "success": "כל הכבוד! את אלופה!",

    # Fix 3: Stage 3 object descriptions (clearly describe item + letter)
    "obj_desc_מיטה": "זה מיטה! מיטה מתחילה באות מ!",
    "obj_desc_כדור": "זה כדור! כדור מתחיל באות כ!",
    "obj_desc_בית":  "זה בית! בית מתחיל באות ב!",
    "obj_desc_שמש":  "זה שמש! שמש מתחילה באות ש!",
    "obj_desc_פרח":  "זה פרח! פרח מתחיל באות פ!",
    "obj_desc_ספר":  "זה ספר! ספר מתחיל באות ס!",

    # Fix 4: Stage 1 multi-target instruction
    "s1_multi_instr": "גרור כל אות אל הצללית המתאימה!",

    # Fix 4: sub-phase announce phrases
    "s1_phase2": "יופי! עכשיו שתי אותיות בבת אחת!",
    "s1_phase3": "מדהים! עכשיו שלוש אותיות!",
    "s1_phase4": "וואו! עכשיו קשה יותר, שימי לב!",
}

for key, text in phrases.items():
    output_path = os.path.join(OUTPUT_DIR, f"{key}.mp3")
    print(f"Generating {key}: {text}")
    cmd = [
        "edge-tts",
        "--voice", "he-IL-HilaNeural",
        "--text", text,
        "--write-media", output_path
    ]
    subprocess.run(cmd, check=True)

print("Audio generation fix4 complete.")
