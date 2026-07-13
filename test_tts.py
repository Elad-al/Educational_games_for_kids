import os
from gtts import gTTS

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')
os.makedirs(ASSETS_DIR, exist_ok=True)

# Test continuous string without spaces/commas to see if TTS blends it into a 5-second sound
text = "מְ" * 20 

test_path = os.path.join(ASSETS_DIR, "test_continuous_mem.mp3")
tts = gTTS(text=text, lang='iw', slow=True)
tts.save(test_path)
print(f"Generated {test_path} with text: {text}")
