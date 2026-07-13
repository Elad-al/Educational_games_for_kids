"""
Generate smooth, sustained phonetic audio files for Hebrew letters.

Uses raw audio manipulation (no pydub) to work on Python 3.13+.

Strategy:
1. Decode each short TTS MP3 into raw PCM samples using ffmpeg
2. Extract the most stable middle portion
3. Crossfade-loop that portion with itself to create a smooth 4-second drone
4. Encode back to MP3 via ffmpeg

For plosive consonants that can't be sustained, create a gentle rhythmic pulse.
"""
import os
import struct
import subprocess
import wave
import tempfile
import math

AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'audio')

# Letters whose sounds can be physically sustained
SUSTAINED = set('הוזחסשמנלרצ')
PLOSIVE = set('אבגדטיכעפקת')

TARGET_DURATION_S = 4.0
SAMPLE_RATE = 44100
CROSSFADE_SAMPLES = int(0.04 * SAMPLE_RATE)  # 40ms crossfade


def mp3_to_samples(mp3_path):
    """Decode MP3 to raw PCM samples (mono, 16-bit, 44100Hz) using ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        tmp_path = tmp.name

    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', mp3_path,
            '-ac', '1', '-ar', str(SAMPLE_RATE), '-sample_fmt', 's16',
            tmp_path
        ], capture_output=True, check=True)

        with wave.open(tmp_path, 'rb') as wf:
            n_frames = wf.getnframes()
            raw = wf.readframes(n_frames)
            samples = list(struct.unpack(f'<{n_frames}h', raw))
            return samples
    finally:
        os.unlink(tmp_path)


def samples_to_mp3(samples, mp3_path):
    """Encode raw PCM samples back to MP3 via ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        tmp_path = tmp.name

    try:
        raw = struct.pack(f'<{len(samples)}h', *[max(-32768, min(32767, int(s))) for s in samples])
        with wave.open(tmp_path, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(raw)

        subprocess.run([
            'ffmpeg', '-y', '-i', tmp_path,
            '-codec:a', 'libmp3lame', '-b:a', '128k',
            mp3_path
        ], capture_output=True, check=True)
    finally:
        os.unlink(tmp_path)


def crossfade(a, b, fade_len):
    """Crossfade the end of 'a' into the beginning of 'b'."""
    if fade_len < 1 or fade_len > len(a) or fade_len > len(b):
        return a + b
    
    result = list(a[:-fade_len])
    for i in range(fade_len):
        t = i / fade_len  # 0.0 -> 1.0
        # Cosine crossfade for smoothness
        weight_a = math.cos(t * math.pi / 2)
        weight_b = math.sin(t * math.pi / 2)
        blended = a[len(a) - fade_len + i] * weight_a + b[i] * weight_b
        result.append(int(blended))
    result.extend(b[fade_len:])
    return result


def fade_in(samples, n):
    """Apply a fade-in over the first n samples."""
    for i in range(min(n, len(samples))):
        samples[i] = int(samples[i] * (i / n))
    return samples


def fade_out(samples, n):
    """Apply a fade-out over the last n samples."""
    length = len(samples)
    for i in range(min(n, length)):
        idx = length - 1 - i
        samples[idx] = int(samples[idx] * (i / n))
    return samples


def create_sustained_drone(samples):
    """Extract the stable middle and crossfade-loop it into a long drone."""
    n = len(samples)
    target_samples = int(TARGET_DURATION_S * SAMPLE_RATE)

    # Extract the middle 40% - the sustained portion
    start = int(n * 0.3)
    end = int(n * 0.7)
    middle = samples[start:end]

    if len(middle) < 100:
        middle = samples[int(n * 0.2):int(n * 0.8)]
    if len(middle) < 50:
        middle = samples[:]

    # Build drone by crossfading copies
    drone = list(middle)
    cf = min(CROSSFADE_SAMPLES, len(middle) // 3)
    if cf < 10:
        cf = 0

    while len(drone) < target_samples:
        if cf > 0:
            drone = crossfade(drone, list(middle), cf)
        else:
            drone = drone + list(middle)

    drone = drone[:target_samples]
    drone = fade_in(drone, int(0.08 * SAMPLE_RATE))
    drone = fade_out(drone, int(0.08 * SAMPLE_RATE))
    return drone


def create_plosive_pulse(samples):
    """For stops/plosives: gentle rhythmic repetition with silence gaps."""
    n = len(samples)
    target_samples = int(TARGET_DURATION_S * SAMPLE_RATE)

    # Trim trailing silence
    trimmed = samples[:int(n * 0.85)]
    trimmed = fade_in(trimmed, int(0.015 * SAMPLE_RATE))
    trimmed = fade_out(trimmed, int(0.015 * SAMPLE_RATE))

    # Gap between pulses (180ms)
    gap = [0] * int(0.18 * SAMPLE_RATE)

    pulse = list(trimmed)
    while len(pulse) < target_samples:
        pulse = pulse + gap + list(trimmed)

    pulse = pulse[:target_samples]
    pulse = fade_in(pulse, int(0.03 * SAMPLE_RATE))
    pulse = fade_out(pulse, int(0.08 * SAMPLE_RATE))
    return pulse


def process_all():
    print(f"Processing phonetics in {AUDIO_DIR}...")

    hebrew_letters = 'אבגדהוזחטיכלמנסעפצקרשת'

    for char in hebrew_letters:
        char_hex = char.encode("utf-8").hex()
        src_path = os.path.join(AUDIO_DIR, f"phonetic_{char_hex}.mp3")

        if not os.path.exists(src_path):
            print(f"  SKIP {char} - source not found")
            continue

        try:
            samples = mp3_to_samples(src_path)
            
            if char in SUSTAINED:
                result = create_sustained_drone(samples)
                method = "sustained drone"
            else:
                result = create_plosive_pulse(samples)
                method = "plosive pulse"

            samples_to_mp3(result, src_path)
            duration_ms = int(len(result) / SAMPLE_RATE * 1000)
            print(f"  {char} ({method}) -> {duration_ms}ms")
        except Exception as e:
            print(f"  ERROR {char}: {e}")

    print("\nDone! All phonetic files are now smooth.")


if __name__ == "__main__":
    process_all()
