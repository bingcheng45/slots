// Core game logic for CryptoSlots

export const SYMBOLS = [
    { name: 'Bitcoin', id: 'BTC', image: 'btc.png', value: 100 },
    { name: 'Ethereum', id: 'ETH', image: 'eth.png', value: 80 },
    { name: 'Dogecoin', id: 'DOGE', image: 'doge.png', value: 40 },
    { name: 'Shiba Inu', id: 'SHIB', image: 'shib.png', value: 30 },
    { name: 'Rocket', id: 'ROCKET', image: 'rocket.png', value: 60 },
    { name: 'Chart', id: 'CHART', image: 'chart.png', value: 50 },
    { name: 'Generic Coin', id: 'COIN', image: 'coin.png', value: 20 }
];

export const BET_AMOUNTS = [1, 5, 10, 25, 50, 100];

export function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
    return SYMBOLS[randomIndex];
}

export function generateReelStrip(length = 30) {
    const strip = [];
    for (let i = 0; i < length; i++) {
        strip.push(getRandomSymbol());
    }
    return strip;
}

export function spinReel(reelStrip) { // reelStrip is currently unused, but function is exported
    return getRandomSymbol();
}

const NUM_REELS = 5; // Internal constant, does not need export
const NUM_ROWS = 3;  // Internal constant, does not need export

export function initializeGameState() {
    const reels = [];
    for (let i = 0; i < NUM_REELS; i++) {
        const reelColumn = [];
        for (let j = 0; j < NUM_ROWS; j++) {
            reelColumn.push(getRandomSymbol());
        }
        reels.push(reelColumn);
    }
    return {
        reels: reels,
        balance: 1000,
        currentBet: BET_AMOUNTS[0],
        lastWin: 0,
        winningLines: null
    };
}

export const PAYLINES = [
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
    [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]],
    [[0, 0], [1, 1], [2, 2], [3, 2], [4, 2]],
    [[0, 2], [1, 1], [2, 0], [3, 0], [4, 0]]
];

export const PAYOUT_TABLE = {
    'BTC': { 3: 50, 4: 150, 5: 500 },
    'ETH': { 3: 30, 4: 100, 5: 300 },
    'DOGE': { 3: 20, 4: 80, 5: 200 },
    'SHIB': { 3: 15, 4: 60, 5: 150 },
    'ROCKET': { 3: 25, 4: 90, 5: 250 },
    'CHART': { 3: 20, 4: 70, 5: 180 },
    'COIN': { 3: 10, 4: 40, 5: 100 }
};

export function checkWin(reels, paylines, payoutTable, currentBet) {
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
}

export function spin(currentState) {
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
            newState.reels[i][j] = getRandomSymbol(); // Uses exported getRandomSymbol
        }
    }

    // Uses exported PAYLINES, PAYOUT_TABLE
    const winInfo = checkWin(newState.reels, PAYLINES, PAYOUT_TABLE, newState.currentBet);

    newState.lastWin = winInfo.totalWin;
    if (winInfo.totalWin > 0) {
        newState.balance += winInfo.totalWin;
        newState.winningLines = winInfo.winningLines;
    }

    return newState;
}

export function increaseBet(currentState) {
    const currentIndex = BET_AMOUNTS.indexOf(currentState.currentBet); // Uses exported BET_AMOUNTS
    if (currentIndex < BET_AMOUNTS.length - 1) {
        return {
            ...currentState,
            currentBet: BET_AMOUNTS[currentIndex + 1],
            winningLines: null
        };
    }
    return currentState;
}

export function decreaseBet(currentState) {
    const currentIndex = BET_AMOUNTS.indexOf(currentState.currentBet); // Uses exported BET_AMOUNTS
    if (currentIndex > 0) {
        return {
            ...currentState,
            currentBet: BET_AMOUNTS[currentIndex - 1],
            winningLines: null
        };
    }
    return currentState;
}

export function getWinTier(winAmount, currentBet) {
    if (winAmount <= 0) return null;
    const multiplier = winAmount / currentBet;

    if (multiplier > 15) return 'large';
    if (multiplier > 5) return 'medium';
    return 'small';
}
