let dropFrame = document.getElementById('dropzone');
let fileInput = document.getElementById('fileInput');

dropFrame.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
});

dropFrame.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();

    let items = e.dataTransfer.items;
    let dt = new DataTransfer();

    for (const item of items) {
        const entry = item.webkitGetAsEntry();

        if (entry.isFile) {
            entry.file((file) => {
                dt.items.add(file);
            })

        } else {
            const reader = entry.createReader()
            reader.readEntries((entries) => {
                reHandleFile(entries, dt)
            })
        }
    }

    fileInput.files = dt.files;
});

const reHandleFile = (entries, dt) => {
    for (const entry of entries) {
        if (entry.isFile) {
            entry.file((file) => {
                dt.items.add(file);
            })
        } else {
            const reader = entry.createReader()
            reader.readEntries((entries) => {
                reHandleFile(entries, dt)
            })
        }
    }
}