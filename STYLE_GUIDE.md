# Style Guide

This project uses a small design system to keep the interface consistent.

## Color Palette
| Name | Hex | Usage |
| --- | --- | --- |
| Primary | `#E94560` | Interactive elements |
| Secondary | `#0F3460` | Background accents |
| Accent | `#533483` | Buttons and highlights |
| Background Dark | `#1A1A2E` | Page background |
| Background Light | `#16213E` | Panels and modals |
| Text Light | `#F0F0F0` | Primary text |
| Text Dark | `#A0A0A0` | Secondary text |

## Typography
- **Base:** `Noto Sans KR` for body text.
- **Display:** `Press Start 2P` for headings and HUD elements.

## Spacing
Spacing follows a 4px scale expressed as CSS custom properties:
| Variable | Size |
| --- | --- |
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |

## Layout
- `.container` centers content and limits width.
- `.grid` implements a 12-column layout with uniform gaps.

## Components
- `.btn`: accent background, primary border, rounded corners.
- `.modal-content`: consistent padding and spacing.

## Icons and Images
- `.icon` class provides a standard 24px square size and inherits the current color.

Expand this guide as new components are introduced.
