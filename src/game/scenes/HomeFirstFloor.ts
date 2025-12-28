import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { PokemonForBattle } from '../types/PokemonForBattle';
import MusicManager from '../MusicManager';

export class HomeFirstFloor extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    player: Phaser.Physics.Arcade.Sprite;
    playerTeam: PokemonForBattle[];
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
        super('HomeFirstFloor');
    }

    init(data: { x: number, y: number, playerTeam: PokemonForBattle[] }) {
        this.playerInitialX = data.x;
        this.playerInitialY = data.y;
        this.playerTeam = data.playerTeam;
    }

    create ()
    {
        this.interactiveObstacles = [];

        MusicManager.playMusic(this, 'defaultPalletTown');

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(0, 0, 'home-first-floor').setOrigin(0, 0);
        this.background.setScale(3);

        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(this.playerInitialX, this.playerInitialY, 'luanita-front-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true);

        // Obstacles for HomeFirstFloor
        this.createObstacle({ x: 0, y: 0, width: 100, height: 50, interactionMessage: 'Louça lavadinha... a mãe é braba demais :P' });
        this.createObstacle({ x: 100, y: 0, width: 100, height: 50 }); // armarinho
        this.createObstacle({ x: 0, y: 280, width: 50, height: 100 }); // planta esquerda
        this.createObstacle({ x: 520, y: 280, width: 50, height: 100 }); // planta direita
        this.createObstacle({ x: 480, y: 280, width: 50, height: 50, interactionMessage: 'Mãe: Oi minha filha, Parabéns !!! é seu aniversário e estou muito feliz por mais um ciclo na sua vida, espero que você seja a melhor mãe do mundo pra o Liam, se esforce pra isso! Aé verdade... o Professor Carvalho me disse que tá te esperando no laboratório, parece que algo urgente ocorreu por lá em um experimento e só você pode ajudar...' }); // mae
        this.createObstacle({ x: 240, y: 0, width: 50, height: 50, interactionMessage: 'Nossa pelo visto o clima hoje vai ser bem ensolarado de novo... saudade de um friozinho...' });
        this.createObstacle({ x: 200, y: 180, width: 180, height: 100, interactionMessage: 'Não tem um pão nessa casa... mais tarde vou jogar um Tekkenzinho pra desestressar dessa fome que eu to ">-<' });

        // Teleport obstacle
        this.createObstacle({
            x: 140,
            y: 410,
            width: 50,
            height: 20,
            teleportTo: {
                scene: 'PalletTown',
                x: 300,
                y: 390
            },
            color: 0x800080, // Purple
            alpha: 0.5
        });

        this.createObstacle({ 
            x: 460, 
            y: 60, 
            width: 20, 
            height: 50, 
            teleportTo: {
                scene: 'HomeSecondFloor',
                x: 430,
                y: 90
            },
            color: 0x800080, // Purple
            alpha: 0.5            
        });


        
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

        for (const obstacle of this.interactiveObstacles) {
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                obstacle.x,
                obstacle.y
            );

            if (distance < interactionDistance) {
                if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                    const message = obstacle.getData('interactionMessage');
                    const teleportTo = obstacle.getData('teleportTo');

                    if (teleportTo) {
                        this.scene.start(teleportTo.scene, { x: teleportTo.x, y: teleportTo.y, playerTeam: this.playerTeam });
                    } else if (message) {
                        EventBus.emit('show-dialog', message);
                    }
                }
                break;
            }
        }
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
