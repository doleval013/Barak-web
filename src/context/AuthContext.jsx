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

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

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
    const [blockedError, setBlockedError] = useState(false);

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

        // Check if script already loaded
        if (window.google?.accounts?.id) {
            setTimeout(() => setGoogleLoaded(true), 0);
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
                if (error.error === 'Account has been blocked') {
                    setBlockedError(true);
                }
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
     * Delete/Remove CV file
     */
    const deleteCV = useCallback(async () => {
        const res = await authFetch(`${API_BASE}/users/me/cv`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'CV deletion failed');
        }

        setUser(prev => ({ ...prev, cvUrl: null }));
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
        deleteCV,
        refreshUser,
        renderGoogleButton,
        authFetch,
        blockedError,
        setBlockedError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            
            {/* Global Blocked User Modal */}
            <AnimatePresence>
                {blockedError && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Overlay */}
                        <div
                            onClick={() => setBlockedError(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></div>

                        {/* Modal Box */}
                        <div
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 z-10 relative overflow-hidden text-center"
                            style={{ direction: (localStorage.getItem('language') || 'he') === 'he' ? 'rtl' : 'ltr' }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
                            
                            <button
                                onClick={() => setBlockedError(false)}
                                className={`absolute top-4 ${(localStorage.getItem('language') || 'he') === 'he' ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-colors`}
                            >
                                <X size={20} />
                            </button>

                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 mt-2">
                                <AlertTriangle className="text-red-600" size={32} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                                {(localStorage.getItem('language') || 'he') === 'he' ? 'הגישה חסומה' : 'Access Denied'}
                            </h3>
                            
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed font-sans">
                                {(localStorage.getItem('language') || 'he') === 'he' 
                                    ? 'החשבון שלך חסום. אינך יכול להתחבר לאתר.'
                                    : 'Your account is blocked. You cannot log in to the website.'}
                            </p>

                            <button
                                onClick={() => setBlockedError(false)}
                                className="w-full py-3 text-white rounded-xl font-medium transition-all shadow-md shadow-black/10 cursor-pointer"
                                style={{ backgroundColor: '#0f172a' }}
                            >
                                {(localStorage.getItem('language') || 'he') === 'he' ? 'סגור' : 'Close'}
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
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
