// Lazy-loaded CC0 ambient soundscape mixer (strictly OFF by default until user opt-in)

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private sourcesStarted = false;
  private loading = false;
  private enabled = false;
  private scrollMix = 0.15;

  private getExt(): string {
    if (typeof document === 'undefined') return 'mp3';
    const probe = document.createElement('audio');
    return probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public async toggle(): Promise<boolean> {
    if (this.enabled) {
      this.disable();
      return false;
    }
    await this.enable();
    return this.enabled;
  }

  public async enable(): Promise<void> {
    if (this.loading) return;
    this.loading = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (!this.sourcesStarted && this.ctx) {
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const ext = this.getExt();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.windGain = this.ctx.createGain();
        this.waterGain = this.ctx.createGain();
        this.windGain.connect(this.masterGain);
        this.waterGain.connect(this.masterGain);

        const [windRes, waterRes] = await Promise.all([
          fetch(`${base}/audio/alpine-wind.${ext}`),
          fetch(`${base}/audio/mountain-water.${ext}`),
        ]);

        const [windBuf, waterBuf] = await Promise.all([
          windRes.arrayBuffer().then((ab) => this.ctx!.decodeAudioData(ab)),
          waterRes.arrayBuffer().then((ab) => this.ctx!.decodeAudioData(ab)),
        ]);

        const windSrc = this.ctx.createBufferSource();
        windSrc.buffer = windBuf;
        windSrc.loop = true;
        windSrc.connect(this.windGain);
        windSrc.start(0);

        const waterSrc = this.ctx.createBufferSource();
        waterSrc.buffer = waterBuf;
        waterSrc.loop = true;
        waterSrc.connect(this.waterGain);
        waterSrc.start(0);

        this.sourcesStarted = true;
      }

      this.enabled = true;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.32, this.ctx.currentTime + 0.8);
      }
      this.applyScrollMix();
    } catch {
      this.enabled = false;
    } finally {
      this.loading = false;
    }
  }

  public disable(): void {
    this.enabled = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);
    }
  }

  /** Crossfade wind (high altitude) <-> water/stream (glacier melt -> waterfall -> river) */
  public setScrollProgress(progress01: number): void {
    this.scrollMix = Math.max(0, Math.min(1, progress01));
    if (this.enabled) {
      this.applyScrollMix();
    }
  }

  private applyScrollMix(): void {
    if (!this.ctx || !this.windGain || !this.waterGain) return;
    const t = this.ctx.currentTime;
    // Water peaks across glacier/waterfall/gorge (0.28..0.72), wind dominates summit dawn (<0.28)
    const waterWeight = Math.min(1, Math.max(0.08, Math.sin(this.scrollMix * Math.PI * 1.1)));
    const windWeight = Math.max(0.22, 1 - waterWeight * 0.65);

    this.windGain.gain.setTargetAtTime(windWeight, t, 0.25);
    this.waterGain.gain.setTargetAtTime(waterWeight, t, 0.25);
  }
}

export const ambientAudio = new AmbientAudioEngine();
