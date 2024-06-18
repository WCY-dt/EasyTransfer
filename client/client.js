const socket = io.connect('http://localhost:3000');
const pc = new RTCPeerConnection();
const clientId = Math.random().toString(36).substring(2, 6).toUpperCase(); // Generate a random client ID
console.log('[client ID] ', clientId);

// Display the client ID on the webpage
document.getElementById('clientIdDisplay').textContent = clientId;

socket.emit('register', clientId); // Register the client ID with the server

const connectButton = document.getElementById('connectButton');

let targetId = null;

connectButton.addEventListener('click', () => {
    targetId = document.getElementById('targetIdInput').value; // Get the target ID from the input field

    // Create an offer and set it as the local description
    pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('offer', offer, clientId, targetId); // Send the offer to the target through the signaling server
    });
});

// 当有ICE candidate生成时，通过信令服务器发送给对方
pc.onicecandidate = event => {
    if (event.candidate) {
        console.log('[ice candidate] ', event.candidate);
        socket.emit('candidate', event.candidate, targetId);
    }
};

// 当接收到对方的ICE candidate时，添加到自己的peer connection
socket.on('candidate', candidate => {
    console.log('[received candidate] ', candidate);
    pc.addIceCandidate(new RTCIceCandidate(candidate));
});

// 当接收到对方的offer时，创建answer
socket.on('offer', (offer, id) => {
    targetId = id;
    // 修改targetIdInput
    document.getElementById('targetIdInput').value = targetId;
    // 发送answer
    pc.setRemoteDescription(new RTCSessionDescription(offer));
    pc.createAnswer().then(answer => {
        pc.setLocalDescription(answer);
        socket.emit('answer', answer, clientId, targetId);
    });
});

// 当接收到对方的answer时，设置为remote description
socket.on('answer', (answer, id) => {
    pc.setRemoteDescription(new RTCSessionDescription(answer));
});

// 创建data channel，用于发送文件
const sendChannel = pc.createDataChannel('sendDataChannel');
console.log('[data channel created]');

sendChannel.onopen = () => {
    console.log('[data channel] open');
};

sendChannel.onerror = (error) => {
    console.error('[data channel] error', error);
};

document.getElementById('sendButton').addEventListener('click', () => {
    // Get the file
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        console.error('[no file selected]');
    }
    if (file.size === 0) {
        console.error('[empty file]');
    }
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);
    // Send the file name and size
    sendChannel.send(file.name);
    sendChannel.send(file.size);
    // Send the file
    const chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('[error reading file] ', error));
    fileReader.addEventListener('abort', event => console.log('[file reading aborted] ', event));
    fileReader.addEventListener('load', e => {
        // console.log('[fileRead.onload] ', e);
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        if (offset < file.size) {
            readSlice(offset);
        }
    });
    const readSlice = o => {
        // console.log('[readSlice] ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
});

pc.ondatachannel = event => {
    const receiveChannel = event.channel;
    let receivedSize = 0;
    let receivedData = [];
    let fileName = '';
    let fileSize = 0;

    receiveChannel.onmessage = event => {
        if (typeof event.data === 'string') {
            if (!fileName) {
                fileName = event.data;
            } else if (!fileSize) {
                fileSize = parseInt(event.data);
            }
        } else {
            receivedData.push(event.data);
            receivedSize += event.data.byteLength;

            if (receivedSize === fileSize) {
                const receivedFile = new Blob(receivedData);
                receivedData = [];
                receivedSize = 0;

                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(receivedFile);
                downloadLink.download = fileName;
                downloadLink.textContent = 'Click here to download the file';
                document.body.appendChild(downloadLink);

                console.log(`Received file ${fileName} with size ${fileSize}`);
            }
        }
    };
};