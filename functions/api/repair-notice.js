const REPAIR_NOTICE_KEY = 'repairNoticeEnabled';

function jsonResponse(body, status = 200) {
    return Response.json(body, {
        headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json; charset=utf-8',
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

function isAuthorized(request, password) {
    return request.headers.get('Authorization') === `Bearer ${password}`;
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
    if (!isAuthorized(request, password)) {
        return jsonResponse({ error: '관리자 비밀번호가 틀렸습니다.' }, 401);
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
        return jsonResponse({ enabled: input.enabled });
    } catch {
        return jsonResponse({ error: '공지 상태를 저장하지 못했습니다.' }, 503);
    }
}
