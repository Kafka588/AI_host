import requests


def synthesize(text):
    url = "https://api.chimege.com/v1.2/synthesize"
    headers = {
        'Content-Type': 'plain/text',
        'Token': '5f5269c912cfec3cea3c5ec8b388b203bd6b759b68590e9bff0880a1c4ea619b',
        'Voice-id': 'FEMALE2v2',
    }

    r = requests.post(
        url, data=text.encode('utf-8'), headers=headers)

    with open("Test_1.wav", 'wb') as out:
        out.write(r.content)


print(synthesize('Сайн байцгаана уу, та бүхэнд энэ өдрийн мэнд хүргэе. Би дотоод аудитын газрын мэдээллийн технологийн хэлтсийн найм дахь ажилтан Номун байна. Манай шинэ жилийн хаус паартид тавтай морилно уу. Өнөөдөр бид хамтдаа тоглож, инээж, дурсамж бүтээх өдөр байх болно. Бүгдэд нь амжилт хүсье.'))