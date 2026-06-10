export function getSubjectTopicKey(subject, topic) {
    return `${subject}_${topic}`;
}

export function getRecordsForSubject(records, subject, topic) {
    return records[getSubjectTopicKey(subject, topic)] || {};
}

export function upsertWrongAnswerRecord({
    records,
    subject,
    topic,
    questionId,
    wrongCount,
    dateKey,
}) {
    const subjectKey = getSubjectTopicKey(subject, topic);
    return {
        ...records,
        [subjectKey]: {
            ...(records[subjectKey] || {}),
            [questionId]: {
                count: wrongCount,
                lastWrong: dateKey,
            },
        },
    };
}

export function removeSubjectTopicRecords(records, subject, topic) {
    const subjectKey = getSubjectTopicKey(subject, topic);
    const updated = { ...records };
    delete updated[subjectKey];
    return updated;
}

export function removeQuestionRecord(records, subject, topic, questionId) {
    const subjectKey = getSubjectTopicKey(subject, topic);

    if (!records[subjectKey]?.[questionId]) {
        return records;
    }

    const subjectRecords = { ...records[subjectKey] };
    delete subjectRecords[questionId];

    return {
        ...records,
        [subjectKey]: subjectRecords,
    };
}

export function buildWrongAnswerStats(records) {
    const stats = {
        totalSubjects: 0,
        totalQuestions: 0,
        totalWrongAnswers: 0,
        subjects: {},
    };

    Object.entries(records).forEach(([key, subjectData]) => {
        const [subject, topic] = key.split('_');
        const subjectKey = getSubjectTopicKey(subject, topic);

        if (!stats.subjects[subjectKey]) {
            stats.subjects[subjectKey] = {
                subject,
                topic,
                questionCount: 0,
                wrongCount: 0,
            };
        }

        Object.values(subjectData).forEach((questionData) => {
            stats.subjects[subjectKey].questionCount++;
            stats.subjects[subjectKey].wrongCount += questionData.count;
            stats.totalQuestions++;
            stats.totalWrongAnswers += questionData.count;
        });

        stats.totalSubjects++;
    });

    return stats;
}

export function upsertCorrectAnswerRecord({
    records,
    subject,
    topic,
    questionId,
    dateKey,
}) {
    const subjectKey = getSubjectTopicKey(subject, topic);
    return {
        ...records,
        [subjectKey]: {
            ...(records[subjectKey] || {}),
            [questionId]: dateKey,
        },
    };
}
