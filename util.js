fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
        // 改变字体大小
        fileName.style.fontSize = '20px';
    } else {
        fileName.textContent = '拖拽或点击上传文件';
    }
});

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

if (targetIdInput.value.length !== 4) {
    connectButton.style.backgroundColor = 'gray';
    connectButton.disabled = true;
    connectButton.style.cursor = 'not-allowed';
}

// 当targetIdInput的值改变时，去除connectButton的行内样式，并去除disabled属性
targetIdInput.addEventListener('input', () => {
    connectButton.removeAttribute('style');
    connectButton.removeAttribute('disabled');
    connectButton.style.cursor = 'pointer';
    if (targetIdInput.value.length !== 4) {
        connectButton.style.backgroundColor = 'gray';
        connectButton.disabled = true;
        connectButton.style.cursor = 'not-allowed';
    }
});

// download 隐藏
download.style.display = 'none';