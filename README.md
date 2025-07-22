# Music Quiz Game

This project is a simple music-based quiz game for practicing various subjects. It runs entirely in the browser.

## Linting

This repository uses ESLint (and optionally Prettier) to keep the code clean.

To check the code style, run:

```bash
npm run lint
```

This command will analyze JavaScript and HTML files using the configuration provided in `eslint.config.js`.

## Visual Styles

Additional CSS rules refine the nested list appearance within the English quiz section. Third and fourth list levels now have larger left margins and unique bullet styles to make the hierarchy clearer.
Dividing lines have been added to the English quiz lists so each level is visibly separated.

## Slot Machine Style Randomization

Clicking the **랜덤** button now triggers a slot machine style overlay that cycles
through subjects before selecting one at random. This short animation adds a
fun, immersive feel to the subject selection process.

## License

This project is licensed under the [ISC License](LICENSE).
