import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';

export interface IRefPhaserGame
{
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps
{
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref)
{
    const game = useRef<Phaser.Game | null>(null!);
    const sceneRef = useRef<Phaser.Scene | null>(null);
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [dialogText, setDialogText] = useState('');
    const [teleportOnClose, setTeleportOnClose] = useState<any>(null);

    const openMenu = () => {
        setMenuVisible(true);
        EventBus.emit('open-menu');
    }

    const closeMenu = () => {
        setMenuVisible(false);
        EventBus.emit('close-menu');
    }

    const goToMainMenu = () => {
        location.reload()
        // setMenuVisible(false);
        // EventBus.emit('go-to-main-menu');
    }

    const closeDialog = () => {
        setDialogText('');
        if (teleportOnClose) {
            EventBus.emit('teleport', teleportOnClose);
            setTeleportOnClose(null);
        } else {
            EventBus.emit('resume-game');
        }
    }

    useLayoutEffect(() =>
    {
        if (game.current === null)
        {
            game.current = StartGame("game-container");

            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: null });
            } else if (ref)
            {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () =>
        {
            if (game.current)
            {
                game.current.destroy(true);
                if (game.current !== null)
                {
                    game.current = null;
                }
            }
        }
    }, [ref]);

    useEffect(() =>
    {
        EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) =>
        {
            sceneRef.current = scene_instance;
            
            if (scene_instance.scene.key === 'Game') {
                setDialogText("Nossa, então tudo isso foi só um sonho???");
                EventBus.emit('pause-game');
            }

            if (currentActiveScene && typeof currentActiveScene === 'function')
            {
                currentActiveScene(scene_instance);
            }

            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: scene_instance });
            } else if (ref)
            {
                ref.current = { game: game.current, scene: scene_instance };
            }
        });
        return () =>
        {
            EventBus.removeListener('current-scene-ready');
        }
    }, [currentActiveScene, ref]);

    useEffect(() => {
        const handleShowDialog = (data: string | { message: string, teleportTo?: any }) => {
            let message: string;
            let teleportTo: any = null;

            if (typeof data === 'string') {
                message = data;
            } else {
                message = data.message;
                teleportTo = data.teleportTo;
            }

            const scene = sceneRef.current;
            if (scene) {
                scene.sound.play('interaction-sound');
            }
            setDialogText(message);
            if (teleportTo) {
                setTeleportOnClose(teleportTo);
            }
            EventBus.emit('pause-game');
        };

        EventBus.on('show-dialog', handleShowDialog);

        return () => {
            EventBus.removeListener('show-dialog', handleShowDialog);
        };
    }, []);

    return (
        <>
            <button
                onClick={openMenu}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '10px 20px',
                    fontFamily: 'Arial Black',
                    fontSize: '24px',
                    color: 'white',
                    backgroundColor: 'black',
                    border: '2px solid white',
                    cursor: 'pointer'
                }}
            >
                MENU
            </button>
            {isMenuVisible && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '20px',
                    padding: '20px',
                    border: '2px solid white',
                    zIndex: 1001,
                    color: 'white',
                    fontFamily: 'Arial Black',
                    backgroundImage: 'url(/assets/menu-background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '300px',
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <h2 style={{ textAlign: 'center', marginTop: 0, color: '#022e52ff' }}>Pallet Town</h2>
                    <button
                        onClick={goToMainMenu}
                        onMouseOver={e => e.currentTarget.style.color='#022e52ff'}
                        onMouseOut={e => e.currentTarget.style.color='blue'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: 'transparent',
                            color: 'blue',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            textAlign: 'center',
                            fontFamily: 'Arial Black'
                        }}
                    >
                        Voltar a tela inicial
                    </button>
                    <button
                        onClick={closeMenu}
                        onMouseOver={e => e.currentTarget.style.color='#022e52ff'}
                        onMouseOut={e => e.currentTarget.style.color='blue'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'transparent',
                            color: 'blue',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            textAlign: 'center',
                            fontFamily: 'Arial Black'
                        }}
                    >
                        FECHAR
                    </button>
                </div>
            )}
            <div style={{ width: '1024px', margin: '0 auto' }}>
                <div id="game-container"></div>
                {dialogText && (
                    <div style={{
                        width: '100%',
                        height: '150px',
                        backgroundColor: 'black',
                        border: '2px solid white',
                        color: 'white',
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '24px',
                        boxSizing: 'border-box',
                        position: 'relative'
                    }}>
                        <button
                            onClick={closeDialog}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            X
                        </button>
                        {dialogText}
                    </div>
                )}
            </div>
        </>
    );
});
