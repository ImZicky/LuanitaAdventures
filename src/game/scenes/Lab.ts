import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import MusicManager from '../MusicManager';

export class Lab extends Scene
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
    interactiveObstacles: Phaser.GameObjects.Rectangle[] = [];
    playerInitialX: number;
    playerInitialY: number;

    constructor ()
    {
        super('Lab');
    }

    init(data: { x: number, y: number }) {
        this.playerInitialX = data.x;
        this.playerInitialY = data.y;
    }

    create ()
    {
        this.interactiveObstacles = [];

        MusicManager.playMusic(this, 'defaultPalletTown');

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(0, 0, 'lab').setOrigin(0, 0);
        this.background.setScale(3);

        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(this.playerInitialX, this.playerInitialY, 'luanita-back-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true);

        //casas
        this.createObstacle({ x: 0, y: 0, width: 600, height: 70 }); // cima lab
        this.createObstacle({ x: 380, y: 180, width: 130, height: 50 }); // mesa
        this.createObstacle({ x: 340, y: 180, width: 50, height: 50, interactionMessage: 'Prof esticado: Luanita! Um experimento meu saiu muito errado... meu amigo alquimista Shou Tucker me ensinou sobre alquimia, logo na minha 1a tentativa um monstro enorme surgiu! e ele está indo para a sala dos campeões do Indigo Plateou para devorar os pokemons que estão por lá, vc deve salvá-los! Entre na maquina ao lado e salve-os!' }); // prof
        this.createObstacle({ x: 0, y: 350, width: 230, height: 70 }); // livros esquerda
        this.createObstacle({ x: 390, y: 350, width: 230, height: 70 }); // livros direita
        this.createObstacle({ x: 0, y: 550, width: 600, height: 70 }); // entrada

        this.createObstacle({ 
            x: 55, 
            y: 180, 
            width: 70, 
            height: 70,
            teleportTo: {
                scene: 'FinalBattleArena',
                x: 300,
                y: 800
            }
         }); // maquina de teleporte


                this.createObstacle({ 
            x: 280, 
            y: 550, 
            width: 50, 
            height: 30,
            teleportTo: {
                scene: 'PalletTown',
                x: 780,
                y: 650
            }
         }); // palletTown


        this.player.setScale(0.015);
        this.player.setInteractive(false);

        this.camera.startFollow(this.player);
        this.camera.setZoom(2);

        // Register event listeners
        this.registerEventListeners();

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

        const interactionDistance = 110;
        let interactionAvailable = false;

        for (const obstacle of this.interactiveObstacles) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                obstacle.x,
                obstacle.y
            );

            if (distance < interactionDistance) {
                const message = obstacle.getData('interactionMessage');
                const teleportTo = obstacle.getData('teleportTo');

                interactionAvailable = !!message || !!teleportTo;

                if (interactionAvailable && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                    if (teleportTo) {
                        this.scene.start(teleportTo.scene, { x: teleportTo.x, y: teleportTo.y });
                    } else if (message) {
                        EventBus.emit('show-dialog', message);
                    }
                }
                break;
            }
        }

        EventBus.emit('interaction-available', interactionAvailable);
    }

    shutdown() {
        // Clean up event listeners
        EventBus.off('open-menu', this.pausePhysics, this);
        EventBus.off('close-menu', this.resumePhysics, this);
        EventBus.off('go-to-main-menu', this.goToMainMenu, this);
        EventBus.off('pause-game', this.pausePhysics, this);
        EventBus.off('resume-game', this.resumePhysics, this);
    }

    private registerEventListeners() {
        EventBus.on('open-menu', this.pausePhysics, this);
        EventBus.on('close-menu', this.resumePhysics, this);
        EventBus.on('go-to-main-menu', this.goToMainMenu, this);
        EventBus.on('pause-game', this.pausePhysics, this);
        EventBus.on('resume-game', this.resumePhysics, this);
    }

    private pausePhysics() {
        if (this.physics && this.physics.world) {
            this.physics.pause();
        }
    }

    private resumePhysics() {
        if (this.physics && this.physics.world) {
            this.physics.resume();
        }
    }

    private goToMainMenu() {
        if (this.physics && this.physics.world) {
            this.physics.resume();
        }
        this.scene.start('MainMenu');
    }

    private createObstacle(options: {
        x: number;
        y: number;
        width: number;
        height: number;
        interactionMessage?: string;
        teleportTo?: {
            scene: string;
            x: number;
            y: number;
        };
        color?: number;
        alpha?: number;
    }) {
        const { x, y, width, height, interactionMessage, teleportTo, alpha = 0.0 } = options;
        let { color = 0xffffff } = options;

        if (interactionMessage) {
            color = 0x00ff00;
        }

        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(x, y, width, height);
        graphics.setDepth(2);

        const obstacleBody = this.add.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height
        );
        this.physics.add.existing(obstacleBody, true);

        this.physics.add.collider(this.player, obstacleBody);

        if (interactionMessage || teleportTo) {
            if (interactionMessage) {
                obstacleBody.setData('interactionMessage', interactionMessage);
            }
            if (teleportTo) {
                obstacleBody.setData('teleportTo', teleportTo);
            }
            this.interactiveObstacles.push(obstacleBody as Phaser.GameObjects.Rectangle);
        }
    }
}
