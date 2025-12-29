import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { PokemonForBattle, PokemonForBattleSkills } from '../types/PokemonForBattle';
import MusicManager from '../MusicManager';
import { usePokemonService } from '../services/pokemonService';

const pokemonService = usePokemonService();

export class Battle extends Scene {
    private playerTeam!: PokemonForBattle[];
    private currentPlayerIndex!: number;
    private playerPokemon!: PokemonForBattle; // O Pokémon atualmente em batalha
    private enemyPokemon!: PokemonForBattle;

    // --- ELEMENTOS DE UI ---
    private playerSprite!: Phaser.GameObjects.Sprite;
    private enemySprite!: Phaser.GameObjects.Sprite;
    private playerHealthBar!: Phaser.GameObjects.Graphics;
    private enemyHealthBar!: Phaser.GameObjects.Graphics;
    private messageText!: Phaser.GameObjects.Text;
    private playerInfoText!: Phaser.GameObjects.Text;
    private mainBattleMenu!: Phaser.GameObjects.Container;
    private attackMenu!: Phaser.GameObjects.Container;
    private pokemonMenu!: Phaser.GameObjects.Container;
    private bagMenu!: Phaser.GameObjects.Container;
    private enemyInfoText!: Phaser.GameObjects.Text;

    // --- CONTROLE DE ESTADO ---
    private isPlayerTurn: boolean = true;
    private potions: number = 5;
    private ozempika: number = 1;

    constructor() {
        super('Battle');
    }

    preload() {
        // As imagens dos Pokémon do jogador já foram carregadas na cena Preloader.
        // Aqui, carregamos apenas o sprite estático do inimigo.
        this.load.image(`enemy_0_front`, 'assets/XJ.png');
    }

    async create() {
        const loadingText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Preparando Batalha...', { font: '32px Arial', color: '#ffffff' }).setOrigin(0.5);

        this.cameras.main.setBackgroundColor(0x000000);
        MusicManager.playMusic(this, 'battle-music');

        // 1. Montar a equipe do jogador (busca de dados)
        const playerTeamIds = [448, 94, 6, 658, 724, 418]; // Lucario, Gengar, Charizard, Greninja, Decidueye, Buizel
        //const playerTeamIds = [448] // testing only
        this.playerTeam = [];
        for (const id of playerTeamIds) {
            const pokemonApi = await pokemonService.getPokemonById(id);
            const pokemonForBattle = await pokemonService.getPokemonForBattle(pokemonApi, 50, undefined, false, true);
            this.playerTeam.push(pokemonForBattle);
        }
        this.currentPlayerIndex = 0;
        this.playerPokemon = this.playerTeam[this.currentPlayerIndex];

        // 2. Calcular o HP total e criar o inimigo
        const totalHp = 1600;
        this.enemyPokemon = {
            id: 0,
            name: 'XJ-MON',
            nickname: undefined,
            level: 999,
            hp: totalHp,
            hpTotal: totalHp,
            levelXp: 0,
            type: [{ type: { name: 'unknown', url: '' }, slot: 0 }],
            skills: [
                { name: 'Explosão PUMclear', damage: 50, ppNow: 99, ppTotal: 99 },
                { name: 'DEVORADOR DE CARNES', damage: 50, ppNow: 99, ppTotal: 99  },
                { name: 'GRAVIDADE ELEVADA', damage: 50, ppNow: 99, ppTotal: 99  },
                { name: 'SUPER ARROTO', damage: 50, ppNow: 99, ppTotal: 99  },
            ],
            sprites: { front_default: 'assets/XJ.png' } as any,
            shiny: true
        };
        
        loadingText.destroy();

        // 3. Construir a UI da batalha agora que os dados estão prontos
        this.anims.create({
            key: 'battle-background-anim',
            frames: this.anims.generateFrameNumbers('battle-background-normal', { start: 0, end: -1 }),
            frameRate: 10,
            repeat: -1
        });

        const background = this.add.sprite(0, 0, 'battle-background-normal').setOrigin(0, 0);
        background.play('battle-background-anim');
        background.setScale(this.cameras.main.width / background.width, this.cameras.main.height / background.height);

        this.createBattleUI();
        this.displayMessage(`Uma batalha contra ${this.enemyPokemon.name} começou!`);
        EventBus.emit('current-scene-ready', this);
    }

    createBattleUI() {
        const playerX = 200, playerY = 450;
        const enemyX = 800, enemyY = 300;

        const playerSpriteKey = `player_${this.playerPokemon.id}_back`;
        const enemySpriteKey = `enemy_${this.enemyPokemon.id}_front`;

        this.playerSprite = this.add.sprite(playerX, playerY, playerSpriteKey).setScale(5);
        this.enemySprite = this.add.sprite(enemyX, enemyY, enemySpriteKey).setScale(2);

        const messageBox = this.add.graphics();
        messageBox.fillStyle(0x000000, 0.8).fillRect(50, 550, 924, 150);
        messageBox.lineStyle(4, 0xffffff, 1).strokeRect(50, 550, 924, 150);

        this.messageText = this.add.text(70, 570, '', { font: '24px Arial', color: '#ffffff', wordWrap: { width: 884 } });

        this.playerHealthBar = this.add.graphics();
        this.enemyHealthBar = this.add.graphics();
        this.updateHealthBars();

        this.playerInfoText = this.add.text(100, 270, `${this.playerPokemon.name.toUpperCase()} Lvl: ${this.playerPokemon.level}`,
            { font: '22px Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 4 });

        this.enemyInfoText = this.add.text(680, 50, `XJ-MON Lvl: 999`,
            { font: '22px Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 4 });

        this.createMainMenu();
        this.createPokemonMenu();
        this.createBagMenu();
        this.createAttackButtons();
    }

    displayMessage(message: string)
    {
        this.messageText.setText(message);
    }

    createMainMenu() {
        this.mainBattleMenu = this.add.container(700, 570);
        const fightButton = this.add.text(0, 0, 'FIGHT', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } }).setInteractive();
        const pokemonButton = this.add.text(100, 0, 'POKEMON', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } }).setInteractive();
        const bagButton = this.add.text(0, 40, 'BAG', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } }).setInteractive();
        const runButton = this.add.text(100, 40, 'RUN', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } }).setInteractive();

        this.mainBattleMenu.add([fightButton, pokemonButton, bagButton, runButton]);

        fightButton.on('pointerdown', () => this.showAttackMenu());
        pokemonButton.on('pointerdown', () => this.showPokemonMenu());
        bagButton.on('pointerdown', () => this.showBagMenu());
        runButton.on('pointerdown', () => this.runFromBattle());
    }

    showAttackMenu() {
        this.mainBattleMenu.setVisible(false);
        this.attackMenu.setVisible(true);
    }

    showPokemonMenu() {
        this.mainBattleMenu.setVisible(false);
        this.pokemonMenu.setVisible(true);
    }

    showBagMenu() {
        this.mainBattleMenu.setVisible(false);
        this.updateBagMenu(); // Atualiza a contagem de poções
        this.bagMenu.setVisible(true);
    }

    runFromBattle() {
        this.displayMessage('A gravidade de XJ-MON impede a fuga desta batalha!');
    }

    createAttackButtons() {
        if (this.attackMenu) {
            this.attackMenu.destroy();
        }

        this.attackMenu = this.add.container(700, 570);
        const attackButtons = this.playerPokemon.skills.map((attack, index) => {
            const button = this.add.text(0, index * 40, attack.name, {
                font: '22px Arial',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }).setInteractive();

            button.on('pointerdown', () => this.playerAttack(attack));
            return button;
        });

        const backButton = this.add.text(0, this.playerPokemon.skills.length * 40, 'BACK', {
            font: '22px Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.attackMenu.setVisible(false);
            this.mainBattleMenu.setVisible(true);
        });

        this.attackMenu.add([...attackButtons, backButton]);
        this.attackMenu.setVisible(false);
    }

    createPokemonMenu() {
        if (this.pokemonMenu) {
            this.pokemonMenu.destroy();
        }
    
        this.pokemonMenu = this.add.container(650, 450);
        const pokemonButtons = this.playerTeam.map((pokemon, index) => {
            const button = this.add.text(0, index * 40, `${pokemon.name} (HP: ${pokemon.hp}/${pokemon.hpTotal})`, {
                font: '20px Arial',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            });
    
            if (pokemon.hp > 0 && index !== this.currentPlayerIndex) {
                button.setInteractive();
                button.on('pointerdown', () => this.switchPokemon(index));
            } else {
                button.setAlpha(0.5);
            }
    
            return button;
        });
    
        const backButton = this.add.text(0, this.playerTeam.length * 40, 'BACK', {
            font: '22px Arial',
            color: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 10, y: 5 }
        }).setInteractive();
    
        backButton.on('pointerdown', () => {
            this.pokemonMenu.setVisible(false);
            this.mainBattleMenu.setVisible(true);
        });
    
        this.pokemonMenu.add([...pokemonButtons, backButton]);
        this.pokemonMenu.setVisible(false);
    }
    
    switchPokemon(newIndex: number) {
        if (!this.isPlayerTurn || this.currentPlayerIndex === newIndex || this.playerTeam[newIndex].hp <= 0) {
            return;
        }
    
        this.isPlayerTurn = false;
        this.pokemonMenu.setVisible(false);
    
        this.currentPlayerIndex = newIndex;
        this.playerPokemon = this.playerTeam[this.currentPlayerIndex];
    
        this.displayMessage(`Luanita jogou ${this.playerPokemon.nickname || this.playerPokemon.name} para a batalha`);
        this.updatePlayerUI();
    
        this.time.delayedCall(2000, () => this.enemyAttack());
    }

    createBagMenu() {
        this.bagMenu = this.add.container(700, 570);
        const potionText = this.add.text(0, 0, '', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } });
        const ozempikaText = this.add.text(0, 40, '', { font: '22px Arial', color: '#ffffff', backgroundColor: '#333333', padding: { x: 10, y: 5 } });
        const backButton = this.add.text(0, 80, 'BACK', { font: '22px Arial', color: '#ffffff', backgroundColor: '#555555', padding: { x: 10, y: 5 } }).setInteractive();

        potionText.setInteractive().on('pointerdown', () => this.usePotion());
        ozempikaText.setInteractive().on('pointerdown', () => this.useOzempika());
        backButton.on('pointerdown', () => {
            this.bagMenu.setVisible(false);
            this.mainBattleMenu.setVisible(true);
        });

        this.bagMenu.add([potionText, ozempikaText, backButton]);
        this.bagMenu.setVisible(false);
    }

    updateBagMenu() {
        const potionText = this.bagMenu.getAt(0) as Phaser.GameObjects.Text;
        const ozempikaText = this.bagMenu.getAt(1) as Phaser.GameObjects.Text;

        potionText.setText(`Potion x${this.potions}`);
        if (this.potions === 0 || this.playerPokemon.hp === this.playerPokemon.hpTotal) {
            potionText.setAlpha(0.5).removeInteractive();
        } else {
            potionText.setAlpha(1).setInteractive();
        }

        ozempikaText.setText(`OZEMPIKA x${this.ozempika}`);
        if (this.ozempika === 0) {
            ozempikaText.setAlpha(0.5).removeInteractive();
        } else {
            ozempikaText.setAlpha(1).setInteractive();
        }
    }

    usePotion() {
        if (this.potions > 0 && this.isPlayerTurn && this.playerPokemon.hp < this.playerPokemon.hpTotal) {
            this.isPlayerTurn = false;
            this.potions--;
            this.bagMenu.setVisible(false);

            const healAmount = 30;
            this.playerPokemon.hp = Math.min(this.playerPokemon.hpTotal, this.playerPokemon.hp + healAmount);
            this.updateHealthBars();

            this.displayMessage(`${this.playerPokemon.nickname || this.playerPokemon.name} usou uma Potion e recuperou ${healAmount} de HP!`);

            this.time.delayedCall(2000, () => this.enemyAttack());
        }
    }

    useOzempika() {
        if (this.ozempika > 0 && this.isPlayerTurn) {
            this.isPlayerTurn = false;
            this.ozempika--;
            this.bagMenu.setVisible(false);

            this.enemyPokemon.hp = 0;
            this.updateHealthBars();

            this.displayMessage('Luanita usou OZEMPIKA, a fome de XJ acabou, MEU DEUS DO CÉU, não sobrou nada....');

            this.time.delayedCall(3000, () => {
                this.displayMessage(`${this.enemyPokemon.name} foi derrotado!`);
                this.time.delayedCall(2000, () => {
                    this.scene.start('FinalBattleArena', { battleWon: true, x: 300, y: 400 });
                });
            });
        }
    }

    playerAttack(attack: PokemonForBattleSkills) {
        if (!this.isPlayerTurn) return;

        this.isPlayerTurn = false;
        this.attackMenu.setVisible(false);

        this.displayMessage(`${this.playerPokemon.nickname || this.playerPokemon.name} usou ${attack.name}!`);
        this.enemyPokemon.hp = Math.max(0, this.enemyPokemon.hp - attack.damage);
        this.updateHealthBars();

        if (this.enemyPokemon.hp <= 0) {
            this.time.delayedCall(1500, () => {
                this.displayMessage(`${this.enemyPokemon.name} foi derrotado!`);
                this.time.delayedCall(2000, () => {
                    this.scene.start('FinalBattleArena', { battleWon: true, x: 300, y: 400 });
                });
            });
            return;
        }

        this.time.delayedCall(2000, () => this.enemyAttack());
    }

    enemyAttack() {
        const attack = this.enemyPokemon.skills[Math.floor(Math.random() * this.enemyPokemon.skills.length)];
        this.displayMessage(`${this.enemyPokemon.name} usou ${attack.name}!`);

        // A lógica de dano do inimigo precisa ser ajustada se a estrutura de ataque for diferente
        const damage = (attack as any).damage || 50; // Usando um valor padrão caso o dano não esteja definido
        this.playerPokemon.hp = Math.max(0, this.playerPokemon.hp - damage);
        this.updateHealthBars();

        if (this.playerPokemon.hp <= 0) {
            this.time.delayedCall(1500, () => this.handlePlayerPokemonFainted());
            return;
        }

        this.time.delayedCall(2000, () => {
            this.displayMessage(`O que ${this.playerPokemon.nickname || this.playerPokemon.name} fará?`);
            this.isPlayerTurn = true;
            this.mainBattleMenu.setVisible(true);
        });
    }

    handlePlayerPokemonFainted() {
        this.displayMessage(`${this.playerPokemon.nickname || this.playerPokemon.name} foi derrotado!`);
        this.currentPlayerIndex++;

        if (this.currentPlayerIndex < this.playerTeam.length) {
            this.time.delayedCall(2000, () => {
                this.playerPokemon = this.playerTeam[this.currentPlayerIndex];
                this.displayMessage(`Vai, ${this.playerPokemon.nickname || this.playerPokemon.name}!`);
                this.updatePlayerUI();
                this.time.delayedCall(2000, () => {
                    this.displayMessage(`O que ${this.playerPokemon.nickname || this.playerPokemon.name} fará?`);
                    this.isPlayerTurn = true;
                    this.mainBattleMenu.setVisible(true);
                });
            });
        } else {
            this.time.delayedCall(2000, () => {
                this.displayMessage('XJ-MON: UMA VEGETARIANA COMO VOCE JAMAIS VENCERIA UM GORDO COMO EU... E COMO EU NAO PARO DE FALAR COMO, LEMBREI QUE PRECISO COMER.... E COMO VC PERDEU... BOM... VOU TE COMER, VOU TE COMER, TE COMER TE COMER...');
                this.time.delayedCall(8000, () => {
                    this.scene.start('HomeSecondFloor', { fromBattle: true });
                });
            });
        }
    }

    updatePlayerUI() {
        const playerSpriteKey = `player_${this.playerPokemon.id}_back`;
        this.playerSprite.setTexture(playerSpriteKey);
        this.playerInfoText.setText(`${this.playerPokemon.name.toUpperCase()} Lvl: ${this.playerPokemon.level}`);
        this.updateHealthBars();
        this.createAttackButtons();
        this.createPokemonMenu();
    }

    updateHealthBars() {
        this.playerHealthBar.clear();
        this.enemyHealthBar.clear();

        this.playerHealthBar.fillStyle(0x808080, 1).fillRect(100, 300, 200, 20);
        this.playerHealthBar.fillStyle(0x00ff00, 1).fillRect(100, 300, (this.playerPokemon.hp / this.playerPokemon.hpTotal) * 200, 20);

        this.enemyHealthBar.fillStyle(0x808080, 1).fillRect(680, 80, 200, 20);
        this.enemyHealthBar.fillStyle(0x00ff00, 1).fillRect(680, 80, (this.enemyPokemon.hp / this.enemyPokemon.hpTotal) * 200, 20);
    }
}
