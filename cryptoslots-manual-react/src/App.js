// App.js

// Access game logic functions and constants from the global gameLogic object
const { initializeGameState, spin, BET_AMOUNTS, increaseBet, decreaseBet, getRandomSymbol, getWinTier } = window.gameLogic;
// Paytable component will be available globally because Paytable.js is loaded in index.html

function App() {
    const [gameState, setGameState] = React.useState(initializeGameState());
    const [showPaytable, setShowPaytable] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [spinningDisplayReels, setSpinningDisplayReels] = React.useState(null);
    const [highlightedWinLines, setHighlightedWinLines] = React.useState(null);
    const [bgmAudio, setBgmAudio] = React.useState(null); // State for BGM Audio object
    const [userInteracted, setUserInteracted] = React.useState(false); // Track user interaction

    // --- Sound Effects & BGM ---
    const playSound = (soundFile, currentIsMuted) => {
      if (!currentIsMuted) {
        const audio = new Audio(soundFile);
        audio.play().catch(error => console.error("Error playing sound:", soundFile, error));
      }
      if (!userInteracted) setUserInteracted(true); // Record first interaction
    };

    // Effect to initialize BGM
    React.useEffect(() => {
        const audio = new Audio('assets/audio/bgm.mp3'); // Assuming bgm.mp3 or adjust to .wav
        audio.loop = true;
        setBgmAudio(audio);

        return () => { // Cleanup on component unmount
            if (audio) {
                audio.pause();
            }
        };
    }, []); // Runs once on mount

    // Effect to control BGM playback based on isMuted and userInteracted
    React.useEffect(() => {
        if (bgmAudio) {
            if (!isMuted && userInteracted) { // Only play if unmuted AND user has interacted
                bgmAudio.play().catch(e => console.error("BGM play error:", e));
            } else {
                bgmAudio.pause();
            }
        }
    }, [isMuted, bgmAudio, userInteracted]);
    // --- End Sound Effects & BGM ---

    const isCellWinning = (reelIndex, rowIndex) => {
        if (!highlightedWinLines) return false;
        for (const line of highlightedWinLines) {
            for (const coord of line.coordinates) {
                if (coord[0] === reelIndex && coord[1] === rowIndex) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleSpin = () => {
        if (gameState.balance < gameState.currentBet || isSpinning) {
            if (isSpinning) console.log("Already spinning!");
            else alert("Not enough balance to spin!");
            return;
        }

        playSound('assets/audio/spin.wav', isMuted);
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
                    playSound('assets/audio/win_large.wav', isMuted);
                } else if (tier === 'medium') {
                    playSound('assets/audio/win_medium.wav', isMuted);
                } else { // small or null (if winAmount is 0 but somehow lastWin > 0)
                    playSound('assets/audio/win_small.wav', isMuted);
                }

                if (finalGameState.winningLines) {
                     setHighlightedWinLines(finalGameState.winningLines);
                }
            }
        }, 1500);
    };

    const handleIncreaseBet = () => {
        if (isSpinning) return;
        playSound('assets/audio/click.wav', isMuted);
        setHighlightedWinLines(null);
        const newGameState = increaseBet(gameState);
        setGameState(newGameState);
    };

    const handleDecreaseBet = () => {
        if (isSpinning) return;
        playSound('assets/audio/click.wav', isMuted);
        setHighlightedWinLines(null);
        const newGameState = decreaseBet(gameState);
        setGameState(newGameState);
    };

    const togglePaytable = () => {
        if (isSpinning) return;
        playSound('assets/audio/click.wav', isMuted);
        setShowPaytable(prevShow => !prevShow);
    };

    const toggleMute = () => {
        playSound('assets/audio/click.wav', isMuted); // Play click sound before mute state changes for this one
        setIsMuted(prevMuted => !prevMuted);
    };

    React.useEffect(() => {
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
        React.createElement('div', { className: 'app-container' },
            React.createElement('h1', null, 'CryptoSlots Game'),

            React.createElement('div', { className: 'game-info' },
                React.createElement('p', null, `Balance: ${balance}`),
                React.createElement('p', null, `Last Win: ${lastWin}`)
            ),

            React.createElement('div', { className: 'reels-grid' },
                displayReels.map((reelColumn, reelIndex) =>
                    React.createElement('div', { key: reelIndex, className: 'reel' },
                        reelColumn.map((symbol, rowIndex) => {
                            const cellClassName = `symbol-cell ${
                                !isSpinning && highlightedWinLines && isCellWinning(reelIndex, rowIndex) ? 'symbol-cell-winning' : ''
                            }`;
                            return React.createElement('div', { key: `${reelIndex}-${rowIndex}`, className: cellClassName },
                                symbol ?
                                React.createElement('img', {
                                    src: `assets/images/${symbol.image}`,
                                    alt: symbol.name,
                                    className: 'symbol-image'
                                }) :
                                '---'
                            );
                        })
                    )
                )
            ),

            React.createElement('div', { className: 'controls-container' },
                React.createElement('div', { className: 'bet-controls' },
                    React.createElement('button', { onClick: handleDecreaseBet, disabled: !canDecreaseBet || isSpinning }, '- Bet'),
                    React.createElement('span', { className: 'bet-display' }, `Bet: ${currentBet}`),
                    React.createElement('button', { onClick: handleIncreaseBet, disabled: !canIncreaseBet || isSpinning }, '+ Bet')
                ),
                React.createElement('div', { className: 'spin-button-container' },
                    React.createElement('button', { onClick: handleSpin, disabled: !canSpin },
                        isSpinning ? 'Spinning...' : 'Spin'
                    )
                )
            ),

            React.createElement('div', { className: 'secondary-controls-container' },
                React.createElement('button', {
                    className: 'paytable-button',
                    onClick: togglePaytable,
                    disabled: isSpinning
                },
                    showPaytable ? 'Hide Paytable' : 'View Paytable'
                ),
                React.createElement('button', { className: 'mute-button', onClick: toggleMute },
                    isMuted ? 'Unmute Sound' : 'Mute Sound'
                )
            ),

            showPaytable && React.createElement(Paytable, { onClose: togglePaytable })
        )
    );
}
