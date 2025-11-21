import React, { useEffect, useState } from 'react';
import { getAllUsers, banUser, unbanUser, getAdminRequests, approveAdmin, revokeAdmin, getProfile } from '../services/api';
import type { User } from '../types';

// Simple confirmation modal component
const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-11/12 max-w-md p-6">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

const Admin = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [requests, setRequests] = useState<User[]>([]);

    // UI state: search and pagination
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => Promise<void> | null>(null);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmLabel, setConfirmLabel] = useState('Confirm');

    const loadUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to load users', err);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await getAdminRequests();
            setRequests(res.data || []);
        } catch (err) {
            console.error('Failed to load admin requests', err);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const profile = await getProfile(localStorage.getItem('token') || '');
                setCurrentUser(profile.data);
            } catch (e) {
                // ignore - not authenticated
            }
            await loadUsers();
            await loadRequests();
        })();
    }, []);

    // Filtered + paginated users
    const filtered = users.filter(u => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

    const openConfirm = (title: string, message: string, label: string, action: () => Promise<void>) => {
        setConfirmTitle(title);
        setConfirmMessage(message);
        setConfirmLabel(label);
        setConfirmAction(() => action);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setConfirmOpen(false);
        if (confirmAction) await confirmAction();
    };

    const handleBan = (id: number, username: string) => {
        openConfirm(
            'Ban user',
            `Are you sure you want to ban user ${username}? They will not be able to log in.`,
            'Ban',
            async () => {
                await banUser(id);
                await loadUsers();
            }
        );
    };

    const handleUnban = (id: number, username: string) => {
        openConfirm(
            'Unban user',
            `Unban user ${username}? They will regain access.`,
            'Unban',
            async () => {
                await unbanUser(id);
                await loadUsers();
            }
        );
    };

    const handleApprove = (id: number, username: string) => {
        openConfirm(
            'Approve admin',
            `Approve ${username} as admin? This gives elevated privileges.`,
            'Approve',
            async () => {
                await approveAdmin(id);
                await loadUsers();
                await loadRequests();
            }
        );
    };

    const handleRevoke = (id: number, username: string) => {
        openConfirm(
            'Revoke admin',
            `Revoke admin privileges from ${username}?`,
            'Revoke',
            async () => {
                await revokeAdmin(id);
                await loadUsers();
                await loadRequests();
            }
        );
    };

    const isOwner = currentUser?.role === 'OWNER';
    const isAdmin = currentUser?.role === 'ADMIN' || isOwner;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>

            {!isAdmin && <p className="text-sm text-gray-600">You must be an admin to access this page.</p>}

            {isAdmin && (
                <>
                    <section className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold">All Users</h2>
                            <div className="flex items-center gap-2">
                                <input
                                    className="px-3 py-2 border rounded w-64"
                                    placeholder="Search by username or email"
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                                />
                                <label className="sr-only" htmlFor="pageSizeSelect">Page size</label>
                                <select id="pageSizeSelect" aria-label="Page size" className="px-2 py-2 border rounded" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                    <option value={5}>5 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={25}>25 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto bg-white shadow rounded">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Username</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pageItems.map(u => (
                                        <tr key={u.id}>
                                            <td className="px-4 py-2 text-sm text-gray-700">{u.id}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{u.username}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{u.role}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700">{u.banned ? 'Banned' : 'Active'}</td>
                                            <td className="px-4 py-2 text-sm text-right">
                                                {u.banned ? (
                                                    <button onClick={() => handleUnban(u.id, u.username)} className="px-3 py-1 bg-green-500 text-white rounded">Unban</button>
                                                ) : (
                                                    <button onClick={() => handleBan(u.id, u.username)} className="px-3 py-1 bg-red-500 text-white rounded">Ban</button>
                                                )}
                                                {isOwner && u.role === 'ADMIN' && (
                                                    <button onClick={() => handleRevoke(u.id, u.username)} className="ml-2 px-3 py-1 bg-yellow-500 text-white rounded">Revoke Admin</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="text-sm text-gray-600">Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
                            <div className="flex items-center gap-2">
                                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
                                <div className="text-sm">Page {page} / {totalPages}</div>
                                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    </section>

                    {isOwner && (
                        <section>
                            <h2 className="text-xl font-semibold mb-2">Admin Approval Requests</h2>
                            <div className="space-y-2">
                                {requests.length === 0 && <p className="text-sm text-gray-600">No pending requests.</p>}
                                {requests.map(r => (
                                    <div key={r.id} className="flex items-center justify-between bg-white p-3 shadow rounded">
                                        <div>
                                            <div className="font-medium">{r.username} ({r.email})</div>
                                            <div className="text-sm text-gray-500">Requested admin approval</div>
                                        </div>
                                        <div className="space-x-2">
                                            <button onClick={() => handleApprove(r.id, r.username)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                                            <button onClick={() => handleRevoke(r.id, r.username)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            <ConfirmModal
                open={confirmOpen}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={confirmLabel}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default Admin;
