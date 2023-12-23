# LocalForage File System Adapter for Electron

A file system adapter for LocalForage designed specifically for Electron
applications, providing simple file-based storage with a familiar LocalForage
API.

## Overview

This adapter implements LocalForage's driver interface to store data in the
local file system, making it ideal for Electron apps that need persistent
storage without SQLite or other database solutions.

## Usage in Electron

```javascript
import createFileSystemInstance from './fileSystemAdapter'

// In your Electron app
const storage = await createFileSystemInstance({
  name: 'user-data' // Will create directory in your app's user data folder
})

// Use like regular localforage
await storage.setItem('settings', { theme: 'dark' })
const settings = await storage.getItem('settings')
```

## Features

- Designed for Electron applications
- Simple file-based storage
- Familiar LocalForage API
- Lightweight alternative to SQLite
- TypeScript support

## API

Supports all standard LocalForage methods:
- `setItem(key, value)`
- `getItem(key)`
- `removeItem(key)`
- `clear()`
- `length()`
- `key(index)`
- `keys()`
- `iterate()`

## Limitations

- Simple key-value storage only
- No encryption (use Electron's built-in encryption if needed)
- Basic string-based storage
- Not suitable for large datasets

## Notes

Configure the storage directory location using the `name` option when
initializing. Recommended to use Electron's app.getPath('userData') for the
base path.
