  myTextArea.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset height to recalculate
        this.style.height = this.scrollHeight + 'px'; // Set height based on scrollHeight
    });