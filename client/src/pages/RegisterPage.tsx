import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        workspaceName: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await authService.register(formData) as { token: string; user: any };
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Get Started</h1>
                    <p className="text-gray-500 mt-2">Create your workspace in seconds</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Workspace Name"
                        value={formData.workspaceName}
                        onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                        placeholder="Acme Corp"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        required
                        error={error}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                    />

                    <Button type="submit" className="w-full" size="lg">
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
}
