"""Transcreve um vídeo em PT-BR com tempo por palavra.
Uso: python -I transcribe.py <video> <saida_dir> [modelo]
Gera <saida_dir>/audio.wav, transcript.json (segmentos + palavras) e words.txt (palavra@segundo).
Lê o WAV com numpy para contornar o bug do pacote `av` novo no faster-whisper."""
import sys, os, json, wave, subprocess, shutil, glob
import numpy as np
from faster_whisper import WhisperModel

video, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "small"
os.makedirs(out, exist_ok=True)

ff = shutil.which("ffmpeg")
if not ff:
    hits = glob.glob(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin\ffmpeg.exe"))
    ff = hits[0] if hits else None
if not ff:
    sys.exit("ffmpeg não encontrado (winget install Gyan.FFmpeg)")

wav = os.path.join(out, "audio.wav")
subprocess.run([ff, "-y", "-loglevel", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
w = wave.open(wav)
audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

m = WhisperModel(model_name, device="cpu", compute_type="int8")
segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=True)
res = [{"start": s.start, "end": s.end, "text": s.text.strip(),
        "words": [{"w": x.word.strip(), "s": round(x.start, 2), "e": round(x.end, 2)} for x in s.words]} for s in segs]
json.dump(res, open(os.path.join(out, "transcript.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(out, "words.txt"), "w", encoding="utf-8").write(
    " ".join("%s@%.1f" % (x["w"], x["s"]) for r in res for x in r["words"]))
open(os.path.join(out, "transcript.txt"), "w", encoding="utf-8").write(
    "\n".join("[%.1f-%.1f] %s" % (r["start"], r["end"], r["text"]) for r in res))
print("ok:", len(res), "segmentos ->", out)
