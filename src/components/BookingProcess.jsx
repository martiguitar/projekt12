import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
  MobileStepper,
  Snackbar,
  Grid,
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addHours, setHours, setMinutes } from 'date-fns';
import { de } from 'date-fns/locale';
import baserowService, { BOOKING_TYPE, FIELDS, ROLES } from '../services/baserow';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Raum wählen', 'Datum auswählen', 'Zeitraum auswählen', 'Bestätigen'];

const BUSINESS_HOURS = {
  start: 8, // 8:00
  end: 22, // 22:00
};

export default function BookingProcess({ rooms: allRooms, selectedDate: initialDate, onClose, onBookingComplete }) {
  // Filter only active rooms
  const rooms = allRooms.filter(room => room[FIELDS.ROOM_ACTIVE] === "true");
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    const loadExistingBookings = async () => {
      try {
        const bookings = await baserowService.getAllBookings();
        setExistingBookings(bookings);
      } catch (error) {
        console.error('Error loading existing bookings:', error);
      }
    };
    loadExistingBookings();
  }, []);

  const getBookedHours = (room, date) => {
    return existingBookings
      .filter(
        booking => booking[FIELDS.BOOKING_ROOM] === room[FIELDS.ROOM_NAME] &&
                   booking[FIELDS.BOOKING_DATE] === format(date, 'yyyy-MM-dd')
      )
      .reduce((hours, booking) => {
        const startHour = parseInt(booking[FIELDS.BOOKING_START_TIME].split(':')[0]);
        const endHour = parseInt(booking[FIELDS.BOOKING_END_TIME].split(':')[0]);
        for (let hour = startHour; hour < endHour; hour++) {
          hours.add(hour);
        }
        return hours;
      }, new Set());
  };

  const isTimeSlotAvailable = (room, date, startHour, endHour) => {
    const bookingsForRoom = existingBookings.filter(
      booking => booking[FIELDS.BOOKING_ROOM] === room[FIELDS.ROOM_NAME] &&
                 booking[FIELDS.BOOKING_DATE] === format(date, 'yyyy-MM-dd')
    );

    return !bookingsForRoom.some(booking => {
      const bookingStartHour = parseInt(booking[FIELDS.BOOKING_START_TIME].split(':')[0]);
      const bookingEndHour = parseInt(booking[FIELDS.BOOKING_END_TIME].split(':')[0]);
      
      return (
        (startHour >= bookingStartHour && startHour < bookingEndHour) ||
        (endHour > bookingStartHour && endHour <= bookingEndHour) ||
        (startHour <= bookingStartHour && endHour >= bookingEndHour)
      );
    });
  };
  const [bookingType, setBookingType] = useState('hourly');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedRoomForInfo, setSelectedRoomForInfo] = useState(null);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setConfirmDialogOpen(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const calculatePrice = () => {
    if (!selectedRoom) return 0;

    if (bookingType === 'daily') {
      return parseFloat(selectedRoom[FIELDS.ROOM_PRICE_DAY]);
    }

    // For hourly bookings
    if (!startTime || !endTime) {
      return startTime ? parseFloat(selectedRoom[FIELDS.ROOM_PRICE_HOUR]) : 0;
    }

    // Calculate based on hours between start and end time (inclusive)
    const hours = endTime.getHours() - startTime.getHours() + 1;
    return parseFloat(selectedRoom[FIELDS.ROOM_PRICE_HOUR]) * hours;
  };

  const createTimeForHour = (hour) => {
    const baseDate = selectedDate || new Date();
    return setHours(setMinutes(new Date(baseDate), 0), hour);
  };

  const getTimeRangeInfo = () => {
    if (!startTime) return '';
    if (!endTime) {
      return `${format(startTime, 'HH:mm')} ausgewählt`;
    }
    const hours = endTime.getHours() - startTime.getHours() + 1;
    return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} (${hours} Stunden)`;
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const showError = (message) => {
    showNotification(message, 'error');
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleTimeChange = (hour) => {
    const currentHour = hour;

    try {
      if (!startTime || (startTime && endTime)) {
        // Prüfe ob die Startstunde verfügbar ist
        if (!isTimeSlotAvailable(selectedRoom, selectedDate, currentHour, currentHour + 1)) {
          showError('Diese Stunde ist bereits gebucht. Bitte wählen Sie eine andere Zeit.');
          return;
        }

        // Start new selection
        const newStartTime = createTimeForHour(hour);
        setStartTime(newStartTime);
        setEndTime(null);
        setCalculatedPrice(parseFloat(selectedRoom?.[FIELDS.ROOM_PRICE_HOUR]) || 0);
      } else {
        // Complete the range
        const startHour = startTime.getHours();
        if (hour !== startHour) {
          let rangeStartTime, rangeEndTime;
          
          if (hour > startHour) {
            rangeStartTime = startTime;
            rangeEndTime = createTimeForHour(hour);
          } else {
            rangeStartTime = createTimeForHour(hour);
            rangeEndTime = startTime;
          }
          
          // Prüfe ob der gesamte Zeitraum verfügbar ist
          const newStartHour = rangeStartTime.getHours();
          const newEndHour = rangeEndTime.getHours();
          
          if (!isTimeSlotAvailable(selectedRoom, selectedDate, newStartHour, newEndHour)) {
            showError('Der gewählte Zeitraum überschneidet sich mit einer bestehenden Buchung.');
            return;
          }

          setStartTime(rangeStartTime);
          setEndTime(rangeEndTime);

          // Calculate price for the range
          if (selectedRoom) {
            const hours = rangeEndTime.getHours() - rangeStartTime.getHours();
            const price = parseFloat(selectedRoom[FIELDS.ROOM_PRICE_HOUR]) * (hours || 1); // Mindestens 1 Stunde
            setCalculatedPrice(price);
          }
        }
      }
    } catch (error) {
      console.error('Error handling time change:', error);
      showError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  };

  const isDayAvailable = (room, date) => {
    if (!room || !date) return false;
    return getBookedHours(room, date).size === 0;
  };

  const handleBookingTypeChange = (event) => {
    const newType = event.target.value;
    
    if (newType === 'daily') {
      if (!isDayAvailable(selectedRoom, selectedDate)) {
        showError('Tagesbuchung nicht möglich, da bereits Stunden an diesem Tag gebucht sind.');
        return;
      }

      const baseDate = selectedDate || new Date();
      const startDateTime = setHours(setMinutes(baseDate, 0), BUSINESS_HOURS.start);
      const endDateTime = setHours(setMinutes(baseDate, 0), BUSINESS_HOURS.end);
      setStartTime(startDateTime);
      setEndTime(endDateTime);
      
      if (selectedRoom) {
        setCalculatedPrice(parseFloat(selectedRoom[FIELDS.ROOM_PRICE_DAY]));
      }
    }
    
    setBookingType(newType);
    
    if (newType === 'hourly') {
      setStartTime(null);
      setEndTime(null);
      setCalculatedPrice(0);
    }
  };

  const calculateBookingPrice = () => {
    // Debug logging
    console.log('Current User:', currentUser);
    console.log('User Role:', currentUser[FIELDS.ROLE]);
    console.log('User Role Value:', currentUser[FIELDS.ROLE]?.value);

    // Skip price calculation for admin and intern users
    const userRole = currentUser[FIELDS.ROLE]?.value;
    if (userRole === 'admin' || userRole === 'intern') {
      console.log('Free booking for admin/intern');
      return 0;
    }

    if (!selectedRoom) return 0;

    if (bookingType === 'daily') {
      return parseFloat(selectedRoom[FIELDS.ROOM_PRICE_DAY]);
    }

    // For hourly bookings
    if (!startTime || !endTime) {
      return startTime ? parseFloat(selectedRoom[FIELDS.ROOM_PRICE_HOUR]) : 0;
    }

    // Calculate based on hours between start and end time (inclusive)
    const hours = endTime.getHours() - startTime.getHours() + 1;
    return parseFloat(selectedRoom[FIELDS.ROOM_PRICE_HOUR]) * hours;
  };

  const handleConfirmBooking = async () => {
    try {
      // Debug logging
      console.log('Confirm Booking - Current User:', currentUser);
      
      // Null-Check für currentUser
      if (!currentUser) {
        console.error('User is not logged in');
        setError('Sie müssen angemeldet sein, um eine Buchung vorzunehmen');
        return;
      }
      
      console.log('User Role:', currentUser[FIELDS.ROLE]);
      console.log('User Role Value:', currentUser[FIELDS.ROLE]?.value);

      const userRole = currentUser[FIELDS.ROLE]?.value;
      const finalPrice = (userRole === 'admin' || userRole === 'intern') 
        ? 0 
        : calculateBookingPrice();

      console.log('Final Price:', finalPrice);

      const bookingData = {
        name: `${selectedRoom[FIELDS.ROOM_NAME]} - ${format(selectedDate, 'dd.MM.yyyy')}`,
        notes: `Buchung von ${format(startTime, 'HH:mm')} bis ${format(endTime, 'HH:mm')}`,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm'),
        endTime: format(endTime, 'HH:mm'),
        roomId: selectedRoom[FIELDS.ROOM_NAME],
        userId: currentUser[FIELDS.NAME],
        userEmail: currentUser[FIELDS.EMAIL],
        price: finalPrice,
        bookingType: bookingType === 'daily' ? BOOKING_TYPE.DAILY : BOOKING_TYPE.HOURLY,
        userRole: userRole
      };

      console.log('Booking Data:', bookingData);

      await baserowService.createBooking(bookingData);
      setError(null);
      onBookingComplete();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Fehler beim Erstellen der Buchung. Bitte versuchen Sie es später erneut.');
      showNotification('Buchung fehlgeschlagen. Bitte versuchen Sie es erneut.', 'error');
    }
    setConfirmDialogOpen(false);
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !selectedRoom;
      case 1:
        return !selectedDate;
      case 2:
        return !startTime;
      default:
        return false;
    }
  };

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    try {
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(auto-fill, minmax(280px, 1fr))' 
            }, 
            gap: { xs: 2, sm: 3 },
            maxWidth: '1200px',
            mx: 'auto'
          }}>
            {rooms.map((room) => (
              <Paper
                key={room.id}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  cursor: 'pointer',
                  border: selectedRoom?.id === room.id ? '2px solid #ffa726' : '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': { transform: isMobile ? 'none' : 'translateY(-4px)', transition: 'transform 0.2s' },
                  '&:active': isMobile ? { bgcolor: 'action.selected' } : {},
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedRoom(room)}
              >
                {room[FIELDS.ROOM_IMAGE] && (
                  <Box sx={{ 
                    width: '100%', 
                    height: { xs: 150, sm: 200 }, 
                    mb: { xs: 1.5, sm: 2 }, 
                    borderRadius: 1, 
                    overflow: 'hidden' 
                  }}>
                    <img
                      src={room[FIELDS.ROOM_IMAGE]}
                      alt={room[FIELDS.ROOM_NAME]}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
                <Typography variant="h6">{room[FIELDS.ROOM_NAME]}</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1
                  }}
                >
                  {room[FIELDS.ROOM_DESCRIPTION]}
                </Typography>
                <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoomForInfo(room);
                    setInfoDialogOpen(true);
                  }}
                  sx={{ mb: 1 }}
                >
                  Mehr Info
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{room[FIELDS.ROOM_PRICE_HOUR]}€/Stunde</Typography>
                  <Typography variant="subtitle1">{room[FIELDS.ROOM_PRICE_DAY]}€/Tag</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ 
            maxWidth: { xs: '100%', sm: 400 }, 
            mx: 'auto',
            px: { xs: 1, sm: 0 } 
          }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                label="Datum auswählen"
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ 
            width: '100%',
            maxWidth: '800px', 
            mx: 'auto',
            px: { xs: 2, sm: 3 } 
          }}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mb: 4
            }}>
              <Button
                variant={bookingType === 'hourly' ? 'contained' : 'outlined'}
                onClick={() => handleBookingTypeChange({ target: { value: 'hourly' } })}
                sx={{
                  bgcolor: bookingType === 'hourly' ? '#ffa726' : 'transparent',
                  '&:hover': { bgcolor: bookingType === 'hourly' ? '#ffc000' : 'rgba(255, 255, 255, 0.05)' }
                }}
              >
                Stundenbuchung
              </Button>
              <Button
                variant={bookingType === 'daily' ? 'contained' : 'outlined'}
                onClick={() => handleBookingTypeChange({ target: { value: 'daily' } })}
                disabled={!isDayAvailable(selectedRoom, selectedDate)}
                sx={{
                  bgcolor: bookingType === 'daily' ? '#ffa726' : 'transparent',
                  '&:hover': { bgcolor: bookingType === 'daily' ? '#ffc000' : 'rgba(255, 255, 255, 0.05)' },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    borderColor: '#ef4444',
                  }
                }}
              >
                Tagesbuchung
              </Button>
            </Box>

            {bookingType === 'hourly' ? (
              <Box>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {!startTime ? 'Startzeit auswählen' : 
                     !endTime ? 'Endzeit auswählen' : 'Zeit auswählen'}
                  </Typography>
                  {startTime && (
                    <Typography variant="body2" color="text.secondary">
                      {!endTime ? 
                        `${format(startTime, 'HH:mm')} ausgewählt. Wählen Sie eine Endzeit für die Buchung.` :
                        `Buchungszeitraum: ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} (${Math.max(1, endTime.getHours() - startTime.getHours())} Stunden)`
                      }
                      {calculatedPrice > 0 && ` • ${calculatedPrice}€`}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 2
                }}>
                  {Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start + 1 }, (_, i) => {
                    const hour = BUSINESS_HOURS.start + i;
                    const timeString = hour.toString().padStart(2, '0') + ':00';
                    const isStart = startTime && format(startTime, 'HH:00') === timeString;
                    const isEnd = endTime && format(endTime, 'HH:00') === timeString;
                    const isInRange = startTime && endTime && 
                      ((startTime.getHours() < endTime.getHours() && 
                        hour > startTime.getHours() && hour < endTime.getHours()) ||
                       (startTime.getHours() > endTime.getHours() && 
                        hour > endTime.getHours() && hour < startTime.getHours()));
                    
                    const isBooked = selectedRoom && [...getBookedHours(selectedRoom, selectedDate)].includes(hour);
                    
                    return (
                      <Button
                        key={hour}
                        variant={isStart || isEnd ? 'contained' : isInRange ? 'contained' : 'outlined'}
                        onClick={() => !isBooked && handleTimeChange(hour)}
                        disabled={isBooked}
                        sx={{
                          bgcolor: isBooked ? 'rgba(239, 68, 68, 0.1)' :
                                 isStart || isEnd ? '#ffa726' : 
                                 isInRange ? '#ffc000' : 'transparent',
                          '&:hover': { 
                            bgcolor: isBooked ? 'rgba(239, 68, 68, 0.1) !important' :
                                     isStart || isEnd ? '#ffa726' : 
                                     isInRange ? '#ffc000' : 'rgba(255, 255, 255, 0.05)' 
                          },
                          border: '1px solid',
                          borderColor: isBooked ? '#ef4444' :
                                      isStart || isEnd ? '#ffa726' : 
                                      isInRange ? '#ffc000' : 'rgba(255, 255, 255, 0.1)',
                          color: isBooked ? '#ef4444' :
                                 isStart || isEnd || isInRange ? '#fff' : 'text.primary',
                          py: 2,
                          '&.Mui-disabled': {
                            color: '#ef4444',
                            borderColor: '#ef4444',
                            opacity: 0.7
                          }
                        }}
                      >
                        {timeString}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                Tagesbuchung von {BUSINESS_HOURS.start}:00 bis {BUSINESS_HOURS.end}:00 Uhr
              </Typography>
            )}

            {startTime && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Preis pro Stunde: {selectedRoom?.[FIELDS.ROOM_PRICE_HOUR]}€/Stunde
                </Typography>
                <Typography variant="h5" sx={{ color: '#ffa726' }}>
                  {calculatedPrice}€
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ maxWidth: '600px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>Buchungsübersicht</Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Raum: {selectedRoom?.[FIELDS.ROOM_NAME]}</Typography>
              <Typography variant="subtitle1">Datum: {format(selectedDate, 'dd.MM.yyyy')}</Typography>
              <Typography variant="subtitle1">
                Zeit: {bookingType === 'daily' ? 'Ganztägig' : 
                  `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Gesamtpreis: {calculatedPrice}€</Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderContent = () => (
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        maxWidth: '1200px',
        width: '100%',
        mx: 'auto'
      }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Neue Buchung
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          {!isMobile ? (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : (
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ mb: 2 }}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={isNextDisabled() || activeStep === steps.length - 1}
                >
                  {steps[activeStep]}
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button 
                  size="small" 
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  <KeyboardArrowLeft />
                  {activeStep > 0 ? steps[activeStep - 1] : ''}
                </Button>
              }
            />
          )}

          <Box sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            mt: 'auto'
          }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
              size={isMobile ? 'small' : 'medium'}
              startIcon={<KeyboardArrowLeft />}
            >
              Zurück
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isNextDisabled()}
              size={isMobile ? 'small' : 'medium'}
              endIcon={<KeyboardArrowRight />}
            >
              {activeStep === steps.length - 1 ? 'Buchen' : 'Weiter'}
            </Button>
          </Box>
        </Box>

        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Buchung bestätigen</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Buchungsdetails:</Typography>
              <Typography>Raum: {selectedRoom?.[FIELDS.ROOM_NAME]}</Typography>
              <Typography>Datum: {selectedDate ? format(selectedDate, 'dd.MM.yyyy') : ''}</Typography>
              <Typography>
                Zeit: {bookingType === 'daily' ? 'Ganztägig' : 
                  (startTime && endTime ? `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}` : '')}
              </Typography>
              <Typography>Preis: {calculatedPrice}€</Typography>
            </Box>
            <Typography color="text.secondary" gutterBottom>
              Ihre Buchung wird nach der Bestätigung durch einen Administrator aktiviert.
              Sie erhalten eine Benachrichtigung, sobald Ihre Buchung bestätigt wurde.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleConfirmBooking} variant="contained" color="primary">
              Jetzt kostenpflichtig buchen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Room Info Dialog */}
        <Dialog
          open={infoDialogOpen}
          onClose={() => setInfoDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {selectedRoomForInfo?.[FIELDS.ROOM_NAME]}
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
                src={selectedRoomForInfo?.[FIELDS.ROOM_IMAGE] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80'}
                alt={selectedRoomForInfo?.[FIELDS.ROOM_NAME]}
                style={{ width: '100%', borderRadius: 4, marginBottom: '16px' }}
              />
              
              {/* Beschreibung */}
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Beschreibung
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {selectedRoomForInfo?.[FIELDS.ROOM_DESCRIPTION].split('•').map((item, index) => (
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
                {selectedRoomForInfo?.[FIELDS.ROOM_DESCRIPTION].split('•').slice(1).map((item, index) => (
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
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Stundentarif
                  </Typography>
                  <Typography variant="h6">
                    {selectedRoomForInfo?.[FIELDS.ROOM_PRICE_HOUR]}€/Stunde
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tagestarif
                  </Typography>
                  <Typography variant="h6">
                    {selectedRoomForInfo?.[FIELDS.ROOM_PRICE_DAY]}€/Tag
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
                setSelectedRoom(selectedRoomForInfo);
              }}
            >
              Raum wählen
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
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
      </Box>
  );

  return renderContent();
}
