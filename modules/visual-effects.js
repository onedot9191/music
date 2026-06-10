export function getMotionPreferences() {
    const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || window.innerWidth <= 768;

    return {
        mobile,
        reducedMotion,
    };
}

function removeWhenAnimationEnds(element) {
    element.addEventListener(
        'animationend',
        () => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        },
        { once: true }
    );
}

export function createParticleEffects(
    { mobile, reducedMotion } = getMotionPreferences()
) {
    function shouldSkipEffects() {
        return mobile || reducedMotion;
    }

    function spawnTypingParticles(element, color) {
        if (shouldSkipEffects()) return;

        try {
            const rect = element.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('span');
                particle.className = 'typing-particle';
                particle.style.backgroundColor = color;
                particle.style.left = `${cx}px`;
                particle.style.top = `${cy}px`;

                const angle = Math.random() * Math.PI * 2;
                const dist = 8 + Math.random() * 18;

                particle.style.setProperty(
                    '--tx',
                    `${(Math.cos(angle) * dist).toFixed(1)}px`
                );
                particle.style.setProperty(
                    '--ty',
                    `${(Math.sin(angle) * dist).toFixed(1)}px`
                );

                document.body.appendChild(particle);
                removeWhenAnimationEnds(particle);
            }
        } catch (_) {
            /* no-op */
        }
    }

    function spawnComboConfetti(
        element,
        colors = ['#39ff14', '#00ffff', '#ffffff']
    ) {
        if (shouldSkipEffects()) return;

        try {
            const rect = element.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            for (let i = 0; i < 12; i++) {
                const confettiPiece = document.createElement('span');
                confettiPiece.className = 'confetti-piece';
                confettiPiece.style.backgroundColor = colors[i % colors.length];
                confettiPiece.style.left = `${cx}px`;
                confettiPiece.style.top = `${cy}px`;

                const angle = Math.random() * Math.PI * 2;
                const speed = 40 + Math.random() * 60;

                confettiPiece.style.setProperty(
                    '--dx',
                    `${(Math.cos(angle) * speed).toFixed(1)}px`
                );
                confettiPiece.style.setProperty(
                    '--dy',
                    `${(Math.sin(angle) * speed - 20).toFixed(1)}px`
                );
                confettiPiece.style.setProperty(
                    '--dr',
                    `${(Math.random() * 360 - 180).toFixed(1)}deg`
                );

                document.body.appendChild(confettiPiece);
                removeWhenAnimationEnds(confettiPiece);
            }
        } catch (_) {
            /* no-op */
        }
    }

    return {
        spawnComboConfetti,
        spawnTypingParticles,
    };
}
