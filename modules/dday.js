// === D-DAY MODULE ===
// D-Day 계산 및 렌더링 관련 함수들

import { getNextDDay } from './utils.js';

/**
 * D-Day 텍스트 계산
 */
export function calculateDDayText(targetDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const diffDays = Math.floor((target - today) / msPerDay);
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

/**
 * D-Day 렌더링 (캐싱된 요소 사용)
 */
export function createDDayRenderer() {
    let ddayRaceResizeObserver = null;
    let ddayElements = null;
    
    return function renderDDay() {
        const el = document.getElementById('dday');
        const race = document.getElementById('dday-race');
        
        if (!el) return;
        
        // 크기 변화에 반응하여 재계산하도록 관찰자 설정
        if (race && !race.dataset.observed) {
            try { 
                if (ddayRaceResizeObserver) ddayRaceResizeObserver.disconnect(); 
            } catch (_) {}
            
            try {
                ddayRaceResizeObserver = new ResizeObserver(() => {
                    // 다음 프레임에서 안전하게 위치 재계산 (디바운스 적용)
                    if (!ddayRaceResizeObserver._pending) {
                        ddayRaceResizeObserver._pending = true;
                        requestAnimationFrame(() => {
                            ddayRaceResizeObserver._pending = false;
                            renderDDay();
                        });
                    }
                });
                
                ddayRaceResizeObserver.observe(race);
                race.dataset.observed = 'true';
            } catch (_) { /* ResizeObserver 미지원 시 무시 */ }
        }
        
        // 11월 두 번째 주 토요일 기준. 이미 지났다면 내년으로 자동 변경
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = getNextDDay();
        
        // 텍스트 D-Day 표시
        const text = calculateDDayText(target);
        el.textContent = '';
        
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
            
            // 최초 렌더 시 구조 구성 및 캐싱
            if (!ddayElements) {
                race.innerHTML = '';
                
                // 중앙 주로 선 + 진행선
                const line = document.createElement('div');
                line.className = 'dday-line';
                
                const progress = document.createElement('div');
                progress.className = 'dday-progress';
                
                // minimal ticks
                const tick0 = document.createElement('div');
                tick0.className = 'dday-tick dday-tick-start';
                tick0.style.left = '0';
                
                // D-200 위치 세로선 계산
                const d200Position = ((365 - 200) / 365) * 100;
                const tickD200 = document.createElement('div');
                tickD200.className = 'dday-tick d200-tick';
                tickD200.style.left = `calc(${d200Position}% - 1px)`;
                
                // D-100 위치 세로선 계산
                const d100Position = ((365 - 100) / 365) * 100;
                const tickD100 = document.createElement('div');
                tickD100.className = 'dday-tick d100-tick';
                tickD100.style.left = `calc(${d100Position}% - 1px)`;
                
                const tick100 = document.createElement('div');
                tick100.className = 'dday-tick dday-tick-end';
                tick100.style.right = '0';
                
                const runner = document.createElement('div');
                runner.className = 'dday-runner';
                runner.style.transition = 'left 0.4s ease';
                runner.setAttribute('aria-hidden', 'true');
                
                // 픽셀 버섯 캔버스
                const canvas = document.createElement('canvas');
                canvas.width = 20;
                canvas.height = 20;
                const ctx = canvas.getContext('2d');
                
                // 픽셀 아트 그리기 함수
                const drawPixelMushroom = (c) => {
                    c.clearRect(0, 0, 20, 20);
                    const fill = (x, y, w, h, color) => {
                        ctx.fillStyle = color;
                        ctx.fillRect(x, y, w, h);
                    };
                    
                    // stem (베이지)
                    fill(7, 11, 6, 6, '#f4e3c3');
                    // cap (빨강)
                    fill(4, 6, 12, 5, '#d9534f');
                    fill(5, 5, 10, 2, '#d9534f');
                    // outline (검정)
                    ctx.fillStyle = '#000';
                    ctx.fillRect(5, 5, 10, 1);
                    ctx.fillRect(4, 6, 1, 5);
                    ctx.fillRect(16, 6, 1, 5);
                    ctx.fillRect(6, 11, 8, 1);
                    ctx.fillRect(7, 11, 1, 6);
                    ctx.fillRect(12, 11, 1, 6);
                    ctx.fillRect(7, 17, 6, 1);
                    // dots (하양)
                    fill(6, 7, 3, 2, '#fff');
                    fill(12, 7, 3, 2, '#fff');
                    // eyes (검정)
                    fill(8, 13, 1, 2, '#000');
                    fill(11, 13, 1, 2, '#000');
                };
                
                drawPixelMushroom(ctx);
                runner.appendChild(canvas);
                
                const finish = document.createElement('div');
                finish.className = 'dday-finish-flag';
                
                // 좌/우 라벨과 퍼센트 칩
                const leftLabel = document.createElement('div');
                leftLabel.className = 'dday-label left';
                leftLabel.textContent = 'D-365';
                
                const d200Label = document.createElement('div');
                d200Label.className = 'dday-label d200-label';
                d200Label.textContent = 'D-200';
                
                const d100Label = document.createElement('div');
                d100Label.className = 'dday-label d100-label';
                d100Label.textContent = 'D-100';
                
                const rightLabel = document.createElement('div');
                rightLabel.className = 'dday-label right';
                rightLabel.textContent = 'D-Day';
                
                const ddayChip = document.createElement('div');
                ddayChip.className = 'dday-chip';
                ddayChip.textContent = text;
                
                race.appendChild(line);
                race.appendChild(progress);
                race.appendChild(tick0);
                race.appendChild(tickD200);
                race.appendChild(tickD100);
                race.appendChild(tick100);
                race.appendChild(runner);
                race.appendChild(finish);
                race.appendChild(leftLabel);
                race.appendChild(d200Label);
                race.appendChild(d100Label);
                race.appendChild(rightLabel);
                race.appendChild(ddayChip);
                
                // 요소들을 캐싱하여 이후 querySelector 호출 방지
                ddayElements = {
                    runner: runner,
                    progress: progress,
                    chip: ddayChip
                };
            }
            
            // 캐싱된 요소들 사용
            const runnerEl = ddayElements.runner;
            const progressEl = ddayElements.progress;
            const chipEl = ddayElements.chip;
            const percent = clamped * 100;
            
            // 실제 트랙 너비 기준 픽셀 위치 계산
            const finishOffset = 0;
            const range = Math.max(0, race.clientWidth - finishOffset);
            const pos = Math.round((percent / 100) * range);
            
            // 초기 상태 설정: 시작점에 배치
            runnerEl.style.left = '0px';
            runnerEl.style.transition = 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (progressEl) {
                progressEl.style.width = '0px';
                progressEl.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            
            // D-Day 텍스트 초기 숨김
            el.classList.remove('visible');
            if (chipEl) {
                chipEl.classList.remove('visible');
                chipEl.textContent = text;
                chipEl.style.left = '0px';
                chipEl.style.transition = 'opacity 0.3s ease-in 0.6s, left 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            
            // 다음 프레임에서 애니메이션 시작 (레이아웃이 완전히 계산된 후)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 버섯과 진행 바를 목표 위치로 이동
                    runnerEl.style.left = `${pos}px`;
                    if (progressEl) {
                        progressEl.style.width = `${pos}px`;
                    }
                    
                    if (chipEl) {
                        chipEl.style.left = `${pos}px`;
                    }
                    
                    // 애니메이션 중간에 텍스트 표시
                    setTimeout(() => {
                        el.classList.add('visible');
                        if (chipEl) {
                            chipEl.classList.add('visible');
                        }
                    }, 600); // 0.6초 후
                });
            });
            
            race.setAttribute('aria-label', `디데이 경주 진행도 ${Math.round(percent)}%`);
        }
    };
}
