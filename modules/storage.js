// === STORAGE MODULE ===
// 로컬 스토리지를 사용한 데이터 저장과 관리를 담당합니다.

import { STORAGE_KEYS } from './storage-config.js';
import {
    getJsonStorageItem,
    isLocalStorageAvailable,
    removeStorageItem,
    setJsonStorageItem,
} from './local-storage-json.js';
import {
    buildWrongAnswerStats,
    getRecordsForSubject,
    removeSubjectTopicRecords,
    upsertCorrectAnswerRecord,
    upsertWrongAnswerRecord,
} from './storage-answer-records.js';
import {
    addDailyStatCount,
    buildDailyStatsRange,
    getTotalDailyStats,
} from './storage-stats-records.js';
import {
    getUserPreference,
    getUserPreferences,
    saveUserPreferences,
} from './storage-preferences.js';
import {
    getGameSettings,
    restoreLastGameState,
    saveGameSettings,
    saveLastGameState,
} from './storage-game-settings.js';
import {
    getAchievementData,
    saveAchievementData,
    updateBestScore,
    updateStreak,
} from './storage-achievements.js';
import {
    clearStorageCategory,
    clearStorageKeys,
    exportStorageData,
    getStorageUsageInfo,
    importStorageData,
} from './storage-maintenance.js';
import { formatDateKey } from './utils.js';

export class StorageManager {
    constructor() {
        this.storageKeys = STORAGE_KEYS;
    }

    // === 일일 통계 관련 ===

    // 일일 통계 저장
    saveDailyStats(count) {
        const key = formatDateKey();
        const stats = this.getDailyStatsRaw();
        this.setItem(
            this.storageKeys.DAILY_STATS,
            addDailyStatCount(stats, key, count)
        );
    }

    // 원시 일일 통계 데이터 가져오기
    getDailyStatsRaw() {
        return this.getItem(this.storageKeys.DAILY_STATS, {});
    }

    // 지정된 일수만큼의 일일 통계 가져오기
    getDailyStats(days = 30) {
        const stats = this.getDailyStatsRaw();
        return buildDailyStatsRange({ stats, days, formatDateKey });
    }

    // 오늘의 통계 가져오기
    getTodayStats() {
        const todayKey = formatDateKey();
        const stats = this.getDailyStatsRaw();
        return stats[todayKey] || 0;
    }

    // 특정 날짜의 통계 가져오기
    getStatsForDate(date) {
        const key = formatDateKey(date);
        const stats = this.getDailyStatsRaw();
        return stats[key] || 0;
    }

    // 전체 통계 총합 가져오기
    getTotalStats() {
        const stats = this.getDailyStatsRaw();
        return getTotalDailyStats(stats);
    }

    // === 사용자 설정 관련 ===

    // 사용자 설정 저장
    saveUserPreferences(preferences) {
        saveUserPreferences(this, preferences);
    }

    // 사용자 설정 가져오기
    getUserPreferences() {
        return getUserPreferences(this);
    }

    // 특정 설정값 가져오기
    getUserPreference(key, defaultValue = null) {
        return getUserPreference(this, key, defaultValue);
    }

    // === 게임 설정 관련 ===

    // 게임 설정 저장
    saveGameSettings(settings) {
        saveGameSettings(this, settings);
    }

    // 게임 설정 가져오기
    getGameSettings() {
        return getGameSettings(this);
    }

    // 마지막 게임 상태 저장
    saveLastGameState(state) {
        saveLastGameState(this, state);
    }

    // 마지막 게임 상태 복원
    restoreLastGameState() {
        return restoreLastGameState(this);
    }

    // === 성취 데이터 관련 ===

    // 성취 데이터 저장
    saveAchievementData(data) {
        saveAchievementData(this, data);
    }

    // 성취 데이터 가져오기
    getAchievementData() {
        return getAchievementData(this);
    }

    // 최고 점수 업데이트
    updateBestScore(subject, topic, score) {
        return updateBestScore(this, subject, topic, score);
    }

    // 연속 기록 업데이트
    updateStreak(type, success = true) {
        updateStreak(this, type, success);
    }

    // === 일반적인 스토리지 유틸리티 ===

    // 아이템 저장 (JSON 직렬화)
    setItem(key, value) {
        return setJsonStorageItem(key, value);
    }

    // 아이템 가져오기 (JSON 파싱)
    getItem(key, defaultValue = null) {
        return getJsonStorageItem(key, defaultValue);
    }

    // 아이템 제거
    removeItem(key) {
        return removeStorageItem(key);
    }

    // 모든 데이터 초기화
    clearAll() {
        return clearStorageKeys(this.storageKeys);
    }

    // 특정 카테고리 데이터 초기화
    clearCategory(category) {
        return clearStorageCategory(this.storageKeys, category);
    }

    // 스토리지 사용량 확인 (근사치)
    getStorageInfo() {
        return getStorageUsageInfo(this.storageKeys);
    }

    // 스토리지 사용 가능 여부 확인
    isStorageAvailable() {
        return isLocalStorageAvailable();
    }

    // 데이터 내보내기
    exportData() {
        return exportStorageData(this.storageKeys);
    }

    // 데이터 가져오기
    importData(data) {
        return importStorageData(this.storageKeys, data);
    }

    // === 오답노트 관련 ===

    // 오답 데이터 저장
    saveWrongAnswer(subject, topic, questionId, wrongCount) {
        const data = this.getWrongAnswers();
        this.setItem(
            this.storageKeys.WRONG_ANSWERS,
            upsertWrongAnswerRecord({
                records: data,
                subject,
                topic,
                questionId,
                wrongCount,
                dateKey: formatDateKey(),
            })
        );
    }

    // 오답 데이터 가져오기
    getWrongAnswers() {
        return this.getItem(this.storageKeys.WRONG_ANSWERS, {});
    }

    // 특정 과목/주제의 오답 데이터 가져오기
    getWrongAnswersForSubject(subject, topic) {
        const data = this.getWrongAnswers();
        return getRecordsForSubject(data, subject, topic);
    }

    // 특정 문제의 오답 횟수 가져오기
    getWrongCount(subject, topic, questionId) {
        const data = this.getWrongAnswersForSubject(subject, topic);
        return data[questionId]?.count || 0;
    }

    // 오답 데이터 초기화
    clearWrongAnswers(subject = null, topic = null) {
        if (subject && topic) {
            const data = this.getWrongAnswers();
            this.setItem(
                this.storageKeys.WRONG_ANSWERS,
                removeSubjectTopicRecords(data, subject, topic)
            );
        } else {
            this.removeItem(this.storageKeys.WRONG_ANSWERS);
        }
    }

    // 오답 통계 가져오기
    getWrongAnswerStats() {
        const data = this.getWrongAnswers();
        return buildWrongAnswerStats(data);
    }

    // === 정답 데이터 관련 ===

    // 정답 데이터 저장
    saveCorrectAnswer(subject, topic, questionId) {
        const data = this.getCorrectAnswers();
        this.setItem(
            this.storageKeys.CORRECT_ANSWERS,
            upsertCorrectAnswerRecord({
                records: data,
                subject,
                topic,
                questionId,
                dateKey: formatDateKey(),
            })
        );
    }

    // 정답 데이터 가져오기
    getCorrectAnswers() {
        return this.getItem(this.storageKeys.CORRECT_ANSWERS, {});
    }

    // 특정 과목/주제의 정답 데이터 가져오기
    getCorrectAnswersForSubject(subject, topic) {
        const data = this.getCorrectAnswers();
        return getRecordsForSubject(data, subject, topic);
    }

    // 특정 문제가 정답 처리되었는지 확인
    isAnsweredCorrectly(subject, topic, questionId) {
        const data = this.getCorrectAnswersForSubject(subject, topic);
        return !!data[questionId];
    }

    // 정답 데이터 초기화
    clearCorrectAnswers(subject = null, topic = null) {
        if (subject && topic) {
            const data = this.getCorrectAnswers();
            this.setItem(
                this.storageKeys.CORRECT_ANSWERS,
                removeSubjectTopicRecords(data, subject, topic)
            );
        } else {
            this.removeItem(this.storageKeys.CORRECT_ANSWERS);
        }
    }
}
