import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AddPatient from './pages/AddPatient';
import PatientDetail from './pages/PatientDetail';
import EditPatient from './pages/EditPatient';
import VisitDetail from './pages/VisitDetail';
import DietChart from './pages/DietChart';
import DietWorkflow from './pages/DietWorkflow'; // Phase 3
import EditDietPage from './pages/EditDietPage'; // Phase 3
import AddFoodPage from './pages/AddFoodPage';
import ClinicDetail from './pages/ClinicDetail';

// Dashboard wrapper to route based on role
const DashboardRouter = () => {
    const { user } = useAuth();

    if (user?.role === 'ADMIN') {
        return <AdminDashboard />;
    }

    return <Dashboard />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        {/* Public registration disabled - users created by admin */}
                        <Route path="/register" element={<Navigate to="/login" replace />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardRouter />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/clinic/:clinicId"
                            element={
                                <ProtectedRoute>
                                    <ClinicDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patients/new"
                            element={
                                <ProtectedRoute>
                                    <AddPatient />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patients/:id"
                            element={
                                <ProtectedRoute>
                                    <PatientDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patients/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <EditPatient />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/visits/:visitId"
                            element={
                                <ProtectedRoute>
                                    <VisitDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/diet/:id"
                            element={
                                <ProtectedRoute>
                                    <DietChart />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/visits/:visitId/create-diet"
                            element={
                                <ProtectedRoute>
                                    <DietWorkflow />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/diet/edit/:dietChartId"
                            element={
                                <ProtectedRoute>
                                    <EditDietPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/foods/add"
                            element={
                                <ProtectedRoute>
                                    <AddFoodPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
