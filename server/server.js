const port = process.env.PORT || 3000;
const io = require('socket.io')(port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const clients = {}; // Store client IDs and their corresponding sockets
const maxConnectionNumbers = {}; // Store client IDs and their corresponding max connection numbers

const generateId = () => { // Generate a random 4 character string
  let id;
  do {
    id = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
  } while (
    id.includes('0')
    || id.includes('1')
    || id.includes('O')
    || id.includes('I')
    || id.includes('L')
    || Object.keys(clients).includes(id)
  );
  return id;
}

io.on('connection', socket => {
  console.log('[client connected] ', socket.id);

  socket.on('register', (maxConnectionNumber) => {
    const clientId = generateId();
    console.log('[register] ', clientId, ' with max connection number ', maxConnectionNumber);
    maxConnectionNumbers[clientId] = maxConnectionNumber;
    clients[clientId] = socket;
    clients[clientId].emit('success', clientId);
  });

  socket.on('offer', (sdp, srcId, targetId) => {
    console.log('[offer] ', srcId, ' --> ', targetId);
    clients[targetId].emit('offer', sdp, srcId, maxConnectionNumbers[srcId]);
  });

  socket.on('answer', (sdp, srcId, targetId) => {
    console.log('[answer] ', srcId, ' --> ', targetId);
    clients[targetId].emit('answer', sdp, srcId);
  });

  socket.on('candidate', (candidate, targetId) => {
    console.log('[candidate] ', targetId);
    clients[targetId].emit('candidate', candidate);
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