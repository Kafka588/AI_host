import requests


def synthesize(text):
    url = "https://api.chimege.com/v1.2/synthesize"
    headers = {
        'Content-Type': 'plain/text',
        'Token': '5f5269c912cfec3cea3c5ec8b388b203bd6b759b68590e9bff0880a1c4ea619b',
        'Voice-id': 'FEMALE1v2',
    }

    r = requests.post(
        url, data=text.encode('utf-8'), headers=headers)

    with open("output_FEMALE1v2.wav", 'wb') as out:
        out.write(r.content)


print(synthesize('Сайн байна уу, Би виртуал хөтлөгч байна, Шинэ жийлийн үдэшлэгт тавтай морилно уу!'))