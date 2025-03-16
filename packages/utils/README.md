# @aconitum/utils

A comprehensive collection of utility functions and helpers used across EpycSolutions projects.

## Description

This package contains various utility functions that are commonly used in EpycSolutions projects. It provides a centralized location for all utility code, ensuring consistency and reducing duplication across projects.

## Installation

This package is part of the Aconitum monorepo. You can install it using a package manager like pnpm & npm:

```bash
npm install @aconitum/utils

&&

pnpm add @aconitum/utils
```

## Available Utilities

The package includes the following utility categories:

- **Corn Magic**: Magic utilities for various purposes
- **East Asian Width**: Utilities for handling East Asian character widths
- **Emoji**: Regular expressions for detecting and working with emoji characters
- **Environment**: Environment detection and configuration
- **Git**: Git-related utilities including URL parsing
- **In Range**: Check if a number is within a specified range
- **is**: Various type checking utilities
  - isInCI: Check if code is running in a CI environment
  - isInteractive: Check if a stream is interactive
  - isPlainObj: Check if a value is a plain object
  - isRunning: Check if a process is running
  - isSSH: Check if using an SSH connection
  - isStream: Check if a value is a stream
  - isUnicodeSupported: Check if the terminal supports Unicode
- **Mimic Function**: Copy properties from one function to another
- **Normalize URL**: URL normalization utilities
- **NPM Run Path**: Utilities for NPM run paths
- **Onetime**: Create functions that can only be called once
- **Parse Path/URL**: Path and URL parsing utilities
- **Path Exists/Key**: Path existence checking and key utilities
- **Protocols**: Protocol handling utilities
- **Signals**: Signal handling utilities
- **Signals Exit**: Register handlers for process exit signals
- **String Width**: Calculate visual width of strings in terminal
- **Strip Final Newline**: Remove final newline from strings
- **Temp Directory/File**: Temporary directory and file utilities
- **Time**: Time conversion and formatting utilities

## Usage

```typescript
import { 
  pathExists, 
  isInRange, 
  stripFinalNewline, 
  stringWidth, 
  isUnicodeSupported, 
  onetime,
  eastAsianWidth
} from '@aconitum/utils';

// Check if a path exists
const exists = await pathExists('/path/to/file');

// Check if a number is in range
const inRange = isInRange(5, { min: 1, max: 10 });

// Strip final newline from a string
const cleaned = stripFinalNewline('Hello World\n');

// Calculate the visual width of a string (handles emoji, CJK characters, etc.)
const width = stringWidth('Hello 👋 世界');

// Check if the terminal supports Unicode
if (isUnicodeSupported()) {
  console.log('Terminal supports Unicode characters');
}

// Create a function that can only be called once
const initialize = onetime(() => {
  console.log('This will only be logged once');
});

// Get the width of East Asian characters
const charWidth = eastAsianWidth('世', { ambiguousAsWide: true });
```

## Contributing

Contributions are welcome! Please make sure to follow our code of conduct and contribution guidelines when submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contributors

This package is maintained by:

- **David Stüwe** - Lead Developer and Maintainer
- **EpycSolutions Team** - Core Development and Support

We appreciate all contributions from the community.