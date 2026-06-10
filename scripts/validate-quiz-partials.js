import fs from 'fs/promises';
import path from 'path';

import { QUIZ_PARTIAL_URLS } from '../modules/quiz-partials-manifest.js';

const INCLUDE_PATTERN = /<!--\s*quiz-include:\s*([^>]+?)\s*-->/g;
const MAIN_ID_PATTERN = /<main\b[^>]*\bid=["']([^"']+)["'][^>]*>/g;
const PROJECT_ROOT = process.cwd();

async function readText(relativePath) {
    return fs.readFile(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

async function resolvePartial(relativePath, stack = []) {
    if (stack.includes(relativePath)) {
        throw new Error(
            `Circular quiz partial include: ${[...stack, relativePath].join(
                ' -> '
            )}`
        );
    }

    const html = await readText(relativePath);
    const includes = [...html.matchAll(INCLUDE_PATTERN)];
    if (includes.length === 0) {
        return html;
    }

    const nextStack = [...stack, relativePath];
    const resolvedIncludes = await Promise.all(
        includes.map((match) => resolvePartial(match[1].trim(), nextStack))
    );

    let includeIndex = 0;
    return html.replace(
        INCLUDE_PATTERN,
        () => resolvedIncludes[includeIndex++]
    );
}

function collectMatches(pattern, text) {
    return [...text.matchAll(pattern)].map((match) => match[1]);
}

const renderedPartials = await Promise.all(
    QUIZ_PARTIAL_URLS.map((url) => resolvePartial(url))
);
const renderedHtml = renderedPartials.join('\n');
const mainIds = collectMatches(MAIN_ID_PATTERN, renderedHtml);
const duplicatedMainIds = [
    ...new Set(mainIds.filter((id, index) => mainIds.indexOf(id) !== index)),
];

if (mainIds.length !== QUIZ_PARTIAL_URLS.length) {
    throw new Error(
        `Expected ${QUIZ_PARTIAL_URLS.length} quiz main elements, found ${mainIds.length}`
    );
}

if (duplicatedMainIds.length > 0) {
    throw new Error(`Duplicate quiz main ids: ${duplicatedMainIds.join(', ')}`);
}

console.log(
    `Validated ${QUIZ_PARTIAL_URLS.length} quiz partials, ${mainIds.length} main elements`
);
