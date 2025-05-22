import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  Container,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import baserowService, { FIELDS } from '../services/baserow';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SecurityIcon from '@mui/icons-material/Security';

const features = [
  {
    icon: <MusicNoteIcon sx={{ fontSize: 40 }} />,
    title: 'Professionelle Ausstattung',
    description: 'Hochwertige Instrumente und modernste Technik'
},
  {
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    title: 'Für alle geeignet',
    description: 'Ideal für Solokünstler, Bands und Musiklehrer'
},
{
    icon: <EventAvailableIcon sx={{ fontSize: 40 }} />,
    title: 'Flexible Buchung',
    description: 'Stundenweise buchbar oder mit speziellen Tagespreisen'
},
{
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Sicher & geschützt',
    description: 'Rund-um-die-Uhr-Sicherheit und klimatisierte Räume'
}
];



export default function Dashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const allRooms = await baserowService.getAllRooms();
        // Filter only active rooms (active status is stored as string "true")
        const activeRooms = allRooms.filter(room => room[FIELDS.ROOM_ACTIVE] === "true");
        setRooms(activeRooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <Layout>
    <Box sx={{ 
      bgcolor: '#1a1c23', 
      minHeight: 'calc(100vh - 64px)', 
      color: 'text.primary',
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Section */}
      <Box sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        p: { xs: 0, sm: 3 }
      }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            py: { xs: 4, sm: 8 },
            position: 'relative',
            borderRadius: { xs: 0, sm: 2 },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url(https://images.unsplash.com/photo-1519892300165-cb5542fb47c7)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6)',
              zIndex: 0
            }
          }}
        >
          <Box 
            sx={{ 
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: { xs: 2, sm: 3 }
            }}
          >
          <Box sx={{ maxWidth: 800 }}>
          <Typography
            component="h1"
            variant="h2"
            sx={{ mb: 4, fontWeight: 'bold' }}
          >
            Professional Studio Spaces
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
            Book your perfect rehearsal or recording space with our easy-to-use platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              if (!currentUser) {
                router.push({ pathname: '/login', query: { returnTo: '/calendar', showBooking: 'true' } });
              } else {
                router.push('/calendar');
              }
            }}
            sx={{
              bgcolor: '#ffa726',
              '&:hover': { bgcolor: '#ffc000' },
              px: 4,
              py: 1.5,
            }}
          >
            {currentUser ? 'Jetzt Buchen' : 'Anmelden & Buchen'}
          </Button>
          </Box>
          </Box>
        </Box>
      </Box>

      {/* Features Section - Hidden on Mobile */}
      <Box sx={{ 
        py: { xs: 0, sm: 8 },
        width: '100%',
        maxWidth: { sm: '1200px' },
        mx: 'auto',
        display: { xs: 'none', sm: 'block' }
      }}>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  bgcolor: '#232936',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Box sx={{ color: '#ffa726', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Rooms Section */}
      <Box sx={{ 
        py: { xs: 0, sm: 8 },
        px: { xs: 0, sm: 3 },
        width: '100%',
        maxWidth: { sm: '1200px' },
        mx: 'auto'
      }}>
        <Typography variant="h3" sx={{ mb: { xs: 1, sm: 6 }, textAlign: 'center', mt: { xs: 0, sm: 0 } }}>
          Unsere Räume
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 4 }}>
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4} sx={{ px: { xs: 0, sm: 2 } }}>
                <Card sx={{ 
                  height: '100%',
                  bgcolor: '#232936',
                  borderRadius: 0,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  mx: { xs: 0, sm: 'auto' }
                }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={60} />
                    <Skeleton variant="text" width="40%" height={30} />
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" height={40} width="100%" />
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            // Actual rooms
            rooms.map((room) => (
              <Grid item key={room.id} xs={12} sm={6} md={4} sx={{ px: { xs: 0, sm: 2 } }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#232936',
                    borderRadius: 4,      border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={room[FIELDS.ROOM_IMAGE] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80'}
                    alt={room[FIELDS.ROOM_NAME]}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {room[FIELDS.ROOM_NAME]}
                    </Typography>
                    <Typography color="text.secondary" sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1
                    }}>
                      {room[FIELDS.ROOM_DESCRIPTION]}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(room);
                        setInfoDialogOpen(true);
                      }}
                      sx={{ mb: 1 }}
                    >
                      Mehr Info
                    </Button>
                    <Typography variant="h6" sx={{ mt: 2, color: '#ffa726' }}>
                      ab {room[FIELDS.ROOM_PRICE_HOUR]}€/Stunde
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => currentUser ? router.push({ pathname: '/calendar', query: { showBooking: 'true' } }) : router.push('/login')}
                      sx={{
                        bgcolor: '#ffa726',
                        '&:hover': { bgcolor: '#ffc000' }
                      }}
                    >
                      {currentUser ? 'Jetzt buchen' : 'Anmelden zum Buchen'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {selectedRoom?.[FIELDS.ROOM_NAME]}
          <IconButton
            onClick={() => setInfoDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <img
              src={selectedRoom?.[FIELDS.ROOM_IMAGE] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80'}
              alt={selectedRoom?.[FIELDS.ROOM_NAME]}
              style={{ width: '100%', borderRadius: '4px', marginBottom: '16px' }}
            />
            
            {/* Beschreibung */}
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              Beschreibung
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {selectedRoom?.[FIELDS.ROOM_DESCRIPTION].split('•').map((item, index) => (
                item.trim() && (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    {index > 0 && <Typography component="span" sx={{ mr: 1 }}>•</Typography>}
                    <Typography component="span">{item.trim()}</Typography>
                  </Box>
                )
              ))}
            </Typography>

            {/* Ausstattung */}
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
              Ausstattung
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
              {selectedRoom?.[FIELDS.ROOM_DESCRIPTION].split('•').slice(1).map((item, index) => (
                item.trim() && (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography component="span" sx={{ mr: 1 }}>•</Typography>
                    <Typography variant="body2">{item.trim()}</Typography>
                  </Box>
                )
              ))}
            </Box>

            {/* Preise */}
            <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
              Preise
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: 2,
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Stundentarif
                </Typography>
                <Typography variant="h6">
                  {selectedRoom?.[FIELDS.ROOM_PRICE_HOUR]}€/Stunde
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tagestarif
                </Typography>
                <Typography variant="h6">
                  {selectedRoom?.[FIELDS.ROOM_PRICE_DAY]}€/Tag
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>
            Schließen
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setInfoDialogOpen(false);
              router.push({ pathname: '/calendar', query: { showBooking: 'true' } });
            }}
          >
            Jetzt buchen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Layout>
  );
}
