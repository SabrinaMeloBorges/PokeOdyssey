import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();
  private isPlaying = false;

  playMusic(url: string): void {
    if (!this.isPlaying) {
      this.audio.src = url;
      this.audio.loop = true;
      this.audio.play().catch(error => console.error('Erro ao reproduzir áudio:', error));
      this.audio.volume = 0.1;
      this.isPlaying = true;
    }
  }

  stopMusic(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }

  toggleMusic(): void {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(error => console.error('Erro ao reproduzir áudio:', error));
    }
    this.isPlaying = !this.isPlaying;
  }
}
