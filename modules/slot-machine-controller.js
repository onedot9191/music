const SLOT_SYMBOLS = [
    '🍒',
    '🍋',
    '🔔',
    '⭐',
    '7',
    '🍉',
    '🍇',
    '💎',
    '👑',
    '🍀',
];

export function createSlotMachineController({
    CONSTANTS,
    playSound,
    slotMachineEl,
    slotReels,
    slotWinAudio,
}) {
    return {
        index: 0,
        predetermined: [],

        randomSymbol() {
            return SLOT_SYMBOLS[
                Math.floor(Math.random() * SLOT_SYMBOLS.length)
            ];
        },

        generateSymbols() {
            const symbols = [];

            symbols[0] = this.randomSymbol();
            symbols[1] = Math.random() < 0.9 ? symbols[0] : this.randomSymbol();

            if (symbols[1] === symbols[0]) {
                symbols[2] =
                    Math.random() < 0.5 ? symbols[0] : this.randomSymbol();
            } else if (Math.random() < 0.5) {
                symbols[2] = Math.random() < 0.5 ? symbols[0] : symbols[1];
            } else {
                symbols[2] = this.randomSymbol();
            }

            return symbols;
        },

        start() {
            if (!slotMachineEl) return;

            this.index = 0;
            this.predetermined = this.generateSymbols();

            slotMachineEl.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);

            slotReels.forEach((reel) => {
                reel.textContent = '?';
                reel.classList.remove('revealed');
            });
        },

        stopNext() {
            if (this.index >= slotReels.length) return;

            const reel = slotReels[this.index];

            reel.textContent = this.predetermined[this.index];
            reel.classList.add('revealed');

            setTimeout(() => reel.classList.remove('revealed'), 300);

            this.index++;

            if (this.index === slotReels.length) {
                this.checkWin();
            }
        },

        checkWin() {
            const values = Array.from(slotReels).map(
                (reel) => reel.textContent
            );

            if (values.every((value) => value === values[0])) {
                playSound(slotWinAudio);

                slotMachineEl.classList.add('win');
                setTimeout(() => slotMachineEl.classList.remove('win'), 1000);

                slotMachineEl.classList.add('win-lights');
                setTimeout(
                    () => slotMachineEl.classList.remove('win-lights'),
                    800
                );
            }

            setTimeout(() => this.start(), 1000);
        },

        reset() {
            slotReels.forEach((reel) => {
                reel.textContent = '?';
            });

            this.predetermined = [];
            this.index = 0;

            slotMachineEl?.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
        },
    };
}
