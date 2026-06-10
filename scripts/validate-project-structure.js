import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const LEGACY_REFERENCES = [
    'modules/migration-helper.js',
    'modules/stats.js',
    'modules/timer.js',
    'modules/ui.js',
    'css/layout.css',
    'css/modals.css',
    'css/responsive.css',
];

async function readText(relativePath) {
    return fs.readFile(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

async function exists(relativePath) {
    try {
        await fs.access(path.join(PROJECT_ROOT, relativePath));
        return true;
    } catch {
        return false;
    }
}

function localCssLinks(html) {
    return [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)]
        .map((match) => match[0].match(/\bhref="([^"]+)"/)?.[1])
        .filter(Boolean)
        .filter((href) => !/^https?:\/\//.test(href));
}

function localScriptSources(html) {
    return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((src) => !/^https?:\/\//.test(src));
}

function readDocumentedCssOrder(readme) {
    const match = readme.match(/CSS는\s+(.+?)\s+순서로 로드됩니다\./);
    if (!match) {
        throw new Error('README_MODULES.md CSS load order sentence not found');
    }

    return [...match[1].matchAll(/`([^`]+\.css)`/g)].map(
        (cssMatch) => cssMatch[1]
    );
}

function normalizeCssPath(href) {
    return href.replace(/^\.?\//, '').replace(/^css\//, '');
}

function uniqueDuplicates(items) {
    return [
        ...new Set(
            items.filter((item, index) => items.indexOf(item) !== index)
        ),
    ];
}

async function assertAllExist(paths, label) {
    const missing = [];
    for (const relativePath of paths) {
        if (!(await exists(relativePath))) {
            missing.push(relativePath);
        }
    }

    if (missing.length > 0) {
        throw new Error(`${label} missing: ${missing.join(', ')}`);
    }
}

async function validateCssOrder(html, readme) {
    const actual = localCssLinks(html).map(normalizeCssPath);
    const documented = readDocumentedCssOrder(readme);
    const actualWithoutCompatibilityCdn = actual.filter(
        (href) =>
            href !== 'https://cdn.jsdelivr.net/npm/galmuri/dist/galmuri.css'
    );

    if (actualWithoutCompatibilityCdn.join('\n') !== documented.join('\n')) {
        throw new Error(
            [
                'CSS load order mismatch between index.html and README_MODULES.md',
                'Actual:',
                actualWithoutCompatibilityCdn.join(', '),
                'Documented:',
                documented.join(', '),
            ].join('\n')
        );
    }

    const duplicateCss = uniqueDuplicates(actualWithoutCompatibilityCdn);
    if (duplicateCss.length > 0) {
        throw new Error(`Duplicate CSS links: ${duplicateCss.join(', ')}`);
    }

    await assertAllExist(
        localCssLinks(html).filter((href) => !/^https?:\/\//.test(href)),
        'CSS files'
    );
}

async function validateScripts(html) {
    await assertAllExist(localScriptSources(html), 'Script files');
}

async function validateModuleRegistry() {
    const registryPath = 'modules/module-registry.js';
    const registry = await readText(registryPath);
    const registryDir = path.posix.dirname(registryPath);
    const imports = [
        ...registry.matchAll(/await import\(\s*'([^']+)'\s*\)/g),
    ].map((match) =>
        path.posix.normalize(path.posix.join(registryDir, match[1]))
    );
    const duplicateImports = uniqueDuplicates(imports);

    if (duplicateImports.length > 0) {
        throw new Error(
            `Duplicate module-registry imports: ${duplicateImports.join(', ')}`
        );
    }

    await assertAllExist(imports, 'Module registry imports');
}

async function validateLegacyReferences(files) {
    const offenders = [];
    for (const relativePath of files) {
        const text = await readText(relativePath);
        for (const legacyReference of LEGACY_REFERENCES) {
            if (text.includes(legacyReference)) {
                offenders.push(`${relativePath}: ${legacyReference}`);
            }
        }
    }

    if (offenders.length > 0) {
        throw new Error(
            `Legacy file references found:\n${offenders.join('\n')}`
        );
    }
}

const html = await readText('index.html');
const readme = await readText('README_MODULES.md');

await validateCssOrder(html, readme);
await validateScripts(html);
await validateModuleRegistry();
await validateLegacyReferences(['index.html', 'README_MODULES.md']);

console.log(
    'Validated project structure, CSS order, scripts, and module registry'
);
