import os
import subprocess

EDGE_TTS_BIN = '/Users/toru/.local/bin/uvx'
AUDIO_DIR = '/Users/toru/.gemini/antigravity-ide/scratch/palash-tribal-pedagogy/public/audio'
ARTIFACT_DIR = '/Users/toru/.gemini/antigravity-ide/brain/d7f2710d-7d1f-4c01-9a65-c26f056d6685'

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

audio_tasks = [
    # 1. Main requested sentence: "Plants ko badhne ke liye paani aur suraj ki roshni chahiye"
    {
        "id": "plants_hindi_teacher",
        "title": "Teacher (Hindi Source)",
        "text": "पौधों को बढ़ने के लिए पानी और सूरज की रोशनी चाहिए।",
        "voice": "hi-IN-SwaraNeural"
    },
    {
        "id": "plants_santhali_output",
        "title": "SARJOM Translation to Santhali",
        "text": "दारे को हाराग लागिद दाग आर सिंजो मार्सल लाकतीग-आ।",
        "voice": "hi-IN-SwaraNeural"
    },
    {
        "id": "plants_ho_output",
        "title": "SARJOM Translation to Ho",
        "text": "दारु को हाराओ नान्ते दाः अड़ोः सिंगी मार्सल दरकार मेनाः।",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "plants_mundari_output",
        "title": "SARJOM Translation to Mundari",
        "text": "दारु को हाराओ लगिद दाः आर सिंगी मार्सल दरकार मेनाः।",
        "voice": "hi-IN-SwaraNeural"
    },

    # 2. Student 1: "Oh! Ab samajh aa gaya."
    {
        "id": "student1_santhali",
        "title": "Student 1 (Santhali Mother Tongue)",
        "text": "ओह! नितोग बुझाव एना।",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student1_ho",
        "title": "Student 1 (Ho Mother Tongue)",
        "text": "ओह! नाहः बुझाव याना।",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student1_mundari",
        "title": "Student 1 (Mundari Mother Tongue)",
        "text": "ओह! नाहः बुझाव याना।",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student1_hindi_translated",
        "title": "Student 1 Translated to Hindi for Teacher",
        "text": "ओह! अब समझ आ गया।",
        "voice": "hi-IN-SwaraNeural"
    },

    # 3. Student 2: "Ma'am, plants ko hawa bhi chahiye na?"
    {
        "id": "student2_santhali",
        "title": "Student 2 (Santhali Mother Tongue)",
        "text": "मैडम, दारे को होय हों लाकतीग-आ से?",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student2_ho",
        "title": "Student 2 (Ho Mother Tongue)",
        "text": "मैडम, दारु को होयो हो दरकार मेनाः आ ना?",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student2_mundari",
        "title": "Student 2 (Mundari Mother Tongue)",
        "text": "मैडम, दारु को होयो हो दरकार मेनाः आ ना?",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "student2_hindi_translated",
        "title": "Student 2 Translated to Hindi for Teacher",
        "text": "मैडम, पौधों को हवा भी चाहिए ना?",
        "voice": "hi-IN-SwaraNeural"
    },

    # 4. Teacher: "Haan, bilkul!"
    {
        "id": "teacher_reply_hindi",
        "title": "Teacher Reply (Hindi)",
        "text": "हाँ, बिल्कुल!",
        "voice": "hi-IN-SwaraNeural"
    },
    {
        "id": "teacher_reply_santhali",
        "title": "Teacher Reply Translated to Santhali",
        "text": "हें, सारि गे!",
        "voice": "hi-IN-SwaraNeural"
    },
    {
        "id": "teacher_reply_ho",
        "title": "Teacher Reply Translated to Ho",
        "text": "हेअ, सरि गे!",
        "voice": "hi-IN-MadhurNeural"
    },
    {
        "id": "teacher_reply_mundari",
        "title": "Teacher Reply Translated to Mundari",
        "text": "हेअ, सरि गे!",
        "voice": "hi-IN-SwaraNeural"
    },
]

print("🎙️ Generating Neural Voice Audio for 2-Way Classroom Scenario across Ho, Mundari, Santhali, and Hindi...")

for task in audio_tasks:
    pub_file = os.path.join(AUDIO_DIR, f"{task['id']}.mp3")
    art_file = os.path.join(ARTIFACT_DIR, f"{task['id']}.mp3")
    
    cmd = [
        EDGE_TTS_BIN,
        'edge-tts',
        '--voice', task['voice'],
        '--text', task['text'],
        '--write-media', pub_file,
        '--rate', '+0%',
        '--pitch', '+0Hz'
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(pub_file):
        subprocess.run(['cp', pub_file, art_file])
        size = os.path.getsize(pub_file)
        print(f"✅ Generated {task['title']} ({task['id']}.mp3 - {size} bytes)")
    else:
        print(f"❌ Failed to generate {task['id']}: {res.stderr}")

print("🎉 All audio outputs created and synced to artifacts directory!")
