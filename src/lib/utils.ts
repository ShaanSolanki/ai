// Utility functions for the application

/**
 * Safely get the first character of a user's name for avatar display
 * @param name - The user's name
 * @returns The first character in uppercase, or 'U' as fallback
 */
export function getAvatarInitial(name?: string): string {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return 'U';
    }
    return name.trim().charAt(0).toUpperCase();
}

/**
 * Safely get a display name for a user
 * @param name - The user's name
 * @returns The name or 'User' as fallback
 */
export function getDisplayName(name?: string): string {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return 'User';
    }
    return name.trim();
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Recently';
    }
}

/**
 * Safely decode JWT token payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWTPayload(token: string): any | null {
    try {
        if (!token || typeof token !== 'string') {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        console.error('Failed to decode JWT token:', error);
        return null;
    }
}