export type Message = {
  role: "user" | "bot";
  text: string;
};

export type AudioConfig = {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
};

export type TTSConfig = {
  voiceId: string;
  speed: number;
  pitch: number;
};