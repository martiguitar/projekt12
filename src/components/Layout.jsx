import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MobileNavigation from './MobileNavigation';

import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Layout({ children }) {
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Kalender', icon: <CalendarMonthIcon />, path: '/calendar' },
    ...(currentUser?.field_5934?.value === 'admin' ? [
      { text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' }
    ] : [])
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      m: 0,
      width: '100%',
      position: 'relative'
    }}>
      {/* Only show MobileNavigation on mobile devices */}
      {isMobile && <MobileNavigation />}
      
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'background.paper', 
          boxShadow: 1,
          display: { xs: 'none', sm: 'block' },
          zIndex: 1100,
          top: 0,
          left: 0,
          right: 0,
          height: '64px'
        }}
      >
        <Box sx={{ maxWidth: '1250px', mx: 'auto', width: '100%' }}>
          <Toolbar sx={{ 
            gap: 2,
            p: { xs: 0, sm: 2 }
          }}>
            <MusicNoteIcon sx={{ color: '#ffa726' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Studio Booking
            </Typography>
          
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: { xs: 0, sm: 4 } }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  startIcon={item.icon}
                  sx={{
                    color: router.pathname === item.path ? 'primary.main' : 'text.primary',
                    borderBottom: router.pathname === item.path ? 2 : 0,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />
          
            <IconButton
              onClick={handleLogout}
              sx={{ color: 'text.primary' }}
              size="small"
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: '100%',
          mt: { xs: '56px', sm: '64px' }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}