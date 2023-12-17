import React, { useState, useEffect } from 'react';

import { io } from "socket.io-client";

import DrawingBoard from './components/DrawingBoard';
import BoardList from './components/BoardList';
import ToolPanel from './components/ToolPanel';

import './App.css';

export const socket = io(process.env.REACT_APP_API_KEY);

function App() {
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState({ id: "", name: "" });
  const [nickname, setNickname] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getBoards = async () => {
      await fetch(`${process.env.REACT_APP_API_KEY}/boards`)
        .then(async (response) => await response.json())
        .then((data) => setBoards(data))
        .catch((error) => console.error('Error fetching boards:', error));
    }

    getBoards();
  }, []);

  useEffect(() => {
    socket.on('userList', ({ boardId, users }) => {
      if (activeBoard.id === boardId) {
        setUsers(users);
      }
    });
  }, [activeBoard.id]);


  const joinBoard = (boardId, boardName, nickname) => {
    if (!nickname) {
      nickname = prompt('Enter your nickname:');
    }
    if (nickname) {
      setActiveBoard({ id: boardId, name: boardName });
      setNickname(nickname);

      socket.emit('joinBoard', { boardName, boardId, nickname });
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    let boardName = e.target[1].value;
    if (!activeBoard.id) {
      const response = await fetch(`${process.env.REACT_APP_API_KEY}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boardName }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        setBoards([...boards, newBoard]);
        joinBoard(newBoard._id, boardName, nickname)
      } else {
        if (response.status === 400) {
          setError((await response.json()).error)
        } else {
          setError(response.statusText)
        }
        console.error('Error creating board:', response.statusText);
      }
    }
  };

  return (
    <div className="App">
      <div className="App-container">
        {!activeBoard.id && (<div className="App-board-list">
          <BoardList boards={boards} joinBoard={joinBoard} />
        </div>)}
        {activeBoard.id && (
          <div className="App-board-list">
            <h3>Users:</h3>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.nickname}</li>
              ))}
            </ul>
          </div>
        )}
        {activeBoard.id && <div className="App-drawing-area">
          <div className="App-drawing-header">
            <h3>Board: {activeBoard.name}</h3>
          </div>
          {activeBoard.id && (
            <DrawingBoard boardId={activeBoard.id} boardName={activeBoard.name} nickname={nickname} />
          )}
        </div>}
        {!activeBoard.id && (
          <form className="App-tool-panel" onSubmit={createBoard}>
            <div className="App-tool-header">
              <h3>Tool Panel</h3>
            </div>
            <div className="App-nickname-input">
              <label>Nickname:</label>
              <input
                type="text"
                placeholder="Enter nickname name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <ToolPanel error={error} />
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
