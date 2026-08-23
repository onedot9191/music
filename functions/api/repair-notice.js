const REPAIR_NOTICE_KEY = 'repairNoticeEnabled';
const ADMIN_COOKIE_NAME = '__Host-repair_notice_admin';
const ADMIN_COOKIE_PAYLOAD = 'repair-notice-admin-v1';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function jsonResponse(body, status = 200, headers = {}) {
    return Response.json(body, {
        headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
        },
        status,
    });
}

function readAdminPassword(env) {
    const password = env.REPAIR_NOTICE_ADMIN_PASSWORD;
    return typeof password === 'string' && password.length > 0
        ? password
        : null;
}

async function createAdminCookieValue(password) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { hash: 'SHA-256', name: 'HMAC' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(ADMIN_COOKIE_PAYLOAD)
    );
    return Array.from(new Uint8Array(signature), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('');
}

function readCookie(request, name) {
    const cookie = request.headers.get('Cookie') || '';
    const prefix = `${name}=`;
    return (
        cookie
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(prefix))
            ?.slice(prefix.length) || null
    );
}

async function isAuthorized(request, password) {
    if (request.headers.get('Authorization') === `Bearer ${password}`) {
        return { authorized: true, remember: true };
    }

    const cookieValue = readCookie(request, ADMIN_COOKIE_NAME);
    const expectedCookieValue = await createAdminCookieValue(password);
    return {
        authorized: cookieValue === expectedCookieValue,
        remember: false,
    };
}

export async function onRequestGet({ env }) {
    try {
        const enabled = await env.REPAIR_NOTICE_CONFIG.get(
            REPAIR_NOTICE_KEY,
            'json'
        );
        return jsonResponse({ enabled: enabled === true });
    } catch {
        return jsonResponse(
            { error: '공지 상태 저장소가 연결되지 않았습니다.' },
            503
        );
    }
}

export async function onRequestPost({ env, request }) {
    const password = readAdminPassword(env);
    if (!password) {
        return jsonResponse(
            { error: '관리자 비밀번호가 설정되지 않았습니다.' },
            503
        );
    }
    const authorization = await isAuthorized(request, password);
    if (!authorization.authorized) {
        return jsonResponse({ error: '관리자 비밀번호를 입력해 주세요.' }, 401);
    }

    let input;
    try {
        input = await request.json();
    } catch {
        return jsonResponse({ error: '요청 형식이 올바르지 않습니다.' }, 400);
    }
    if (typeof input?.enabled !== 'boolean') {
        return jsonResponse({ error: '요청 값이 올바르지 않습니다.' }, 400);
    }

    try {
        await env.REPAIR_NOTICE_CONFIG.put(
            REPAIR_NOTICE_KEY,
            JSON.stringify(input.enabled)
        );
        const headers = authorization.remember
            ? {
                  'Set-Cookie': `${ADMIN_COOKIE_NAME}=${await createAdminCookieValue(
                      password
                  )}; Path=/; Max-Age=${ADMIN_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Strict`,
              }
            : {};
        return jsonResponse({ enabled: input.enabled }, 200, headers);
    } catch {
        return jsonResponse({ error: '공지 상태를 저장하지 못했습니다.' }, 503);
    }
}
