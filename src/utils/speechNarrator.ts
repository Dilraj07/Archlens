/**
 * Clean Web Speech API helper for voice narration in ArchLens.
 * Works completely in-browser without external API keys or server latency.
 */

export interface SpeechNarratorOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

class SpeechNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private rate: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer high-quality natural English voices
    const preferredVoices = [
      'Google US English',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Guy Online (Natural) - English (United States)',
      'Samantha',
      'Daniel',
      'en-US',
      'en-GB',
    ];

    for (const pref of preferredVoices) {
      const found = voices.find(
        (v) => v.name.includes(pref) || v.lang.startsWith(pref)
      );
      if (found) {
        this.voice = found;
        return;
      }
    }

    // Fallback to any English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
    this.voice = anyEnglish || voices[0] || null;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(text: string, options: SpeechNarratorOptions = {}) {
    if (!this.synth || this.isMuted) {
      options.onEnd?.();
      return;
    }

    // Stop any active speech first
    this.stop();

    const cleanText = text.replace(/<[^>]+>/g, '').trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.rate = options.rate ?? this.rate;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      // Don't treat cancellation as a hard error
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options.onError?.(e);
      }
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
      options.onEnd?.();
    };

    try {
      this.synth.speak(utterance);
    } catch {
      options.onEnd?.();
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.currentUtterance = null;
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth?.speaking && !this.synth?.paused);
  }

  public isPaused(): boolean {
    return Boolean(this.synth?.paused);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.rate;
  }
}

export const speechNarrator = new SpeechNarrator();
