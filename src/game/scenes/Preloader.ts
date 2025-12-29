import { Scene } from 'phaser';
import { usePokemonService } from '../services/pokemonService';
import { PokemonForBattle } from '../types/PokemonForBattle';

const pokemonService = usePokemonService();

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        this.load.setPath('assets');

        // Carrega assets estáticos
        this.load.image('home-second-floor', 'home-second-floor.png');
        this.load.image('home-first-floor', 'home-first-floor.png');
        this.load.image('pallet-town-city', 'pallet-town-city.png');
        this.load.image('FinalBattleArena', 'FinalBattleArena.png');
        this.load.image('FinalPhase', 'FinalPhase.png');
        this.load.image('XJ', 'XJ.png');
        this.load.image('lab', 'lab.png');
        this.load.spritesheet('battle-background-normal', 'battlefields/normal.png', { frameWidth: 400, frameHeight: 400 });
        this.load.video('poke-menu-background-video', 'poke-menu-background-video.mp4');
        this.load.image('menu-background', 'menu-background.png');
        this.load.image('luanita-front-stopped', 'luanita-front-stopped.png');
        this.load.image('luanita-back-stopped', 'luanita-back-stopped.png');
        this.load.image('luanita-left-stopped', 'luanita-left-stopped.png');
        this.load.image('luanita-right-stopped', 'luanita-right-stopped.png');
        this.load.image('luanita-front-walk-left-foot', 'luanita-front-walk-left-foot.png');
        this.load.image('luanita-front-walk-right-foot', 'luanita-front-walk-right-foot.png');
        this.load.image('luanita-back-walk-left-foot', 'luanita-back-walk-left-foot.png');
        this.load.image('luanita-back-walk-right-foot', 'luanita-back-walk-right-foot.png');
        this.load.image('luanita-left-walk-left-foot', 'luanita-left-walk-left-foot.png');
        this.load.image('luanita-left-walk-right-foot', 'luanita-left-walk-right-foot.png');
        this.load.image('luanita-right-walk-left-foot', 'luanita-right-walk-left-foot.png');
        this.load.image('luanita-right-walk-right-foot', 'luanita-right-walk-right-foot.png');
        this.load.audio('defaultPalletTown', 'musics/defaultPalletTown.mp3');
        this.load.audio('interaction-sound', 'musics/selectButton.mp3');
        this.load.audio('poke-menu-audio', 'poke-menu.mp3');
        this.load.audio('battle-music', 'musics/battle.mp3');
        this.load.video('poke-intro', 'poke-intro.mp4');

        // Carrega estaticamente os sprites dos Pokémon da equipe
        const playerTeamIds = [448, 94, 6, 658, 724, 418]; // Lucario, Gengar, Charizard, Greninja, Decidueye, Buizel
        playerTeamIds.forEach(id => {
            this.load.image(`player_${id}_back`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`);
            this.load.image(`pokemon_${id}_front`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`);
            this.load.image(`pokemon_card_${id}`, `cards/${id}.png`);
        });
    }

    create() {
        const camera = this.cameras.main;
        camera.setBackgroundColor(0x000000);
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;

        const playerTeamPromise = this.createPlayerTeam();
        const totalHp = 1600;
        const enemyPokemon: PokemonForBattle = {
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
                { name: 'DEVORADOR DE CARNES', damage: 50, ppNow: 99, ppTotal: 99 },
                { name: 'GRAVIDADE ELEVADA', damage: 50, ppNow: 99, ppTotal: 99 },
                { name: 'SUPER ARROTO', damage: 50, ppNow: 99, ppTotal: 99 }
            ],
            sprites: { front_default: 'assets/XJ.png' } as any,
            shiny: true
        };

        const video = this.add.video(centerX, centerY, 'poke-intro');
        video.setOrigin(0.5);

        const soundText = this.add.text(centerX, camera.height - 40, 'clique para habilitar o som', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        video.on('play', () => {
            const htmlVideo = video.video;
            const sourceWidth = htmlVideo && htmlVideo.videoWidth ? htmlVideo.videoWidth : video.width;
            const sourceHeight = htmlVideo && htmlVideo.videoHeight ? htmlVideo.videoHeight : video.height;

            if (sourceWidth > 0 && sourceHeight > 0) {
                const scaleX = camera.width / sourceWidth;
                const scaleY = camera.height / sourceHeight;
                const scale = Math.min(scaleX, scaleY);
                video.setScale(scale);
            }
        });

        video.setMute(true);
        video.play();

        this.input.once('pointerdown', () => {
            if (video.isPlaying()) {
                video.setMute(false);
            }
            soundText.destroy();
        });

        video.once('complete', async () => {
            video.destroy();
            const playerTeam = await playerTeamPromise;
            this.scene.start('MainMenu', { playerTeam, enemyPokemon });
        });
    }

    private async createPlayerTeam(): Promise<PokemonForBattle[]> {
        const playerTeamIds = [448, 94, 6, 658, 724, 418];
        const playerTeam: PokemonForBattle[] = [];
        for (const id of playerTeamIds) {
            const pokemonApi = await pokemonService.getPokemonById(id);
            const pokemonForBattle = await pokemonService.getPokemonForBattle(pokemonApi, 50, undefined, false, true);
            playerTeam.push(pokemonForBattle);
        }
        return playerTeam;
    }
}
