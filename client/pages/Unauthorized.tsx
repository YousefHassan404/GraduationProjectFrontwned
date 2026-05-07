import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/lib/auth-context';

export default function Unauthorized() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldOff size={40} className="text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>

                <p className="text-slate-400 max-w-md mb-2">
                    You don't have permission to view this page.
                </p>

                {user && (
                    <p className="text-slate-500 text-sm mb-8">
                        Your current role:{' '}
                        <span className="text-blue-400 font-medium capitalize">{user.role}</span>
                    </p>
                )}

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700"
                        onClick={() => navigate(-1)}
                    >
                        Go Back
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
