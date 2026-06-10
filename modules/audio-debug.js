// === AUDIO DEBUG MODULE ===
// URL에 ?audioDebug=1을 붙이거나 localStorage.audioDebug = '1'로 설정하면
// 정상 흐름 오디오 로그를 확인할 수 있다.

export function isAudioDebugEnabled() {
    try {
        return (
            new URLSearchParams(window.location.search).has('audioDebug') ||
            window.localStorage?.getItem('audioDebug') === '1'
        );
    } catch (_) {
        return false;
    }
}

export function logAudioDebug(...args) {
    if (isAudioDebugEnabled()) {
        console.info(...args);
    }
}
