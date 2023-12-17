import React from 'react';

const BoardList = ({ boards, joinBoard }) => {
    return (
        <div>
            <h2>Available Boards</h2>
            <ul>
                {boards.map((board) => (
                    <li key={board._id} onClick={() => joinBoard(board._id, board.boardName)}>
                        {board.boardName}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BoardList;
