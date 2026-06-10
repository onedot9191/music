export function getAnswerCandidates(input) {
    const answers = [];
    const dataAnswer = input.getAttribute('data-answer');

    if (dataAnswer) {
        answers.push(...expandAnswerAliases(dataAnswer.trim()));
    }

    const accept =
        input.getAttribute('data-accept') ||
        input.getAttribute('data-alias') ||
        input.getAttribute('data-aliases');

    if (accept) {
        accept.split(',').forEach((value) => {
            const trimmed = value.trim();
            if (trimmed) answers.push(trimmed);
        });
    }

    return answers.length ? answers : [''];
}

export function getLongestReferenceText(input) {
    const answers = getAnswerCandidates(input);
    return answers.reduce(
        (longest, current) =>
            current.length > longest.length ? current : longest,
        ''
    );
}

function expandAnswerAliases(answer) {
    const answers = [answer];
    const parenMatch = answer.match(/([^(]*)\(([^)]*)\)(.*)/);

    if (!parenMatch) {
        return answers;
    }

    const beforeParen = parenMatch[1];
    const parenContent = parenMatch[2];
    const afterParen = parenMatch[3] || '';
    const withoutParen = beforeParen + afterParen;

    if (withoutParen && withoutParen !== answer) {
        answers.push(withoutParen);
    }

    if (beforeParen && parenContent) {
        const mergedWithBefore = beforeParen + parenContent + afterParen;
        if (
            mergedWithBefore &&
            mergedWithBefore !== answer &&
            mergedWithBefore !== withoutParen
        ) {
            answers.push(mergedWithBefore);
        }
    }

    if (parenContent && parenContent !== answer) {
        answers.push(parenContent + afterParen);
    }

    return answers;
}
