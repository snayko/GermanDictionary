import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import DictionaryPage from './pages/DictionaryPage';
import AddWordPage from './pages/AddWordPage';
import EditWordPage from './pages/EditWordPage';
import SettingsPage from './pages/SettingsPage';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DictionaryPage />,
      },
      {
        path: 'add',
        element: <AddWordPage />,
      },
      {
        path: 'edit/:id',
        element: <EditWordPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

// ----------------------------------------------------------------------

export default function Router() {
  return <RouterProvider router={router} />;
}
