import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TablePagination
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import baserowService, { BOOKING_STATUS, FIELDS } from '../services/baserow';

const iconButtonStyles = {
  success: {
    '&:hover': {
      boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)',
    },
    transition: 'box-shadow 0.3s ease-in-out'
  },
  error: {
    '&:hover': {
      boxShadow: '0 0 15px rgba(244, 67, 54, 0.5)',
    },
    transition: 'box-shadow 0.3s ease-in-out'
  }
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    try {
      const [bookingsData, roomsData, usersData] = await Promise.all([
        baserowService.getAllBookings(),
        baserowService.getAllRooms(),
        baserowService.getAllUsers()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAction = (booking, action) => {
    setSelectedBooking(booking);
    setDialogAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (dialogAction === 'confirm') {
        await baserowService.updateBookingStatus(selectedBooking.id, BOOKING_STATUS.APPROVED);
      } else if (dialogAction === 'reject') {
        await baserowService.deleteBooking(selectedBooking.id);
      }
      await loadData();
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error processing booking:', error);
    }
  };

  const getStatusChipProps = (status) => {
    switch (status?.id) {
      case BOOKING_STATUS.PENDING:
        return {
          label: 'Ausstehend',
          color: 'warning',
          sx: {
            boxShadow: '0 0 10px rgba(255, 152, 0, 0.5)', // Orange glow für warning
            '&:hover': {
              boxShadow: '0 0 15px rgba(255, 152, 0, 0.7)',
            },
            transition: 'box-shadow 0.3s ease-in-out'
          }
        };
      case BOOKING_STATUS.APPROVED:
        return {
          label: 'Bestätigt',
          color: 'success',
          sx: {
            boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)', // Grüner glow
            '&:hover': {
              boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)',
            },
            transition: 'box-shadow 0.3s ease-in-out'
          }
        };
      case BOOKING_STATUS.REJECTED:
        return {
          label: 'Abgelehnt',
          color: 'error'
        };
      default:
        return {
          label: 'Unbekannt',
          color: 'default'
        };
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return '';
    const [hours, minutes] = time.split(':');
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours), parseInt(minutes));
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: de });
  };

  const pendingBookings = bookings.filter(booking => booking.field_5947?.id === BOOKING_STATUS.PENDING);
  const approvedBookings = bookings.filter(booking => booking.field_5947?.id === BOOKING_STATUS.APPROVED);

  const renderBookingTable = (filteredBookings, showActions = true) => (
    <TableContainer component={Paper} sx={{ bgcolor: '#232936',           borderRadius: 4,
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Datum & Zeit</TableCell>
            <TableCell>Raum</TableCell>
            <TableCell>Benutzer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Preis</TableCell>
            <TableCell>Typ</TableCell>
            <TableCell align="right">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBookings
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {formatDateTime(booking.field_5942, booking.field_5943)}
                  <br />
                  bis
                  <br />
                  {formatDateTime(booking.field_5942, booking.field_5944)}
                </TableCell>
                <TableCell>
                  {rooms.find(r => r.id === booking.field_5945)?.[FIELDS.ROOM_NAME] || booking.field_5945}
                </TableCell>
                <TableCell>
                  {users.find(u => u.id === booking.field_5946)?.[FIELDS.NAME] || booking.field_5946}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {users.find(u => u.id === booking.field_5946)?.[FIELDS.EMAIL] || booking.field_5950}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip {...getStatusChipProps(booking.field_5947)} />
                </TableCell>
                <TableCell>{booking.field_5948}€</TableCell>
                <TableCell>{booking.field_5949?.id === 2838 ? 'Stündlich' : 'Täglich'}</TableCell>
                <TableCell align="right">
                  {showActions && booking.field_5947?.id === BOOKING_STATUS.PENDING && (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => handleAction(booking, 'confirm')}
                        size="small"
                        sx={iconButtonStyles.success}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleAction(booking, 'reject')}
                        size="small"
                        sx={iconButtonStyles.error}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  {showActions && booking.field_5947?.id === BOOKING_STATUS.APPROVED && (
                    <IconButton
                      color="error"
                      onClick={() => handleAction(booking, 'reject')}
                      size="small"
                      sx={iconButtonStyles.error}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredBookings.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Einträge pro Seite"
      />
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Buchungsverwaltung</Typography>
      
      {/* Ausstehende Buchungen */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ausstehende Buchungen ({pendingBookings.length})
      </Typography>
      {renderBookingTable(pendingBookings)}

      {/* Bestätigte Buchungen */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Bestätigte Buchungen ({approvedBookings.length})
      </Typography>
      {renderBookingTable(approvedBookings)}

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          {dialogAction === 'confirm' ? 'Buchung bestätigen' : 'Buchung ablehnen'}
        </DialogTitle>
        <DialogContent>
          {dialogAction === 'confirm' ? (
            <Typography>
              Möchten Sie diese Buchung wirklich bestätigen? Der Benutzer wird benachrichtigt.
            </Typography>
          ) : (
            <Typography>
              Möchten Sie diese Buchung wirklich ablehnen? Diese Aktion kann nicht rückgängig gemacht werden.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={dialogAction === 'confirm' ? 'success' : 'error'}
          >
            {dialogAction === 'confirm' ? 'Bestätigen' : 'Ablehnen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}