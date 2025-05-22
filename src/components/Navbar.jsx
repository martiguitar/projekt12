'use client';

import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/login' || !session) return null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div onClick={handleDrawerToggle}>
      <List>
        <ListItem button component={Link} href="/">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} href="/calendar">
          <ListItemText primary="Calendar" />
        </ListItem>
        <ListItem button component={Link} href="/admin">
          <ListItemText primary="Admin" />
        </ListItem>
        <ListItem button onClick={() => signOut()}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={4} sx={{ width: '100%' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" passHref>
              <a style={{ color: 'inherit', textDecoration: 'none' }}>Booking App</a>
            </Link>
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1 }}>
            <div style={{ display: 'flex', gap: '4px', display: { xs: 'none', sm: 'flex' } }}>
              <Button color="inherit" component={Link} href="/">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} href="/calendar">
                Calendar
              </Button>
              <Button color="inherit" component={Link} href="/admin">
                Admin
              </Button>
            </div>
            <Button color="inherit" onClick={() => signOut()} sx={{ marginLeft: 'auto' }}>
              Logout
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
      <Toolbar /> {/* This Toolbar is to push the content below the AppBar */}
    </>
  );
}
