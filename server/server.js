const port = process.env.PORT || 3000;
const io = require('socket.io')(port, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const clients = {}; // Store client IDs and their corresponding sockets

io.on('connection', socket => {
    console.log('[client connected] ', socket.id);

    socket.on('register', clientId => {
        console.log('[register] ', clientId);
        clients[clientId] = socket; // Register the client ID
    });

    socket.on('offer', (sdp, srcId, targetId) => {
        console.log('[offer] ', srcId, ' --> ', targetId);
        clients[targetId].emit('offer', sdp, srcId); // Send the offer to the target client
    });

    socket.on('answer', (sdp, srcId, targetId) => {
        console.log('[answer] ', srcId, ' --> ', targetId);
        clients[targetId].emit('answer', sdp, srcId); // Send the answer to the target client
    });

    socket.on('candidate', (candidate, targetId) => {
        console.log('[candidate] ', targetId);
        clients[targetId].emit('candidate', candidate); // Send the candidate to the target client
    });

    socket.on('disconnect', () => {
        console.log('[client disconnected] ', socket.id);
        for (const clientId in clients) {
            if (clients[clientId] === socket) {
                delete clients[clientId];
                break;
            }
        }
    });
});