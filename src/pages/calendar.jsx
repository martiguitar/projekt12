import { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import BookingProcess from '../components/BookingProcess';
import Layout from '../components/Layout';
import {
  Box,
  Paper,
  Button,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import deLocale from '@fullcalendar/core/locales/de';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import baserowService, { ROLES, FIELDS } from '../services/baserow';
import { format, parseISO } from 'date-fns';

export default function Calendar() {
  const [showBookingProcess, setShowBookingProcess] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingInfoOpen, setBookingInfoOpen] = useState(false);

  // Vibrant, pop-style color palette with more unique colors
  const VIBRANT_COLORS = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bright Blue
    '#FDCB6E', // Sunflower Yellow
    '#6C5CE7', // Purple
    '#FF8A5B', // Bright Orange
    '#2ECC71', // Emerald Green
    '#AF7AC5', // Lavender Purple
    '#FF69B4', // Hot Pink
    '#5D3FD3', // Iris Purple
    '#FF4500', // Vibrant Orange-Red
    '#1E90FF', // Dodger Blue
    '#32CD32', // Lime Green
    '#FF1493', // Deep Pink
    '#00CED1', // Dark Turquoise
    '#8A4FFF', // Vivid Purple
    '#FF6347', // Tomato
    '#20B2AA', // Light Sea Green
    '#FF7F50', // Coral
    '#4682B4'  // Steel Blue
  ];

  // Generate a consistent, vibrant color from room ID with 50% transparency
  const generateRoomColor = (roomInfo) => {
    // Handle null, undefined, or invalid room information
    if (!roomInfo) {
      console.warn('No room information provided, using default color');
      return '#607D8B80'; // Neutral gray with 50% transparency
    }

    // Extract room ID, handling different possible input formats
    const roomId = 
      (typeof roomInfo === 'object' ? 
        (roomInfo.id || roomInfo.roomId || roomInfo.room_id || roomInfo.display_value) : 
        roomInfo
      ) || null;

    // If no valid room ID, use a fallback
    if (roomId === null) {
      console.warn('Could not extract room ID, using default color');
      return '#607D8B80';
    }

    // Convert room ID to a string to ensure consistent hashing
    const roomIdString = String(roomId);

    // Advanced hash function to distribute colors more evenly
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i <str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    // Generate hash from room ID
    const hash = hashCode(roomIdString);

    // Select color from palette based on hash
    const colorIndex = hash % VIBRANT_COLORS.length;
    const selectedColor = VIBRANT_COLORS[colorIndex];

    // Add 50% transparency to the color
    const transparentColor = selectedColor + '80';

    // Logging for transparency
    console.log(`Room Color Generation: ${roomIdString} -> ${transparentColor}`);

    return transparentColor;
  };

  // Call color demonstration after rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      console.log('Room Color Demonstration:');
      rooms.forEach(room => {
        const roomId = room.id;
        const color = generateRoomColor(roomId);
        console.log(`Room ID ${roomId} (${room[FIELDS.ROOM_NAME] || 'Unnamed'}): ${color}`);
      });
    }
  }, [rooms]);

  // Existing event color function remains the same
  const getEventColor = (eventInfo) => {
    const roomId = eventInfo.event.extendedProps.roomId;
    return generateRoomColor(roomId);
  };

  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (router.query.showBooking) {
      setShowBookingProcess(true);
    }
  }, [router.query]);

  useEffect(() => {
    loadRooms();
    loadBookings();
  }, []);

  const loadRooms = async () => {
    try {
      const allRooms = await baserowService.getAllRooms();
      // Filter only active rooms
      const activeRooms = allRooms.filter(room => room[FIELDS.ROOM_ACTIVE] === "true");
      setRooms(activeRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const bookings = await baserowService.getAllBookings();
      
      // Create a Set to track unique bookings
      const uniqueBookings = new Set();
      
      const formattedEvents = bookings
        .filter(booking => {
          // Create a unique key for each booking
          const bookingKey = `${booking[FIELDS.BOOKING_DATE]}_${booking[FIELDS.BOOKING_START_TIME]}_${booking[FIELDS.BOOKING_END_TIME]}_${booking[FIELDS.BOOKING_ROOM]?.id || 'unknown'}`;
          
          // Only keep the booking if it's not a duplicate
          if (!uniqueBookings.has(bookingKey)) {
            uniqueBookings.add(bookingKey);
            return true;
          }
          return false;
        })
        .map(booking => {
          // Safely extract room information
          const roomInfo = booking[FIELDS.BOOKING_ROOM] || {};
          
          // Determine room name with multiple fallback strategies
          const roomName = 
            roomInfo.display_value || 
            roomInfo.value || 
            (typeof roomInfo === 'string' ? roomInfo : null) || 
            booking[FIELDS.BOOKING_NAME] || 
            'Unbekannter Raum';

          // Determine room ID with multiple fallback strategies
          const roomId = 
            roomInfo.id || 
            (typeof roomInfo === 'object' && roomInfo.id) || 
            (roomName !== 'Unbekannter Raum' ? roomName : null);

          // Format the booking date
          const bookingDate = booking[FIELDS.BOOKING_DATE] 
            ? new Date(booking[FIELDS.BOOKING_DATE]).toLocaleDateString('de-DE') 
            : '';

          // Extract user name directly from field_5946
          const userName = booking['field_5946'] || 'Unbekannt';
          
          // Create event title without repeating room name
          const title = roomName === 'Unbekannter Raum' 
            ? `${bookingDate} - ${booking[FIELDS.BOOKING_NAME] || 'Buchung'}` 
            : `${bookingDate} - ${roomName} ${userName !== 'Unbekannt' ? `(${userName})` : ''}`;

          return {
            id: booking.id,
            title: title,
            start: `${booking[FIELDS.BOOKING_DATE]}T${booking[FIELDS.BOOKING_START_TIME]}`,
            end: `${booking[FIELDS.BOOKING_DATE]}T${booking[FIELDS.BOOKING_END_TIME]}`,
            allDay: false,
            backgroundColor: generateRoomColor(roomInfo), // Full block color
            borderColor: generateRoomColor(roomInfo), // Border color to match
            textColor: '#FFFFFF', // White text for better readability
            extendedProps: {
              roomId: roomId, // Room identifier
              room: roomName, // Room name
              status: booking[FIELDS.BOOKING_STATUS], // Booking status
              isBooking: true,
              booking: booking
            }
          };
        });

      // Log the number of unique events
      console.log(`Loaded ${formattedEvents.length} unique booking events`);

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setNotification({
        open: true,
        message: 'Fehler beim Laden der Buchungen',
        severity: 'error'
      });
    }
  };

  const handleDateSelect = (selectInfo) => {
    if (!currentUser) {
      router.push({ pathname: '/login', query: { returnTo: '/calendar', showBooking: 'true' } });
      return;
    }
    setSelectedDate(selectInfo.start);
    setShowBookingProcess(true);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleBookingComplete = () => {
    loadBookings();
    setNotification({
      open: true,
      message: 'Ihre Buchung wurde erfolgreich erstellt und wird in Kürze bestätigt.',
      severity: 'success'
    });
  };

  const eventClick = (info) => {
    if (info.event.extendedProps.isBooking) {
      setSelectedBooking(info.event.extendedProps.booking);
      setBookingInfoOpen(true);
    }
  };

  const getStatusColor = (status) => {
    const statusValue = status?.value || status || 'PENDING';
    switch (statusValue.toUpperCase()) {
      case 'APPROVED':
        return '#4caf50'; // Green
      case 'PENDING':
        return '#ff9800'; // Orange
      case 'REJECTED':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Gray for undefined status
    }
  };

  // Ensure status text is correctly displayed
  const getStatusText = (status) => {
    const statusValue = status?.value || status;
    switch (statusValue?.toUpperCase()) {
      case 'APPROVED':
        return 'Bestätigt';
      case 'PENDING':
        return 'Ausstehend';
      case 'REJECTED':
        return 'Abgelehnt';
      default:
        return 'Unbekannt';
    }
  };

  // Updated event content rendering
  const eventContent = (eventInfo) => {
    // Try to get room information from extended properties
    const roomInfo = eventInfo.event.extendedProps.roomId || 
                     eventInfo.event.extendedProps.room || 
                     null;
    
    const roomColor = generateRoomColor(roomInfo);
    const roomName = eventInfo.event.extendedProps.room || 'Unbekannter Raum';

    return (
      <div 
        style={{ 
          backgroundColor: roomColor, 
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        title={`Raum: ${roomName}`}
      >
        {eventInfo.event.title}
      </div>
    );
  };

  return (
    <Layout>
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      bgcolor: '#1a1c23',
      pt: { xs: 2, sm: 3 }
    }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '1250px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2, sm: 3 }
      }}>
        {showBookingProcess ? (
          <BookingProcess 
            onClose={() => setShowBookingProcess(false)} 
            selectedDate={selectedDate}
            rooms={rooms}
            onBookingComplete={() => {
              setShowBookingProcess(false);
              loadBookings();
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Desktop-Button wird unten angezeigt */}

            <Paper 
              elevation={3} 
              sx={{ 
                flexGrow: 1, 
                p: { xs: 1, sm: 2 },
                display: 'flex',
                width: '100%',
                bgcolor: '#232936',
                borderRadius: { xs: 2, sm: 4 },
                overflow: 'hidden',
                '.fc': {
                  height: 'auto',
                  minHeight: '600px',
                  width: '100%',
                  backgroundColor: '#1a1c23',
                  '--fc-page-bg-color': '#1a1c23',
                  '--fc-border-color': 'rgba(255, 255, 255, 0.1)',
                  '--fc-neutral-bg-color': 'rgba(255, 255, 255, 0.05)',
                  '--fc-list-event-hover-bg-color': 'rgba(255, 255, 255, 0.1)',
                  '--fc-today-bg-color': 'rgba(99, 102, 241, 0.1)',
                  '--fc-event-bg-color': '#ffa726',
                  '--fc-event-border-color': '#ffa726',
                  '--fc-event-text-color': '#fff',
                  '--fc-button-bg-color': '#2d3748',
                  '--fc-button-border-color': '#4a5568',
                  '--fc-button-hover-bg-color': '#4a5568',
                  '--fc-button-hover-border-color': '#ffa726',
                  '--fc-button-active-bg-color': '#ffa726',
                  '--fc-button-active-border-color': '#ffa726',
                  color: '#fff'
                },
                '.fc-view': {
                  height: '100%'
                },
                '.fc-scroller': {
                  height: '100% !important'
                },
                '.fc-col-header-cell': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff'
                },
                '.fc-timegrid-slot': {
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)'
                },
                '.fc-timegrid-col': {
                  backgroundColor: '#1a1c23'
                },
                '.fc-button': {
                  textTransform: 'capitalize',
                  '&:focus': {
                    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)'
                  },
                  padding: { xs: '0.2rem 0.5rem', sm: '0.4rem 0.65rem' },
                  fontSize: { xs: '0.8rem', sm: '1rem' }
                },
                '.fc-toolbar-title': {
                  fontSize: { xs: '1.2rem', sm: '1.5rem' }
                },
                '.fc-event': {
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                  },
                },
                '.fc-day-today': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1) !important'
                },
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                height="100%"
                expandRows={true}
                stickyHeaderDates={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventContent={eventContent}
                eventColor="#607D8B80"  // Neutral default color with 50% transparency
                eventBorderColor="#455A6480"  // Slightly darker neutral color with 50% transparency
                eventClick={eventClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale="de"
                buttonText={{
                  today: 'Heute',
                  month: 'Monat',
                  week: 'Woche',
                  day: 'Tag'
                }}
                nowIndicator={true}
                eventDisplay="block"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                views={{
                  timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
                  },
                  dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'long' }
                  },
                  timeGridDay: {
                    titleFormat: { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long' }
                  }
                }}
              />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowBookingProcess(true)}
                startIcon={<EventIcon />}
                sx={{ 
                  bgcolor: '#ffa726', 
                  '&:hover': { bgcolor: '#ffc000' },
                  width: { xs: 'auto', sm: 'auto' }
                }}
              >
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Neue Buchung</Typography>
                <Typography sx={{ display: { xs: 'block', sm: 'none' } }}>Buchen</Typography>
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>

    {/* Booking Info Dialog */}
    <Dialog
      open={bookingInfoOpen}
      onClose={() => setBookingInfoOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a1c23',
          color: '#fff'
        }
      }}
    >
      {selectedBooking && (
        <>
          <DialogTitle sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h6" component="div">
                {selectedBooking[FIELDS.BOOKING_ROOM]}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {format(parseISO(selectedBooking[FIELDS.BOOKING_DATE]), 'dd.MM.yyyy')}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              bgcolor: getStatusColor(selectedBooking[FIELDS.BOOKING_STATUS]),
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 4
            }}>
              {getStatusText(selectedBooking[FIELDS.BOOKING_STATUS])}
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ py: 1 }}>
              {/* Zeit */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Zeitraum
                </Typography>
                <Typography variant="body1">
                  {selectedBooking[FIELDS.BOOKING_START_TIME]} - {selectedBooking[FIELDS.BOOKING_END_TIME]} Uhr
                </Typography>
              </Box>

              {/* Buchungstyp und Preis */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Buchungsdetails
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Buchungstyp
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking[FIELDS.BOOKING_TYPE] === 'DAILY' ? 'Tagesbuchung' : 'Stundenbuchung'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Preis
                    </Typography>
                    <Typography variant="body1">
                      {selectedBooking[FIELDS.BOOKING_PRICE]}€
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Benutzer */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Gebucht von
                </Typography>
                <Typography variant="body1">
                  {selectedBooking[FIELDS.BOOKING_USER]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking[FIELDS.BOOKING_USER_EMAIL]}
                </Typography>
              </Box>

              {/* Notizen */}
              {selectedBooking[FIELDS.BOOKING_NOTES] && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Notizen
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking[FIELDS.BOOKING_NOTES]}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Button onClick={() => setBookingInfoOpen(false)}>
              Schließen
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>

    <Snackbar
      open={notification.open}
      autoHideDuration={10000}
      onClose={handleNotificationClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleNotificationClose}
        severity={notification.severity}
        variant="filled"
        sx={{
          minWidth: '300px',
          backgroundColor: '#10B981',
          '& .MuiAlert-icon': {
            color: '#ffffff'
          },
          '& .MuiAlert-message': {
            color: '#ffffff',
            fontWeight: 500
          }
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
    </Layout>
  );
}
