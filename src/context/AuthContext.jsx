import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_USERS_KEY = 'likha_atelier_users';
const STORAGE_CURRENT_USER_KEY = 'likha_atelier_current_user';
const STORAGE_JWT_KEY = 'likha_atelier_jwt_token';

// Pre-seeded VIP client for offline / immediate dev testing
const INITIAL_DEMO_USER = {
  id: 1,
  name: 'Doña Maria Clara de los Santos',
  email: 'maria.clara@likha-atelier.com',
  phone: '+63 917 888 1898',
  password: 'password123',
  tier: 'Kliyente de Honor • Likha Circle',
  memberSince: '2026',
  address: '14 Acacia Avenue, Urdaneta Village, Makati City 1225',
  savedAddresses: [
    {
      id: 1,
      label: 'Primary Residence (Makati)',
      recipient: 'Doña Maria Clara de los Santos',
      phone: '+63 917 888 1898',
      street: '14 Acacia Avenue, Urdaneta Village',
      city: 'Makati City',
      province: 'Metro Manila',
      postal: '1225',
      isDefault: true,
    },
    {
      id: 2,
      label: 'Tagaytay Summer Residence',
      recipient: 'Doña Maria Clara de los Santos',
      phone: '+63 917 888 1898',
      street: 'Villa San Juan, Ridge Road',
      city: 'Tagaytay City',
      province: 'Cavite',
      postal: '4120',
      isDefault: false,
    },
  ],
  orders: [
    {
      orderNumber: 'LKH-2026-9812',
      serialKey: 'HABI-004/012-781',
      timestamp: 'September 18, 2026',
      items: [
        {
          product: {
            id: 'terno-capelet',
            name: 'Modern Sculptural Terno (Barong para sa Kababaihan)',
            collection: 'Kasuotan & Sutla',
            pricePHP: 125000,
            modelType: 'terno',
          },
          price: 125000,
          currency: 'PHP',
        },
      ],
      total: 125000,
      currency: 'PHP',
      status: 'Vault Allocated (Curated)',
      paymode: 'White-Glove Private Concierge Escrow',
      trackingNumber: 'PH-ARMOR-881920',
      estimatedDispatch: '7 to 14 business days (White-Glove Insured)',
    },
  ],
};

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_JWT_KEY) || null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse currentUser from localStorage', e);
    }
    return null;
  });

  // Verify session on mount against Vercel backend if token exists
  useEffect(() => {
    async function verifySession() {
      if (!authToken) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(data.user));
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          setAuthToken(null);
          localStorage.removeItem(STORAGE_JWT_KEY);
        }
      } catch (err) {
        // Offline / dev mode without active server: preserve cached session
        console.info('[AuthContext]: Operating in local cached session mode');
      }
    }

    verifySession();
  }, [authToken]);

  // Keep localStorage in sync with currentUser
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to save currentUser', e);
    }
  }, [currentUser]);

  // Synchronize local users store
  function getLocalUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local users', e);
    }
    const initial = [INITIAL_DEMO_USER];
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
    } catch {}
    return initial;
  }

  function saveLocalUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save local users', e);
    }
  }

  // 1. Login Handler (Vercel Serverless + PostgreSQL with fallback)
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials. Please verify your email and password.');
        }

        if (data.token) {
          setAuthToken(data.token);
          localStorage.setItem(STORAGE_JWT_KEY, data.token);
        }

        setCurrentUser(data.user);
        return data.user;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local / Offline fallback
    const localUsers = getLocalUsers();
    const matched = localUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!matched) {
      throw new Error('No registered account found under this email address.');
    }

    if (matched.password !== password) {
      throw new Error('Invalid email or secret credentials. Please verify your password.');
    }

    const userToSet = {
      ...matched,
      orders: matched.orders || [],
      savedAddresses: matched.savedAddresses || [],
    };
    setCurrentUser(userToSet);
    return userToSet;
  };

  // 2. Register Handler (Vercel Serverless + PostgreSQL with fallback)
  const register = async ({ name, email, phone, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name || !trimmedEmail || !password) {
      throw new Error('Please complete all required fields.');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: trimmedEmail, phone, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create patron account.');
        }

        if (data.token) {
          setAuthToken(data.token);
          localStorage.setItem(STORAGE_JWT_KEY, data.token);
        }

        const newUser = {
          ...data.user,
          savedAddresses: [],
          orders: [],
        };

        const localUsers = getLocalUsers();
        saveLocalUsers([...localUsers.filter((u) => u.email.toLowerCase() !== trimmedEmail), { ...newUser, password }]);

        setCurrentUser(newUser);
        return newUser;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local / Offline fallback
    const localUsers = getLocalUsers();
    const existing = localUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const localNewUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : '',
      password,
      tier: 'Kliyente de Honor • Bagong Kasapi',
      memberSince: new Date().getFullYear().toString(),
      savedAddresses: [],
      orders: [],
    };

    saveLocalUsers([...localUsers, localNewUser]);
    setCurrentUser(localNewUser);
    return localNewUser;
  };

  // 3. Logout Handler
  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_JWT_KEY);
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  };

  // 4. Request Password Reset Code
  const requestPasswordReset = async (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('Email address is required.');
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: trimmedEmail }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to request password reset code.');
        }
        return data;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local / offline fallback
    const localUsers = getLocalUsers();
    const user = localUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      throw new Error('No account registered under this email address.');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetData = {
      email: trimmedEmail,
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    try {
      localStorage.setItem('likha_active_reset_code', JSON.stringify(resetData));
    } catch {}

    return {
      success: true,
      email: trimmedEmail,
      resetCode,
      message: `A 6-digit verification code has been dispatched to ${trimmedEmail}.`,
    };
  };

  // 5. Reset Password Confirmation
  const resetPassword = async (email, newPassword, code) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must contain at least 6 characters.');
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email: trimmedEmail,
          newPassword,
          code: code ? code.trim() : '',
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update password.');
        }

        // Also update local cache
        const localUsers = getLocalUsers();
        const updated = localUsers.map((u) =>
          u.email.toLowerCase() === trimmedEmail ? { ...u, password: newPassword } : u
        );
        saveLocalUsers(updated);

        if (currentUser && currentUser.email.toLowerCase() === trimmedEmail) {
          setCurrentUser((prev) => ({ ...prev, password: newPassword }));
        }

        return true;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON') && !err.message.includes('Unexpected')) {
        throw err;
      }
    }

    // Local fallback verification
    try {
      const stored = localStorage.getItem('likha_active_reset_code');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === trimmedEmail) {
          if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem('likha_active_reset_code');
            throw new Error('Verification code has expired. Please request a new one.');
          }
          if (code && code.trim() !== parsed.code) {
            throw new Error('Invalid verification code entered.');
          }
        }
      }
      localStorage.removeItem('likha_active_reset_code');
    } catch (e) {
      if (e.message.includes('verification') || e.message.includes('expired')) {
        throw e;
      }
    }

    // Update password in local registry
    const localUsers = getLocalUsers();
    const userIndex = localUsers.findIndex((u) => u.email.toLowerCase() === trimmedEmail);
    if (userIndex === -1) {
      throw new Error('No account registered under this email.');
    }

    localUsers[userIndex].password = newPassword;
    saveLocalUsers(localUsers);

    if (currentUser && currentUser.email.toLowerCase() === trimmedEmail) {
      setCurrentUser((prev) => ({ ...prev, password: newPassword }));
    }

    return true;
  };

  // 6. Update Profile
  const updateProfile = async (updatedData) => {
    if (!currentUser) return;

    try {
      if (authToken) {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedData),
        });
      }
    } catch (e) {
      console.warn('API profile update failed, saved locally', e);
    }

    setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  // 7. Save Address
  const saveAddress = async (addressData) => {
    if (!currentUser) return;

    let updatedList = [...(currentUser.savedAddresses || [])];

    try {
      if (authToken) {
        const res = await fetch('/api/user/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(addressData),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.addresses) {
            updatedList = data.addresses;
          }
        }
      }
    } catch (e) {
      console.warn('API address creation failed, falling back to local', e);
    }

    if (!authToken || updatedList.length === (currentUser.savedAddresses || []).length) {
      const newAddr = {
        ...addressData,
        id: `addr_${Date.now()}`,
        isDefault: updatedList.length === 0 || addressData.isDefault,
      };
      if (newAddr.isDefault) {
        updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
      }
      updatedList.push(newAddr);
    }

    updateProfile({
      savedAddresses: updatedList,
      address: addressData.isDefault ? `${addressData.street}, ${addressData.city}` : currentUser.address,
    });
  };

  // 8. Record Order
  const recordOrder = async (orderData) => {
    if (!currentUser) return;

    try {
      if (authToken) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            items: orderData.items,
            client: orderData.client,
            packaging: orderData.packaging,
            total: orderData.subtotal,
            currency: orderData.currency,
            paymode: orderData.paymode,
            orderNumber: orderData.orderNumber,
            serialKey: orderData.serialKey,
          }),
        });
      }
    } catch (e) {
      console.warn('API order recording failed, saved locally', e);
    }

    const existingOrders = currentUser.orders || [];
    const updatedOrders = [orderData, ...existingOrders];
    setCurrentUser((prev) => ({ ...prev, orders: updatedOrders }));
  };

  const value = {
    currentUser,
    authToken,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    saveAddress,
    recordOrder,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
