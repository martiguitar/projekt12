import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Container } from '@mui/material';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        gap: 4
      }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Studio Bookings
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Your platform for managing studio spaces and bookings
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => router.push('/login')}
            sx={{ 
              bgcolor: '#ffa726',
              '&:hover': { bgcolor: '#ffc000' }
            }}
          >
            Login
          </Button>
          <Button 
            variant="outlined"
            onClick={() => router.push('/register')}
            sx={{ 
              borderColor: '#ffa726',
              color: '#ffa726',
              '&:hover': { 
                borderColor: '#ffc000',
                bgcolor: 'rgba(255, 167, 38, 0.1)'
              }
            }}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
}