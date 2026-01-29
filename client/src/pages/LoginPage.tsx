import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

export default function LoginPage() {
    const [workspaceName, setWorkspaceName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const data = await authService.login({
                workspaceName: workspaceName.trim(),
                email: email.trim(),
                password
            }) as { token: string; user: any };
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to login';
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome LeadFlow</h1>
                    <p className="text-gray-500 mt-2">Sign in to your workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Workspace Name"
                        type="text"
                        value={workspaceName}
                        onChange={(e) => { setWorkspaceName(e.target.value); setError(''); }}
                        placeholder="Acme Corp"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@company.com"
                        required
                        error={error}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" className="w-full" size="lg">
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                        Create Workspace
                    </Link>
                </div>
            </Card>
        </div>
    );
}
