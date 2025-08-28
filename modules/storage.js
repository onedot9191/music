// === STORAGE MODULE ===
// 로컬 스토리지를 사용한 데이터 저장과 관리를 담당합니다.

import { formatDateKey } from './utils.js';

export class StorageManager {
    constructor() {
        this.storageKeys = {
            DAILY_STATS: 'dailyStats',
            USER_PREFERENCES: 'userPreferences',
            GAME_SETTINGS: 'gameSettings',
            ACHIEVEMENT_DATA: 'achievementData'
        };
    }

    // === 일일 통계 관련 ===
    
    // 일일 통계 저장
    saveDailyStats(count) {
        const key = formatDateKey();
        const stats = this.getDailyStatsRaw();
        stats[key] = (stats[key] || 0) + count;
        this.setItem(this.storageKeys.DAILY_STATS, stats);
    }

    // 원시 일일 통계 데이터 가져오기
    getDailyStatsRaw() {
        return this.getItem(this.storageKeys.DAILY_STATS, {});
    }

    // 지정된 일수만큼의 일일 통계 가져오기
    getDailyStats(days = 30) {
        const stats = this.getDailyStatsRaw();
        const result = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = formatDateKey(d);
            result.push({ 
                date: key, 
                count: stats[key] || 0 
            });
        }
        
        return result;
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
        return Object.values(stats).reduce((sum, count) => sum + count, 0);
    }

    // === 사용자 설정 관련 ===

    // 사용자 설정 저장
    saveUserPreferences(preferences) {
        const current = this.getUserPreferences();
        const updated = { ...current, ...preferences };
        this.setItem(this.storageKeys.USER_PREFERENCES, updated);
    }

    // 사용자 설정 가져오기
    getUserPreferences() {
        return this.getItem(this.storageKeys.USER_PREFERENCES, {
            volume: 0.5,
            theme: 'dark',
            language: 'ko',
            autoSave: true,
            showHints: true
        });
    }

    // 특정 설정값 가져오기
    getUserPreference(key, defaultValue = null) {
        const preferences = this.getUserPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }

    // === 게임 설정 관련 ===

    // 게임 설정 저장
    saveGameSettings(settings) {
        const current = this.getGameSettings();
        const updated = { ...current, ...settings };
        this.setItem(this.storageKeys.GAME_SETTINGS, updated);
    }

    // 게임 설정 가져오기
    getGameSettings() {
        return this.getItem(this.storageKeys.GAME_SETTINGS, {
            lastSubject: 'music',
            lastTopic: 'curriculum',
            lastMode: 'normal',
            lastDuration: 900,
            spellingDataset: 'basic'
        });
    }

    // 마지막 게임 상태 저장
    saveLastGameState(state) {
        this.saveGameSettings({
            lastSubject: state.selectedSubject,
            lastTopic: state.selectedTopic,
            lastMode: state.gameMode,
            lastDuration: state.duration,
            spellingDataset: state.spelling?.selectedDataset
        });
    }

    // 마지막 게임 상태 복원
    restoreLastGameState() {
        return this.getGameSettings();
    }

    // === 성취 데이터 관련 ===

    // 성취 데이터 저장
    saveAchievementData(data) {
        const current = this.getAchievementData();
        const updated = { ...current, ...data };
        this.setItem(this.storageKeys.ACHIEVEMENT_DATA, updated);
    }

    // 성취 데이터 가져오기
    getAchievementData() {
        return this.getItem(this.storageKeys.ACHIEVEMENT_DATA, {
            unlockedAchievements: [],
            bestScores: {},
            totalPlayTime: 0,
            streaks: {},
            milestones: {}
        });
    }

    // 최고 점수 업데이트
    updateBestScore(subject, topic, score) {
        const data = this.getAchievementData();
        const key = `${subject}_${topic}`;
        
        if (!data.bestScores[key] || data.bestScores[key] < score) {
            data.bestScores[key] = score;
            this.saveAchievementData(data);
            return true; // 새로운 기록
        }
        
        return false; // 기존 기록 유지
    }

    // 연속 기록 업데이트
    updateStreak(type, success = true) {
        const data = this.getAchievementData();
        const today = formatDateKey();
        
        if (!data.streaks[type]) {
            data.streaks[type] = { current: 0, best: 0, lastDate: null };
        }
        
        const streak = data.streaks[type];
        
        if (success) {
            if (streak.lastDate === today) {
                // 오늘 이미 기록됨, 무시
                return;
            }
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = formatDateKey(yesterday);
            
            if (streak.lastDate === yesterdayKey) {
                // 연속 기록 증가
                streak.current++;
            } else {
                // 새로운 연속 기록 시작
                streak.current = 1;
            }
            
            streak.lastDate = today;
            
            if (streak.current > streak.best) {
                streak.best = streak.current;
            }
        } else {
            // 연속 기록 중단
            streak.current = 0;
        }
        
        this.saveAchievementData(data);
    }

    // === 일반적인 스토리지 유틸리티 ===

    // 아이템 저장 (JSON 직렬화)
    setItem(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error(`Storage setItem failed for key "${key}":`, error);
            return false;
        }
    }

    // 아이템 가져오기 (JSON 파싱)
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`Storage getItem failed for key "${key}":`, error);
            return defaultValue;
        }
    }

    // 아이템 제거
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Storage removeItem failed for key "${key}":`, error);
            return false;
        }
    }

    // 모든 데이터 초기화
    clearAll() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Storage clearAll failed:', error);
            return false;
        }
    }

    // 특정 카테고리 데이터 초기화
    clearCategory(category) {
        const key = this.storageKeys[category.toUpperCase()];
        if (key) {
            return this.removeItem(key);
        }
        return false;
    }

    // 스토리지 사용량 확인 (근사치)
    getStorageInfo() {
        let totalSize = 0;
        const info = {};
        
        Object.entries(this.storageKeys).forEach(([name, key]) => {
            try {
                const item = localStorage.getItem(key);
                const size = item ? item.length : 0;
                info[name] = {
                    key,
                    size,
                    sizeKB: Math.round(size / 1024 * 100) / 100
                };
                totalSize += size;
            } catch (error) {
                info[name] = { key, size: 0, sizeKB: 0, error: error.message };
            }
        });
        
        return {
            categories: info,
            totalSize,
            totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
            available: this.isStorageAvailable()
        };
    }

    // 스토리지 사용 가능 여부 확인
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 데이터 내보내기
    exportData() {
        const data = {};
        Object.values(this.storageKeys).forEach(key => {
            const value = this.getItem(key);
            if (value !== null) {
                data[key] = value;
            }
        });
        return data;
    }

    // 데이터 가져오기
    importData(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                if (Object.values(this.storageKeys).includes(key)) {
                    this.setItem(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage importData failed:', error);
            return false;
        }
    }
}
