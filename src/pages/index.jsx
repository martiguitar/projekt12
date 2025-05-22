import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Only redirect if environment variables are properly set
    if (process.env.NEXT_PUBLIC_API_URL) {
      router.push('/dashboard');
    }
  }, [router]);

  // Show environment variables status if not redirecting
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>Environment Variables Status:</Typography>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        {JSON.stringify({
          API_URL: process.env.NEXT_PUBLIC_API_URL,
          API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN ? '✓ Set' : '✗ Missing',
          DATABASE_ID: process.env.NEXT_PUBLIC_DATABASE_ID,
          USERS_TABLE_ID: process.env.NEXT_PUBLIC_USERS_TABLE_ID,
          ROOMS_TABLE_ID: process.env.NEXT_PUBLIC_ROOMS_TABLE_ID,
          BOOKINGS_TABLE_ID: process.env.NEXT_PUBLIC_BOOKINGS_TABLE_ID
        }, null, 2)}
      </pre>
    </Box>
  );
}