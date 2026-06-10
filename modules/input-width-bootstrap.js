import { initAutoWidthCourse, protectHomeProjectInputs } from './dom-utils.js';

export function scheduleInitialInputWidthSetup() {
    requestAnimationFrame(() => {
        initAutoWidthCourse();
    });

    requestAnimationFrame(() => {
        protectHomeProjectInputs();
    });
}
