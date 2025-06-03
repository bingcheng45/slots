import React from 'react';
import { SYMBOLS, PAYOUT_TABLE } from '../gameLogic.js'; // Assuming gameLogic.js is in src/

function Paytable(props) {
    const { onClose } = props;

    // SYMBOLS and PAYOUT_TABLE are now imported
    // const payoutTable = PAYOUT_TABLE; // No longer needed, use PAYOUT_TABLE directly
    // const symbols = SYMBOLS;       // No longer needed, use SYMBOLS directly

    return (
        <div className="paytable-overlay">
            <div className="paytable-content">
                <h2>Paytable</h2>
                <table className="paytable-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Name</th>
                            <th>3 Matches</th>
                            <th>4 Matches</th>
                            <th>5 Matches</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SYMBOLS.map(symbol => {
                            const payouts = PAYOUT_TABLE[symbol.id];
                            if (!payouts) {
                                return null;
                            }
                            return (
                                <tr key={symbol.id}>
                                    <td>
                                        <img
                                            src={`/assets/images/${symbol.image}`} // Path relative to public directory
                                            alt={symbol.name}
                                            className="paytable-symbol-image"
                                        />
                                    </td>
                                    <td>{symbol.name}</td>
                                    <td>{payouts[3] ? `${payouts[3]}x bet` : '-'}</td>
                                    <td>{payouts[4] ? `${payouts[4]}x bet` : '-'}</td>
                                    <td>{payouts[5] ? `${payouts[5]}x bet` : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <button onClick={onClose} className="paytable-close-btn">Close</button>
            </div>
        </div>
    );
}

export default Paytable;
