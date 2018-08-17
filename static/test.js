window.addEventListener('load', () => {
    createButtons();
    createServiceWorker();
});

function createServiceWorker() {
    navigator.serviceWorker.register('worker.js')
        .then(function(reg) {
            // регистрация сработала
            console.log('Registration succeeded. Scope is ' + reg.scope);
        })
        .catch(function(error) {
            // регистрация прошла неудачно
            console.log('Registration failed with ' + error);
        });
}

function createButtons() {
    [
        'without-cache',
        'cache-control',
        'no-cache',
        'no-store',
        'service-worker',
        'service-worker-404',
        'service-worker-500',
        'service-worker-fake',
        'test-images',
        'e-tag',
        'e-tag-with-cache-control',
        'last-modified'
    ].forEach(createTestButton);
}

function createTestButton(key) {
    var button = document.createElement('button');
    button.innerText = key;
    document.body.appendChild(button);
    button.onclick = () => {
        makeRequest(key);
    };
}

function makeRequest(key) {
    fetch(`/${key}`)
        .then(console.log)
        .catch(console.error);
}
