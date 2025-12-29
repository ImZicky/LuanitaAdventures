import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import MusicManager from '../MusicManager';

export class HomeSecondFloor extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    player: Phaser.Physics.Arcade.Sprite;
    keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        SPACE: Phaser.Input.Keyboard.Key;
    };
    lastDirection: string = 'front'; // Rastreia a última direção do movimento
    interactiveObstacles: Phaser.GameObjects.Rectangle[] = [];

    constructor ()
    {
        super('HomeSecondFloor');
    }

    create (data: { fromBattle?: boolean })
    {
        this.interactiveObstacles = [];

        if (data && data.fromBattle) {
            this.time.delayedCall(500, () => {
                EventBus.emit('show-dialog', 'Nossa.. mas que sonho foi esse???');
            });
        }

        MusicManager.setVolume(30);
        MusicManager.playMusic(this, 'defaultPalletTown');

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(0, 0, 'home-second-floor').setOrigin(0, 0);
        this.background.setScale(3); // Aumenta o tamanho do background

        // Define os limites do mundo para corresponder ao tamanho do background com zoom
        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(130, 280, 'luanita-front-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true); // Player collides with world bounds

        this.createObstacle({ x: 40, y: 220, width: 60, height: 100, interactionMessage: 'Essa é minha cama, o Tsuki ama dormir aqui... Ele é o meu gato mais companheiro, sempre tá comigo onde quer que eu ande nessa casa S2' });
        this.createObstacle({ x: 0, y: 0, width: 100, height: 60, interactionMessage: 'Esse é meu PC Gamer de multi-milionária, aqui é onde eu jogo muito Monster Hunter, Tekken e etc...  Aé também amo postar meus pensamentos sobre os pobres macacos da região de Bostíl ^^' });
        this.createObstacle({ x: 150, y: 0, width: 100, height: 60, interactionMessage: 'Aqui estão os meus livros, muita coisa sobre Massoterapia, Letras e se olhar bem de pertinho... tem um Kama Sutra :P' });
        this.createObstacle({ x: 365, y: 50, width: 50, height: 50 });
        this.createObstacle({ x: 490, y: -20, width: 50, height: 30, interactionMessage: 'Nossa! Hoje é meu aniversário!!! Parabéns pra mim!!!' });
        this.createObstacle({ x: 230, y: 170, width: 60, height: 100, interactionMessage: 'Esse é meu Super Nintendo que eu peguei aqui na feira do rolo do Chile, digo.. digo... Cidade de Pallet! Eu amo meus consoles clássicos e meu sonho é um dia estar em um jogo... se eu pudesse escolher... acho que em algum Pokemon de gba :)' });
        this.createObstacle({ x: 500, y: 380, width: 60, height: 60, interactionMessage: 'Esse pedaço de pau eu achei na rua, era bonito demais pra ir pra o lixo, então virou minha decoração, é o que dizem: "O lixo de um é o tesouro dos outros"' });

        // Teleport obstacle
        this.createObstacle({
            x: 400,
            y: 90,
            width: 20,
            height: 60,
            teleportTo: {
                scene: 'HomeFirstFloor',
                x: 420,
                y: 100
            }
        });

        this.player.setScale(0.015); // Ajuste na escala do personagem
        this.player.setInteractive(false); // Desativa interatividade do sprite

        this.camera.startFollow(this.player);
        this.camera.setZoom(2); // Aplica um zoom de 2x

        // Register event listeners
        this.registerEventListeners();
        this.events.once('shutdown', this.shutdown, this);

        const animFrameRate = 5; // Velocidade da animação - troca a cada 800ms

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

        // Animação para andar para a esquerda (A)
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

        // Animação para andar para cima (W)
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

        // Animação para andar para a direita (D)
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

        const speed = 200; // Velocidade reduzida - personagem anda mais devagar
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

        // Controla as animações baseado na direção do movimento
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

        // --- Interaction Logic ---
        const interactionDistance = 110; // The distance in pixels to allow interaction

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
                        this.scene.start(teleportTo.scene, { x: teleportTo.x, y: teleportTo.y });
                    } else if (message) {
                        EventBus.emit('show-dialog', message);
                    }
                }
                break; // Interact with the first obstacle in range
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
