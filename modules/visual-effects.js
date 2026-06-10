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

function pulseElement(element, className) {
    element.classList.remove(className);

    void element.offsetWidth;

    element.classList.add(className);
    element.addEventListener(
        'animationend',
        () => {
            element.classList.remove(className);
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
            const isPositive = color !== '#ff5733';
            const ring = document.createElement('span');

            ring.className = `answer-impact-ring ${
                isPositive ? 'is-correct' : 'is-wrong'
            }`;
            ring.style.left = `${cx}px`;
            ring.style.top = `${cy}px`;
            ring.style.width = `${Math.max(rect.width, 72)}px`;
            ring.style.height = `${Math.max(rect.height, 44)}px`;
            document.body.appendChild(ring);
            removeWhenAnimationEnds(ring);
            pulseElement(
                document.body,
                isPositive ? 'screen-correct-flash' : 'screen-wrong-flash'
            );

            for (let i = 0; i < 14; i++) {
                const particle = document.createElement('span');
                particle.className = 'typing-particle';
                particle.style.backgroundColor = color;
                particle.style.left = `${cx}px`;
                particle.style.top = `${cy}px`;

                const angle = Math.random() * Math.PI * 2;
                const dist = 14 + Math.random() * 38;
                const size = 3 + Math.random() * 5;

                particle.style.width = `${size.toFixed(1)}px`;
                particle.style.height = `${size.toFixed(1)}px`;
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
        colors = ['#00c853', '#ffe600', '#00d9ff', '#ff9f1c', '#ffffff']
    ) {
        if (shouldSkipEffects()) return;

        try {
            const rect = element.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const shockwave = document.createElement('span');
            shockwave.className = 'combo-shockwave';
            shockwave.style.left = `${cx}px`;
            shockwave.style.top = `${cy}px`;
            document.body.appendChild(shockwave);
            removeWhenAnimationEnds(shockwave);
            pulseElement(document.body, 'screen-combo-flash');

            for (let i = 0; i < 34; i++) {
                const confettiPiece = document.createElement('span');
                confettiPiece.className = `confetti-piece ${
                    i % 3 === 0 ? 'is-wide' : ''
                }`;
                confettiPiece.style.backgroundColor = colors[i % colors.length];
                confettiPiece.style.left = `${cx}px`;
                confettiPiece.style.top = `${cy}px`;

                const angle = Math.random() * Math.PI * 2;
                const speed = 70 + Math.random() * 130;

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
                confettiPiece.style.setProperty(
                    '--delay',
                    `${(Math.random() * 80).toFixed(0)}ms`
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
