"""
Generate clean, single-pronunciation phonetic audio files.
We'll stretch them natively in the browser using playbackRate.
"""
import os
import time
from gtts import gTTS

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')
os.makedirs(ASSETS_DIR, exist_ok=True)

# Just the single letter with Shva for a clean pronunciation
phonetics_he = {
    'א': "אְ", 'ב': "בְּ", 'ג': "גְ", 'ד': "דְ",
    'ה': "הְ", 'ו': "וְ", 'ז': "זְ", 'ח': "חְ",
    'ט': "טְ", 'י': "יְ", 'כ': "כְּ", 'ל': "לְ",
    'מ': "מְ", 'נ': "נְ", 'ס': "סְ", 'ע': "עְ",
    'פ': "פְּ", 'צ': "צְ", 'ק': "קְ", 'ר': "רְ",
    'ש': "שְׁ", 'ת': "תְּ"
}

def generate_all():
    print(f"Generating clean short phonetics in {ASSETS_DIR}...")
    
    for char, text in phonetics_he.items():
        char_hex = char.encode("utf-8").hex()
        phonetic_path = os.path.join(ASSETS_DIR, f"phonetic_{char_hex}.mp3")
        
        # Default speed for a clean, natural single sound
        tts = gTTS(text=text, lang='iw', slow=False)
        tts.save(phonetic_path)
        time.sleep(0.3)
        print(f"  {char} -> {phonetic_path}")

if __name__ == "__main__":
    generate_all()
    print("\nDone! Short clean phonetic files generated.")
