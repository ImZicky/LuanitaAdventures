import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import MusicManager from '../MusicManager';

export class FinalPhase extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Phaser.Physics.Arcade.Sprite;
    keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        SPACE: Phaser.Input.Keyboard.Key;
    };
    lastDirection: string = 'front';
    playerInitialX: number;
    playerInitialY: number;

    constructor ()
    {
        super('FinalPhase');
    }

    init(data: { x: number, y: number }) {
        this.playerInitialX = data.x;
        this.playerInitialY = data.y;
    }

    create ()
    {
        MusicManager.playMusic(this, 'defaultPalletTown');

        this.camera = this.cameras.main;
        this.background = this.add.image(0, 0, 'FinalPhase').setOrigin(0, 0);
        this.background.setScale(3);

        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(this.playerInitialX, this.playerInitialY, 'luanita-back-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true);

        this.player.setScale(0.015);
        this.player.setInteractive(false);

        this.camera.startFollow(this.player);
        this.camera.setZoom(2);

        const animFrameRate = 5;

        this.anims.create({
            key: 'walk-down',
            frames: [
                { key: 'luanita-front-walk-left-foot' },
                { key: 'luanita-front-stopped' },
                { key: 'luanita-front-walk-right-foot' },
                { key: 'luanita-front-stopped' }
            ],
            frameRate: animFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: [
                { key: 'luanita-left-walk-left-foot' },
                { key: 'luanita-left-stopped' },
                { key: 'luanita-left-walk-right-foot' },
                { key: 'luanita-left-stopped' }
            ],
            frameRate: animFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-up',
            frames: [
                { key: 'luanita-back-walk-left-foot' },
                { key: 'luanita-back-stopped' },
                { key: 'luanita-back-walk-right-foot' },
                { key: 'luanita-back-stopped' }
            ],
            frameRate: animFrameRate,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-right',
            frames: [
                { key: 'luanita-right-walk-left-foot' },
                { key: 'luanita-right-stopped' },
                { key: 'luanita-right-walk-right-foot' },
                { key: 'luanita-right-stopped' }
            ],
            frameRate: animFrameRate,
            repeat: -1
        });

        if (this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE') as any;
        }

        EventBus.emit('current-scene-ready', this);
    }

    update ()
    {
        if (!this.keys) {
            return;
        }

        const speed = 200;
        let velocityX = 0;
        let velocityY = 0;

        if (this.keys.W.isDown)
        {
            velocityY = -speed;
        }
        else if (this.keys.S.isDown)
        {
            velocityY = speed;
        }

        if (this.keys.A.isDown)
        {
            velocityX = -speed;
        }
        else if (this.keys.D.isDown)
        {
            velocityX = speed;
        }

        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(velocityX, velocityY);

        if (this.keys.S.isDown)
        {
            this.player.anims.play('walk-down', true);
            this.lastDirection = 'front';
        }
        else if (this.keys.W.isDown)
        {
            this.player.anims.play('walk-up', true);
            this.lastDirection = 'back';
        }
        else if (this.keys.A.isDown)
        {
            this.player.anims.play('walk-left', true);
            this.lastDirection = 'left';
        }
        else if (this.keys.D.isDown)
        {
            this.player.anims.play('walk-right', true);
            this.lastDirection = 'right';
        }
        else if (velocityX === 0 && velocityY === 0)
        {
            this.player.anims.stop();
            this.player.setTexture(`luanita-${this.lastDirection}-stopped`);
        }
    }
}
