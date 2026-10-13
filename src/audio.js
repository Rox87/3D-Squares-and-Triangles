/**
 * Modulo de sintese sonora procedural cosmica via Web Audio API.
 * Nao requer download de arquivos externos.
 */

let audioCtx = null;
let masterGain = null;
let isAudioEnabled = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Ativa ou silencia a saida de som.
 * @param {boolean} enabled
 */
export function toggleSound(enabled) {
  isAudioEnabled = enabled;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  if (isAudioEnabled) {
    masterGain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.05);
  } else {
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
}

/**
 * Retorna se o som esta ativado.
 * @returns {boolean}
 */
export function isSoundEnabled() {
  return isAudioEnabled;
}

/**
 * Reproduz o acorde/pulso sintetizado da onda de choque cosmica.
 */
export function playShockwaveSound() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Pulso grave de impacto suave (Sub-bass)
  const oscBass = ctx.createOscillator();
  const gainBass = ctx.createGain();
  oscBass.type = 'sine';
  oscBass.frequency.setValueAtTime(140, now);
  oscBass.frequency.exponentialRampToValueAtTime(35, now + 0.6);

  gainBass.gain.setValueAtTime(0.35, now);
  gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  oscBass.connect(gainBass);
  gainBass.connect(masterGain);

  oscBass.start(now);
  oscBass.stop(now + 0.6);

  // 2. Chime cristalino espacial (Harmonicos agudos cintilantes)
  const frequencies = [528, 792, 1056]; // Frequencias de ressonancia pura
  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.03);

    gain.gain.setValueAtTime(0.08, now + idx * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.1);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + idx * 0.03);
    osc.stop(now + 0.9 + idx * 0.1);
  });
}
