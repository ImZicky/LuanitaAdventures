import { Boot } from './scenes/Boot';
import { HomeSecondFloor } from './scenes/HomeSecondFloor';
import { HomeFirstFloor } from './scenes/HomeFirstFloor';
import { PalletTown } from './scenes/PalletTown';
import { Lab } from './scenes/Lab';
import { FinalBattleArena } from './scenes/FinalBattleArena';
import { FinalPhase } from './scenes/FinalPhase';
import { Battle } from './scenes/Battle';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        HomeSecondFloor,
        HomeFirstFloor,
        PalletTown,
        Lab,
        FinalBattleArena,
        FinalPhase,
        Battle
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
