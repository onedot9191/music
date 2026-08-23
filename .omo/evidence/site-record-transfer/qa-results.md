# Site record transfer QA

- Date: 2026-08-24
- Source: current uncommitted working tree
- Surface: two local HTTP origins reproducing the old and new production sites

## Functional flow

1. Opened the old-origin page and confirmed the migration dialog was visible.
2. Clicked `기록과 함께 새 주소로 이동` once.
3. Confirmed the old page received the transfer handshake from the new origin.
4. Opened the new-origin page, started the quiz, and clicked the character counter.
5. Confirmed the transferred daily count rendered as `7개` and the transferred sound setting rendered as `Off`.
6. Confirmed direct visits to the new origin do not show the migration dialog.
7. Confirmed the completed state shows `기록을 모두 옮겼습니다`, hides the transfer button, and exposes a single `확인` button.

## Storage failure flow

1. Forced the new-origin browser store to reject the `soundEnabled` write.
2. Clicked the old-origin transfer button once.
3. Confirmed the old page displayed `기록을 옮기지 못했습니다. 잠시 후 다시 시도해 주세요.` and kept retry enabled.
4. Continued on the old page and confirmed its daily count still rendered as `7개`.
5. Confirmed the automated regression restores values written before the rejection and never enters the completed state.

## Responsive captures

- `old-desktop.jpg`: old-origin migration dialog at 1280 px width
- `old-tablet.jpg`: old-origin migration dialog at 768 px width
- `old-mobile.jpg`: old-origin migration dialog at 375 px width
- `new-direct-mobile.jpg`: direct new-origin visit without the migration dialog
- `success-desktop.jpg`: completed state at 1280 px width
- `success-tablet.jpg`: completed state at 768 px width
- `success-mobile.jpg`: completed state at 375 px width

No clipping, overlap, or unreadable Korean text was observed in the captured states.
