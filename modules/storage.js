// === STORAGE MODULE ===
// 로컬 스토리지를 사용한 데이터 저장과 관리를 담당합니다.

import { formatDateKey } from './utils.js';

export class StorageManager {
    constructor() {
        this.storageKeys = {
            DAILY_STATS: 'dailyStats',
            USER_PREFERENCES: 'userPreferences',
            GAME_SETTINGS: 'gameSettings',
            ACHIEVEMENT_DATA: 'achievementData',
            WRONG_ANSWERS: 'wrongAnswers',
            CORRECT_ANSWERS: 'correctAnswers'
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

    // === 오답노트 관련 ===

    // 오답 데이터 저장
    saveWrongAnswer(subject, topic, questionId, wrongCount) {
        const data = this.getWrongAnswers();
        const key = `${subject}_${topic}`;
        
        if (!data[key]) {
            data[key] = {};
        }
        
        if (!data[key][questionId]) {
            data[key][questionId] = { count: 0, lastWrong: null };
        }
        
        data[key][questionId].count = wrongCount;
        data[key][questionId].lastWrong = formatDateKey();
        
        this.setItem(this.storageKeys.WRONG_ANSWERS, data);
    }

    // 오답 데이터 가져오기
    getWrongAnswers() {
        return this.getItem(this.storageKeys.WRONG_ANSWERS, {});
    }

    // 특정 과목/주제의 오답 데이터 가져오기
    getWrongAnswersForSubject(subject, topic) {
        const data = this.getWrongAnswers();
        const key = `${subject}_${topic}`;
        return data[key] || {};
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
            const key = `${subject}_${topic}`;
            delete data[key];
            this.setItem(this.storageKeys.WRONG_ANSWERS, data);
        } else {
            this.removeItem(this.storageKeys.WRONG_ANSWERS);
        }
    }

    // 오답 통계 가져오기
    getWrongAnswerStats() {
        const data = this.getWrongAnswers();
        const stats = {
            totalSubjects: 0,
            totalQuestions: 0,
            totalWrongAnswers: 0,
            subjects: {}
        };

        Object.entries(data).forEach(([key, subjectData]) => {
            const [subject, topic] = key.split('_');
            const subjectKey = `${subject}_${topic}`;

            if (!stats.subjects[subjectKey]) {
                stats.subjects[subjectKey] = {
                    subject,
                    topic,
                    questionCount: 0,
                    wrongCount: 0
                };
            }

            Object.values(subjectData).forEach(questionData => {
                stats.subjects[subjectKey].questionCount++;
                stats.subjects[subjectKey].wrongCount += questionData.count;
                stats.totalQuestions++;
                stats.totalWrongAnswers += questionData.count;
            });

            stats.totalSubjects++;
        });

        return stats;
    }

    // === 정답 데이터 관련 ===

    // 정답 데이터 저장
    saveCorrectAnswer(subject, topic, questionId) {
        const data = this.getCorrectAnswers();
        const key = `${subject}_${topic}`;

        if (!data[key]) {
            data[key] = {};
        }

        data[key][questionId] = formatDateKey();

        this.setItem(this.storageKeys.CORRECT_ANSWERS, data);
    }

    // 정답 데이터 가져오기
    getCorrectAnswers() {
        return this.getItem(this.storageKeys.CORRECT_ANSWERS, {});
    }

    // 특정 과목/주제의 정답 데이터 가져오기
    getCorrectAnswersForSubject(subject, topic) {
        const data = this.getCorrectAnswers();
        const key = `${subject}_${topic}`;
        return data[key] || {};
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
            const key = `${subject}_${topic}`;
            delete data[key];
            this.setItem(this.storageKeys.CORRECT_ANSWERS, data);
        } else {
            this.removeItem(this.storageKeys.CORRECT_ANSWERS);
        }
    }
}
