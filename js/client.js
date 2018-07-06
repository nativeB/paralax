let room = {};

//check if id is provided
room.token = window.location.hash.substring(1);
if (room.token !== "") {
    console.log(room);
    room.url = true
}
//our username
let connectedUser;
//username
let name;
let fullscreen;
let type;
//connecting to our signaling server
const socket = io.connect();
let unconnected = []


//******
//UI selectors block
//******

const main = document.querySelector('.main');
const nav = document.querySelector('.nav');
const landing = document.querySelector('.landing');
const landcon = document.querySelector('#con');
const landweb = document.querySelector('#web');
const land = document.querySelector('.btns');
const log = document.querySelector('.login');
const full = document.querySelector('#full');
const usernameInput = document.querySelector('#usernameInput');
const loginBtn = document.querySelector('#loginBtn');
const hangUpBtn = document.querySelector('#hangupBtn');
const localVideo = document.querySelector('#localVideo');
const roomInput = document.querySelector('#room');
let yourConn = {};
const audioBtn = document.querySelector('#audio');
const speakerBtn = document.querySelector('#speaker');
const conname = document.querySelector('.nav-title');
const conlink = document.querySelector('#sharelink');

let stream;

log.style.display = 'none';
main.style.display = 'none';
nav.style.display = 'none';


//socket events
socket.on('connect', () => {
    console.log("Connected to the signaling server");
})

socket.on('login', data => {
    logger(data)
    handleLogin(data);
});
socket.on('offer', data => {
    logger(data)
    handleOffer(data.offer, data.otherpeer, data.otherpeerid);
});
socket.on('answer', data => {
    logger(data)
    handleAnswer(data.answer, data.otherpeer, data.otherpeerid);
});
socket.on('candidate', data => {
    logger(data)
    handleCandidate(data.candidate, data.otherpeer, data.otherpeerid);
});
socket.on('leave', data => {
    userleave(data)
});

socket.on('joined', data => {
    console.log(data)
});
socket.on('join', data => {
    join(data)
    conname.innerHTML="Paralax/ "+data.name;
    conlink.innerHTML= window.location.href;
});
socket.on('created', data => {
    console.log('created :', data[0])
    conname.innerHTML="Paralax/ "+data[0];
    conlink.innerHTML= window.location.href+ data[2];
    window.location.hash = data[2]
    getstream(doforcreator)
});
socket.on('error', (error) => {
    console.log('got error: ', err)
});


// for sending messages
function send(on, message) {
    //attach the other peer username to our messages
    if (connectedUser) {
        message.id = connectedUser;

    }

    socket.emit(on, message);
};


//event listeners
landcon.addEventListener('click', () => {
    // type = "con"
    land.style.display = 'none';
    log.style.display = 'flex';
    if (room.url) {
        roomInput.style.display = 'none';
    }
});

landweb.addEventListener('click', () => // type = "web"
// land.style.display = 'none';
// log.style.display = 'flex';
//todo implement one way calling for webinar
    false)

full.addEventListener('click', () => {
    if (fullscreen) exitFullscreen(document.documentElement)
    else launchIntoFullscreen(document.documentElement);
})


localVideo.style.display = "none"
// Login when the user clicks the button
loginBtn.addEventListener("click", event => {
    name = usernameInput.value;
    if (!room.url) {
        room = roomInput.value;
    }
    if (name.length > 0) {
        send("login",
            {name}
        );
    }

});


function handleLogin(data) {
    if (data.success === false) {
        alert("Ooops...try a different username");
    } else {
        landing.style.display = 'none';
        log.style.display = 'none';
        nav.style.display = 'flex';
        main.style.display = 'flex';
        console.log('runnin')
        console.log('tryin', room)
        if (room.url) {
            send('create or join', room)
        } else send('create or join', {name: room, token: randomToken()})
    }
}

function join(data) {
    console.log('data', data)
    if (data.success) {
        window.location.hash = data.token;
        unconnected = data.members
        unconnected.splice(unconnected.indexOf(name), 1)
        //getting local video stream
        getstream(doforothers)
    }
    else console.log('failed to join')
}

function getstream(thens) {
    // roomBtn.style.display = "none";
    // roomInput.style.display = "none";
    localVideo.style.display = "block"
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(thens)
        .catch(e => {
            alert(`getUserMedia() error: ${e.name}`);
        });
}

function doforcreator(myStream) {

    console.log('creator success')
    stream = myStream;
    //displaying local video stream on the page
    localVideo.srcObject = stream;

}

function doforothers(myStream) {
    stream = myStream;
    //displaying local video stream on the page
    localVideo.srcObject = stream;
    console.log(unconnected, 'l')
    if (unconnected.length > 0) {
        console.log('runn', unconnected)
        call(unconnected.pop())
    }
}


audioBtn.addEventListener('click', function () {
    toggleaudio(stream)
    this.classList.toggle('fa-microphone-slash');
    this.classList.toggle('fa-microphone');
    this.classList.toggle('off');
})
speakerBtn.addEventListener('click', function () {
    togglespeaker()
    this.classList.toggle('fa-volume-up');
    this.classList.toggle('fa-volume-off');
    this.classList.toggle('off');
})

function togglespeaker() {
    let speakers = document.getElementsByTagName('video')
    for (i = 0; i < speakers.length; i++) {
        if (speakers[i].id !== 'localVideo') speakers[i].muted = !speakers[i].muted

    }
}

function toggleaudio(localstream) {
    //toggling track
    localstream.getAudioTracks()[0].enabled = !localstream.getAudioTracks()[0].enabled;
//    sending a message
    console.log('audio ')

}


function newuser(user) {
//**********************
    //Starting a peer connection
    //**********************

    //using Google public stun server
  //using  public stun/turn servers
     const configuration = {
        "iceServers": [{"urls": "stun:stun2.1.google.com:19302"},
            {"urls": "stun:stun.l.google.com:19302"},
            {"urls": "stun:stun1.l.google.com:19302"},
            {"urls": "stun:stun3.l.google.com:19302"},
            {"urls": "stun:stun4.l.google.com:19302"},
            {"urls":"stun:numb.viagenie.ca"},
            {
                "urls": 'stun:numb.viagenie.ca',
                credential: 'qhutchison8@gmail.com',
                username: 'gateway08'
            },{
                "urls": 'turn:numb.viagenie.ca',
                credential: 'qhutchison8@gmail.com',
                username: 'gateway08'
            }
            ]
    };

    yourConn[user] = new RTCPeerConnection(configuration);

    // setup stream listening
    yourConn[user].addStream(stream);

    //when a remote user adds stream to the peer connection, we display it
    yourConn[user].onaddstream = e => {
        let divs = document.getElementById('videos');
        console.log('Remote stream added.');
        let video = document.createElement('video')
        video.srcObject = e.stream;
        video.autoplay = true;
        video.className = user;
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        divs.appendChild(video);
        if (unconnected.length > 0) {

            call(unconnected.pop())
        }
    };

    // Setup ice handling
    yourConn[user].onicecandidate = event => {
        if (event.candidate) {
            send("candidate",
                {token: window.location.hash.substring(1), candidate: event.candidate}
            );
        }
    };
    console.log('created', user)
}

//initiating calls
function call(id) {

    connectedUser = id;
    console.log('call', connectedUser, yourConn[connectedUser])
    newuser(connectedUser)
    // create an offer
    yourConn[connectedUser].createOffer(offer => {
        console.log(window.location.hash.substring(1))
        send("offer",
            {
                token: window.location.hash.substring(1),
                offer
            });

        yourConn[connectedUser].setLocalDescription(offer);
    }, error => {
        alert("Error when creating an offer");
    })

}

//when somebody sends us an offer
function handleOffer(offer, name, id) {
    connectedUser = id;
    newuser(connectedUser)
    console.log('offer', connectedUser, yourConn[connectedUser])
    yourConn[connectedUser].setRemoteDescription(new RTCSessionDescription(offer));

    //create an answer to an offer
    yourConn[connectedUser].createAnswer(answer => {
        yourConn[connectedUser].setLocalDescription(answer);

        send("answer",
            {token: window.location.hash.substring(1), answer});
        let adduser = document.createElement('a');
        adduser.innerHTML = name;
        adduser.className = connectedUser;
        document.getElementById('mySidenav').appendChild(adduser);
    }, error => {
        alert("Error when creating an answer");
    });
}


//when we got an answer from a remote user
function handleAnswer(answer, name, id) {
    console.log('setremote', connectedUser, yourConn[connectedUser])
    yourConn[id].setRemoteDescription(new RTCSessionDescription(answer));
    let adduser = document.createElement('a');
    adduser.innerHTML = name;
    adduser.className = connectedUser;
    document.getElementById('mySidenav').appendChild(adduser);
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate, name, id) {
    console.log('candidate', connectedUser, yourConn[connectedUser])
    yourConn[id].addIceCandidate(new RTCIceCandidate(candidate));
};

// hang up
hangUpBtn.addEventListener("click", () => {

    send("leave", {token: window.location.hash.substring(1)});
    handleLeave()

});

function handleLeave() {
    connectedUser = null;
    unconnected = null
    yourConn = null
    conname.innerHTML="Paralax";
    conlink.innerHTML=''
    const myNode = document.getElementById("videos");
    const myNodelist = document.getElementById("mySidenav");
    while (myNode.firstChild) {
        myNodelist.removeChild(myNodelist.lastChild);
        myNode.removeChild(myNode.firstChild);
    }
}

function userleave(id) {
    console.log('removing', id);
    const remove = document.getElementsByClassName(id);
    console.log('f', remove[1])
    for (i = 0; i <= remove.length; i++) {
        // console.log(remove[i],i)
        remove[0].remove();
    }
    yourConn[id] = null

}

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    fullscreen = false
}

function launchIntoFullscreen(element) {
    console.log('itruns')
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
    fullscreen = true
}

window.onbeforeunload = function() {
    socket.emit('close',{ token: window.location.hash.substring(1)})
};

//on msg
function logger(log) {
    console.log(log)
}
