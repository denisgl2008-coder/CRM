import { Card } from '@/components/ui/Card';
import { authService } from '@/services/auth';
import { useEffect, useState } from 'react';
import { statsService, DashboardStats } from '@/services/stats';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                setUser(currentUser);
                const statsData = await statsService.getStats();
                setStats(statsData);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (!user) return null;

    return (
        <div>
            <header className="mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
                    <p className="text-gray-500">Welcome back, {user.name}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-sm font-medium text-gray-500">Total Leads (Active)</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats?.totalLeads}</p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-gray-500">Pipeline Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.pipelineValue || 0)}
                    </p>
                </Card>
                <Card>
                    <h3 className="text-sm font-medium text-gray-500">Active Tasks</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats?.activeTasks}</p>
                    <span className="text-sm text-gray-500 mt-1 inline-block">
                        {loading ? '...' : `${stats?.tasksDueToday} due today`}
                    </span>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <Card>
                    {loading ? (
                        <p className="text-gray-500">Loading activity...</p>
                    ) : stats?.recentActivity.length === 0 ? (
                        <p className="text-gray-500 italic">No recent activity found.</p>
                    ) : (
                        <div className="space-y-4">
                            {stats?.recentActivity.map((lead) => (
                                <div key={lead.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                                        <p className="text-xs text-gray-500">Created by {lead.creator?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {lead.budget ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.budget) : '-'}
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
