import os
import tempfile
from werkzeug.datastructures import FileStorage
import librosa
import numpy as np
import ffmpeg

def generate_30s_preview(file: FileStorage):
    input_temp = None
    output_temp = None

    try:
        # Save uploaded file to a temporary location
        suffix = os.path.splitext(file.filename)[1]
        input_temp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        file.save(input_temp.name)

        # Optional: skip large files (>10MB)
        if os.path.getsize(input_temp.name) > 10 * 1024 * 1024:
            raise Exception("Uploaded file is too large. Max 10MB allowed.")

        # Generate preview (first 30s) to MP3
        output_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        output_path = output_temp.name
        output_temp.close()

        (
            ffmpeg
            .input(input_temp.name)
            .output(output_path, t=30, acodec='libmp3lame', audio_bitrate='192k')
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )

        duration = detect_audio_duration(input_temp.name)
        bpm = detect_bpm(input_temp.name)

        return input_temp.name, output_path, duration, bpm

    except ffmpeg.Error as e:
        print("FFmpeg error:", e.stderr.decode() if hasattr(e, "stderr") else str(e))
        return None, None, None, None

    except Exception as e:
        print("Unexpected error in generate_30s_preview:", str(e))
        return None, None, None, None


def detect_audio_format(file_path: str) -> str:
    try:
        probe = ffmpeg.probe(file_path)
        if 'format' in probe and 'format_name' in probe['format']:
            return probe['format']['format_name']
    except Exception as e:
        print("Audio format detection failed:", str(e))
    return "unknown"


def detect_audio_duration(file_path: str) -> str:
    try:
        probe = ffmpeg.probe(file_path)
        if 'format' in probe and 'duration' in probe['format']:
            seconds = float(probe['format']['duration'])
            mins = int(seconds // 60)
            secs = int(seconds % 60)
            return f"{mins}:{secs:02d}"
    except Exception as e:
        print("Audio duration detection failed:", str(e))
    return "unknown"


# ✅ Memory-safe, numba-free BPM detection
def detect_bpm(file_path: str) -> str:
    try:
        y, sr = librosa.load(file_path, sr=22050, duration=10, mono=True)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo_estimate = np.count_nonzero(onset_env > np.mean(onset_env)) / 10 * 60
        bpm = int(round(tempo_estimate))
        return str(bpm)
    except Exception as e:
        print("BPM detection failed:", str(e))
        return "0"
