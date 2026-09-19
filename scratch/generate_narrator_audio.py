import os
import subprocess

EDGE_TTS_BIN = '/Users/toru/.local/bin/uvx'
OUT_DIR = '/Users/toru/.gemini/antigravity-ide/scratch/palash-tribal-pedagogy/scratch/narrator_audio'
PUB_DIR = '/Users/toru/.gemini/antigravity-ide/scratch/palash-tribal-pedagogy/public'
ART_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685'

os.makedirs(OUT_DIR, exist_ok=True)

segments = [
    {
        "id": "seg1_gap",
        "target_start": 0,
        "target_end": 15,
        "text": "In many tribal classrooms, teachers and students may speak different languages. This language gap can make even a simple lesson difficult to understand."
    },
    {
        "id": "seg2_bridge",
        "target_start": 15,
        "target_end": 30,
        "text": "Here, the teacher is explaining a lesson in Hindi, while the students understand mainly their mother tongue. To bridge this gap, the teacher turns to Sarjom."
    },
    {
        "id": "seg3_realtime",
        "target_start": 30,
        "target_end": 48,
        "text": "First, the teacher selects Hindi as the source language and the student's mother tongue as the target language. The teacher simply speaks, and Sarjom translates the message and provides audio output."
    },
    {
        "id": "seg4_twoway",
        "target_start": 48,
        "target_end": 62,
        "text": "But communication works both ways. Students can speak in their mother tongue, and Sarjom translates their response into Hindi for the teacher."
    },
    {
        "id": "seg5_flashcards",
        "target_start": 62,
        "target_end": 78,
        "text": "Learning goes beyond translation. Sarjom provides multilingual flashcards, helping students understand new words and concepts through both language and visuals."
    },
    {
        "id": "seg6_quiz",
        "target_start": 78,
        "target_end": 92,
        "text": "After learning, students can practice with interactive quizzes aligned with foundational learning goals of NIPUN Bharat, making learning more engaging and measurable."
    },
    {
        "id": "seg7_directionart",
        "target_start": 92,
        "target_end": 100,
        "text": "Directionart further supports teachers with additional guidance during the learning process."
    },
    {
        "id": "seg8_ease",
        "target_start": 100,
        "target_end": 115,
        "text": "With Sarjom, teachers and students can communicate more easily, while students learn in the language they understand best."
    },
    {
        "id": "seg9_outro",
        "target_start": 115,
        "target_end": 120,
        "text": "Because when children understand the language, they can understand the lesson. Breaking Language Barriers. Building Better Learning."
    }
]

print("🎙️ Synthesizing 9 narrator script segments with edge-tts...")
voice = "en-IN-NeerjaNeural"

for seg in segments:
    out_file = os.path.join(OUT_DIR, f"{seg['id']}.mp3")
    cmd = [
        EDGE_TTS_BIN,
        'edge-tts',
        '--voice', voice,
        '--text', seg['text'],
        '--write-media', out_file,
        '--rate', '-4%',  # slightly relaxed pedagogical cadence
        '--pitch', '+0Hz'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        # Get audio duration via ffprobe
        dur_cmd = [
            '/opt/homebrew/bin/ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            out_file
        ]
        dur = subprocess.check_output(dur_cmd).decode('utf-8').strip()
        print(f"✅ {seg['id']} generated: {dur}s (Target window: {seg['target_start']}s to {seg['target_end']}s)")
    else:
        print(f"❌ Failed to generate {seg['id']}: {res.stderr}")

# Assemble full 120s soundtrack by placing each segment at its target timestamp
filter_complex = ""
inputs = []
for i, seg in enumerate(segments):
    inputs.extend(['-i', os.path.join(OUT_DIR, f"{seg['id']}.mp3")])
    delay_ms = int(seg['target_start'] * 1000)
    filter_complex += f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}];"

filter_complex += "".join([f"[a{i}]" for i in range(len(segments))])
filter_complex += f"amix=inputs={len(segments)}:normalize=0[aout]"

master_mp3 = os.path.join(OUT_DIR, "sarjom_narrator_master_2min.mp3")
pub_master = os.path.join(PUB_DIR, "sarjom_narrator_voiceover.mp3")
art_master = os.path.join(ART_DIR, "sarjom_narrator_voiceover.mp3")

mix_cmd = ['/opt/homebrew/bin/ffmpeg', '-y'] + inputs + [
    '-filter_complex', filter_complex,
    '-map', '[aout]',
    '-t', '120',
    master_mp3
]

print("\n🎧 Assembling 120-second master narrator soundtrack...")
subprocess.run(mix_cmd, check=True)

import shutil
shutil.copy2(master_mp3, pub_master)
shutil.copy2(master_mp3, art_master)
print(f"🎉 Master soundtrack generated: {master_mp3} -> {pub_master}")
