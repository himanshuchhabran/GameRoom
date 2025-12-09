const { getRooms, saveRooms } = require('../utils/roomStore');

module.exports = (io, socket) => {
    
    socket.on('create_room', ({ roomCode, username, gameType }) => {
        const rooms = getRooms(); 

        if (rooms[roomCode]) {
            socket.emit('error', 'Room already exists');
            return;
        }

        rooms[roomCode] = {
            host: username,
            gameType,
            status: 'waiting',
            players: [{ id: socket.id, username, score: 0 }]
        };

        saveRooms(rooms); 
        socket.join(roomCode);
        
        console.log(`[JSON] Room ${roomCode} created by ${username}`);
        socket.emit('room_created', { roomCode, gameType });
        io.to(roomCode).emit('update_players', rooms[roomCode].players);
    });

    socket.on('join_room', ({ roomCode, username }) => {
        const rooms = getRooms();

        if (!rooms[roomCode]) {
            socket.emit('error', 'Room not found');
            return;
        }
        
        const playerExists = rooms[roomCode].players.find(p => p.username === username);
        if (!playerExists) {
            rooms[roomCode].players.push({ id: socket.id, username, score: 0 });
            saveRooms(rooms); 
        }
        
        socket.join(roomCode);
        console.log(`[JSON] ${username} joined ${roomCode}`);
        io.to(roomCode).emit('update_players', rooms[roomCode].players);
        
        if(rooms[roomCode].status === 'playing'){
            socket.emit('game_started');
        }
    });

    socket.on('start_game', ({ roomCode }) => {
        const rooms = getRooms();
        if (rooms[roomCode]) {
            rooms[roomCode].status = 'playing';
            saveRooms(rooms);
            io.to(roomCode).emit('game_started');
        }
    });

    socket.on('send_score', ({ roomCode, score }) => {
        const rooms = getRooms();
        if (rooms[roomCode]) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if (player) {
                player.score = score;
        
                rooms[roomCode].players.sort((a, b) => b.score - a.score);
                
                saveRooms(rooms);
                
                io.to(roomCode).emit('live_leaderboard', rooms[roomCode].players);
            }
        }
    });

    socket.on('disconnect', () => {
        const rooms = getRooms();
        let roomCodeToUpdate = null;

        for (const code in rooms) {
            const playerIndex = rooms[code].players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                rooms[code].players.splice(playerIndex, 1);
                
                // If room empty, delete it
                if (rooms[code].players.length === 0) {
                    delete rooms[code];
                } else {
                    roomCodeToUpdate = code;
                }
                break;
            }
        }
        
        saveRooms(rooms);
        if (roomCodeToUpdate) {
            io.to(roomCodeToUpdate).emit('update_players', rooms[roomCodeToUpdate].players);
        }
    });
};