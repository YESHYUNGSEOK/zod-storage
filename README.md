# ss

Type-safe localStorage wrapper with Zod runtime validation for React, Vue, Angular, and more.

## Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type inference
- ✅ **Runtime validation**: Powered by Zod schema validation
- 🎯 **Framework agnostic**: Works with React, Vue, Angular, or vanilla JS
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🚀 **Simple API**: Easy to use with intuitive methods

## Installation

```bash
npm install ss zod
# or
pnpm add ss zod
# or
yarn add ss zod
```

## Usage

### Basic Example

```typescript
import { z } from 'zod';
import { createLocalStorage } from 'ss';

// Define your schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

// Create a typed storage instance
const userStorage = createLocalStorage('user', userSchema);

// Set data (validated automatically)
userStorage.set({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
});

// Get data (returns typed data or null)
const user = userStorage.get();
console.log(user); // { name: 'John Doe', age: 30, email: 'john@example.com' }

// Remove data
userStorage.remove();

// Clear all localStorage
userStorage.clear();
```

### With Prefix

```typescript
import { z } from 'zod';
import { createLocalStorage } from 'ss';

const themeSchema = z.enum(['light', 'dark']);

const themeStorage = createLocalStorage('theme', themeSchema, {
  prefix: 'myapp', // stored as 'myapp:theme'
});

themeStorage.set('dark');
```

### React Example

```typescript
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { createLocalStorage } from 'ss';

const settingsSchema = z.object({
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark']),
});

const settingsStorage = createLocalStorage('settings', settingsSchema);

function useSettings() {
  const [settings, setSettings] = useState(() =>
    settingsStorage.get() ?? { notifications: true, theme: 'light' }
  );

  useEffect(() => {
    settingsStorage.set(settings);
  }, [settings]);

  return [settings, setSettings] as const;
}
```

### Vue Example

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { createLocalStorage } from 'ss';

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const userStorage = createLocalStorage('user', userSchema);
const user = ref(userStorage.get() ?? { name: '', age: 0 });

watch(user, (newUser) => {
  userStorage.set(newUser);
}, { deep: true });
</script>
```

## API

### `createLocalStorage(key, schema, options?)`

Creates a localStorage wrapper with validation.

**Parameters:**
- `key` (string): The localStorage key
- `schema` (ZodType): Zod schema for validation
- `options` (optional):
  - `prefix` (string): Key prefix (e.g., 'myapp:key')

**Returns:** Storage instance with methods:

#### `.get()`
Returns validated data or `null` if not found or invalid.

#### `.set(value)`
Stores validated data. Throws if validation fails.

#### `.remove()`
Removes the item from localStorage.

#### `.clear()`
Clears all localStorage.

## License

MIT © [YESHYUNGSEOK](https://github.com/YESHYUNGSEOK)
