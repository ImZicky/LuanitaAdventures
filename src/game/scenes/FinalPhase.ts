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
    interactiveObstacles: Phaser.GameObjects.Rectangle[] = [];
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

        this.createObstacle({ x: 0, y: 0, width: 200, height: 100 }); // cima arena esq
        this.createObstacle({ x: 230, y: 120, width: 70, height: 30, interactionMessage: 'PARABÉNS!!! GRAÇAS AO PODER DO VEGETARIANISMO O XJ-MON FOI DERROTADO!!! e é claro, parabéns por mais um ano de vida ;) espero que tenha gostado do meu presente, já tentou interagir com os seus pokemons favoritos aqui dessa sala? garanto que vai valer apena! E bom, espero ter tirado ao menos um sorriso seu'}); // cima arena meio
        this.createObstacle({ x: 340, y: 0, width: 200, height: 100 }); // cima arena dir

        this.createObstacle({ x: 0, y: 550, width: 200, height: 400 }); // baixo arena
        this.createObstacle({ x: 350, y: 550, width: 200, height: 400 }); // baixo arena

        // Add Pokémon NPCs
        this.createPokemonObstacle({ x: 90, y: 250, pokemonId: 448, message: 'Mega Lucario EX (Secret) 113/111 XY-Furious Fists Holo' });
        this.createPokemonObstacle({ x: 90, y: 350, pokemonId: 94, message: 'Gengar ex (108/112)' });
        this.createPokemonObstacle({ x: 90, y: 450, pokemonId: 6, message: 'Charizard Holográfica da 1ª Edição (Base Set) de 1999' });
        this.createPokemonObstacle({ x: 430, y: 250, pokemonId: 658, message: 'Greninja (323/XY-P)' });
        this.createPokemonObstacle({ x: 430, y: 350, pokemonId: 724, message: '2017 POKEMON SUN & MOON GUARDIANS RISING SECRET FULL ART/DECIDUEYE GX PSA 10' });
        this.createPokemonObstacle({ x: 430, y: 450, pokemonId: 418, message: 'Pokemon Zukan (2007) Buneary/Buizel Special Card POP2!! None Higher-Pristine 10' });

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

        this.registerEventListeners();
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
                    const pokemonId = obstacle.getData('pokemonId');

                    if (pokemonId) {
                        EventBus.emit('show-pokemon-card', pokemonId);
                    }

                    if (teleportTo) {
                        this.scene.start(teleportTo.scene, { x: teleportTo.x, y: teleportTo.y });
                    } else if (message) {
                        EventBus.emit('show-dialog', message);
                    }
                }
                break;
            }
        }
    }

    shutdown() {
        this.unregisterEventListeners();
    }

    private registerEventListeners() {
        EventBus.on('open-menu', this.pausePhysics, this);
        EventBus.on('close-menu', this.resumePhysics, this);
        EventBus.on('go-to-main-menu', this.goToMainMenu, this);
        EventBus.on('pause-game', this.pausePhysics, this);
        EventBus.on('resume-game', this.resumePhysics, this);
    }

    private unregisterEventListeners() {
        EventBus.off('open-menu', this.pausePhysics, this);
        EventBus.off('close-menu', this.resumePhysics, this);
        EventBus.off('go-to-main-menu', this.goToMainMenu, this);
        EventBus.off('pause-game', this.pausePhysics, this);
        EventBus.off('resume-game', this.resumePhysics, this);
    }

    private pausePhysics() {
        this.physics.pause();
        this.player.anims.stop();
    }

    private resumePhysics() {
        this.physics.resume();
    }

    private goToMainMenu() {
        this.scene.start('MainMenu');
    }

    private createPokemonObstacle(options: {
        x: number;
        y: number;
        pokemonId: number;
        message: string;
    }) {
        const pokemonSprite = this.add.sprite(options.x, options.y, `pokemon_${options.pokemonId}_front`);
        pokemonSprite.setScale(1);
        pokemonSprite.setDepth(1);

        const interactionWidth = pokemonSprite.width;
        const interactionHeight = pokemonSprite.height;

        const obstacle = this.add.rectangle(
            options.x,
            options.y,
            interactionWidth,
            interactionHeight,
            0x00ff00,
            0.0 // Make it invisible
        );
        obstacle.setOrigin(0.5, 0.5);

        this.physics.add.existing(obstacle, true);
        obstacle.setData('interactionMessage', options.message);
        obstacle.setData('pokemonId', options.pokemonId);
        this.interactiveObstacles.push(obstacle);
        this.physics.add.collider(this.player, obstacle);
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
        const { x, y, width, height, interactionMessage, teleportTo, alpha = 0.3 } = options;
        let { color = 0xff0000 } = options;

        if (interactionMessage) {
            color = 0x00ff00;
        }

        // Create a visual representation for the obstacle
        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(x, y, width, height);
        graphics.setDepth(2); // Ensure it's visible above other elements

        // Create a static physics body for the obstacle area
        const obstacleBody = this.add.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height
        );
        this.physics.add.existing(obstacleBody, true); // true for static

        // Add collider between the player and the obstacle
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
