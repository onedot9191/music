// === STATS MANAGER MODULE ===
// 통계 관리 및 히트맵 렌더링 관련 함수들

import {
    getJsonStorageItem,
    setJsonStorageItem,
} from './local-storage-json.js';
import { STORAGE_KEYS as SHARED_STORAGE_KEYS } from './storage-config.js';
import {
    addDailyStatCount,
    buildDailyStatsRange,
} from './storage-stats-records.js';
import {
    renderHeatmap as renderHeatmapView,
    renderSixMonthHeatmap,
    updateHeatmapTitle as updateHeatmapTitleView,
} from './stats-heatmap-view.js';
import { formatDateKey } from './utils.js';

const STORAGE_KEYS = {
    DAILY_STATS: SHARED_STORAGE_KEYS.DAILY_STATS,
    SUBJECT_ACCURACY: 'subjectAccuracy',
    SUBJECT_ACHIEVEMENTS: 'subjectAchievements',
};

const readStorageObject = (key) => getJsonStorageItem(key, {});
const writeStorageObject = (key, value) => setJsonStorageItem(key, value);

/**
 * 일일 통계 저장
 */
export function saveDailyStats(count) {
    const key = formatDateKey();
    const stats = readStorageObject(STORAGE_KEYS.DAILY_STATS);
    writeStorageObject(
        STORAGE_KEYS.DAILY_STATS,
        addDailyStatCount(stats, key, count)
    );
}

/**
 * 과목별 정확도 저장
 */
export function saveSubjectAccuracy(subject, correctCount, totalCount) {
    const key = formatDateKey();
    const stats = readStorageObject(STORAGE_KEYS.SUBJECT_ACCURACY);

    if (!stats[key]) {
        stats[key] = {};
    }

    if (!stats[key][subject]) {
        stats[key][subject] = { correct: 0, total: 0 };
    }

    stats[key][subject].correct += correctCount;
    stats[key][subject].total += totalCount;

    writeStorageObject(STORAGE_KEYS.SUBJECT_ACCURACY, stats);
}

/**
 * 과목별 정확도 조회
 */
export function getSubjectAccuracy(subject) {
    const key = formatDateKey();
    const stats = readStorageObject(STORAGE_KEYS.SUBJECT_ACCURACY);

    if (stats[key] && stats[key][subject]) {
        const data = stats[key][subject];
        return data.total > 0
            ? Math.round((data.correct / data.total) * 100)
            : 0;
    }

    return 0;
}

/**
 * 과목별 정확도 임계값 확인
 */
export function checkSubjectAccuracyThreshold(subject, threshold = 70) {
    const accuracy = getSubjectAccuracy(subject);
    return accuracy >= threshold;
}

/**
 * 과목별 정확도 달성 표시
 */
export function markSubjectAccuracyAchieved(subject) {
    const key = formatDateKey();
    const achievements = readStorageObject(STORAGE_KEYS.SUBJECT_ACHIEVEMENTS);

    if (!achievements[key]) {
        achievements[key] = {};
    }

    achievements[key][subject] = true;
    writeStorageObject(STORAGE_KEYS.SUBJECT_ACHIEVEMENTS, achievements);
}

/**
 * 과목별 정확도 달성 여부 확인
 */
export function checkSubjectAccuracyAchieved(subject) {
    const key = formatDateKey();
    const achievements = readStorageObject(STORAGE_KEYS.SUBJECT_ACHIEVEMENTS);
    return achievements[key] && achievements[key][subject] === true;
}

/**
 * 일일 통계 조회
 */
export function getDailyStats(days = 30) {
    const stats = readStorageObject(STORAGE_KEYS.DAILY_STATS);
    return buildDailyStatsRange({ stats, days, formatDateKey });
}

/**
 * 오늘의 빈칸 개수 조회
 */
export function getTodayBlankCount() {
    const stats = readStorageObject(STORAGE_KEYS.DAILY_STATS);
    const todayKey = formatDateKey();
    return stats[todayKey] || 0;
}

/**
 * 히트맵 제목 업데이트
 */
export function updateHeatmapTitle(stats) {
    updateHeatmapTitleView(stats);
}

/**
 * 히트맵 렌더링
 * @param {Array} stats - 통계 데이터 배열
 * @param {Function} renderDDayCallback - D-Day 렌더링 콜백 함수
 */
export function renderHeatmap(stats, renderDDayCallback) {
    renderHeatmapView(stats, renderDDayCallback);
}

/**
 * 6개월 히트맵 렌더링
 */
export function render6MonthHeatmap() {
    const stats = getDailyStats(180);
    renderSixMonthHeatmap(stats);
}
