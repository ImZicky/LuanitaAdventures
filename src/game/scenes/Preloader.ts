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
        this.add.image(512, 384, 'background');
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
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('home-second-floor', 'home-second-floor.png');
        this.load.image('home-first-floor', 'home-first-floor.png');
        this.load.image('pallet-town-city', 'pallet-town-city.png');
        this.load.image('FinalBattleArena', 'FinalBattleArena.png');
        this.load.image('FinalPhase', 'FinalPhase.png');
        this.load.image('XJ', 'XJ.png');
        this.load.image('lab', 'lab.png');
        this.load.spritesheet('battle-background-normal', 'battlefields/normal.png', { frameWidth: 400, frameHeight: 400 });
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

        // Carrega estaticamente os sprites dos Pokémon da equipe
        const playerTeamIds = [448, 94, 6, 658, 724, 418]; // Lucario, Gengar, Charizard, Greninja, Decidueye, Buizel
        playerTeamIds.forEach(id => {
            this.load.image(`player_${id}_back`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`);
            this.load.image(`pokemon_${id}_front`, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`);
            this.load.image(`pokemon_card_${id}`, `cards/${id}.png`);
        });
    }

    create() {
        this.scene.start('MainMenu');
    }
}
