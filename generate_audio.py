import os
import time

try:
    from gtts import gTTS
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "gTTS"])
    from gtts import gTTS

# Target directory
ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')
os.makedirs(ASSETS_DIR, exist_ok=True)

# Hebrew letters mapping
# char: [name_with_niqqud, phonetic_string]
letters = {
    'א': ['אָלֶף', 'אאאא'],
    'ב': ['בֵּית', 'בּבּבּבּ'],
    'ג': ['גִּימֶל', 'גגגג'],
    'ד': ['דָּלֶת', 'דדדד'],
    'ה': ['הֵא', 'הההה'],
    'ו': ['וָו', 'וווו'],
    'ז': ['זַיִן', 'זזזז'],
    'ח': ['חֵית', 'חחחח'],
    'ט': ['טֵית', 'טטטט'],
    'י': ['יוֹד', 'יייי'],
    'כ': ['כַּף', 'כּכּכּכּ'],
    'ל': ['לָמֶד', 'לללל'],
    'מ': ['מֵם', 'ממממ'],
    'נ': ['נוּן', 'ננננ'],
    'ס': ['סָמֶךְ', 'סססס'],
    'ע': ['עַיִן', 'עעעע'],
    'פ': ['פֵּא', 'פּפּפּפּ'],
    'צ': ['צָדִי', 'צצצצ'],
    'ק': ['קוֹף', 'קקקק'],
    'ר': ['רֵישׁ', 'רררר'],
    'ש': ['שִׁין', 'שׁשׁשׁשׁ'],
    'ת': ['תָּו', 'תּתּתּתּ']
}

def generate_audio():
    print(f"Generating audio in {ASSETS_DIR}...")
    for char, (name, phonetic) in letters.items():
        # Clean char for filename
        char_hex = char.encode("utf-8").hex()
        
        name_path = os.path.join(ASSETS_DIR, f"name_{char_hex}.mp3")
        phonetic_path = os.path.join(ASSETS_DIR, f"phonetic_{char_hex}.mp3")
        
        if not os.path.exists(name_path):
            tts = gTTS(text=name, lang='iw') # iw is hebrew in gTTS
            tts.save(name_path)
            
        if not os.path.exists(phonetic_path):
            tts = gTTS(text=phonetic, lang='iw')
            tts.save(phonetic_path)
            
        time.sleep(0.5) # prevent rate limiting
        print(f"Generated {char} -> {name_path}, {phonetic_path}")

if __name__ == "__main__":
    generate_audio()
    print("All audio files generated successfully.")
