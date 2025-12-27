import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { PokemonForBattle } from '../types/PokemonForBattle';
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
        // MusicManager.playMusic(this, 'main-menu-music');

        this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.logoTween = this.tweens.add({
            targets: this.logo,
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'Sine.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        const startButton = this.add.text(512, 550, 'INICIAR', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
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
