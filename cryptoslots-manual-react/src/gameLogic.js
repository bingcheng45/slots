// Core game logic for CryptoSlots

// Create a global object to attach game logic to
window.gameLogic = {};

gameLogic.SYMBOLS = [
    { name: 'Bitcoin', id: 'BTC', image: 'btc.png', value: 100 },
    { name: 'Ethereum', id: 'ETH', image: 'eth.png', value: 80 },
    { name: 'Dogecoin', id: 'DOGE', image: 'doge.png', value: 40 },
    { name: 'Shiba Inu', id: 'SHIB', image: 'shib.png', value: 30 },
    { name: 'Rocket', id: 'ROCKET', image: 'rocket.png', value: 60 },
    { name: 'Chart', id: 'CHART', image: 'chart.png', value: 50 },
    { name: 'Generic Coin', id: 'COIN', image: 'coin.png', value: 20 }
];

gameLogic.BET_AMOUNTS = [1, 5, 10, 25, 50, 100];

gameLogic.getRandomSymbol = function() {
    const randomIndex = Math.floor(Math.random() * gameLogic.SYMBOLS.length);
    return gameLogic.SYMBOLS[randomIndex];
};

gameLogic.generateReelStrip = function(length = 30) {
    const strip = [];
    for (let i = 0; i < length; i++) {
        strip.push(gameLogic.getRandomSymbol());
    }
    return strip;
};

gameLogic.spinReel = function(reelStrip) {
    return gameLogic.getRandomSymbol();
};

const NUM_REELS = 5;
const NUM_ROWS = 3;

gameLogic.initializeGameState = function() {
    const reels = [];
    for (let i = 0; i < NUM_REELS; i++) {
        const reelColumn = [];
        for (let j = 0; j < NUM_ROWS; j++) {
            reelColumn.push(gameLogic.getRandomSymbol());
        }
        reels.push(reelColumn);
    }
    return {
        reels: reels,
        balance: 1000,
        currentBet: gameLogic.BET_AMOUNTS[0],
        lastWin: 0,
        winningLines: null
    };
};

gameLogic.PAYLINES = [
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    [[0, 0], [1, 1], [2, 2], [3, 2], [4, 2]],
    [[0, 2], [1, 1], [2, 0], [3, 0], [4, 0]]
];

gameLogic.PAYOUT_TABLE = {
    'BTC': { 3: 50, 4: 150, 5: 500 },
    'ETH': { 3: 30, 4: 100, 5: 300 },
    'DOGE': { 3: 20, 4: 80, 5: 200 },
    'SHIB': { 3: 15, 4: 60, 5: 150 },
    'ROCKET': { 3: 25, 4: 90, 5: 250 },
    'CHART': { 3: 20, 4: 70, 5: 180 },
    'COIN': { 3: 10, 4: 40, 5: 100 }
};

gameLogic.checkWin = function(reels, paylines, payoutTable, currentBet) {
    let totalWin = 0;
    const winningLineDetails = [];

    paylines.forEach((lineCoordinates, lineIndex) => {
        const symbolsOnLine = lineCoordinates.map(coord => reels[coord[0]][coord[1]]);

        if (symbolsOnLine.length === 0) return;

        const firstSymbol = symbolsOnLine[0];
        let matchCount = 1;
        for (let i = 1; i < symbolsOnLine.length; i++) {
            if (symbolsOnLine[i].id === firstSymbol.id) {
                matchCount++;
            } else {
                break;
            }
        }

        if (matchCount >= 3) {
            const symbolPayouts = payoutTable[firstSymbol.id];
            if (symbolPayouts && symbolPayouts[matchCount]) {
                const payoutMultiplier = symbolPayouts[matchCount];
                const winAmount = payoutMultiplier * currentBet;
                totalWin += winAmount;

                const winningSymbolCoordinates = lineCoordinates.slice(0, matchCount);

                winningLineDetails.push({
                    lineId: lineIndex,
                    symbolId: firstSymbol.id,
                    numMatching: matchCount,
                    payout: winAmount,
                    coordinates: winningSymbolCoordinates
                });
            }
        }
    });

    return {
        totalWin: totalWin,
        winningLines: winningLineDetails
    };
};

gameLogic.spin = function(currentState) {
    const newState = {
        ...currentState,
        reels: currentState.reels.map(reelColumn => reelColumn.map(symbol => ({...symbol}))),
        winningLines: null
    };

    if (newState.balance < newState.currentBet) {
        console.warn("Not enough balance to spin.");
        return currentState;
    }
    newState.balance -= newState.currentBet;

    for (let i = 0; i < NUM_REELS; i++) {
        for (let j = 0; j < NUM_ROWS; j++) {
            newState.reels[i][j] = gameLogic.getRandomSymbol();
        }
    }

    const winInfo = gameLogic.checkWin(newState.reels, gameLogic.PAYLINES, gameLogic.PAYOUT_TABLE, newState.currentBet);

    newState.lastWin = winInfo.totalWin;
    if (winInfo.totalWin > 0) {
        newState.balance += winInfo.totalWin;
        newState.winningLines = winInfo.winningLines;
    }

    return newState;
};

gameLogic.increaseBet = function(currentState) {
    const currentIndex = gameLogic.BET_AMOUNTS.indexOf(currentState.currentBet);
    if (currentIndex < gameLogic.BET_AMOUNTS.length - 1) {
        return {
            ...currentState,
            currentBet: gameLogic.BET_AMOUNTS[currentIndex + 1],
            winningLines: null
        };
    }
    return currentState;
};

gameLogic.decreaseBet = function(currentState) {
    const currentIndex = gameLogic.BET_AMOUNTS.indexOf(currentState.currentBet);
    if (currentIndex > 0) {
        return {
            ...currentState,
            currentBet: gameLogic.BET_AMOUNTS[currentIndex - 1],
            winningLines: null
        };
    }
    return currentState;
};

// Function to determine win tier
gameLogic.getWinTier = function(winAmount, currentBet) {
    if (winAmount <= 0) return null;
    const multiplier = winAmount / currentBet;

    if (multiplier > 15) return 'large';
    if (multiplier > 5) return 'medium';
    return 'small';
};
