import { Scene } from 'phaser';

interface IVolumeManagedSound extends Phaser.Sound.BaseSound {
    volume: number;
}

class MusicManager {
    private static instance: MusicManager;
    private currentMusic: IVolumeManagedSound | null = null;
    private volume = 1;

    private constructor() { }

    public static getInstance(): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager();
        }
        return MusicManager.instance;
    }

    public playMusic(scene: Scene, musicKey: string) {
        // Stop currently playing music if it's different from the new one
        if (this.currentMusic && this.currentMusic.key !== musicKey) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }

        // If no music is playing or the requested music is different, start playing it
        if (!this.currentMusic) {
            this.currentMusic = scene.sound.add(musicKey, { loop: true, volume: this.volume }) as IVolumeManagedSound;
            this.currentMusic.play();
        }
    }

    public stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    public setVolume(volume: number) {
        // Phaser volume is between 0 and 1
        this.volume = Phaser.Math.Clamp(volume / 100, 0, 1);

        if (this.currentMusic) {
            this.currentMusic.volume = this.volume;
        }
    }
}

export default MusicManager.getInstance();
