import assert from 'node:assert/strict';

import repairNoticeApi from '../api/repair-notice.js';
import { isRepairNoticeAdminShortcut } from '../modules/repair-notice-admin.js';

function createShortcutEvent(overrides = {}) {
    return {
        altKey: true,
        ctrlKey: false,
        key: 'Enter',
        metaKey: true,
        repeat: false,
        shiftKey: false,
        ...overrides,
    };
}

assert.equal(
    isRepairNoticeAdminShortcut(createShortcutEvent()),
    true,
    'Option + Command + Enter should open repair notice admin'
);
assert.equal(
    isRepairNoticeAdminShortcut(createShortcutEvent({ repeat: true })),
    false,
    'Repeated keydown should not reopen repair notice admin'
);
assert.equal(
    isRepairNoticeAdminShortcut(createShortcutEvent({ shiftKey: true })),
    false,
    'Extra modifiers should not trigger repair notice admin'
);

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

try {
    process.env.GLOBAL_CONFIG =
        'https://edge-config.vercel.com/ecfg_test?token=read-token';
    process.env.GLOBAL_CONFIG_ID = 'ecfg_wrong';
    process.env.VERCEL_API_TOKEN = 'write-token';

    let requestedUrl = '';
    globalThis.fetch = async (url) => {
        requestedUrl = String(url);
        return Response.json(true);
    };

    const statusResponse = await repairNoticeApi.fetch(
        new Request('https://example.com/api/repair-notice')
    );
    assert.equal(statusResponse.status, 200);
    assert.deepEqual(await statusResponse.json(), { enabled: true });
    assert.equal(
        requestedUrl,
        'https://edge-config.vercel.com/ecfg_test/item/repairNoticeEnabled?token=read-token'
    );

    let updateRequest;
    globalThis.fetch = async (url, options) => {
        updateRequest = { options, url: String(url) };
        return Response.json({ status: 'ok' });
    };

    const updateResponse = await repairNoticeApi.fetch(
        new Request('https://example.com/api/repair-notice', {
            body: JSON.stringify({
                enabled: false,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
    );
    assert.equal(updateResponse.status, 200);
    assert.deepEqual(await updateResponse.json(), { enabled: false });
    assert.equal(
        updateRequest.url,
        'https://api.vercel.com/v1/edge-config/ecfg_test/items'
    );
    assert.equal(updateRequest.options.method, 'PATCH');
    assert.equal(
        updateRequest.options.headers.Authorization,
        'Bearer write-token'
    );
    assert.deepEqual(JSON.parse(updateRequest.options.body), {
        items: [
            {
                key: 'repairNoticeEnabled',
                operation: 'upsert',
                value: false,
            },
        ],
    });

    let invalidRequestFetchCalled = false;
    globalThis.fetch = async () => {
        invalidRequestFetchCalled = true;
        return Response.json({ status: 'ok' });
    };

    const invalidRequestResponse = await repairNoticeApi.fetch(
        new Request('https://example.com/api/repair-notice', {
            body: JSON.stringify({
                enabled: true,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
    );
    assert.equal(invalidRequestResponse.status, 200);
    assert.equal(invalidRequestFetchCalled, true);

    globalThis.fetch = async () =>
        Response.json(
            { error: { message: 'not authorized' } },
            { status: 403 }
        );

    const failedUpdateResponse = await repairNoticeApi.fetch(
        new Request('https://example.com/api/repair-notice', {
            body: JSON.stringify({ enabled: false }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })
    );
    assert.equal(failedUpdateResponse.status, 502);
    assert.deepEqual(await failedUpdateResponse.json(), {
        error: '공지 상태를 저장하지 못했습니다. (Vercel 응답 403)',
    });
} finally {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
}

console.log('Repair notice admin tests passed');
