export function addDailyStatCount(stats, dateKey, count) {
    return {
        ...stats,
        [dateKey]: (stats[dateKey] || 0) + count,
    };
}

export function buildDailyStatsRange({ stats, days, formatDateKey }) {
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = formatDateKey(date);
        result.push({
            date: key,
            count: stats[key] || 0,
        });
    }

    return result;
}

export function getTotalDailyStats(stats) {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
}

export function updateBestScoreData(data, subject, topic, score) {
    const key = `${subject}_${topic}`;
    const updated = {
        ...data,
        bestScores: { ...data.bestScores },
    };

    if (updated.bestScores[key] && updated.bestScores[key] >= score) {
        return { data, changed: false };
    }

    updated.bestScores[key] = score;
    return { data: updated, changed: true };
}

export function updateStreakData({
    data,
    type,
    success,
    todayKey,
    yesterdayKey,
}) {
    const updated = {
        ...data,
        streaks: { ...data.streaks },
    };
    const currentStreak = updated.streaks[type] || {
        current: 0,
        best: 0,
        lastDate: null,
    };
    const streak = { ...currentStreak };

    if (success) {
        if (streak.lastDate === todayKey) {
            return { data, changed: false };
        }

        streak.current =
            streak.lastDate === yesterdayKey ? streak.current + 1 : 1;
        streak.lastDate = todayKey;
        streak.best = Math.max(streak.best, streak.current);
    } else {
        streak.current = 0;
    }

    updated.streaks[type] = streak;
    return { data: updated, changed: true };
}
