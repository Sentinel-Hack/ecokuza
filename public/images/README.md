# Images Folder Structure

This directory contains all images used in the EcoKuza frontend application.

## Folder Structure

- **logo/** - Contains the main EcoKuza logo
  - `econuza-logo.png` - Main logo used in the header

- **hero/** - Contains hero section background images
  - `hero-background.jpg` - Background image for the hero section

- **process/** - Contains process step icons and images
  - `step1-plant.png` - Icon for "Plant and Record" step
  - `step2-ai.png` - Icon for "AI Verifies Growth" step
  - `step3-rewards.png` - Icon for "Earn Points and Rewards" step

- **features/** - Contains feature section images
  - `strong-clubs.jpg` - Image for "Strong Environmental Clubs" feature
  - `simple-tools.jpg` - Image for "Simple Tools for Real Impact" feature
  - `collaboration.jpg` - Image for "Collaboration That Works" feature

- **icons/** - Contains general purpose icons
  - `tree-icon.svg` - Tree icon used in benefits section
  - `growth-icon.svg` - Growth icon used in benefits section

## Usage

Images are referenced in the React components using absolute paths from the public directory:
- Logo: `/images/logo/econuza-logo.png`
- Hero background: `/images/hero/hero-background.jpg`
- Process icons: `/images/process/step1-plant.png`, etc.
- Feature images: `/images/features/strong-clubs.jpg`, etc.
- Icons: `/images/icons/tree-icon.svg`, etc.

## Adding New Images

1. Place new images in the appropriate subfolder based on their usage
2. Update the corresponding React component to reference the new image
3. Update CSS styles if needed for proper display
4. Update this README file to document the new image
