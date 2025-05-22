import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import baserowService, { FIELDS } from '../services/baserow';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    priceHour: '',
    priceDay: '',
    active: true
  });

  const loadRooms = async () => {
    const allRooms = await baserowService.getAllRooms();
    setRooms(allRooms);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenDialog = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room[FIELDS.ROOM_NAME] || '',
        description: room[FIELDS.ROOM_DESCRIPTION] || '',
        imageUrl: room[FIELDS.ROOM_IMAGE] || '',
        priceHour: room[FIELDS.ROOM_PRICE_HOUR] || '',
        priceDay: room[FIELDS.ROOM_PRICE_DAY] || '',
        active: room[FIELDS.ROOM_ACTIVE] === 'true'
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        priceHour: '',
        priceDay: '',
        active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
  };

  const handleSubmit = async () => {
    const { name, description, imageUrl, priceHour, priceDay, active } = formData;
    if (!name || !description || !priceHour || !priceDay) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingRoom) {
        await baserowService.updateRoom(editingRoom.id, {
          name,
          description,
          imageUrl,
          priceHour: parseFloat(priceHour),
          priceDay: parseFloat(priceDay),
          active
        });
      } else {
        await baserowService.createRoom(
          name,
          description,
          imageUrl || '',
          parseFloat(priceHour),
          parseFloat(priceDay),
          active
        );
      }
      handleCloseDialog();
      loadRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room. Please try again.');
    }
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await baserowService.deleteRoom(roomId);
        loadRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Room Management</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#ffa726',
            '&:hover': { bgcolor: '#ffc000' }
          }}
        >
          Add New Room
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#232936',           borderRadius: 4,
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room[FIELDS.ROOM_NAME]}</TableCell>
                <TableCell>
                  {room[FIELDS.ROOM_DESCRIPTION]?.length > 50 
                    ? `${room[FIELDS.ROOM_DESCRIPTION].substring(0, 50)}...` 
                    : room[FIELDS.ROOM_DESCRIPTION]}
                </TableCell>
                <TableCell>
                  {room[FIELDS.ROOM_IMAGE] && (
                    <img 
                      src={room[FIELDS.ROOM_IMAGE]} 
                      alt={room[FIELDS.ROOM_NAME]}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50px' }}
                    />
                  )}
                </TableCell>
                <TableCell>{room[FIELDS.ROOM_ACTIVE] === 'true' ? 'Active' : 'Inactive'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenDialog(room)}
                    sx={{ color: 'text.primary' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(room.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Image URL"
            type="url"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            helperText="Enter a valid image URL"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense"
              label="Price per Hour"
              type="text"
              fullWidth
              value={formData.priceHour}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, priceHour: value });
                }
              }}
              helperText="Enter the hourly price"
              InputProps={{
                endAdornment: <span>€/Stunde</span>,
              }}
              placeholder="25.00"
            />
            <TextField
              margin="dense"
              label="Price per Day"
              type="text"
              fullWidth
              value={formData.priceDay}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, priceDay: value });
                }
              }}
              helperText="Enter the daily price"
              InputProps={{
                endAdornment: <span>€/Tag</span>,
              }}
              placeholder="130.00"
            />
          </Box>
          {formData.imageUrl && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={formData.imageUrl} 
                alt="Room preview"
                style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </Box>
          )}
          <FormControlLabel
            control={<Switch checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingRoom ? 'Save Changes' : 'Create Room'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
