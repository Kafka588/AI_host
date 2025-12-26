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

    with open("Taniltsuulga.wav", 'wb') as out:
        out.write(r.content)


print(synthesize('Та өөрт хуваарилагдсан багийн дагуу уг кюүаар кодыг уншуулан бүртгэлээ үүсгээрэй. Ингэснээр бүтэн өдрийн үйл ажиллагаанд оролцох боломжтой болно. Амьдралыг ажлаар, шагналыг чармайлтаар. Ачаагаа хоёр давхарт тавин хорин минутын дараа нэг давхартаа эргээд уулзацгаая.'))