export function createTypewriterEffect({ gameState }) {
    function typewriter(element, text) {
        if (gameState.typingInterval) {
            clearInterval(gameState.typingInterval);
        }

        element.innerHTML = '';

        let index = 0;

        gameState.typingInterval = setInterval(() => {
            if (index < text.length) {
                const char = text.charAt(index);

                element.innerHTML += char === '\n' ? '<br>' : char;
                index += 1;
                return;
            }

            clearInterval(gameState.typingInterval);
            gameState.typingInterval = null;
        }, 50);
    }

    return { typewriter };
}
