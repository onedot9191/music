function ensureRevealWrapper(input) {
    if (input.parentElement.classList.contains('reveal-wrapper')) {
        return input.parentElement;
    }

    const wrapper = document.createElement('span');
    wrapper.className = 'reveal-wrapper';
    input.parentElement.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    return wrapper;
}

export function showMiniRevealButton(input, onReveal) {
    const wrapper = ensureRevealWrapper(input);
    const existingButton = wrapper.querySelector('.mini-reveal-btn');

    if (existingButton) return existingButton;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mini-reveal-btn';
    button.textContent = '정답';
    button.title = '정답 보기';
    button.addEventListener(
        'click',
        () => {
            onReveal(input);
            button.remove();
        },
        { once: true }
    );

    wrapper.appendChild(button);
    return button;
}
