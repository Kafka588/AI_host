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

    with open("nb_solongo.wav", 'wb') as out:
        out.write(r.content)


print(synthesize('Шалгарсан оролцогч нартаа баяр хүргэе. Тэгвэл одоо энэ оны шилдэг ажилтнуудыг шалгаруулах мөч ирлээ. Ингээд шилдэг ажилтны шагналыг гардуулж өгнүү хэмээн Төлөөлөн удирдах зөвлөлийн нарийн бичгийн дарга Солонгоо таныг гарч ирэхийг урьж байна.'))