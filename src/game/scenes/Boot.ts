import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        this.cameras.main.setBackgroundColor(0x000000);
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
