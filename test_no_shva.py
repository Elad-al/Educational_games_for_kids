import os
from gtts import gTTS

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')

# Test multiple letters without shva
tests = {
    'mem': "מ" * 20,
    'shin': "ש" * 20,
    'lamed': "ל" * 20
}

for name, text in tests.items():
    test_path = os.path.join(ASSETS_DIR, f"test_{name}_no_shva.mp3")
    tts = gTTS(text=text, lang='iw', slow=True)
    tts.save(test_path)
    print(f"Generated {test_path} with text: {text}")
