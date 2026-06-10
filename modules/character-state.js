export function createCharacterStateController({
    CONSTANTS,
    character,
    gameState,
}) {
    function updateMushroomGrowth() {
        character.classList.remove(
            'combo-level-1',
            'combo-level-2',
            'combo-level-3'
        );

        if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) return;

        if (gameState.combo >= 10) {
            character.classList.add('combo-level-3');
        } else if (gameState.combo >= 5) {
            character.classList.add('combo-level-2');
        } else if (gameState.combo >= 2) {
            character.classList.add('combo-level-1');
        }
    }

    function setCharacterState(state, duration = 1500) {
        character.className = '';
        character.classList.add(state);

        if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
            character.classList.add('devil-mode');
        }

        updateMushroomGrowth();

        if (state !== 'happy' && state !== 'sad') return;

        setTimeout(() => {
            const baseState =
                gameState.total > 0 &&
                gameState.total < 30 &&
                gameState.gameMode !== CONSTANTS.MODES.HARD_CORE
                    ? 'worried'
                    : 'idle';

            character.className = '';
            character.classList.add(baseState);

            if (gameState.gameMode === CONSTANTS.MODES.HARD_CORE) {
                character.classList.add('devil-mode');
            }

            updateMushroomGrowth();
        }, duration);
    }

    return {
        setCharacterState,
        updateMushroomGrowth,
    };
}
