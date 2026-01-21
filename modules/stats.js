// === STATISTICS MODULE ===
// 통계 및 데이터 관리 관련 함수들을 제공합니다.

import { StorageManager } from './storage.js';
import { formatDateKey } from './utils.js';
import { updateHeatmapTitle, renderHeatmap, calculateDDayText, getNextDDay } from './utils.js';

// renderDDay는 복잡한 DOM 조작이 필요하므로 app.js에 유지
// 여기서는 간단한 버전만 제공

// StorageManager 인스턴스 (외부에서 주입받거나 새로 생성)
let storageManager = null;

/**
 * StorageManager를 설정합니다.
 * @param {StorageManager} manager - StorageManager 인스턴스
 */
export function setStorageManager(manager) {
    storageManager = manager;
}

/**
 * StorageManager를 가져옵니다.
 * @returns {StorageManager}
 */
function getStorageManager() {
    if (!storageManager) {
        storageManager = new StorageManager();
    }
    return storageManager;
}

/**
 * 일일 통계를 저장합니다.
 * @param {number} count - 추가할 개수
 */
export function saveDailyStats(count) {
    const sm = getStorageManager();
    sm.saveDailyStats(count);
}

/**
 * 지정된 일수만큼의 일일 통계를 가져옵니다.
 * @param {number} days - 일수 (기본값: 30)
 * @returns {Array<{date: string, count: number}>}
 */
export function getDailyStats(days = 30) {
    const sm = getStorageManager();
    return sm.getDailyStats(days);
}

/**
 * 과목별 정확도를 저장합니다.
 * @param {string} subject - 과목
 * @param {number} correctCount - 정답 개수
 * @param {number} totalCount - 전체 개수
 */
export function saveSubjectAccuracy(subject, correctCount, totalCount) {
    const sm = getStorageManager();
    const key = formatDateKey();
    const stats = sm.getItem('subjectAccuracy', {});
    
    if (!stats[key]) {
        stats[key] = {};
    }
    
    if (!stats[key][subject]) {
        stats[key][subject] = { correct: 0, total: 0 };
    }
    
    stats[key][subject].correct += correctCount;
    stats[key][subject].total += totalCount;
    
    sm.setItem('subjectAccuracy', stats);
}

/**
 * 과목별 정확도를 가져옵니다.
 * @param {string} subject - 과목
 * @returns {number} 정확도 (0-100)
 */
export function getSubjectAccuracy(subject) {
    const sm = getStorageManager();
    const key = formatDateKey();
    const stats = sm.getItem('subjectAccuracy', {});
    
    if (stats[key] && stats[key][subject]) {
        const data = stats[key][subject];
        return data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    }
    
    return 0;
}

/**
 * 과목별 정확도가 임계값을 넘었는지 확인합니다.
 * @param {string} subject - 과목
 * @param {number} threshold - 임계값 (기본값: 70)
 * @returns {boolean}
 */
export function checkSubjectAccuracyThreshold(subject, threshold = 70) {
    const accuracy = getSubjectAccuracy(subject);
    return accuracy >= threshold;
}

/**
 * 과목별 정확도 달성을 표시합니다.
 * @param {string} subject - 과목
 */
export function markSubjectAccuracyAchieved(subject) {
    const sm = getStorageManager();
    const key = formatDateKey();
    const achievements = sm.getItem('subjectAchievements', {});
    
    if (!achievements[key]) {
        achievements[key] = {};
    }
    
    achievements[key][subject] = true;
    
    sm.setItem('subjectAchievements', achievements);
}

/**
 * 과목별 정확도 달성 여부를 확인합니다.
 * @param {string} subject - 과목
 * @returns {boolean}
 */
export function checkSubjectAccuracyAchieved(subject) {
    const sm = getStorageManager();
    const key = formatDateKey();
    const achievements = sm.getItem('subjectAchievements', {});
    
    return achievements[key] && achievements[key][subject] === true;
}

/**
 * 과목 버튼들의 상태를 업데이트합니다.
 */
export function updateSubjectButtonStates() {
    const subjectButtons = document.querySelectorAll('.subject-btn');
    
    subjectButtons.forEach(button => {
        const subject = button.dataset.subject;
        
        // 한번 달성했으면 계속 유지, 아니면 현재 정답률로 판단
        if (subject && (checkSubjectAccuracyAchieved(subject) || checkSubjectAccuracyThreshold(subject, 70))) {
            button.classList.add('high-accuracy');
        } else {
            button.classList.remove('high-accuracy');
        }
    });
}

// updateHeatmapTitle은 modules/utils.js에서 import하여 사용

/**
 * 히트맵을 렌더링합니다.
 * @param {Array<{date: string, count: number}>} stats - 통계 데이터
 */
export function renderHeatmapStats(stats) {
    renderHeatmap(stats);
    updateHeatmapTitle(stats);
    // renderDDay는 app.js에서 직접 호출됨 (복잡한 DOM 구조 생성 필요)
}

/**
 * 6개월 히트맵을 렌더링합니다.
 */
export function render6MonthHeatmap() {
    const container = document.getElementById('six-month-heatmap-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 6개월 (약 180일) 데이터 가져오기
    const stats = getDailyStats(180);
    
    if (stats.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">아직 학습 기록이 없습니다.</p>';
        return;
    }

    // 월별로 그룹화
    const monthGroups = {};
    stats.forEach(({ date, count }) => {
        const [year, month] = date.split('-');
        const key = `${year}-${month}`;
        if (!monthGroups[key]) {
            monthGroups[key] = [];
        }
        monthGroups[key].push({ date, count });
    });

    // 전체 데이터의 최대값 계산 (일관된 색상 표시를 위해)
    const globalMax = Math.max(...stats.map(s => s.count), 0);
    
    // 6개월 총 푼 개수 계산
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    // 제목 업데이트
    const titleElement = document.getElementById('six-month-heatmap-title');
    if (titleElement) {
        titleElement.innerHTML = `<span style="color: #FFFFFF; font-weight: 700;">${totalCount}개</span> 진행 중 (6개월 기준)`;
    }

    // 각 월별로 히트맵 생성
    Object.keys(monthGroups).sort().forEach(monthKey => {
        const monthData = monthGroups[monthKey];
        const [year, month] = monthKey.split('-');
        
        const monthSection = document.createElement('div');
        monthSection.classList.add('month-heatmap-section');
        
        const monthTitle = document.createElement('h3');
        monthTitle.classList.add('month-title');
        monthTitle.textContent = `${year}년 ${parseInt(month)}월`;
        monthSection.appendChild(monthTitle);
        
        const monthGrid = document.createElement('div');
        monthGrid.classList.add('month-heatmap-grid');
        
        // 첫 날의 요일에 맞춰 빈 칸 추가
        const firstDate = new Date(monthData[0].date);
        let offset = (firstDate.getDay() + 6) % 7; // 월요일 = 0
        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.classList.add('heatmap-cell', 'empty');
            monthGrid.appendChild(empty);
        }
        
        // 각 날짜별 셀 생성 (전체 최대값 기준으로 레벨 계산)
        monthData.forEach(({ date, count }) => {
            const cell = document.createElement('div');
            cell.classList.add('heatmap-cell');
            if (globalMax > 0 && count > 0) {
                const level = Math.min(4, Math.ceil((count / globalMax) * 4));
                cell.classList.add(`level-${level}`);
            }
            cell.title = `${date}: ${count}개`;
            monthGrid.appendChild(cell);
        });
        
        monthSection.appendChild(monthGrid);
        container.appendChild(monthSection);
    });
}

/**
 * D-Day를 렌더링합니다.
 * @param {Function} playSound - 사운드 재생 함수 (선택사항)
 */
export function renderDDay(playSound = null) {
    const el = document.getElementById('dday');
    const race = document.getElementById('dday-race');
    
    if (!el) return;
    
    // 11월 두 번째 주 토요일 기준. 이미 지났다면 내년 11월 두 번째 주 토요일 기준
    const target = getNextDDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 텍스트 D-Day 표시
    const text = calculateDDayText(target);
    el.textContent = text;
    
    // 경주 트랙 업데이트 (D-365 기준 진행도)
    if (race) {
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const start = new Date(target);
        start.setDate(start.getDate() - 365);
        const clamped = Math.max(0, Math.min(1, (today - start) / (365 * MS_PER_DAY)));
        
        // 아직 레이아웃이 잡히지 않아 너비가 0이면 다음 기회로 미룸
        if (race.clientWidth === 0) {
            return;
        }
        
        // 진행도 표시 업데이트
        const progress = race.querySelector('.dday-progress');
        if (progress) {
            progress.style.width = `${clamped * 100}%`;
        }
        
        // 러너 위치 업데이트
        const runner = race.querySelector('.dday-runner');
        if (runner) {
            runner.style.left = `${clamped * 100}%`;
        }
    }
}

/**
 * 오늘의 빈칸 개수를 업데이트합니다.
 * @param {Object} gameState - 게임 상태 객체
 * @param {Function} showSpecialBlankCountPopup - 특별 팝업 표시 함수
 */
export function updateTodayBlankCount(gameState, showSpecialBlankCountPopup) {
    try {
        const sm = getStorageManager();
        const stats = sm.getDailyStatsRaw();
        const todayKey = formatDateKey();
        const count = stats[todayKey] || 0;
        
        const countEl = document.getElementById('today-blank-count-number');
        if (countEl) {
            countEl.textContent = String(count);
        }
        
        // 50의 배수일 경우 특별 팝업 표시
        if (count > 0 && count % 50 === 0 && count !== gameState.lastSpecialPopupCount && !gameState.isForceQuit) {
            if (showSpecialBlankCountPopup) {
                showSpecialBlankCountPopup(count);
            }
        }
        
        // 강제 종료 플래그 초기화
        if (gameState.isForceQuit) {
            gameState.isForceQuit = false;
        }
    } catch (error) {
        console.warn('Failed to update today blank count:', error);
        // 오류 발생 시 안전하게 0으로 표시
        const countEl = document.getElementById('today-blank-count-number');
        if (countEl) {
            countEl.textContent = '0';
        }
    }
}
