import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import LeadsPage from '@/pages/LeadsPage';
import LeadsListPage from '@/pages/LeadsListPage';
import Layout from '@/components/Layout';
import ContactsPage from '@/pages/ContactsPage';
import CompaniesPage from '@/pages/CompaniesPage';
import HomePage from '@/pages/HomePage';
import ComingSoonPage from '@/pages/ComingSoonPage';
import ProductsPage from '@/pages/ProductsPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/leads" element={<LeadsPage />} />
                    <Route path="/leads/list" element={<LeadsListPage />} />
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/all-contacts" element={<ComingSoonPage />} /> {/* Placeholder for combined view */}
                    <Route path="/files" element={<ComingSoonPage />} /> {/* Placeholder */}

                    {/* Insights Placeholders */}
                    <Route path="/insights/*" element={<ComingSoonPage />} />
                    <Route path="/inbox" element={<ComingSoonPage />} />
                    <Route path="/tasks" element={<ComingSoonPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
