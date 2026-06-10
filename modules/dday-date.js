const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DDAY_PROGRESS_WINDOW_DAYS = 365;

function startOfDay(date = new Date()) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

export function getSecondSaturdayOfNovember(year) {
    const novemberFirst = new Date(year, 10, 1);
    const dayOfWeek = novemberFirst.getDay();
    const firstSaturday = dayOfWeek === 6 ? 1 : 7 - dayOfWeek;

    return new Date(year, 10, firstSaturday + 7);
}

export function getNextDDayDate(today = new Date()) {
    const normalizedToday = startOfDay(today);
    const year = normalizedToday.getFullYear();
    const target = getSecondSaturdayOfNovember(year);

    return target < normalizedToday
        ? getSecondSaturdayOfNovember(year + 1)
        : target;
}

export function calculateDDayText(targetDate, today = new Date()) {
    const normalizedToday = startOfDay(today);
    const target = startOfDay(targetDate);
    const diffDays = Math.floor((target - normalizedToday) / MS_PER_DAY);

    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
}

export function calculateDDayProgress(targetDate, today = new Date()) {
    const normalizedToday = startOfDay(today);
    const start = new Date(targetDate);
    start.setDate(start.getDate() - DDAY_PROGRESS_WINDOW_DAYS);

    return Math.max(
        0,
        Math.min(
            1,
            (normalizedToday - start) / (DDAY_PROGRESS_WINDOW_DAYS * MS_PER_DAY)
        )
    );
}
