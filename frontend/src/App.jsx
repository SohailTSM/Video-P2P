import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Room, { loader as roomLoader } from './pages/Room';
import PeerProvider from './providers/PeerProvider';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Lobby />,
    },
    {
      path: 'room/:username',
      element: <Room />,
      loader: roomLoader,
    },
  ]);
  return (
    <PeerProvider>
      <RouterProvider router={router} />
    </PeerProvider>
  );
}

export default App;
