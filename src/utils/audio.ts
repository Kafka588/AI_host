export async function resampleAudio(
  webmBlob: Blob
): Promise<{ wavBlob: Blob; success: boolean; error?: string }> {
  try {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Check original audio level
    const originalData = audioBuffer.getChannelData(0);
    let originalMax = 0;
    for (let i = 0; i < originalData.length; i++) {
      originalMax = Math.max(originalMax, Math.abs(originalData[i]));
    }

    if (originalMax < 0.001) {
      return {
        wavBlob: new Blob(),
        success: false,
        error: "Микрофон дуу авахгүй байна. Тохиргоо шалгана уу.",
      };
    }

    // Resample to 16kHz
    const targetSampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(
      1,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    const pcmData = resampledBuffer.getChannelData(0);

    const wavBlob = encodeWavFromFloat32(pcmData, targetSampleRate);
    return { wavBlob, success: true };
  } catch (error) {
    return {
      wavBlob: new Blob(),
      success: false,
      error: "Аудио хөрвүүлэх алдаа.",
    };
  }
}

function encodeWavFromFloat32(samples: Float32Array, sampleRate: number): Blob {
  // Check if audio is silent
  let maxAmplitude = 0;
  for (let i = 0; i < samples.length; i++) {
    maxAmplitude = Math.max(maxAmplitude, Math.abs(samples[i]));
  }

  // Normalize to use full dynamic range
  const normalizedSamples = new Float32Array(samples.length);
  const gain = maxAmplitude > 0 ? Math.min(1.0 / maxAmplitude, 10.0) : 1.0;

  for (let i = 0; i < samples.length; i++) {
    normalizedSamples[i] = samples[i] * gain;
  }

  const buffer = new ArrayBuffer(44 + normalizedSamples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + normalizedSamples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, normalizedSamples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < normalizedSamples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, normalizedSamples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}