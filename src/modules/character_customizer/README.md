# Character Customizer Module

Lightweight scene module for previewing and selecting character parts (base model, headwear, hair style).

## Store
- `stores/useCharacterCustomizerStore.js`
- Holds a single `selection` object with one selected option per category.
- Exposes:
  - `setSelection(category, optionId)`
  - `resetSelection()`

## Customization Options
- `config/customizationOptions.js`
- Central list of option definitions for:
  - `baseModel`
  - `headwear`
  - `hairStyle`
- Each option includes an `id`, `label`, and render data (shape, offsets, colors, etc.).
- Add new options by appending to these arrays; UI buttons are generated automatically.

## Next Steps for Blender Assets
- Export one attachment mesh per category option (headwear and hair variants).
- Keep attachment pivots consistent (head center / anchor point) so swaps stay aligned.
- Define a small transform config per imported mesh (position, rotation, scale) in `customizationOptions.js`.
- Replace primitive preview meshes in `CustomizableCharacter.jsx` with GLTF model components.
- Validate all options while idle + animated to confirm attachments stay on the head.
