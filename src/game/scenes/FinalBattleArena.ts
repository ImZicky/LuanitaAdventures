import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import MusicManager from '../MusicManager';
import { usePokemonService } from '../services/pokemonService';
import { PokemonForBattle } from '../types/PokemonForBattle';

const pokemonService = usePokemonService();

export class FinalBattleArena extends Scene
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
    xjSprite: Phaser.GameObjects.Sprite;
    xjBattleTrigger: Phaser.GameObjects.Rectangle;
    arenaObstacle: Phaser.GameObjects.Rectangle;

    constructor ()
    {
        super('FinalBattleArena');
    }

    init(data: { x: number, y: number }) {
        this.playerInitialX = data.x;
        this.playerInitialY = data.y;
    }

    create (data: { battleWon?: boolean })
    {
        if (data && data.battleWon) {
            this.time.delayedCall(500, () => {
                EventBus.emit('show-dialog', { message: 'XJ: Quem diria que uma vegetariana iria me derrotar!!! MALDIÇÃAAAAO' });
                this.time.delayedCall(4000, () => {
                    EventBus.emit('show-dialog', { message: 'Luanita: Voce é fraco, gordo, imenso, e ainda por cima se orgulha de comer pokemons... XJ, vc é uma doença e eu sou a cura, agora suma e não volte mais!' });
                    this.time.delayedCall(8000, () => {
                        if (this.xjSprite) {
                            this.xjSprite.setVisible(false);
                        }
                        if (this.xjBattleTrigger) {
                            this.xjBattleTrigger.destroy();
                        }
                        if (this.arenaObstacle) {
                            this.arenaObstacle.setVisible(false)
                            this.arenaObstacle.destroy();
                        }
                                            
                        this.createObstacle({ 
                            x: 300, 
                            y: 50, 
                            width: 20, 
                            height: 20,                            
                            teleportTo: {
                                scene: 'FinalPhase',
                                x: 270,
                                y: 800
                            },
                            color: 0x800080, // Purple
                            alpha: 1.0 // Visível
                        }); 
                    });
                });
            });
        }
        MusicManager.playMusic(this, 'defaultPalletTown');

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(0, 0, 'FinalBattleArena').setOrigin(0, 0);
        this.background.setScale(3);

        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(this.playerInitialX, this.playerInitialY, 'luanita-back-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true);

        //casas
        this.arenaObstacle = this.createObstacle({ x: 0, y: 310, width: 600, height: 70 }); // cima finalArena
        this.createObstacle({ x: 0, y: 0, width: 250, height: 200 }); // cima arena
        this.createObstacle({ x: 370, y: 0, width: 200, height: 200 }); // cima arena


        this.createObstacle({ x: 0, y: 550, width: 250, height: 400 }); // baixo arena
        this.createObstacle({ x: 370, y: 550, width: 200, height: 400 }); // baixo arena

        this.xjSprite = this.physics.add.staticSprite(310, 330, 'XJ').setScale(1);

        this.xjBattleTrigger = this.createObstacle({
            x: 310,
            y: 330,
            width: 50,
            height: 50,
            interactionMessage: 'XJ-MON: Eu sou o XJ-MON, e eu devorarei todos os Pokemons da região de Kanto e do mundo!!! Se ajoelhe perante a mim sua reles vegetariana! MUAHAHA HAHAHA',
            teleportTo: {
                scene: 'Battle',
                x: 0,
                y: 0
            },
            alpha: 0,
            color: 0x800088 // Purple
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

                    if (message) {
                        EventBus.emit('show-dialog', { message, teleportTo });
                    } else if (teleportTo) {
                        this.handleTeleport(teleportTo);
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
        EventBus.off('teleport', this.handleTeleport, this);
    }

    private registerEventListeners() {
        EventBus.on('open-menu', this.pausePhysics, this);
        EventBus.on('close-menu', this.resumePhysics, this);
        EventBus.on('go-to-main-menu', this.goToMainMenu, this);
        EventBus.on('pause-game', this.pausePhysics, this);
        EventBus.on('resume-game', this.resumePhysics, this);
        EventBus.on('teleport', this.handleTeleport, this);
    }

    private handleTeleport(teleportData: { scene: string, x: number, y: number }) {
        if (teleportData) {
            this.teleport(teleportData.scene, teleportData.x, teleportData.y);
        }
    }

    private teleport(scene: string, x: number, y: number) {
        this.scene.start(scene, { x, y });
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
    }): Phaser.GameObjects.Rectangle {
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

        return obstacleBody as Phaser.GameObjects.Rectangle;
    }
}
