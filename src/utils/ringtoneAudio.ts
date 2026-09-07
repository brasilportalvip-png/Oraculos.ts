/**
 * Web Audio API synthesizer for realistic incoming call ringtone.
 * Emulates a melodic mobile phone ring chime with zero external audio assets.
 */

let audioCtx: AudioContext | null = null;
let ringInterval: number | null = null;
let isCurrentlyRinging = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a single phone ring phrase (melodic chime cadence)
 */
function playRingPhrase(ctx: AudioContext) {
  if (!isCurrentlyRinging) return;

  const now = ctx.currentTime;

  // Melodic notes sequence reminiscent of a clean modern smartphone ring
  // (A4: 440, C#5: 554.37, E5: 659.25, A5: 880, E5: 659.25, A5: 880)
  const notes = [
    { freq: 440.0, start: 0.0, dur: 0.18 },
    { freq: 554.37, start: 0.16, dur: 0.18 },
    { freq: 659.25, start: 0.32, dur: 0.22 },
    { freq: 880.0, start: 0.52, dur: 0.30 },
    { freq: 659.25, start: 0.84, dur: 0.18 },
    { freq: 880.0, start: 1.02, dur: 0.45 },
  ];

  notes.forEach(({ freq, start, dur }) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Dual harmonic content for rich bell/ringtone timber
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Subtle vibrato/ring vibe
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.28, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    } catch {
      // Audio context might be restricted before first click
    }
  });
}

/**
 * Starts playing incoming call phone ringtone in loop.
 * Returns a cancel/stop function.
 */
export function startPhoneRingtone(): () => void {
  if (isCurrentlyRinging) {
    return stopPhoneRingtone;
  }

  isCurrentlyRinging = true;

  try {
    const ctx = getAudioContext();
    // Play immediately
    playRingPhrase(ctx);

    // Loop every 2.4 seconds
    ringInterval = window.setInterval(() => {
      if (!isCurrentlyRinging) {
        stopPhoneRingtone();
        return;
      }
      playRingPhrase(ctx);
    }, 2400);
  } catch (err) {
    console.warn('[Ringtone] Não foi possível inicializar áudio:', err);
  }

  return stopPhoneRingtone;
}

/**
 * Stops any playing ringtone immediately.
 */
export function stopPhoneRingtone(): void {
  isCurrentlyRinging = false;
  if (ringInterval !== null) {
    window.clearInterval(ringInterval);
    ringInterval = null;
  }
}

export function isRingingActive(): boolean {
  return isCurrentlyRinging;
}
