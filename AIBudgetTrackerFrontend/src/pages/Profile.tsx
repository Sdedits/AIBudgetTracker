import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/index';
import { User as UserIcon, Mail, Shield, Save, DollarSign, PiggyBank, Target } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState<User | null>(null);
    const [error, setError] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        monthlyIncome: 0,
        savings: 0,
        targetExpenses: 0
    });
    const { token } = useAuth();

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        if (token) {
            try {
                const res = await getProfile(token);
                setProfile(res.data);
                setFormData({
                    username: res.data.username || '',
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    monthlyIncome: res.data.monthlyIncome || 0,
                    savings: res.data.savings || 0,
                    targetExpenses: res.data.targetExpenses || 0
                });
            } catch (err) {
                setError('Failed to fetch profile.');
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                monthlyIncome: formData.monthlyIncome,
                savings: formData.savings,
                targetExpenses: formData.targetExpenses
            };
            const res = await updateProfile(payload);
            setProfile(res.data);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    if (error) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="mb-4">
                <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-lg text-gray-600 mt-1">Manage your account information and financial goals</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Account Information */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-5">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Info</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <UserIcon className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-base text-gray-600">Username</p>
                                <p className="font-bold text-lg text-gray-900">{profile.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <UserIcon className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-base text-gray-600">Name</p>
                                <p className="font-bold text-lg text-gray-900">{(profile.firstName || '') + (profile.lastName ? ' ' + profile.lastName : '')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Mail className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-gray-900">{profile.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Shield className="text-purple-600" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Role</p>
                                <p className="font-semibold text-gray-900">{profile.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Goals */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="username"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="First name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Last name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign size={18} className="text-blue-600" />
                                    Monthly Income
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <PiggyBank size={18} className="text-green-600" />
                                    Savings Goal
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.savings}
                                    onChange={(e) => setFormData({ ...formData, savings: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Target size={18} className="text-purple-600" />
                                    Target Expenses
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.targetExpenses}
                                    onChange={(e) => setFormData({ ...formData, targetExpenses: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            monthlyIncome: profile.monthlyIncome || 0,
                                            savings: profile.savings || 0,
                                            targetExpenses: profile.targetExpenses || 0
                                        });
                                    }}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    <Save size={20} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="text-blue-600" size={24} />
                                    <p className="text-sm text-gray-600">Monthly Income</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">₹{(profile.monthlyIncome || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <PiggyBank className="text-green-600" size={24} />
                                    <p className="text-sm text-gray-600">Savings Goal</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">₹{(profile.savings || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="text-purple-600" size={24} />
                                    <p className="text-sm text-gray-600">Target Expenses</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">₹{(profile.targetExpenses || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
