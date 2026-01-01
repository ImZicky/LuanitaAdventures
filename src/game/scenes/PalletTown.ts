import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import MusicManager from '../MusicManager';

export class PalletTown extends Scene
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
        super('PalletTown');
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

        this.background = this.add.image(0, 0, 'pallet-town-city').setOrigin(0, 0);
        this.background.setScale(3);

        this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.player = this.physics.add.sprite(this.playerInitialX, this.playerInitialY, 'luanita-front-stopped').setDepth(1);
        this.player.setCollideWorldBounds(true);

        //casas
        this.createObstacle({ x: 250, y: 170, width: 220, height: 150 }); // casa 1
        
        this.createObstacle({ 
            x: 330, 
            y: 300, 
            width: 10, 
            height: 10,
            teleportTo: {
                scene: 'HomeFirstFloor',
                x: 165,
                y: 390
            } 
        }); // casa 1

        this.createObstacle({ x: 680, y: 170, width: 220, height: 150 }); // casa 2
        this.createObstacle({ x: 630, y: 460, width: 320, height: 150 }); // lab

        //assets
        this.createObstacle({ x: 600, y: 60, width: 50, height: 20, interactionMessage: 'CALMA AE MINHA CARA CHILENA, SE QUISER QUE EU TE CODE UM JOGO INTEIRINHO ENTÃO PAGA NÓIS MEU NOBRE :P por enquanto você pode explorar Pallet e em seguida ir ver o professor Oak' }); // aviso da unica saida da cidade

        this.createObstacle({ x: 350, y: 830, width: 170, height: 370 }); // rio
        this.createObstacle({ x: 0, y: 0, width: 70, height: 900 }); // arvores esquerda
        this.createObstacle({ x: 0, y: 0, width: 1100, height: 70 }); // arvores cima
        this.createObstacle({ x: 1050, y: 0, width: 70 , height: 1100 }); // arvores direita


        
        
        //flores
        this.createObstacle({ x: 450, y: 530, width: 20 , height: 20, interactionMessage: 'Canteiro de flores Luanita Lied Rodriguez' }); // placa campo de flores
        this.createObstacle({ x: 330, y: 680, width: 60 , height: 10, interactionMessage: 'Bulba: Sei que você pediu cartas de Pokémon, mas achei que te colocar dentro de um jogo Pokémon seria mais divertido 😄 Feliz aniversário, Luanita! ( Eu também não tenho seu endereço, então é o que me sobrou, usar a criatividade :P )' }); // buba
        this.createObstacle({ x: 250, y: 530, width: 150 , height: 10 }); // cerca do canteiro de flores
        this.createObstacle({ x: 250, y: 680, width: 20 , height: 10 , interactionMessage: 'Não conheço todas as flores do mundo, mas quis deixar esse cantinho aqui pra te desejar coisas boas. Que seu novo ano venha leve, divertido e cheio de conquistas!'}); // placa campo de flores

        this.createObstacle({ x: 630, y: 770, width: 250 , height: 10 }); // cerca do canteiro de flores 2
        this.createObstacle({ x: 780, y: 770, width: 20 , height: 20 , interactionMessage: 'Esse é o Laboratório do professor Carvalho! Melhor me apressar e ver o que ele quer comigo...'}); // placa campo do lab

        //CARTAS
        this.createObstacle({ x: 200, y: 300, width: 20 , height: 20 , interactionMessage: 'Tem uma carta aqui... está escrito: "Hoje não é só seu aniversário, é o dia que o mundo sorri um pouco mais, porque tem você nele! Porque celebrar sua existencia, é uma alegria que nunca envelhece, um presente que a vida me deu" '}); // carta da casa da luanita
        this.createObstacle({ x: 650, y: 300, width: 20 , height: 20 , interactionMessage: 'Tem uma carta aqui... está escrito: あと何回君と笑えるの 集めた一秒を永遠にしていけるかな é uma pena que eu não sei falar japones...'}); // carta da casa 2

        
        // Teleport obstacle
        this.createObstacle({
            x: 760,
            y: 600,
            width: 50,
            height: 20,
            teleportTo: {
                scene: 'Lab',
                x: 300,
                y: 500
            }
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
