import os
import tempfile
import subprocess
from werkzeug.datastructures import FileStorage
import librosa
import soundfile as sf

# development
# FFMPEG_PATH = r"C:\ffmpeg-7.1.1-full_build\ffmpeg-7.1.1-full_build\bin\ffmpeg.exe"

# production
FFMPEG_PATH = "ffmpeg"  # Use system path (Linux)

def generate_30s_preview(file: FileStorage):
    input_temp = None
    output_temp = None

    try:
        suffix = os.path.splitext(file.filename)[1]
        input_temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        file.save(input_temp.name)

        output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        output_path = output_temp.name
        output_temp.close()

        command = [
            FFMPEG_PATH, "-y",
            "-i", input_temp.name,
            "-t", "30",
            "-acodec", "libmp3lame",
            "-ab", "192k",
            output_path
        ]

        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        if result.returncode != 0:
            print("FFmpeg failed:\n", result.stderr.decode())
            return None, None, None, None

        duration = detect_audio_duration(input_temp.name)
        bpm = detect_bpm(input_temp.name)

        return input_temp.name, output_path, duration, bpm

    except Exception as e:
        print("Unexpected error in generate_30s_preview:", str(e))
        return None, None, None, None

def detect_audio_format(file_path: str) -> str:
    try:
        command = [FFMPEG_PATH, "-i", file_path]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stderr = result.stderr

        for line in stderr.splitlines():
            if "Input #" in line and "from" in line:
                parts = line.split(',')
                if len(parts) > 1:
                    return parts[1].strip()
    except Exception as e:
        print("Audio format detection failed:", str(e))
    return "unknown"

def detect_audio_duration(file_path: str) -> str:
    try:
        command = [
            FFMPEG_PATH,
            "-i", file_path
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stderr = result.stderr

        for line in stderr.splitlines():
            if "Duration" in line:
                parts = line.strip().split(',')
                if parts:
                    duration_part = parts[0]
                    if "Duration:" in duration_part:
                        return duration_part.split("Duration:")[1].strip()
    except Exception as e:
        print("Audio duration detection failed:", str(e))
    return "unknown"

def detect_bpm(file_path: str) -> str:
    try:
        import numpy as np
        import librosa

        y, sr = librosa.load(file_path, sr=None)
        # Use either beat_track or tempo; both return tempo in different formats
        tempo = librosa.beat.tempo(y=y, sr=sr)  # Returns ndarray

        if isinstance(tempo, (np.ndarray, list)):
            bpm = int(round(tempo[0]))
        else:
            bpm = int(round(tempo))

        return str(bpm)
    except Exception as e:
        print("BPM detection failed:", str(e))
        return None

