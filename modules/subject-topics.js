export const SUBJECT_TOPIC_MAPPING = {
    'overview-creative': [
        { name: '총론', subject: 'overview', topic: 'course' },
        { name: '창체', subject: 'creative', topic: 'course' },
    ],
    competency: [{ name: '역량', subject: 'competency', topic: 'competency' }],
    area: [{ name: '영역', subject: 'area', topic: 'area' }],
    korean: [
        { name: '내체표', subject: 'korean', topic: 'curriculum' },
        { name: '모형', subject: 'korean-model', topic: 'model' },
        { name: '성취기준', subject: 'korean-std', topic: 'achievement' },
        { name: '교육과정', subject: 'korean-course', topic: 'course' },
        { name: '맞춤법', subject: 'spelling', topic: 'moral' },
    ],
    math: [
        { name: '모형', subject: 'math-model', topic: 'model' },
        {
            name: '성취기준',
            subject: 'math-operation',
            topic: 'achievement',
            hasSubmenu: true,
        },
        { name: '교육과정', subject: 'math-course', topic: 'course' },
        { name: '도형', subject: 'geometry', topic: 'moral' },
    ],
    english: [
        { name: '기본이론', subject: 'english', topic: 'basic' },
        { name: '성취기준', subject: 'english-std', topic: 'achievement' },
        { name: '교육과정', subject: 'english-course', topic: 'course' },
    ],
    social: [
        { name: '모형', subject: 'social', topic: 'model' },
        {
            name: '성취기준',
            subject: 'social-34',
            topic: 'achievement',
            hasSubmenu: true,
        },
        { name: '교육과정', subject: 'social-course', topic: 'course' },
    ],
    ethics: [
        { name: '내체표', subject: 'ethics-lite', topic: 'curriculum' },
        { name: '모형', subject: 'ethics', topic: 'model' },
        { name: '교육과정', subject: 'moral-course', topic: 'course' },
        { name: '지도 원리·방법', subject: 'moral-principles', topic: 'moral' },
    ],
    science: [
        { name: '내체표', subject: 'science-curriculum', topic: 'curriculum' },
        { name: '모형', subject: 'science', topic: 'model' },
        { name: '성취기준', subject: 'science-std', topic: 'achievement' },
        { name: '교육과정', subject: 'science-course', topic: 'course' },
    ],
    pe: [
        {
            name: '내체표',
            subject: 'pe',
            topic: 'curriculum',
            hasSubmenu: true,
        },
        { name: '모형', subject: 'pe-model', topic: 'model' },
        { name: '교육과정', subject: 'pe-course', topic: 'course' },
        { name: '체육(뒷교)', subject: 'pe-back', topic: 'moral' },
        { name: '신체활동 예시', subject: 'physical-activity', topic: 'moral' },
        { name: '기본 기능&전략', subject: 'sports-functions', topic: 'moral' },
    ],
    music: [
        { name: '내체표', subject: 'music', topic: 'curriculum' },
        { name: '성취기준', subject: 'music-std', topic: 'achievement' },
        { name: '교육과정', subject: 'music-course', topic: 'course' },
        { name: '음악요소', subject: 'music-elements', topic: 'moral' },
    ],
    art: [
        { name: '내체표', subject: 'art', topic: 'curriculum' },
        { name: '모형', subject: 'art-model', topic: 'model' },
        { name: '성취기준', subject: 'art-std', topic: 'achievement' },
        { name: '교육과정', subject: 'art-course', topic: 'course' },
    ],
    practical: [
        { name: '내체표', subject: 'practical-lite', topic: 'curriculum' },
        { name: '모형', subject: 'practical', topic: 'model' },
        { name: '성취기준', subject: 'practical-std', topic: 'achievement' },
        { name: '교육과정', subject: 'practical-course', topic: 'course' },
    ],
    integrated: [
        {
            name: '내체표',
            subject: 'life',
            topic: 'curriculum',
            hasSubmenu: true,
        },
        { name: '모형', subject: 'integrated-model', topic: 'model' },
        {
            name: '성취기준',
            subject: 'life-achievement',
            topic: 'achievement',
            hasSubmenu: true,
        },
        { name: '교육과정', subject: 'integrated-course', topic: 'course' },
        { name: '통합 지도서', subject: 'integrated-guide', topic: 'moral' },
    ],
};

export const TOPIC_SUBMENU_IDS = [
    'math-achievement-submenu',
    'social-achievement-submenu',
    'integrated-curriculum-submenu',
    'integrated-achievement-submenu',
    'pe-curriculum-submenu',
    'ethics-basic-submenu',
];

const SUBMENU_SELECTION_GROUPS = [
    {
        groupName: 'math',
        topic: 'achievement',
        subjects: [
            'math-operation',
            'change-relation',
            'geometry-measure',
            'data-probability',
        ],
    },
    {
        groupName: 'social',
        topic: 'achievement',
        subjects: ['social-34', 'social-56'],
    },
    {
        groupName: 'integrated',
        topic: 'curriculum',
        subjects: ['life', 'wise', 'joy'],
    },
    {
        groupName: 'integrated',
        topic: 'achievement',
        subjects: ['life-achievement', 'wise-achievement', 'joy-achievement'],
    },
    {
        groupName: 'pe',
        topic: 'curriculum',
        subjects: ['pe', 'pe-lite'],
    },
    {
        groupName: 'ethics',
        topic: 'basic',
        subjects: ['eastern-ethics', 'western-ethics', 'moral-psychology'],
    },
];

export function findSubjectGroupForSelection(
    subject,
    topic,
    mapping = SUBJECT_TOPIC_MAPPING
) {
    for (const [groupName, topics] of Object.entries(mapping)) {
        const directMatch = topics.find(
            (item) => item.subject === subject && item.topic === topic
        );

        if (directMatch) {
            return { groupName, subject: directMatch.subject, topic };
        }
    }

    const submenuMatch = SUBMENU_SELECTION_GROUPS.find(
        (item) => item.topic === topic && item.subjects.includes(subject)
    );

    if (submenuMatch) {
        return { groupName: submenuMatch.groupName, subject, topic };
    }

    return { groupName: 'music', subject: 'music', topic: 'curriculum' };
}

export function createTopicSubmenuVisibility(groupName, topic) {
    const visibility = Object.fromEntries(
        TOPIC_SUBMENU_IDS.map((id) => [id, false])
    );

    if (groupName === 'math' && topic === 'achievement') {
        visibility['math-achievement-submenu'] = true;
    } else if (groupName === 'social' && topic === 'achievement') {
        visibility['social-achievement-submenu'] = true;
    } else if (groupName === 'integrated' && topic === 'curriculum') {
        visibility['integrated-curriculum-submenu'] = true;
    } else if (groupName === 'integrated' && topic === 'achievement') {
        visibility['integrated-achievement-submenu'] = true;
    } else if (groupName === 'pe' && topic === 'curriculum') {
        visibility['pe-curriculum-submenu'] = true;
    } else if (groupName === 'ethics' && topic === 'basic') {
        visibility['ethics-basic-submenu'] = true;
    }

    return visibility;
}

export function getDurationForTopic(topic, CONSTANTS) {
    return [
        CONSTANTS.TOPICS.CURRICULUM,
        CONSTANTS.TOPICS.COMPETENCY,
        CONSTANTS.TOPICS.AREA,
    ].includes(topic)
        ? 1200
        : 2400;
}

export function clearTopicSubButtonStyles(button) {
    button.classList.remove('selected');
    button.style.background = '';
    button.style.color = '';
    button.style.transform = '';
    button.style.boxShadow = '';
    button.style.borderColor = '';
    button.style.fontWeight = '';
}

export function showTopicSubmenus(
    visibility,
    { selectedSubject, onDefaultSelect } = {}
) {
    Object.entries(visibility).forEach(([id, isVisible]) => {
        const submenu = document.getElementById(id);
        if (!submenu) return;

        if (!isVisible) {
            submenu.classList.add('hidden');
            return;
        }

        submenu.classList.remove('hidden');
        submenu
            .querySelectorAll('.topic-sub-btn')
            .forEach(clearTopicSubButtonStyles);

        const selectedButton = selectedSubject
            ? submenu.querySelector(
                  `.topic-sub-btn[data-subject="${selectedSubject}"]`
              )
            : null;
        const buttonToSelect =
            selectedButton || submenu.querySelector('.topic-sub-btn');

        if (!buttonToSelect) return;

        buttonToSelect.classList.add('selected');
        clearInlineTopicSubButtonStyles(buttonToSelect);

        if (!selectedButton && onDefaultSelect) {
            onDefaultSelect(buttonToSelect);
        }
    });
}

export function hideTopicSubmenus(ids = TOPIC_SUBMENU_IDS) {
    ids.forEach((id) => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

function clearInlineTopicSubButtonStyles(button) {
    button.style.background = '';
    button.style.color = '';
    button.style.fontWeight = '';
    button.style.transform = '';
    button.style.boxShadow = '';
    button.style.borderColor = '';
}
