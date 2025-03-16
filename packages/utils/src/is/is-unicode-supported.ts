/**
 * Checks if the current terminal environment supports Unicode characters.
 * 
 * This function determines Unicode support by examining various environment variables
 * and terminal emulator identifiers across different platforms.
 * 
 * On non-Windows platforms, it checks if the terminal is not the Linux console (kernel),
 * which has limited Unicode support.
 * 
 * On Windows, it checks for modern terminal emulators that support Unicode, including:
 * - Windows Terminal
 * - Terminus
 * - ConEmu and Cmder
 * - Visual Studio Code's integrated terminal
 * - Various xterm-compatible terminals
 * - JetBrains terminal emulator
 * 
 * @returns {boolean} True if the terminal supports Unicode, false otherwise
 * 
 * @example
 * ```typescript
 * import isUnicodeSupported from './is-unicode-supported';
 * 
 * if (isUnicodeSupported()) {
 *   console.log('✓ Unicode is supported');
 * } else {
 *   console.log('x Unicode is not supported');
 * }
 * ```
 */

import process from 'node:process';

export default function isUnicodeSupported(): boolean {
	const {env} = process;
	const {TERM, TERM_PROGRAM} = env;

	if (process.platform !== 'win32') {
		return TERM !== 'linux'; // Linux console (kernel)
	}

	return Boolean(env.WT_SESSION) // Windows Terminal
		|| Boolean(env.TERMINUS_SUBLIME) // Terminus (<0.2.27)
		|| env.ConEmuTask === '{cmd::Cmder}' // ConEmu and cmder
		|| TERM_PROGRAM === 'Terminus-Sublime'
		|| TERM_PROGRAM === 'vscode'
		|| TERM === 'xterm-256color'
		|| TERM === 'alacritty'
		|| TERM === 'rxvt-unicode'
		|| TERM === 'rxvt-unicode-256color'
		|| env.TERMINAL_EMULATOR === 'JetBrains-JediTerm';
}