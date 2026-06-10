const CREATIVE_TEXT_REVEAL_ANSWERS = new Set([
    '주제 탐구 활동',
    '적응 및 개척 활동',
    '프로젝트형 봉사활동',
    '기본생활습관 형성 활동',
    '관계 형성 및 소통 활동',
    '공동체 자치활동',
    '학술 동아리',
    '예술 동아리',
    '스포츠 동아리',
    '놀이 동아리',
    '교내 봉사활동',
    '지역 사회 봉사활동',
    '청소년 단체 활동',
    '자아탐색 활동',
    '진로 이해 활동',
    '직업 이해 활동',
    '정보 탐색 활동',
    '진로 준비 활동',
    '진로계획 활동',
    '진로체험 활동',
]);

function findById(root, id) {
    return root.getElementById?.(id) || root.querySelector?.(`#${id}`);
}

function collectInlineTextUntilBreak(input) {
    const nodes = [];
    let textContent = '';
    let nextNode = input.nextSibling;

    while (nextNode) {
        if (
            nextNode.nodeType === Node.ELEMENT_NODE &&
            nextNode.tagName === 'BR'
        ) {
            break;
        }

        nodes.push(nextNode);

        if (nextNode.nodeType === Node.TEXT_NODE) {
            textContent += nextNode.textContent.trim();
        } else if (nextNode.textContent) {
            textContent += nextNode.textContent;
        }

        nextNode = nextNode.nextSibling;
    }

    return { nodes, textContent };
}

export function setupCreativeQuestionTextReveal({ root = document } = {}) {
    const creativeMain = findById(root, 'creative-quiz-main');
    if (!creativeMain) return;

    const inputs = Array.from(
        creativeMain.querySelectorAll('.creative-question input[data-answer]')
    ).filter((input) => CREATIVE_TEXT_REVEAL_ANSWERS.has(input.dataset.answer));

    inputs.forEach((input) => {
        if (input.dataset.textRevealSetup === 'true') return;

        input.dataset.textRevealSetup = 'true';

        const { nodes, textContent } = collectInlineTextUntilBreak(input);
        if (!textContent) return;

        const textSpan = document.createElement('span');
        textSpan.className = 'creative-answer-text';
        textSpan.style.display = input.disabled ? 'inline' : 'none';

        nodes.forEach((node) => {
            textSpan.appendChild(node);
        });

        input.parentNode?.insertBefore(textSpan, input.nextSibling);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'disabled'
                ) {
                    textSpan.style.display = input.disabled ? 'inline' : 'none';
                }
            });
        });

        observer.observe(input, {
            attributeFilter: ['disabled'],
            attributes: true,
        });
    });
}

export function wrapScienceInquiryActivities({ root = document } = {}) {
    const main = findById(root, 'science-std-quiz-main');
    if (!main || main.dataset.inquiryWrapped === 'true') return;

    const blocks = main.querySelectorAll('.achievement-block');

    main.querySelectorAll('.outline-title').forEach((title) => {
        if (title.textContent.trim().startsWith('#')) {
            title.setAttribute('data-is-topic', 'true');
        }
    });

    blocks.forEach((block, index) => {
        if (index === 0) return;

        const divider = document.createElement('div');
        divider.className = 'topic-divider';
        block.parentNode.insertBefore(divider, block);
    });

    blocks.forEach((block) => {
        const questions = Array.from(
            block.querySelectorAll('.overview-question')
        );

        questions.forEach((question) => {
            const text = question.textContent
                .replace(/\s+/g, '')
                .replace(/[<>]/g, '')
                .trim();

            if (text !== '탐구활동') return;

            question.textContent = '<탐구 활동>';

            const wrapper = document.createElement('div');
            wrapper.className = 'activity-box';
            question.parentNode.insertBefore(wrapper, question);
            wrapper.appendChild(question);

            let sibling = wrapper.nextElementSibling;

            while (sibling && !sibling.classList.contains('outline-title')) {
                const next = sibling.nextElementSibling;

                if (!sibling.classList.contains('overview-question')) {
                    break;
                }

                wrapper.appendChild(sibling);
                sibling = next;
            }
        });
    });

    main.dataset.inquiryWrapped = 'true';
}

export function shuffleSocialityFunctionList({ root = document } = {}) {
    const list = findById(root, 'sociality-function-list');
    if (!list) return;

    const items = Array.from(list.children);

    for (let index = items.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));

        list.appendChild(items[swapIndex]);
        items.splice(swapIndex, 1);
    }
}
