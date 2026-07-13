import importlib
libs = ['pydub', 'librosa', 'soundfile', 'mutagen', 'pedalboard', 'audioread']
for lib in libs:
    try:
        importlib.import_module(lib)
        print(f"{lib} is installed")
    except ImportError:
        print(f"{lib} is NOT installed")
