const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const RecordRTC = require('recordrtc');
const cors = require('cors');
const app = express();
app.use(cors);
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods:["GET", "POST"]
    }
});

app.use(express.static('public'));

const rooms = {};
const chat = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('create-room', (roomId, userId) => {
        rooms[roomId]= [];
        chat[roomId] = [];
        socket.emit("room-created", {roomId})
        console.log("room-created", rooms)
    });

    socket.on('join-room', ({roomId, userId}) => {
        console.log("join-room", roomId, userId, rooms)
       
       if( rooms[roomId]){
        socket.join(roomId);
        rooms[roomId].push(userId);
        socket.to(roomId).emit("joined-user", {userId});
        socket.emit("get-users", {roomId, participents: rooms[roomId]});

        if(chat[roomId]){
            socket.emit('get-message', {roomId, meassage: chat[roomId]});

        }
       }
     
        
      //  console.log("rooms[roomId.roomId]---->", rooms[roomId])
      // socket.to(roomId).emit('user-connected', userId);
    //    socket.to(roomId).emit('message', {roomId: roomId, meassage: chat[roomId]});
        let mediaRecorder;
        let chunks = [];

        // socket.on('start-recording', () => {
        //     const stream = socket.request.stream;
        //     mediaRecorder = new RecordRTC(stream, { type: 'video' });
        //     mediaRecorder.startRecording();
        // });

        // socket.on('stop-recording', () => {
        //     mediaRecorder.stopRecording(() => {
        //         const blob = mediaRecorder.getBlob();
        //         const videoBuffer = Buffer.from(blob);
        //         io.to(roomId).emit('video-blob', videoBuffer);
        //     });
        // });

      

      
    });

    socket.on('add-message', (roomId, message) => {
      //  console.log(roomId, meassage)
      socket.join(roomId);
        // if(!chat[roomId.roomId]){
        //     chat[roomId.roomId] = [];
        // }
        chat[roomId].push(message);
       // console.log(roomId.roomId, chat[roomId.roomId]);
        socket.to(roomId).emit('get-message', {roomId, meassage: chat[roomId]});
    });

    // socket.on('disconnect', () => {
    //     socket.to(roomId).emit('user-disconnected', userId);
    // });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});