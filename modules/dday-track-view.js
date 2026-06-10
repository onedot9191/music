function drawPixelMushroom(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fill = (x, y, width, height, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    };

    ctx.clearRect(0, 0, 20, 20);
    fill(7, 11, 6, 6, '#f4e3c3');
    fill(4, 6, 12, 5, '#d9534f');
    fill(5, 5, 10, 2, '#d9534f');
    ctx.fillStyle = '#000';
    ctx.fillRect(5, 5, 10, 1);
    ctx.fillRect(4, 6, 1, 5);
    ctx.fillRect(16, 6, 1, 5);
    ctx.fillRect(6, 11, 8, 1);
    ctx.fillRect(7, 11, 1, 6);
    ctx.fillRect(12, 11, 1, 6);
    ctx.fillRect(7, 17, 6, 1);
    fill(6, 7, 3, 2, '#fff');
    fill(12, 7, 3, 2, '#fff');
    fill(8, 13, 1, 2, '#000');
    fill(11, 13, 1, 2, '#000');
}

function createTick(className, styleKey, styleValue) {
    const tick = document.createElement('div');
    tick.className = className;
    tick.style[styleKey] = styleValue;
    return tick;
}

function createLabel(className, textContent) {
    const label = document.createElement('div');
    label.className = className;
    label.textContent = textContent;
    return label;
}

export function createDDayTrackElements(race, text) {
    race.innerHTML = '';

    const line = document.createElement('div');
    line.className = 'dday-line';

    const progress = document.createElement('div');
    progress.className = 'dday-progress';

    const d200Position = ((365 - 200) / 365) * 100;
    const d100Position = ((365 - 100) / 365) * 100;

    const runner = document.createElement('div');
    runner.className = 'dday-runner';
    runner.style.transition = 'left 0.4s ease';
    runner.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    drawPixelMushroom(canvas);
    runner.appendChild(canvas);

    const finish = document.createElement('div');
    finish.className = 'dday-finish-flag';

    const chip = document.createElement('div');
    chip.className = 'dday-chip';
    chip.textContent = text;

    race.append(
        line,
        progress,
        createTick('dday-tick dday-tick-start', 'left', '0'),
        createTick(
            'dday-tick d200-tick',
            'left',
            `calc(${d200Position}% - 1px)`
        ),
        createTick(
            'dday-tick d100-tick',
            'left',
            `calc(${d100Position}% - 1px)`
        ),
        createTick('dday-tick dday-tick-end', 'right', '0'),
        runner,
        finish,
        createLabel('dday-label left', 'D-365'),
        createLabel('dday-label d200-label', 'D-200'),
        createLabel('dday-label d100-label', 'D-100'),
        createLabel('dday-label right', 'D-Day'),
        chip
    );

    return { runner, progress, chip };
}

export function resetDDayTrackAnimation({
    chip,
    ddayTextEl,
    progress,
    runner,
    text,
}) {
    runner.style.left = '0px';
    runner.style.transition = 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1)';

    if (progress) {
        progress.style.width = '0px';
        progress.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    ddayTextEl.classList.remove('visible');

    if (chip) {
        chip.classList.remove('visible');
        chip.textContent = text;
        chip.style.left = '0px';
        chip.style.transition =
            'opacity 0.3s ease-in 0.6s, left 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
    }
}

export function animateDDayTrack({ chip, ddayTextEl, pos, progress, runner }) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            runner.style.left = `${pos}px`;
            if (progress) {
                progress.style.width = `${pos}px`;
            }

            if (chip) {
                chip.style.left = `${pos}px`;
            }

            setTimeout(() => {
                ddayTextEl.classList.add('visible');
                chip?.classList.add('visible');
            }, 600);
        });
    });
}

export function setDDayTrackAriaLabel(race, percent) {
    race.setAttribute(
        'aria-label',
        `디데이 경주 진행도 ${Math.round(percent)}%`
    );
}
