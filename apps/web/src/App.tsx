import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProjectList } from './components/projects/ProjectList';
import { DocumentViewer } from './components/documents/DocumentViewer';
import { DocumentsPage } from './components/documents/DocumentsPage';
import { CodesPage } from './components/codes/CodesPage';
import { MemosPage } from './components/memos/MemosPage';
import { QueryPage } from './components/query/QueryPage';
import { QueryPanel } from './components/query/QueryPanel';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { NetworkView } from './components/network/NetworkView';
import { NetworkPage } from './components/network/NetworkPage';
import { MemosProjectView } from './components/memos/MemosProjectView';
import { LaTeXEditor } from './components/articles/LaTeXEditor';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/projects" />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="documents/:id" element={<DocumentViewer />} />
            <Route path="codes" element={<CodesPage />} />
            <Route path="memos" element={<MemosPage />} />
            <Route path="memos/:projectId" element={<MemosProjectView />} />
            <Route path="query" element={<QueryPage />} />
            <Route path="query/:projectId" element={<QueryPanel />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="network/:projectId" element={<NetworkView />} />
            <Route path="articles/:articleId" element={<LaTeXEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
