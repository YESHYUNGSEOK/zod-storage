# zod-browser-storage

Type-safe Web Storage wrapper with Zod runtime validation for React, Vue, Angular, and vanilla JavaScript.

> **Disclaimer:** This library is not affiliated with, endorsed by, or sponsored by the [Zod project](https://github.com/colinhacks/zod) or its creators. It is an independent utility that leverages Zod for runtime validation.

## Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type inference
- ✅ **Runtime validation**: Powered by Zod schema validation
- 🎯 **Framework agnostic**: Works with React, Vue, Angular, or vanilla JS
- 💾 **Dual storage**: Supports both localStorage and sessionStorage
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🚀 **Simple API**: Intuitive methods with flexible error handling

## Installation

```bash
npm install zod-browser-storage zod
# or
pnpm add zod-browser-storage zod
# or
yarn add zod-browser-storage zod
```

## Quick Start

```typescript
import { z } from 'zod';
import { zs, zodStorage } from 'zod-browser-storage';

// Define your storage with schema
const userStorage = zs({
  key: 'user',
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  defaultValue: { name: '', age: 0, email: '' }
});

// Set data (automatically validated)
zodStorage.set(userStorage, {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
});

// Get data (returns typed data or null)
const user = zodStorage.get(userStorage);
console.log(user); // { name: 'John Doe', age: 30, email: 'john@example.com' }

// Clear data
zodStorage.clear(userStorage);
```

## API Reference

### `zs(config)`

Creates a storage configuration object.

**Parameters:**

- `config.key` (string): The storage key
- `config.schema` (ZodType): Zod schema for validation
- `config.defaultValue` (T): Default value for initialization
- `config.storage` ('local' | 'session', optional): Storage type (default: 'local')

**Returns:** `SafeStorage<T>` configuration object

### `zodStorage.get(storage, options?)`

Retrieves and validates data from storage.

**Parameters:**

- `storage` (SafeStorage<T>): Storage configuration
- `options.onFailure` ('null' | 'default' | 'throw', optional): Error handling behavior
  - `'null'`: Returns `null` on failure (default)
  - `'default'`: Returns `defaultValue` on failure
  - `'throw'`: Throws an exception on failure

**Returns:** `T | null` - Validated data or null

**Example:**

```typescript
// Return null on validation failure (default)
const data = zodStorage.get(userStorage);

// Return default value on validation failure
const data = zodStorage.get(userStorage, { onFailure: 'default' });

// Throw error on validation failure
const data = zodStorage.get(userStorage, { onFailure: 'throw' });
```

### `zodStorage.set(storage, data)`

Stores validated data in storage.

**Parameters:**

- `storage` (SafeStorage<T>): Storage configuration
- `data` (T): Data to store

**Returns:** `void`

### `zodStorage.clear(storage)`

Clears data from storage.

**Parameters:**

- `storage` (SafeStorage<T>): Storage configuration

**Returns:** `void`

### `zodStorage.init(storage)`

Initializes storage with the default value.

**Parameters:**

- `storage` (SafeStorage<T>): Storage configuration

**Returns:** `void`

## Usage Examples

### Basic Types

```typescript
// Number array
const numbersStorage = zs({
  key: 'numbers',
  schema: z.array(z.number()),
  defaultValue: []
});

// String
const nameStorage = zs({
  key: 'name',
  schema: z.string(),
  defaultValue: ''
});

// Boolean
const flagStorage = zs({
  key: 'flag',
  schema: z.boolean(),
  defaultValue: false
});
```

### Enum Types

```typescript
const themeStorage = zs({
  key: 'theme',
  schema: z.enum(['light', 'dark', 'auto']),
  defaultValue: 'light'
});

zodStorage.set(themeStorage, 'dark');
```

### Complex Objects

```typescript
const profileSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  settings: z.object({
    theme: z.string(),
    notifications: z.boolean(),
  }),
});

const profileStorage = zs({
  key: 'profile',
  schema: profileSchema,
  defaultValue: {
    user: { id: 0, name: '' },
    settings: { theme: 'light', notifications: true }
  }
});
```

### SessionStorage

```typescript
const sessionData = zs({
  key: 'tempData',
  schema: z.string(),
  defaultValue: '',
  storage: 'session' // Use sessionStorage instead of localStorage
});

zodStorage.set(sessionData, 'temporary value');
```

### React Integration

```typescript
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zs, zodStorage } from 'zod-browser-storage';

const settingsSchema = z.object({
  notifications: z.boolean(),
  theme: z.enum(['light', 'dark']),
});

const settingsStorage = zs({
  key: 'settings',
  schema: settingsSchema,
  defaultValue: { notifications: true, theme: 'light' }
});

function useSettings() {
  const [settings, setSettings] = useState(() =>
    zodStorage.get(settingsStorage) ?? settingsStorage.defaultValue
  );

  useEffect(() => {
    zodStorage.set(settingsStorage, settings);
  }, [settings]);

  return [settings, setSettings] as const;
}
```

### Vue Integration

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { z } from 'zod';
import { zs, zodStorage } from 'zod-browser-storage';

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const userStorage = zs({
  key: 'user',
  schema: userSchema,
  defaultValue: { name: '', age: 0 }
});

const user = ref(zodStorage.get(userStorage) ?? userStorage.defaultValue);

watch(user, (newUser) => {
  zodStorage.set(userStorage, newUser);
}, { deep: true });
</script>
```

### Error Handling

```typescript
const dataStorage = zs({
  key: 'data',
  schema: z.array(z.number()),
  defaultValue: [1, 2, 3]
});

// Scenario 1: Invalid data in storage
localStorage.setItem('data', 'invalid json');

// Returns null (default behavior)
const result1 = zodStorage.get(dataStorage);
console.log(result1); // null

// Returns default value
const result2 = zodStorage.get(dataStorage, { onFailure: 'default' });
console.log(result2); // [1, 2, 3]

// Throws error
try {
  const result3 = zodStorage.get(dataStorage, { onFailure: 'throw' });
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Advanced Validation

```typescript
// Email validation
const emailStorage = zs({
  key: 'email',
  schema: z.string().email(),
  defaultValue: ''
});

// Number constraints
const ageStorage = zs({
  key: 'age',
  schema: z.number().min(0).max(120),
  defaultValue: 0
});

// Pattern matching
const codeStorage = zs({
  key: 'code',
  schema: z.string().regex(/^[A-Z]{3}-\d{3}$/),
  defaultValue: ''
});

// Transformed values
const upperCaseStorage = zs({
  key: 'name',
  schema: z.string().transform(val => val.toUpperCase()),
  defaultValue: ''
});
```

## TypeScript

The library is written in TypeScript and provides full type safety:

```typescript
import { SafeStorage, SafeStorageGetOptions, StorageType } from 'zod-browser-storage';

// All types are automatically inferred
const userStorage = zs({
  key: 'data',
  schema: z.object({ id: z.number(), name: z.string() }),
  defaultValue: { id: 0, name: '' }
});

// TypeScript knows the exact type
const data = zodStorage.get(userStorage); // { id: number, name: string } | null
```

## Why zod-browser-storage?

### Data Integrity

Without validation, localStorage can contain corrupted or invalid data:

```typescript
// Without zod-browser-storage - No type safety
localStorage.setItem('user', JSON.stringify({ id: '123' })); // Wrong type!
const user = JSON.parse(localStorage.getItem('user')!);
console.log(user.id + 1); // "1231" - String concatenation bug!

// With zod-browser-storage - Runtime validation catches errors
const userStorage = zs({
  key: 'user',
  schema: z.object({ id: z.number() }),
  defaultValue: { id: 0 }
});

const user = zodStorage.get(userStorage); // null (validation failed)
const safeUser = zodStorage.get(userStorage, { onFailure: 'default' }); // { id: 0 }
```

### Type Safety

```typescript
const countStorage = zs({
  key: 'count',
  schema: z.number(),
  defaultValue: 0
});

zodStorage.set(countStorage, 'invalid'); // TypeScript error!
zodStorage.set(countStorage, 42); // OK
```

### Framework Agnostic

Works seamlessly with any JavaScript framework or vanilla JS. No framework-specific dependencies.

## License

MIT © [YESHYUNGSEOK](https://github.com/YESHYUNGSEOK)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

- GitHub: [https://github.com/YESHYUNGSEOK/zod-browser-storage](https://github.com/YESHYUNGSEOK/zod-browser-storage)
- Issues: [https://github.com/YESHYUNGSEOK/zod-browser-storage/issues](https://github.com/YESHYUNGSEOK/zod-browser-storage/issues)
