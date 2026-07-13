"""
Fix specific phonetic and name audio files, and generate feedback audio.
"""
import os
import time
from gtts import gTTS

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')
os.makedirs(ASSETS_DIR, exist_ok=True)

# --- 1. Fix phonetic sounds for problematic letters ---
phonetic_fixes = {
    'כ': "כּ",      # Just dagesh, no shva
    'ע': "עָ",      # With kamatz for audible sound
    'פ': "פּ",      # Just dagesh
    'צ': "צָ",      # With kamatz
    'ר': "רָ",      # With kamatz
}

print("=== Fixing phonetic sounds ===")
for char, text in phonetic_fixes.items():
    char_hex = char.encode("utf-8").hex()
    path = os.path.join(ASSETS_DIR, f"phonetic_{char_hex}.mp3")
    tts = gTTS(text=text, lang='iw', slow=False)
    tts.save(path)
    time.sleep(0.3)
    print(f"  {char} ({text}) -> {path}")

# --- 2. Fix name sounds for ק and ת ---
name_fixes = {
    'ק': "קוּף",
    'ת': "תָּיו",
}

print("\n=== Fixing name sounds ===")
for char, text in name_fixes.items():
    char_hex = char.encode("utf-8").hex()
    path = os.path.join(ASSETS_DIR, f"name_{char_hex}.mp3")
    tts = gTTS(text=text, lang='iw', slow=False)
    tts.save(path)
    time.sleep(0.3)
    print(f"  {char} ({text}) -> {path}")

# --- 3. Generate Hebrew feedback audio files ---
feedback_phrases = {
    'praise_1': 'יפה!',
    'praise_2': 'מצוין!',
    'praise_3': 'נהדר!',
    'praise_4': 'כל הכבוד!',
    'praise_win': 'כל הכבוד! הצלחת!',
    'wrong_1': 'נסה שוב',
    'wrong_2': 'אוי, לא פה',
    'wrong_full': 'הסל מלא',
    'wrong_not_here': 'זה לא שייך לפה',
    'count_1': 'אחת',
    'count_2': 'שתיים',
    'count_3': 'שלוש',
    'count_4': 'ארבע',
    'count_5': 'חמש',
}

print("\n=== Generating feedback audio ===")
for key, text in feedback_phrases.items():
    path = os.path.join(ASSETS_DIR, f"feedback_{key}.mp3")
    tts = gTTS(text=text, lang='iw', slow=False)
    tts.save(path)
    time.sleep(0.3)
    print(f"  {key}: '{text}' -> {path}")

print("\nDone! All audio files generated.")
