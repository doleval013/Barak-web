/**
 * AuthContext — Google OAuth Authentication Provider
 * 
 * Provides:
 * - user: current user object or null
 * - isAdmin: boolean
 * - isLoading: boolean (initial auth check)
 * - login(): triggers Google Sign-In popup
 * - logout(): clears session
 * - deleteAccount(): self-service account deletion
 * - updateProfile(data): update user profile fields
 * - refreshUser(): re-fetch user data from server
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';

// Store token in localStorage for persistence across tabs/refreshes
const getStoredToken = () => localStorage.getItem('barak_auth_token');
const setStoredToken = (token) => localStorage.setItem('barak_auth_token', token);
const clearStoredToken = () => localStorage.removeItem('barak_auth_token');

export function AuthProvider({ children, googleClientId }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getStoredToken());
    const [isLoading, setIsLoading] = useState(true);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const isAdmin = user?.role === 'admin';

    // Helper: make authenticated API calls
    const authFetch = useCallback(async (url, options = {}) => {
        const currentToken = getStoredToken();
        if (!currentToken) throw new Error('Not authenticated');

        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${currentToken}`,
                ...(options.body && !(options.body instanceof FormData) 
                    ? { 'Content-Type': 'application/json' } 
                    : {}),
            },
        });

        if (res.status === 401) {
            // Token expired or revoked
            clearStoredToken();
            setToken(null);
            setUser(null);
            throw new Error('Session expired');
        }

        return res;
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = getStoredToken();
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    setToken(storedToken);
                } else {
                    // Invalid token — clear it
                    clearStoredToken();
                    setToken(null);
                }
            } catch (err) {
                console.error('[Auth] Session check failed:', err);
                clearStoredToken();
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Initialize Google Identity Services
    useEffect(() => {
        if (!googleClientId) return;

        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                setGoogleLoaded(true);
                return;
            }
        };

        // Check if script already loaded
        if (window.google?.accounts?.id) {
            setGoogleLoaded(true);
            return;
        }

        // Wait for the script to load
        const checkInterval = setInterval(() => {
            if (window.google?.accounts?.id) {
                setGoogleLoaded(true);
                clearInterval(checkInterval);
            }
        }, 100);

        // Cleanup after 10 seconds
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.google?.accounts?.id) {
                console.error('[Auth] Google Identity Services failed to load');
            }
        }, 10000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
        };
    }, [googleClientId]);

    /**
     * Handle Google credential response.
     * Sends the ID token to our backend for verification + user creation.
     */
    const handleGoogleResponse = useCallback(async (response) => {
        try {
            const res = await fetch(`${API_BASE}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Authentication failed');
            }

            const data = await res.json();
            setStoredToken(data.token);
            setToken(data.token);
            setUser(data.user);

            return data.user;
        } catch (err) {
            console.error('[Auth] Login failed:', err);
            throw err;
        }
    }, []);

    /**
     * Trigger Google Sign-In popup
     */
    const login = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!googleLoaded || !window.google?.accounts?.id) {
                reject(new Error('Google Sign-In not loaded yet'));
                return;
            }

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response) => {
                    try {
                        const user = await handleGoogleResponse(response);
                        resolve(user);
                    } catch (err) {
                        reject(err);
                    }
                },
            });

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // One Tap not shown — fall back to button click
                    // The GoogleSignInButton component handles this case
                }
            });
        });
    }, [googleLoaded, googleClientId, handleGoogleResponse]);

    /**
     * Render a Google Sign-In button into a container element
     */
    const renderGoogleButton = useCallback((elementId, options = {}) => {
        if (!googleLoaded || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: options.theme || 'outline',
                size: options.size || 'large',
                text: options.text || 'signin_with',
                shape: options.shape || 'rectangular',
                locale: options.locale || 'he',
                width: options.width,
            }
        );
    }, [googleLoaded, googleClientId, handleGoogleResponse]);

    /**
     * Logout — invalidate session on server and clear local state
     */
    const logout = useCallback(async () => {
        try {
            await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        } catch (err) {
            // Even if server call fails, clear local state
            console.error('[Auth] Logout error:', err);
        } finally {
            clearStoredToken();
            setToken(null);
            setUser(null);

            // Revoke Google session
            if (window.google?.accounts?.id) {
                window.google.accounts.id.disableAutoSelect();
            }
        }
    }, [authFetch]);

    /**
     * Delete account — self-service account deletion
     */
    const deleteAccount = useCallback(async () => {
        const res = await authFetch(`${API_BASE}/auth/account`, { method: 'DELETE' });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Account deletion failed');
        }

        clearStoredToken();
        setToken(null);
        setUser(null);

        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }, [authFetch]);

    /**
     * Update user profile fields (phone, age)
     */
    const updateProfile = useCallback(async (data) => {
        const res = await authFetch(`${API_BASE}/users/me`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Profile update failed');
        }

        const updatedUser = await res.json();
        setUser(updatedUser);
        return updatedUser;
    }, [authFetch]);

    /**
     * Upload CV file
     */
    const uploadCV = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('cv', file);

        const res = await authFetch(`${API_BASE}/users/me/cv`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'CV upload failed');
        }

        const result = await res.json();
        setUser(prev => ({ ...prev, cvUrl: result.cvUrl }));
        return result;
    }, [authFetch]);

    /**
     * Re-fetch current user data from server
     */
    const refreshUser = useCallback(async () => {
        try {
            const res = await authFetch(`${API_BASE}/auth/me`);
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                return userData;
            }
        } catch (err) {
            console.error('[Auth] Refresh failed:', err);
        }
        return null;
    }, [authFetch]);

    const value = {
        user,
        token,
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
        googleLoaded,
        login,
        logout,
        deleteAccount,
        updateProfile,
        uploadCV,
        refreshUser,
        renderGoogleButton,
        authFetch,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
