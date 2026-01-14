# Modules

Bigger modules, each in its own folder. Each module is a self-contained feature.

## Structure

Each module should have its own folder with:
- `index.ts` - Main exports
- `README.md` - Module documentation
- Component files (`.vue`)
- Sub-components in subfolders if needed

## Example Module Structure

```
modules/
  users/
    index.ts
    README.md
    UserList.vue
    UserForm.vue
    UserDetail.vue
  events/
    index.ts
    README.md
    EventList.vue
    EventForm.vue
    EventDetail.vue
  settings/
    index.ts
    README.md
    SettingsPanel.vue
    GeneralSettings.vue
    EmailSettings.vue
```

## Usage

```vue
<script setup lang="ts">
// Import from specific module
import { UserList, UserForm } from '~/components/modules/users'
</script>
```
