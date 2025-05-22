import React from 'react';
import { useRouter } from 'next/router';
import { Paper, BottomNavigation, BottomNavigationAction, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { FIELDS } from '../services/baserow';

export default function MobileNavigation() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.[FIELDS.ROLE]?.value === 'admin';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getValue = () => {
    const path = router.pathname;
    if (path === '/dashboard' || path === '/') return 0;
    if (path === '/calendar') return 1;
    if (path === '/admin') return 2;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        display: { xs: 'block', sm: 'none' },
        zIndex: 1100,
        bgcolor: '#232936',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: '56px',
        '& .MuiBottomNavigation-root': {
          maxWidth: '1200px',
          mx: 'auto',
          position: 'relative',
          height: '56px'
        }
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getValue()}
        onChange={(event, newValue) => {
          switch (newValue) {
            case 0:
              router.push('/dashboard');
              break;
            case 1:
              router.push('/calendar');
              break;
            case 2:
              router.push('/admin');
              break;
            case 3:
              if (currentUser) {
                handleLogout();
              } else {
                router.push('/login');
              }
              break;
            default:
              break;
          }
        }}
        sx={{
          bgcolor: 'transparent',
          height: '56px',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 'auto',
            padding: '6px 12px',
            flex: 1,
            height: '56px',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              marginTop: '4px'
            },
            '&.Mui-selected': {
              color: '#ffa726'
            }
          }
        }}
      >
        <BottomNavigationAction 
          label="Home" 
          icon={<HomeIcon />} 
        />
        <BottomNavigationAction 
          label="Kalender" 
          icon={<EventIcon />} 
        />
        {isAdmin && (
          <BottomNavigationAction 
            label="Admin" 
            icon={<AdminPanelSettingsIcon />} 
          />
        )}
        <BottomNavigationAction 
          label={currentUser ? 'Logout' : 'Login'}
          icon={currentUser ? <LogoutIcon /> : <PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
