// === D-DAY MODULE ===
// D-Day 렌더링 조립을 담당합니다.

import {
    calculateDDayProgress,
    calculateDDayText,
    getNextDDayDate,
    getSecondSaturdayOfNovember,
} from './dday-date.js';
import {
    animateDDayTrack,
    createDDayTrackElements,
    resetDDayTrackAnimation,
    setDDayTrackAriaLabel,
} from './dday-track-view.js';

export { calculateDDayText, getSecondSaturdayOfNovember };

function observeRaceResize({ race, renderDDay, resizeObserverRef }) {
    if (!race || race.dataset.observed) return resizeObserverRef.current;

    try {
        resizeObserverRef.current?.disconnect();
    } catch {
        /* noop */
    }

    try {
        const observer = new ResizeObserver(() => {
            if (observer._pending) return;

            observer._pending = true;
            requestAnimationFrame(() => {
                observer._pending = false;
                renderDDay();
            });
        });

        observer.observe(race);
        race.dataset.observed = 'true';
        return observer;
    } catch {
        return resizeObserverRef.current;
    }
}

export function createDDayRenderer() {
    const resizeObserverRef = { current: null };
    let ddayElements = null;

    return function renderDDay() {
        const ddayTextEl = document.getElementById('dday');
        const race = document.getElementById('dday-race');

        if (!ddayTextEl) return;

        resizeObserverRef.current = observeRaceResize({
            race,
            renderDDay,
            resizeObserverRef,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = getNextDDayDate(today);
        const text = calculateDDayText(target, today);
        ddayTextEl.textContent = '';

        if (!race) return;
        if (race.clientWidth === 0) return;

        if (!ddayElements) {
            ddayElements = createDDayTrackElements(race, text);
        }

        const percent = calculateDDayProgress(target, today) * 100;
        const pos = Math.round((percent / 100) * race.clientWidth);

        resetDDayTrackAnimation({
            ...ddayElements,
            ddayTextEl,
            text,
        });
        animateDDayTrack({
            ...ddayElements,
            ddayTextEl,
            pos,
        });
        setDDayTrackAriaLabel(race, percent);
    };
}
