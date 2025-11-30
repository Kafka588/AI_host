import requests

def transcribe(filename):
    with open(filename, 'rb') as f:
        audio = f.read()

    r = requests.post("https://api.chimege.com/v1.2/transcribe", data=audio, headers={
        'Content-Type': 'application/octet-stream',
        'Punctuate': 'true',
        'Token': 'a9a2dfad675f416eadae191b77cf74ed9d6d293a13dbec85141c933dcca0d931',
    })

    return r.content.decode("utf-8")

print(transcribe('input.wav'))