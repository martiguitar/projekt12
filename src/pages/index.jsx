import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasAllEnvVars = 
      process.env.NEXT_PUBLIC_API_URL &&
      process.env.NEXT_PUBLIC_API_TOKEN &&
      process.env.NEXT_PUBLIC_DATABASE_ID &&
      process.env.NEXT_PUBLIC_USERS_TABLE_ID &&
      process.env.NEXT_PUBLIC_ROOMS_TABLE_ID &&
      process.env.NEXT_PUBLIC_BOOKINGS_TABLE_ID;

    if (hasAllEnvVars) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#1a1c23',
      p: 2
    }}>
      <Paper sx={{ 
        p: 4, 
        maxWidth: 600, 
        width: '100%',
        bgcolor: '#232936',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h5" gutterBottom color="primary">
          Environment Variables Status
        </Typography>
        <Box sx={{ 
          mt: 2,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 1,
          fontFamily: 'monospace'
        }}>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#fff'
          }}>
            {JSON.stringify({
              API_URL: process.env.NEXT_PUBLIC_API_URL || '✗ Missing',
              API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN ? '✓ Set' : '✗ Missing',
              DATABASE_ID: process.env.NEXT_PUBLIC_DATABASE_ID || '✗ Missing',
              USERS_TABLE_ID: process.env.NEXT_PUBLIC_USERS_TABLE_ID || '✗ Missing',
              ROOMS_TABLE_ID: process.env.NEXT_PUBLIC_ROOMS_TABLE_ID || '✗ Missing',
              BOOKINGS_TABLE_ID: process.env.NEXT_PUBLIC_BOOKINGS_TABLE_ID || '✗ Missing'
            }, null, 2)}
          </pre>
        </Box>
      </Paper>
    </Box>
  );
}