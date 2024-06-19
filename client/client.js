const dropzone = document.querySelector('#dropzone');
document.getElementById('fileInput').addEventListener('change', sendFiles);


// Generate a random client ID
const clientId = Math.random().toString(36).substring(2, 6).toUpperCase();
console.log('[client ID] ', clientId);
document.getElementById('clientIdDisplay').textContent = clientId;

// Connect to the signaling server
const socket = io.connect('https://easy-transfer.glitch.me/');
const configuration = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
        },
        {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
        },
        {
            urls: "turn:global.relay.metered.ca:443",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
        },
        {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "cf841207b56ebddc17948dde",
            credential: "0dGvvEm7eq2UaqlW",
        },
    ]
};
const peerConnection = new RTCPeerConnection(configuration);

// Data channel
const sendChannel = peerConnection.createDataChannel('fileTransfer');
console.log('[send channel created]');
// disable file input
document.getElementById('fileInput').disabled = true;
sendChannel.onopen = () => {
    console.log('[send channel] open');
    dropzone.onclick = () => fileInput.click();
    dropzone.ondragover = event => {
        event.preventDefault();
        dropzone.style.backgroundColor = 'lightgray';
    };
    dropzone.ondragleave = () => dropzone.style.backgroundColor = 'white';
    dropzone.ondrop = event => {
        event.preventDefault();
        fileInput.files = event.dataTransfer.files;
        dropzone.style.backgroundColor = 'white';
        var event = new Event('change');
        fileInput.dispatchEvent(event);
    };
    document.getElementById('fileInput').disabled = false;
};
sendChannel.onerror = (error) => {
    console.error('[send channel] error', error);
};
sendChannel.onclose = () => {
    console.log('[send channel] closed');
    dropzone.onclick = null;
    dropzone.ondragover = null;
    dropzone.ondragleave = null;
    dropzone.ondrop = null;
    document.getElementById('fileInput').disabled = true;
}

// Register the client ID with the server
socket.emit('register', clientId);

// Handle collected ICE candidates
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        console.log('[ice candidate] ', event.candidate);
        socket.emit('candidate', event.candidate, targetId);
    }
};

// Handle received ICE candidates
socket.on('candidate', (candidate) => {
    console.log('[received candidate] ', candidate);
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Create and send an offer to the target client
let targetId = null;
document.getElementById('connectButton').addEventListener('click', () => {
    targetId = document.getElementById('targetIdInput').value;

    peerConnection.createOffer().then((offer) => {
        return peerConnection.setLocalDescription(offer);
    }).then(() => {
        socket.emit('offer', peerConnection.localDescription, clientId, targetId);
    });
});

// When receiving an offer from the target, create an answer and send it back to the target
socket.on('offer', (sdp, id) => {
    targetId = id;
    document.getElementById('targetIdInput').value = targetId;

    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
        return peerConnection.createAnswer();
    }).then((answer) => {
        return peerConnection.setLocalDescription(answer);
    }).then(() => {
        socket.emit('answer', peerConnection.localDescription, clientId, targetId);
    });

    // Modify connectButton
    connectButton.style.backgroundColor = 'green';
    connectButton.disabled = true;
    connectButton.style.cursor = 'not-allowed';
});

// Get the answer from the target and set it as the remote description
socket.on('answer', (sdp, id) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

    // Modify connectButton
    connectButton.style.backgroundColor = 'green';
    connectButton.disabled = true;
    connectButton.style.cursor = 'not-allowed';
});

async function sendFiles() {
    // Get the file
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    if (!files.length) {
        console.error('[no file selected]');
        return;
    }

    // Iterate through the files
    for (const file of files) {
        await sendFile(file);
    }
}

async function sendFile(file) {
    if (file.size === 0) {
        console.error('[empty file]');
        return;
    }
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(' ')}`);

    // Check if the sendChannel is open before sending files
    if (sendChannel.readyState !== 'open') {
        console.error('[send channel] is not open');
        return;
    }

    const fileName = document.getElementById('fileName');
    fileName.textContent = file.name;

    // Send the file name and size
    sendChannel.send(file.name);
    sendChannel.send(file.size);

    console.log(`Sending file ${file.name} with size ${file.size}`);

    // Send the file
    const chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('[error reading file] ', error));
    fileReader.addEventListener('abort', event => console.log('[file reading aborted] ', event));

    // Send the file slice by slice
    fileReader.addEventListener('load', e => {
        sendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        fileProgress.value = offset;
        if (offset < file.size) {
            readSlice(offset);
        }
    });

    // Read the file slice by slice
    const readSlice = o => {
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
    };

    // Display the progress bar
    fileProgress.max = file.size;
    readSlice(0);
}

document.getElementById('fileInput').addEventListener('change', sendFiles);

downloadFileHTML = `
<a href="javascript:void(0)" class="download">
    <div id="downloadDisplay">
        <p id="downloadName">No file to download</p>
        <progress id="downloadProgress" value="0" max="1">
        </progress>
    </div>
    <button id="downloadButton" disabled><span class="material-symbols-outlined">
        download
    </span></button>
</a>
`;

peerConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;

    let receivedSize = 0;
    let receivedData = [];
    let fileName = '';
    let fileSize = 0;
    let downloadElement = null;
    let downloadName = null;
    let downloadProgress = null;
    let downloadButton = null;

    receiveChannel.onopen = () => {
        console.log('[reveive channel] open');
    }
    receiveChannel.onerror = error => {
        console.error('[reveive channel] error', error);
    }
    receiveChannel.onclose = () => {
        console.log('[reveive channel] closed');
    }

    let fileNameQueue = [];
    let fileSizeQueue = [];

    receiveChannel.onmessage = async event => {
        console.log('[reveive channel] message', event.data);
        if (typeof event.data === 'string') {
            // if can parseInt, it is the file size
            if (parseInt(event.data)) {
                console.log(`Receiving file size ${event.data}`);
                fileSizeQueue.push(parseInt(event.data));
            } else {
                // receive file name
                console.log(`Receiving file ${event.data}`);
                fileNameQueue.push(event.data);
            }
        } else {
            // if no file name, pop from queue
            if (!fileName && fileNameQueue.length > 0) {
                fileName = fileNameQueue.shift();
                fileSize = fileSizeQueue.shift();

                // Insert download file HTML
                document.getElementById('file').innerHTML += downloadFileHTML;
                const downloadElements = document.getElementsByClassName('download');
                downloadElement = downloadElements[downloadElements.length - 1];

                // Set download file                
                downloadProgress = downloadElement.querySelector('#downloadProgress');
                downloadProgress.max = fileSize;
                downloadName = downloadElement.querySelector('#downloadName');
                downloadName.textContent = fileName;
                downloadButton = downloadElement.querySelector('#downloadButton');
                downloadButton.style.backgroundColor = 'gray';
                downloadButton.disabled = true;
                downloadButton.style.cursor = 'not-allowed';
            }

            // display download
            downloadElement.style.display = 'flex';

            // receive file
            receivedData.push(event.data);
            receivedSize += event.data.byteLength;
            downloadProgress.value = receivedSize;

            // check if file is fully received
            if (receivedSize === fileSize) {
                const receivedFile = new Blob(receivedData);
                receivedData = [];
                receivedSize = 0;

                // set download link
                downloadElement.href = URL.createObjectURL(receivedFile);
                downloadElement.download = fileName;
                downloadButton.style.backgroundColor = 'green';
                downloadButton.removeAttribute('disabled');
                downloadButton.style.cursor = 'pointer';

                console.log(`Received file ${fileName} with size ${fileSize}`);

                // Initialize file
                receivedSize = 0;
                receivedData = [];
                fileName = '';
                fileSize = 0;

                // Re-attach dropzone event listeners
                const dropzone = document.querySelector('#dropzone');
                dropzone.onclick = () => fileInput.click();
                dropzone.ondragover = event => {
                    event.preventDefault();
                    dropzone.style.backgroundColor = 'lightgray';
                };
                dropzone.ondragleave = () => dropzone.style.backgroundColor = 'white';
                dropzone.ondrop = event => {
                    event.preventDefault();
                    fileInput.files = event.dataTransfer.files;
                    dropzone.style.backgroundColor = 'white';
                    var event = new Event('change');
                    fileInput.dispatchEvent(event);
                };
                document.getElementById('fileInput').addEventListener('change', sendFiles);

                // click download button
                await new Promise(resolve => {
                    downloadElement.addEventListener('click', resolve);
                    downloadElement.click();
                });
            }
        }
    };
};