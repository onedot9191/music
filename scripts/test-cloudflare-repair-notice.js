import assert from 'node:assert/strict';

import { onRequestGet, onRequestPost } from '../functions/api/repair-notice.js';
import { createRepairNoticeUpdateOptions } from '../modules/repair-notice-admin.js';

function createConfigStore(initialValue = null) {
    let storedValue = initialValue;

    return {
        async get() {
            return storedValue;
        },
        async put(_key, value) {
            storedValue = JSON.parse(value);
        },
        read() {
            return storedValue;
        },
    };
}

const configStore = createConfigStore();
const env = {
    REPAIR_NOTICE_ADMIN_PASSWORD: 'correct-password',
    REPAIR_NOTICE_CONFIG: configStore,
};

// Given: no repair notice value has been stored yet.
// When: the public status endpoint is requested.
const defaultStatusResponse = await onRequestGet({ env });

// Then: the notice is safely disabled by default.
assert.equal(defaultStatusResponse.status, 200);
assert.deepEqual(await defaultStatusResponse.json(), { enabled: false });

// Given: an unauthenticated update request.
// When: the admin endpoint receives the request.
const unauthorizedResponse = await onRequestPost({
    env,
    request: new Request('https://example.com/api/repair-notice', {
        body: JSON.stringify({ enabled: true }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
    }),
});

// Then: the update is rejected and the stored value is unchanged.
assert.equal(unauthorizedResponse.status, 401);
assert.equal(configStore.read(), null);

// Given: an authenticated update request.
// When: the admin endpoint enables the notice.
const updateResponse = await onRequestPost({
    env,
    request: new Request('https://example.com/api/repair-notice', {
        body: JSON.stringify({ enabled: true }),
        headers: {
            Authorization: 'Bearer correct-password',
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }),
});

// Then: the update succeeds and future reads return the stored value.
assert.equal(updateResponse.status, 200);
assert.deepEqual(await updateResponse.json(), { enabled: true });
assert.equal(configStore.read(), true);
const adminCookie = updateResponse.headers.get('Set-Cookie');
assert.match(adminCookie, /__Host-repair_notice_admin=/);
assert.match(adminCookie, /HttpOnly/);
assert.match(adminCookie, /Max-Age=31536000/);
assert.deepEqual(await (await onRequestGet({ env })).json(), { enabled: true });

// Given: the browser retained the secure cookie after the first login.
// When: the administrator updates the notice without entering the password.
const rememberedResponse = await onRequestPost({
    env,
    request: new Request('https://example.com/api/repair-notice', {
        body: JSON.stringify({ enabled: false }),
        headers: {
            Cookie: adminCookie.split(';')[0],
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }),
});

// Then: the saved browser authentication authorizes the update.
assert.equal(rememberedResponse.status, 200);
assert.deepEqual(await rememberedResponse.json(), { enabled: false });
assert.equal(configStore.read(), false);

// Given: an authenticated request with an invalid value.
// When: the admin endpoint receives the request.
const invalidValueResponse = await onRequestPost({
    env,
    request: new Request('https://example.com/api/repair-notice', {
        body: JSON.stringify({ enabled: 'yes' }),
        headers: {
            Authorization: 'Bearer correct-password',
            'Content-Type': 'application/json',
        },
        method: 'POST',
    }),
});

// Then: the invalid update is rejected.
assert.equal(invalidValueResponse.status, 400);
assert.equal(configStore.read(), false);

// Given: the administrator entered a password and selected a new state.
// When: the browser update request is prepared.
const requestOptions = createRepairNoticeUpdateOptions(false, 'admin-secret');

// Then: the password stays in the authorization header and the state is JSON.
assert.equal(requestOptions.method, 'POST');
assert.equal(requestOptions.headers.Authorization, 'Bearer admin-secret');
assert.deepEqual(JSON.parse(requestOptions.body), { enabled: false });

// Given: the browser already has a remembered authentication cookie.
// When: the update request is prepared without a password.
const rememberedRequestOptions = createRepairNoticeUpdateOptions(true, '');

// Then: the browser can rely on its secure cookie.
assert.equal(rememberedRequestOptions.headers.Authorization, undefined);

console.log('Cloudflare repair notice tests passed');
