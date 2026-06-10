import { QUIZ_PARTIAL_URLS } from './quiz-partials-manifest.js';

const DEFAULT_ROOT_ID = 'quiz-partials-root';
const INCLUDE_PATTERN = /<!--\s*quiz-include:\s*([^>]+?)\s*-->/g;

function readPartialUrls(root) {
    const configuredPartials = root.dataset.quizPartials || '';
    if (!configuredPartials) {
        return QUIZ_PARTIAL_URLS;
    }

    return configuredPartials
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);
}

async function loadPartialHtml(url, stack = []) {
    if (stack.includes(url)) {
        throw new Error(
            `Circular quiz partial include: ${[...stack, url].join(' -> ')}`
        );
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load quiz partial: ${url}`);
    }

    const html = await response.text();
    const nextStack = [...stack, url];
    const includes = [...html.matchAll(INCLUDE_PATTERN)];
    if (includes.length === 0) {
        return html;
    }

    const resolvedIncludes = await Promise.all(
        includes.map((match) => loadPartialHtml(match[1].trim(), nextStack))
    );

    let includeIndex = 0;
    return html.replace(
        INCLUDE_PATTERN,
        () => resolvedIncludes[includeIndex++]
    );
}

export async function loadQuizPartials(rootId = DEFAULT_ROOT_ID) {
    const root = document.getElementById(rootId);
    if (!root || root.dataset.loaded === 'true') {
        return;
    }

    const partialUrls = readPartialUrls(root);
    if (partialUrls.length === 0) {
        root.dataset.loaded = 'true';
        return;
    }

    const partialHtml = await Promise.all(
        partialUrls.map((url) => loadPartialHtml(url))
    );

    root.innerHTML = partialHtml.join('\n');
    root.dataset.loaded = 'true';
}
