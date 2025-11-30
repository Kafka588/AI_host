export const EVENT_DATA = `
1. Welcome drink & kit (12:00-12:30) 0 coin
2. House QR hunt (12:30-13:30) variable coin
3. Lunch (13:30-14:30)
4. Team challenge (14:30-15:00) 3 coin
5. Talent showcase (15:00-15:30) 5 coin
6. Lucky box (15:30-16:00)
7. Cover singer (16:00-16:15)
8. Secret Santa (16:15-17:30) guess = 1 coin
12. Mini Countdown (22:50-23:00)
`;

export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
};

export const TTS_DEFAULT = {
  voiceId: "FEMALE3v2",
  speed: 1,
  pitch: 1,
};

export const INITIAL_MESSAGE = {
  role: "bot" as const,
  text: "Сайн байна уу! Асуух зүйлээ бичих эсвэл 🎤 дарж ярь.",
};