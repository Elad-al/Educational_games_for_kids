import os
from gtts import gTTS

def test_stretch():
    # Test a few letters with repeated characters without spaces
    test_chars = {
        'מ': "מְ" * 10,  # Mem
        'ש': "שְׁ" * 10,  # Shin
        'ב': "בְּ" * 10   # Bet
    }
    
    for char, text in test_chars.items():
        print(f"Generating test for {char}...")
        char_hex = char.encode("utf-8").hex()
        tts = gTTS(text=text, lang='iw', slow=False)
        tts.save(f"test_{char_hex}.mp3")

if __name__ == "__main__":
    test_stretch()
    print("Test files generated.")
