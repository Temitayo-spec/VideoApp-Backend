const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.get('/', (req: any, res: { send: (arg0: string) => void }) => {
  res.send('Hello World!');
});

io.on('connection', (socket: any) => {
  console.log('a user connected');
  socket.emit('me', socket.id);
  socket.on('disconnect', () => {
    socket.broadcast.emit('callended');
    console.log('user disconnected');
  });

  socket.on(
    'calluser',
    ({
      userToCall,
      signalData,
      from,
      name,
    }: {
      userToCall: string;
      signalData: any;
      from: string;
      name: string;
    }) => {
      io.to(userToCall).emit('calluser', {
        signal: signalData,
        from,
        name,
      });
    }
  );

  socket.on('answercall', (data: any) => {
    io.to(data.to).emit('callaccepted', data.signal);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
