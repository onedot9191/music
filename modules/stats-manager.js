// === STATS MANAGER MODULE ===
// 통계 관리 및 히트맵 렌더링 관련 함수들

import { formatDateKey } from './utils.js';

/**
 * 일일 통계 저장
 */
export function saveDailyStats(count) {
    const key = formatDateKey();
    const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    stats[key] = (stats[key] || 0) + count;
    localStorage.setItem('dailyStats', JSON.stringify(stats));
}

/**
 * 과목별 정확도 저장
 */
export function saveSubjectAccuracy(subject, correctCount, totalCount) {
    const key = formatDateKey();
    const stats = JSON.parse(localStorage.getItem('subjectAccuracy') || '{}');
    
    if (!stats[key]) {
        stats[key] = {};
    }
    
    if (!stats[key][subject]) {
        stats[key][subject] = { correct: 0, total: 0 };
    }
    
    stats[key][subject].correct += correctCount;
    stats[key][subject].total += totalCount;
    
    localStorage.setItem('subjectAccuracy', JSON.stringify(stats));
}

/**
 * 과목별 정확도 조회
 */
export function getSubjectAccuracy(subject) {
    const key = formatDateKey();
    const stats = JSON.parse(localStorage.getItem('subjectAccuracy') || '{}');
    
    if (stats[key] && stats[key][subject]) {
        const data = stats[key][subject];
        return data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
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
    const achievements = JSON.parse(localStorage.getItem('subjectAchievements') || '{}');
    
    if (!achievements[key]) {
        achievements[key] = {};
    }
    
    achievements[key][subject] = true;
    localStorage.setItem('subjectAchievements', JSON.stringify(achievements));
}

/**
 * 과목별 정확도 달성 여부 확인
 */
export function checkSubjectAccuracyAchieved(subject) {
    const key = formatDateKey();
    const achievements = JSON.parse(localStorage.getItem('subjectAchievements') || '{}');
    return achievements[key] && achievements[key][subject] === true;
}

/**
 * 일일 통계 조회
 */
export function getDailyStats(days = 30) {
    const stats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = formatDateKey(d);
        result.push({ date: key, count: stats[key] || 0 });
    }
    
    return result;
}

/**
 * 오늘의 빈칸 개수 조회
 */
export function getTodayBlankCount() {
    const dailyStatsStr = localStorage.getItem('dailyStats');
    const stats = dailyStatsStr ? JSON.parse(dailyStatsStr) : {};
    const todayKey = formatDateKey();
    return stats[todayKey] || 0;
}

/**
 * 히트맵 제목 업데이트
 */
export function updateHeatmapTitle(stats) {
    const countEl = document.getElementById('heatmap-count');
    if (!countEl) return;
    
    const todayKey = formatDateKey();
    const today = stats.find(s => s.date === todayKey);
    const count = today ? today.count : 0;
    countEl.textContent = String(count);
}

/**
 * 히트맵 렌더링
 * @param {Array} stats - 통계 데이터 배열
 * @param {Function} renderDDayCallback - D-Day 렌더링 콜백 함수
 */
export function renderHeatmap(stats, renderDDayCallback) {
    const container = document.getElementById('activity-heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    if (stats.length === 0) return;
    
    const firstDate = new Date(stats[0].date);
    let offset = (firstDate.getDay() + 6) % 7; // 월요일 = 0
    
    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('div');
        empty.classList.add('heatmap-cell', 'empty');
        container.appendChild(empty);
    }
    
    const max = Math.max(...stats.map(s => s.count), 0);
    
    stats.forEach(({ date, count }) => {
        const cell = document.createElement('div');
        cell.classList.add('heatmap-cell');
        
        if (max > 0 && count > 0) {
            const level = Math.min(4, Math.ceil((count / max) * 4));
            cell.classList.add(`level-${level}`);
        }
        
        cell.title = `${date}: ${count}`;
        container.appendChild(cell);
    });
    
    updateHeatmapTitle(stats);
    
    if (renderDDayCallback) {
        renderDDayCallback();
    }
}

/**
 * 6개월 히트맵 렌더링
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
        titleElement.innerHTML = `<span style="color: var(--primary);">${totalCount}개</span> 진행 중 (6개월 기준)`;
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
