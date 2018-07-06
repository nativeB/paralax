let os = require('os');
let nodeStatic = require('node-static');
let http = require('http');
const PORT = process.env.PORT || 5000;
let fs=require('fs');
let socketIO = require('socket.io');
const rooms={};
const fileServer = new(nodeStatic.Server)();
const app = http.createServer((req, res) => {
    fileServer.serve(req, res);
}).listen(PORT);


const io = socketIO.listen(app);

//all connected to the server users
const users = {};

//logging
function log() {
    console.log(arguments);

}


//when a user connects to our sever
io.sockets.on('connection', socket => {
    console.log("User connected");
    //when server gets a message from a connected user
    socket.on('login', data => {
        console.log("User logged", data.name);

        //if anyone is logged in with this username then refuse
        if (users[data.name]) {
            sendTo(socket, "login",
                {success: false}
            );
        } else {
            //save user connection on the server
            users[data.name] = socket;
            socket.name = data.name;

            sendTo(socket, "login",
                {success: true}
            );
        }
    })


    socket.on('create or join', room => {
        console.log('received create or join request ', room)
        if (rooms[room.name] !== undefined) {
            console.log('existing rooms:', io.sockets.adapter.rooms)
            const clientsInRoom = io.sockets.adapter.rooms[rooms[room.name]];
            console.log('room members', clientsInRoom)
            const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
            console.log('number:', numClients)
            // log(`Room ${room.roomie} now has ${numClients} client(s)`);
            if (numClients === 0) {
                socket.join(rooms[room.name]);
                // log(`Client ID ${socket.id} created room ${room.roomie}`);
                socket.emit('created', [room.name, socket.id, rooms[room.name]]);
            } else {
                socket.join(rooms[room.name]);
                console.log('members:', Object.keys(clientsInRoom.sockets))
                sendTo(socket, 'join', {
                    name:room.name,
                    success: true,
                    members: Object.keys(clientsInRoom.sockets),
                    token: rooms[room.name]
                })

                socket.broadcast.emit('joined', room.name);

            }
        } else {
            if (room.url) {
                socket.join(room.token);
                sendTo(socket, 'join', {
                    members:room.name,
                    success: true,
                    members: Object.keys(io.sockets.adapter.rooms[room.token]['sockets']),
                    token: room.token
                })
                socket.broadcast.emit('joined', room.token);
            } else {
                socket.join(room.token);
                log(`Client ID ${socket.id} created room ${room.name}`);
                console.log('room', io.sockets.adapter.rooms)
                socket.emit('created', [room.name, socket.id, room.token]);
                rooms[room.name] = room.token
            }
        }
    });

    socket.on('offer', data => {
        //for ex. UserA wants to call UserB
        console.log("Sending offer to: ", data.id);

        //if UserB exists then send him offer details
        const conn = Object.keys(io.sockets.adapter.rooms[data.token]['sockets']).indexOf(data.id);
        console.log(conn, data.token)


        if (conn !== -1) {
            //setting that UserA connected with UserB
            socket.to(data.id).emit("offer",
                {
                    offer: data.offer,
                    otherpeerid: socket.id,
                    otherpeer: socket.name
                }
            );
        }

    })
    socket.on('answer', data => {
        console.log("Sending answer to: ", data.id);
        //for ex. UserB answers UserA
        console.log(data.id)
        const conn = Object.keys(io.sockets.adapter.rooms[data.token]['sockets']).indexOf(data.id);

        if (conn !== -1) {
            socket.to(data.id).emit("answer",
                {
                    answer: data.answer,
                    otherpeerid: socket.id,
                    otherpeer: socket.name
                }
            );
        }

    })
    socket.on('candidate', data => {
        console.log("Sending candidate to:", data.id);
        const conn = Object.keys(io.sockets.adapter.rooms[data.token]['sockets']).indexOf(data.id);

        if (conn !== -1) {
            socket.to(data.id).emit("candidate",
                {
                    candidate: data.candidate,
                    otherpeerid: socket.id,
                });
        }
    })
    socket.on('leave', data => {
        console.log("Disconnecting from", socket.id);
        // const conn = Object.keys(io.sockets.adapter.rooms[data.token]['sockets']).indexOf(data.id);
        //notify the other user so he can disconnect his peer connection
        socket.broadcast.to(data.token).emit('leave', socket.id);
        socket.leave(data.token)
        delete users[socket.name]
    })


    //when user exits, for example closes a browser window
    //this may help if we are still in "offer","answer" or "candidate" state
    socket.on("close", (data) => {
        socket.broadcast.to(data.token).emit('leave', socket.id);
        socket.leave(data.token)
        delete users[socket.name]

    })
})

function sendTo(socket, on, message) {
    socket.emit(on, message);
}