import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import { Box, Paper, TextField, Button, Typography, Alert, useTheme as useMuiTheme } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const theme = useMuiTheme();
  const router = useRouter();

  // Redirect if already logged in
  if (typeof window !== 'undefined' && currentUser) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      const returnTo = router.query.returnTo || '/';
      router.push(returnTo);
    } catch (err) {
      setError('Failed to login');
    }
  };

  return (
    <Layout>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)',
      bgcolor: 'background.default'
    }}>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
      }}>
        <Paper sx={{ 
          p: 4, 
          maxWidth: 400, 
          width: '100%', 
          m: 2, 
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)'
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <KeyIcon sx={{ mr: 1, color: '#ffa726' }} />
          <Typography variant="h5" component="h1" sx={{ color: 'white' }}>
            Anmelden
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#ffa726',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffa726',
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
              },
            }}
          />
          <TextField
            fullWidth
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: '#ffa726',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffa726',
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 2,
              bgcolor: '#ffa726',
              '&:hover': {
                bgcolor: '#ffc000'
              },
              textTransform: 'none',
              py: 1.5
            }}
          >
            Anmelden
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              Noch kein Konto? <Link href="/register" style={{ color: '#ffa726', textDecoration: 'none', fontWeight: 'bold' }}>Registrieren</Link>
            </Typography>
          </Box>
        </form>
      </Paper>
      </Box>
    </Box>
    </Layout>
  );
}
