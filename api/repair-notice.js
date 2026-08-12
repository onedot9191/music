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

async function readRepairNoticeEnabled() {
    const connectionString = process.env.GLOBAL_CONFIG;
    if (!connectionString) {
        throw new Error('GLOBAL_CONFIG is not configured');
    }

    const endpoint = new URL(connectionString);
    endpoint.pathname = `${endpoint.pathname.replace(
        /\/$/,
        ''
    )}/item/${REPAIR_NOTICE_KEY}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Edge Config read failed with ${response.status}`);
    }

    const enabled = await response.json();
    if (typeof enabled !== 'boolean') {
        throw new Error('Edge Config repair notice value is not boolean');
    }

    return enabled;
}

async function updateRepairNoticeEnabled(enabled) {
    const globalConfigId = process.env.GLOBAL_CONFIG_ID;
    const apiToken = process.env.VERCEL_API_TOKEN;
    if (!globalConfigId || !apiToken) {
        throw new Error('Global Config write credentials are not configured');
    }

    const endpoint = new URL(
        `https://api.vercel.com/v1/edge-config/${encodeURIComponent(
            globalConfigId
        )}/items`
    );
    if (process.env.VERCEL_TEAM_ID) {
        endpoint.searchParams.set('teamId', process.env.VERCEL_TEAM_ID);
    }

    const response = await fetch(endpoint, {
        body: JSON.stringify({
            items: [
                {
                    key: REPAIR_NOTICE_KEY,
                    operation: 'upsert',
                    value: enabled,
                },
            ],
        }),
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        method: 'PATCH',
    });

    if (!response.ok) {
        throw new Error(`Edge Config update failed with ${response.status}`);
    }
}

function writeFailureMessage(error) {
    const match =
        error instanceof Error
            ? /Edge Config update failed with (\d{3})/.exec(error.message)
            : null;

    return match
        ? `공지 상태를 저장하지 못했습니다. (Vercel 응답 ${match[1]})`
        : '공지 상태를 저장하지 못했습니다.';
}

async function handleUpdate(request) {
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
        await updateRepairNoticeEnabled(input.enabled);
        return jsonResponse({ enabled: input.enabled });
    } catch (error) {
        return jsonResponse({ error: writeFailureMessage(error) }, 502);
    }
}

export default {
    async fetch(request) {
        if (request.method === 'GET') {
            try {
                return jsonResponse({
                    enabled: await readRepairNoticeEnabled(),
                });
            } catch {
                return jsonResponse(
                    { error: '공지 상태를 불러오지 못했습니다.' },
                    503
                );
            }
        }

        if (request.method === 'POST') {
            return handleUpdate(request);
        }

        return jsonResponse({ error: '지원하지 않는 요청입니다.' }, 405);
    },
};
