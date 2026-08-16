import assert from 'assert/strict';

import { AUDIO_DEFINITIONS, getAudioVolume } from '../modules/audio-config.js';

assert.equal(
    AUDIO_DEFINITIONS.start.volumeMultiplier,
    0.85,
    'the start sound should be slightly quieter than the default effect volume'
);
assert.equal(
    AUDIO_DEFINITIONS.timeup.volumeMultiplier,
    0.85,
    'the time-up sound used by the quit action should be slightly quieter than the default effect volume'
);
assert.equal(
    getAudioVolume(0.3, AUDIO_DEFINITIONS.start),
    0.255,
    'the desktop start sound should use the reduced volume'
);

console.log('Start and quit sounds use the reduced effect volume');
