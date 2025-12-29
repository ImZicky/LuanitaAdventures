import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { PokemonForBattle } from '../types/PokemonForBattle';
import MusicManager from '../MusicManager';
//import MusicManager from '../MusicManager';

export class MainMenu extends Scene
{
    logo: Phaser.GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    playerTeam: PokemonForBattle[];
    enemyPokemon: PokemonForBattle;

    constructor ()
    {
        super('MainMenu');
    }

    init(data: { playerTeam: PokemonForBattle[], enemyPokemon: PokemonForBattle }) 
    {
        this.playerTeam = data.playerTeam;
        this.enemyPokemon = data.enemyPokemon;
    }

    create ()
    {
        MusicManager.playMusic(this, 'poke-menu-audio');

        const camera = this.cameras.main;
        camera.setBackgroundColor(0x000000);

        const centerX = camera.width / 2;
        const centerY = camera.height / 2;

        const backgroundVideo = this.add.video(centerX, centerY, 'poke-menu-background-video');
        backgroundVideo.setOrigin(0.5);
        backgroundVideo.setLoop(true);
        backgroundVideo.setMute(true);

        backgroundVideo.on('play', () => {
            const htmlVideo = backgroundVideo.video;
            const sourceWidth = htmlVideo && htmlVideo.videoWidth ? htmlVideo.videoWidth : backgroundVideo.width;
            const sourceHeight = htmlVideo && htmlVideo.videoHeight ? htmlVideo.videoHeight : backgroundVideo.height;

            if (sourceWidth > 0 && sourceHeight > 0) {
                const scaleX = camera.width / sourceWidth;
                const scaleY = camera.height / sourceHeight;
                const scale = Math.max(scaleX, scaleY);
                backgroundVideo.setScale(scale);
            }
        });

        backgroundVideo.play();

        const startButton = this.add.text(350, 640, 'CLIQUE AQUI E INICIE', {
            fontFamily: 'Arial Black', fontSize: 50, color: '#ffffff', backgroundColor: '#000',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setDepth(100).setOrigin(0.5);

        startButton.setInteractive();

        startButton.on('pointerover', () => {
            startButton.setColor('#ffff00');
            this.tweens.add({ targets: startButton, scale: 1.1, duration: 100 });
        });

        startButton.on('pointerout', () => {
            startButton.setColor('#ffffff');
            this.tweens.add({ targets: startButton, scale: 1, duration: 100 });
        });

        startButton.on('pointerdown', () => {
            this.logoTween?.stop();
            this.scene.start('HomeSecondFloor', { playerTeam: this.playerTeam, enemyPokemon: this.enemyPokemon });
        });

        EventBus.emit('current-scene-ready', this);
    }
}
