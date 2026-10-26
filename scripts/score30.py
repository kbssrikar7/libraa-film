"""Original 30 s score for the Libraa motion piece (LibraaMotion30).

Synthesised from scratch (pads, plucks, bass, soft kick), so there is no
licence to track. Chord changes and the arpeggio grid restart on the scene
wipes: 3.6 s, 6.4 s, 14.8 s, 23.4 s, 26.6 s, and on the second and third
service titles (9.8375 s, 12.65 s: kept on the half-beat grid from 6.4 s so the
arpeggio never doubles up at the join).
Run: python3 scripts/score30.py  -> public/music/libraa-score-30s.wav
"""
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
import wave

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BPM = 96
BEAT = 60 / BPM
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)

# sections: (start, end, chord midi notes (root first), energy)
C = lambda r, kind: [r, r + (3 if kind == "m" else 4), r + 7]
SECTIONS = [
    (0.0, 3.6, C(57, "m"), 0.0),      # A minor, sparse
    (3.6, 6.4, C(53, "M"), 0.35),     # F: lift on "Libraa Group"
    (6.4, 9.8375, C(48, "M"), 0.6),     # services: C (Ship Management)
    (9.8375, 12.65, C(55, "M"), 0.6),   # G (Crew Management title)
    (12.65, 14.8, C(57, "m"), 0.65),  # Am (Marine Services title)
    (14.8, 17.6, C(53, "M"), 0.7),    # map: F
    (17.6, 20.5, C(48, "M"), 0.8),    # C  (globe pull-back)
    (20.5, 23.4, C(55, "M"), 0.9),    # G  (West Africa)
    (23.4, 26.6, C(57, "m"), 0.85),   # proof: Am
    (26.6, 30.0, C(53, "M"), 0.75),   # close: F, then rings out
]

def env_ar(n, a, r):
    e = np.ones(n)
    a = min(int(a * SR), n // 2); r = min(int(r * SR), n // 2)
    e[:a] = np.linspace(0, 1, a) ** 1.5
    e[n - r:] = np.linspace(1, 0, r) ** 1.5
    return e

def pad(notes, dur, level):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = midi(m) * 2 ** (det / 12)
            ph = rng.uniform(0, 6.28)
            out += (np.sin(2 * np.pi * f * t + ph) + 0.4 * np.sin(2 * np.pi * 2 * f * t + ph) + 0.15 * np.sin(2 * np.pi * 3 * f * t)) * 0.1
    return out * env_ar(n, 0.9, 1.2) * level

def pluck(freq, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 9) + 0.25 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 14)
    return s * np.exp(-t * 4.2) * (1 - np.exp(-t * 400))

def kick(dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def tick(dur=0.06):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    sos = butter(2, 6500, "hp", fs=SR, output="sos")
    return sosfilt(sos, x) * np.exp(-np.arange(n) / SR * 90)

def add(buf, x, at, gain):
    i = int(at * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i : i + len(x)] += x * gain

dry = np.zeros(N)      # pads + plucks (get reverb)
low = np.zeros(N)      # bass + kick (stay dry)

for k, (a, b, notes, en) in enumerate(SECTIONS):
    d = b - a
    # pad, overlapping into the next section so chords crossfade
    add(dry, pad(notes + [notes[0] + 12], d + 1.4, 1.0), a - 0.15 if a > 0 else 0, 0.55 + 0.4 * en)
    # arpeggio on the beat grid restarted at the section start (cuts land on a beat)
    if en > 0:
        arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 24, notes[2] + 12, notes[1] + 12]
        step = BEAT / 2 if en >= 0.6 else BEAT
        i = 0; tt = a
        while tt < b - 0.75 * step:  # no note just before the join: the next grid starts at b
            add(dry, pluck(midi(arp[i % len(arp)])), tt, 0.16 + 0.10 * en)
            i += 1; tt += step
    # bass on the downbeats
    if en >= 0.35:
        tt = a
        while tt < b - 0.05:
            n = int(BEAT * 2 * SR); t = np.arange(n) / SR
            bass = np.sin(2 * np.pi * midi(notes[0] - 12) * t) * np.exp(-t * 1.6) * (1 - np.exp(-t * 60))
            add(low, bass, tt, 0.30 * en + 0.08)
            tt += BEAT * 2
    # soft kick + tick from the services onwards; a downbeat chime on every wipe
    if en >= 0.6:
        tt = a; j = 0
        kk = kick()
        while tt < b - 0.05:
            add(low, kk, tt, 0.34 if j % 2 == 0 else 0.0)
            if tt + BEAT / 2 < b - 0.15:
                add(dry, tick(), tt + BEAT / 2, 0.05 + 0.03 * en)
            tt += BEAT; j += 1
    if a > 0:
        add(dry, pluck(midi(notes[2] + 24), 2.0), a, 0.22)
        add(dry, pluck(midi(notes[0] + 24), 2.0), a + 0.02, 0.16)

# a gentle riser into the globe reveal (14.8 -> 17.6 handled by arp density), and
# a low swell under the last section so the ending settles
swell = np.sin(2 * np.pi * midi(41) * t_all) * np.exp(-((t_all - 27.0) ** 2) / 4.0) * 0.10
low += swell

# reverb: decaying-noise impulse on the dry bus
ir_n = int(2.2 * SR)
ir = rng.standard_normal((2, ir_n)) * np.exp(-np.arange(ir_n) / SR * 2.2)
ir[:, :int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
wet = np.stack([fftconvolve(dry, ir[0])[:N], fftconvolve(dry, ir[1])[:N]]) * 0.045
mix = np.stack([dry * 0.8 + low, dry * 0.8 + low]) + wet

# gentle low-pass for warmth, fades, normalise
sos = butter(2, 9000, "lp", fs=SR, output="sos")
mix = sosfilt(sos, mix, axis=1)
fade = np.ones(N)
fi = int(0.6 * SR); fo = int(2.2 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo) ** 1.4
mix *= fade
mix *= 0.9 / np.max(np.abs(mix))
pcm = (mix.T * 32767).astype("<i2")
with wave.open("public/music/libraa-score-30s.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok")
