const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const drawingSchema = new mongoose.Schema({
    boardName: String,
    boardId: String,
    path: [{
        x: Number,
        y: Number
    }],
});

const Drawing = mongoose.model('Drawing', drawingSchema);

app.get('/boards', async (req, res) => {
    try {
        const boards = await Drawing.find();
        res.json(boards);
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/boards', async (req, res) => {
    try {
        const { boardName } = req.body;

        // Check if a board with the given name already exists
        const existingBoard = await Drawing.findOne({ boardName });

        // If the board already exists, return an error
        if (existingBoard) {
            return res.status(400).json({ error: 'Board with this name already exists' });
        }

        // Create a new board
        const newBoard = new Drawing({ boardName });
        await newBoard.save();

        // Return the created board
        res.status(201).json(newBoard);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_DOMAIN
    }
});

// Map to store nicknames associated with socket IDs
const nicknameMap = new Map();
// Map to store users associated with board IDs
const usersMap = new Map();
// Map to store socket IDs associated with board IDs
const socketToBoardMap = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinBoard', async ({ boardName, boardId, nickname }) => {
        socket.join(boardId);
        nicknameMap.set(socket.id, nickname);
        socketToBoardMap.set(socket.id, boardId);
        console.log(`${nickname} joined board ${boardName} (${boardId})`);

        // Add user to the usersMap
        if (!usersMap.has(boardId)) {
            usersMap.set(boardId, []);
        }
        const users = usersMap.get(boardId);
        users.push({ id: socket.id, nickname });
        usersMap.set(boardId, users);

        // Emit the user list to everyone in the board
        io.to(boardId).emit('userList', { boardId, users });

        // Retrieve previous drawings from MongoDB and send them to the newly joined user
        const existingBoard = await Drawing.findOne({ _id: new ObjectId(boardId) });

        io.to(boardId).emit('draw', existingBoard.path);
    });

    socket.on('draw', async (data) => {
        io.to(data.boardId).emit('draw', data.path);

        // Check if the board already exists
        const existingBoard = await Drawing.findOne({ _id: new ObjectId(data.boardId) });

        // If the board exists, add the new drawing path
        if (existingBoard) {
            existingBoard.path.push(...data.path);
            await existingBoard.save();
        } else {
            // If the board does not exist, create a new board
            const drawing = new Drawing({
                boardName: data.boardName,
                boardId: data.boardId,
                path: data.path,
            });
            await drawing.save();
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove the nickname from the map on disconnect
        const nickname = nicknameMap.get(socket.id);
        if (nickname) {
            nicknameMap.delete(socket.id);
            console.log(`${nickname} disconnected`);

            // Remove the user from the usersMap
            const boardId = socketToBoardMap.get(socket.id);
            if (boardId && usersMap.has(boardId)) {
                const users = usersMap.get(boardId).filter(user => user.id !== socket.id);
                usersMap.set(boardId, users);
                io.to(boardId).emit('userList', { boardId, users });
            }

            // Remove the socket ID from the socketToBoardMap
            socketToBoardMap.delete(socket.id);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
