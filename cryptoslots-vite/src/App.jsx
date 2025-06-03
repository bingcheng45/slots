import React, { useState, useEffect, useCallback } from 'react';
import Paytable from './components/Paytable.jsx';
import {
    initializeGameState,
    spin,
    BET_AMOUNTS, // Assuming BET_AMOUNTS is needed for disabling buttons, if not, remove
    increaseBet,
    decreaseBet,
    getWinTier,
    getRandomSymbol
} from './gameLogic.js';
import './App.css';

function App() {
    const [gameState, setGameState] = useState(initializeGameState());
    const [showPaytable, setShowPaytable] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinningDisplayReels, setSpinningDisplayReels] = useState(null);
    const [highlightedWinLines, setHighlightedWinLines] = useState(null);
    const [bgmAudio, setBgmAudio] = useState(null);
    const [userInteracted, setUserInteracted] = useState(false);

    const playSound = useCallback((soundFile, currentIsMutedOverride = isMuted) => {
        if (!currentIsMutedOverride) {
            const audio = new Audio(`/assets/audio/${soundFile}`); // Path relative to public
            audio.play().catch(error => console.error("Error playing sound:", soundFile, error));
        }
        if (!userInteracted) setUserInteracted(true);
    }, [isMuted, userInteracted]); // playSound changes if isMuted or userInteracted changes

    useEffect(() => {
        const audio = new Audio('/assets/audio/bgm.mp3'); // Path relative to public
        audio.loop = true;
        setBgmAudio(audio);

        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, []);

    useEffect(() => {
        if (bgmAudio) {
            if (!isMuted && userInteracted) {
                bgmAudio.play().catch(e => console.error("BGM play error:", e));
            } else {
                bgmAudio.pause();
            }
        }
    }, [isMuted, bgmAudio, userInteracted]);

    const isCellWinning = useCallback((reelIndex, rowIndex) => {
        if (!highlightedWinLines) return false;
        for (const line of highlightedWinLines) {
            for (const coord of line.coordinates) {
                if (coord[0] === reelIndex && coord[1] === rowIndex) {
                    return true;
                }
            }
        }
        return false;
    }, [highlightedWinLines]);

    const handleSpin = useCallback(() => {
        if (gameState.balance < gameState.currentBet || isSpinning) {
            if (isSpinning) console.log("Already spinning!");
            else alert("Not enough balance to spin!");
            return;
        }

        playSound('spin.wav');
        setHighlightedWinLines(null);
        setIsSpinning(true);
        const initialRandomGrid = Array(5).fill(null).map(() =>
            Array(3).fill(null).map(() => getRandomSymbol())
        );
        setSpinningDisplayReels(initialRandomGrid);

        const finalGameState = spin(gameState);

        setTimeout(() => {
            setGameState(finalGameState);
            setIsSpinning(false);
            if (finalGameState.lastWin > 0) {
                const tier = getWinTier(finalGameState.lastWin, finalGameState.currentBet);
                if (tier === 'large') {
                    playSound('win_large.wav');
                } else if (tier === 'medium') {
                    playSound('win_medium.wav');
                } else {
                    playSound('win_small.wav');
                }

                if (finalGameState.winningLines) {
                     setHighlightedWinLines(finalGameState.winningLines);
                }
            }
        }, 1500);
    }, [gameState, isSpinning, playSound]); // Include playSound, gameState, isSpinning

    const handleIncreaseBet = useCallback(() => {
        if (isSpinning) return;
        playSound('click.wav');
        setHighlightedWinLines(null);
        const newGameState = increaseBet(gameState);
        setGameState(newGameState);
    }, [isSpinning, playSound, gameState]); // Include dependencies

    const handleDecreaseBet = useCallback(() => {
        if (isSpinning) return;
        playSound('click.wav');
        setHighlightedWinLines(null);
        const newGameState = decreaseBet(gameState);
        setGameState(newGameState);
    }, [isSpinning, playSound, gameState]); // Include dependencies

    const togglePaytable = useCallback(() => {
        if (isSpinning) return;
        playSound('click.wav');
        setShowPaytable(prevShow => !prevShow);
    }, [isSpinning, playSound]); // Include dependencies

    const toggleMute = useCallback(() => {
        // Pass the *future* mute state to playSound for the click sound
        playSound('click.wav', !isMuted);
        setIsMuted(prevMuted => !prevMuted);
    }, [playSound, isMuted]); // Include playSound and isMuted

    useEffect(() => {
        let animationInterval;
        if (isSpinning) {
            animationInterval = setInterval(() => {
                const randomGrid = Array(5).fill(null).map(() =>
                    Array(3).fill(null).map(() => getRandomSymbol())
                );
                setSpinningDisplayReels(randomGrid);
            }, 100);
        } else {
            setSpinningDisplayReels(null);
        }
        return () => clearInterval(animationInterval);
    }, [isSpinning]);

    const { balance, currentBet, lastWin } = gameState;
    const displayReels = isSpinning && spinningDisplayReels ? spinningDisplayReels : gameState.reels;

    const canIncreaseBet = currentBet < BET_AMOUNTS[BET_AMOUNTS.length - 1];
    const canDecreaseBet = currentBet > BET_AMOUNTS[0];
    const canSpin = balance >= currentBet && !isSpinning;

    return (
        <div className="app-container">
            <h1>CryptoSlots Game</h1>

            <div className="game-info">
                <p>Balance: {balance}</p>
                <p>Last Win: {lastWin}</p>
            </div>

            <div className="reels-grid">
                {displayReels.map((reelColumn, reelIndex) =>
                    <div key={reelIndex} className="reel">
                        {reelColumn.map((symbol, rowIndex) => {
                            const cellClassName = `symbol-cell ${
                                !isSpinning && highlightedWinLines && isCellWinning(reelIndex, rowIndex) ? 'symbol-cell-winning' : ''
                            }`;
                            return (
                                <div key={`${reelIndex}-${rowIndex}`} className={cellClassName}>
                                    {symbol ?
                                        <img
                                            src={`/assets/images/${symbol.image}`}
                                            alt={symbol.name}
                                            className="symbol-image"
                                        /> :
                                        '---'
                                    }
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="controls-container">
                <div className="bet-controls">
                    <button onClick={handleDecreaseBet} disabled={!canDecreaseBet || isSpinning}>- Bet</button>
                    <span className="bet-display">Bet: {currentBet}</span>
                    <button onClick={handleIncreaseBet} disabled={!canIncreaseBet || isSpinning}>+ Bet</button>
                </div>
                <div className="spin-button-container">
                    <button onClick={handleSpin} disabled={!canSpin}>
                        {isSpinning ? 'Spinning...' : 'Spin'}
                    </button>
                </div>
            </div>

            <div className="secondary-controls-container">
                <button
                    className="paytable-button"
                    onClick={togglePaytable}
                    disabled={isSpinning}
                >
                    {showPaytable ? 'Hide Paytable' : 'View Paytable'}
                </button>
                <button className="mute-button" onClick={toggleMute}>
                    {isMuted ? 'Unmute Sound' : 'Mute Sound'}
                </button>
            </div>

            {showPaytable && <Paytable onClose={togglePaytable} />}
        </div>
    );
}

export default App;
