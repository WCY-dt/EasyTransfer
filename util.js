if (targetIdInput.value.length !== 4) {
    connectButton.style.backgroundColor = 'gray';
    connectButton.disabled = true;
    connectButton.style.cursor = 'not-allowed';
}

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