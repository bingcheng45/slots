// src/Paytable.js

function Paytable(props) {
    const { onClose } = props;
    // Access game logic data from the global window.gameLogic object
    const { PAYOUT_TABLE, SYMBOLS } = window.gameLogic;

    return React.createElement('div', { className: 'paytable-overlay' },
        React.createElement('div', { className: 'paytable-content' },
            React.createElement('h2', null, 'Paytable'),
            React.createElement('table', { className: 'paytable-table' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Symbol'),
                        React.createElement('th', null, 'Name'),
                        React.createElement('th', null, '3 Matches'),
                        React.createElement('th', null, '4 Matches'),
                        React.createElement('th', null, '5 Matches')
                    )
                ),
                React.createElement('tbody', null,
                    SYMBOLS.map(symbol => {
                        const payouts = PAYOUT_TABLE[symbol.id];
                        if (!payouts) {
                            return null;
                        }
                        return React.createElement('tr', { key: symbol.id },
                            React.createElement('td', null,
                                React.createElement('img', {
                                    src: `assets/images/${symbol.image}`,
                                    alt: symbol.name,
                                    className: 'paytable-symbol-image'
                                })
                            ),
                            React.createElement('td', null, symbol.name),
                            React.createElement('td', null, payouts[3] ? `${payouts[3]}x bet` : '-'),
                            React.createElement('td', null, payouts[4] ? `${payouts[4]}x bet` : '-'),
                            React.createElement('td', null, payouts[5] ? `${payouts[5]}x bet` : '-')
                        );
                    })
                )
            ),
            React.createElement('button', { onClick: onClose, className: 'paytable-close-btn' }, 'Close')
        )
    );
}
