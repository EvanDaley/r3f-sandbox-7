# r3f-sandbox-7

## Live Demo

https://evandaley.github.io/r3f-sandbox-7/

## Description

A React Three Fiber sandbox project featuring a third-person character controller built with ecctrl.

## Development Commands

Start development server: `npm run dev`

Build library for production: `npm run build`

Build example for deployment: `npm run build:example`

Deploy to GitHub Pages: `npm run ship` (builds example and deploys)

Preview built example locally: `npm run preview`

## Project Structure

- `src/` - Source code for the library
  - `modules/third_person_controller/` - Main character controller components
  - `hooks/` - Custom React hooks
- `example/` - Example/demo application
- `public/` - Static assets (models, textures, images)
- `dist/` - Built library output
- `dist-example/` - Built example output (for GitHub Pages)

## Features

- Third-person character controller with physics
- Joystick controls for mobile devices
- Keyboard and gamepad support
- Camera follow system
- Animation system
- Physics-based movement

## Development

The project uses:
- **Vite** for building and development
- **TypeScript** for type safety
- **React Three Fiber** for 3D rendering
- **Rapier** for physics
- **Zustand** for state management

Path aliases are configured - use `@/` to import from the `src/` directory.

## Deployment

To deploy the example to GitHub Pages:

1. Make sure your repository is set up with GitHub Pages (Settings > Pages)
2. Run `npm run ship` to build and deploy
3. The example will be available at the GitHub Pages URL

```
├── public/
│   ├── index.html          ← HTML entry point
│   ├── images/
│   ├── models/
│   └── textures/
├── src/
│   ├── index.js            ← JS entry point
│   ├── index.css           ← Global styles
│   ├── App.js              ← App component
│   └── modules/
│       ├── third_person_controller/  ← Library code
│       └── third_person_scene_1/      ← Scene files
└── vite.config.js
```