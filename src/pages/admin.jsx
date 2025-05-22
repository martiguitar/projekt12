import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import baserowService, { ROLES, FIELDS } from '../services/baserow';
import RoomManagement from '../components/RoomManagement';
import BookingManagement from '../components/BookingManagement';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Alert,
  Snackbar,
  Badge,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HomeIcon from '@mui/icons-material/Home';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';

export default function Admin() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const { currentUser } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Snackbar notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const loadUsers = async () => {
    try {
      const allUsers = await baserowService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Laden der Benutzer',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (!currentUser || currentUser[FIELDS.ROLE]?.value !== 'admin') {
      router.push('/');
      return;
    }

    loadUsers();
  }, [currentUser, router]);
  
  // Handle delete user dialog
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await baserowService.deleteUser(userToDelete.id);
      setSnackbar({
        open: true,
        message: `Benutzer ${userToDelete[FIELDS.NAME]} wurde gelöscht`,
        severity: 'success'
      });
      loadUsers(); // Refresh user list
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Fehler beim Löschen des Benutzers: ${error.message}`,
        severity: 'error'
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleRoleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleRoleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const roleNameMap = {
    [ROLES.USER]: "user",
    [ROLES.INTERN]: "intern",
    [ROLES.ADMIN]: "admin",
};

const handleRoleChange = async (newRole) => {
    console.log(`Changing role for user ${selectedUserId} to ${newRole}`);
    try {
        const roleName = roleNameMap[newRole]; // Get the role name
        console.log('Request payload:', { userId: selectedUserId, role: roleName }); // Log the request payload
        await baserowService.updateUserRole(selectedUserId, roleName); // Send role name instead of ID
        console.log('Role updated successfully');
        await loadUsers(); // Refresh user list
    } catch (error) {
        console.error('Error updating role:', error);
    }
};

  const getRoleIcon = (role) => {
    switch (role?.value) {
      case 'admin':
        return <AdminPanelSettingsIcon sx={{ color: '#ffa726' }} />;
      case 'intern':
        return <BuildIcon sx={{ color: '#00f090' }} />;
      default:
        return <PersonIcon sx={{ color: '#ffa000' }} />;
    }
  };

  const getNextRole = (currentRole) => {
    switch (currentRole) {
      case ROLES.USER:
        return ROLES.INTERN;
      case ROLES.INTERN:
        return ROLES.ADMIN;
      case ROLES.ADMIN:
        return ROLES.INTERN;
      default:
        return ROLES.USER;
    }
  };

  return (
    <Layout>
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      bgcolor: '#1a1c23', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: 7, sm: 0 } // Add padding at bottom for mobile navigation
    }}>


      <Box sx={{ 
        p: { xs: 0.0, sm: 3 }, // Minimaler Abstand für Mobile
        pt: { xs: 0, sm: 3 }, // Kein zusätzlicher Abstand oben für Mobile
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '1200px' }
        }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 0, sm: 2 }, // Kein seitlicher Abstand auf Mobilgeräten
            mt: { xs: 0, sm: 2 },
            mb: { xs: 1, sm: 3 },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ffa726',
            },
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#ffa726',
              },
              minWidth: { xs: 'auto', sm: 160 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            },
          }}
        >
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Typography noWrap>
                {window.innerWidth <= 600 ? 'Benutzer' : 'Benutzerverwaltung'}
              </Typography>
            </Box>} 
          />
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Typography noWrap>
                {window.innerWidth <= 600 ? 'Räume' : 'Raumverwaltung'}
              </Typography>
            </Box>} 
          />
          <Tab 
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Typography noWrap>
                {window.innerWidth <= 600 ? 'Buchungen' : 'Buchungsverwaltung'}
              </Typography>
            </Box>} 
          />
        </Tabs>

        {currentTab === 0 ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 3 } }}>
              <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>Benutzerverwaltung</Typography>
              <Chip 
                icon={<PersonIcon />} 
                label={`${users.length} Benutzer`} 
                sx={{ 
                  bgcolor: '#2a3142', 
                  color: 'text.primary',
                  '& .MuiChip-icon': { color: '#ffa726' }
                }}
              />
            </Box>

            {/* Admins Section */}
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: { xs: 1, sm: 2 }, 
                p: { xs: 0.5, sm: 1 },
                borderLeft: '4px solid #ffa726',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'rgba(255, 167, 38, 0.1)'
              }}>
                <AdminPanelSettingsIcon sx={{ color: '#ffa726' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>Administratoren</Typography>
                <Chip 
                  size="small" 
                  label={users.filter(user => user[FIELDS.ROLE]?.value === 'admin').length} 
                  sx={{ 
                    bgcolor: 'rgba(255, 167, 38, 0.2)', 
                    color: '#ffa726',
                    ml: 1
                  }}
                />
              </Box>
              
              <Grid container spacing={{ xs: 3, sm: 4 }}>
                {users
                  .filter(user => user[FIELDS.ROLE]?.value === 'admin')
                  .map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id} sx={{ px: { xs: 0.5, sm: 2 } }}>
                  <Card sx={{ 
                    bgcolor: '#232936', 
                    borderRadius: { xs: 2, sm: 3 }, 
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' },
                      boxShadow: { xs: '0 4px 18px rgba(0, 0, 0, 0.5)', sm: '0 8px 24px rgba(0, 0, 0, 0.6)' },
                    }
                  }}>
                    <CardHeader
                      sx={{ p: { xs: 1.5, sm: 2 } }}
                      avatar={
                        <Avatar sx={{ 
                          bgcolor: user[FIELDS.ROLE]?.value === 'admin' ? '#ffa726' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? '#00f090' : '#6b7280'
                        }}>
                          {user[FIELDS.NAME]?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                      }
                      action={
                        <Chip 
                          size="small" 
                          label={user[FIELDS.ROLE]?.value || 'user'}
                          sx={{ 
                            bgcolor: user[FIELDS.ROLE]?.value === 'admin' ? 'rgba(255, 167, 38, 0.2)' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? 'rgba(0, 240, 144, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                            color: user[FIELDS.ROLE]?.value === 'admin' ? '#ffa726' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? '#00f090' : '#6b7280',
                            borderRadius: 1,
                            mr: 1,
                            mt: 1
                          }}
                        />
                      }
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            {user[FIELDS.NAME]}
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <EmailIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                          {user[FIELDS.EMAIL]}
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardActions sx={{ justifyContent: 'space-between', p: { xs: 1, sm: 2 } }}>
                      <Button 
                        startIcon={getRoleIcon(user[FIELDS.ROLE])}
                        onClick={(e) => handleRoleMenuOpen(e, user.id)}
                        size="small"
                        sx={{ 
                          color: 'text.primary',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                        }}
                      >
                        Rolle ändern
                      </Button>
                      <Button 
                        startIcon={<DeleteIcon sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />}
                        onClick={() => handleOpenDeleteDialog(user)}
                        size="small"
                        sx={{ 
                          color: '#f87171',
                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          py: { xs: 0.5, sm: 1 },
                          minWidth: { xs: 'auto', sm: '100px' },
                          '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
                        }}
                      >
                        Löschen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              </Grid>
            </Box>

            {/* Interns Section */}
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: { xs: 1, sm: 2 }, 
                p: { xs: 0.5, sm: 1 },
                borderLeft: '4px solid #00f090',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'rgba(0, 240, 144, 0.1)'
              }}>
                <BuildIcon sx={{ color: '#00f090' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>Intern</Typography>
                <Chip 
                  size="small" 
                  label={users.filter(user => user[FIELDS.ROLE]?.value === 'intern').length} 
                  sx={{ 
                    bgcolor: 'rgba(0, 240, 144, 0.2)', 
                    color: '#00f090',
                    ml: 1
                  }}
                />
              </Box>
              
              <Grid container spacing={{ xs: 3, sm: 4 }}>
                {users
                  .filter(user => user[FIELDS.ROLE]?.value === 'intern')
                  .map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id} sx={{ px: { xs: 0.5, sm: 2 } }}>
                  <Card sx={{ 
                    bgcolor: '#232936', 
                    borderRadius: { xs: 2, sm: 3 }, 
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' },
                      boxShadow: { xs: '0 4px 18px rgba(0, 0, 0, 0.5)', sm: '0 8px 24px rgba(0, 0, 0, 0.6)' },
                    }
                  }}>
                    <CardHeader
                      sx={{ p: { xs: 1.5, sm: 2 } }}
                      avatar={
                        <Avatar sx={{ 
                          bgcolor: '#00f090'
                        }}>
                          {user[FIELDS.NAME]?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                      }
                      action={
                        <Chip 
                          size="small" 
                          label={user[FIELDS.ROLE]?.value || 'user'}
                          sx={{ 
                            bgcolor: user[FIELDS.ROLE]?.value === 'admin' ? 'rgba(255, 167, 38, 0.2)' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? 'rgba(0, 240, 144, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                            color: user[FIELDS.ROLE]?.value === 'admin' ? '#ffa726' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? '#00f090' : '#6b7280',
                            borderRadius: 1,
                            mr: 1,
                            mt: 1
                          }}
                        />
                      }
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            {user[FIELDS.NAME]}
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <EmailIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                          {user[FIELDS.EMAIL]}
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardActions sx={{ justifyContent: 'space-between', p: { xs: 1, sm: 2 } }}>
                      <Button 
                        startIcon={<BuildIcon sx={{ color: '#00f090' }} />}
                        onClick={(e) => handleRoleMenuOpen(e, user.id)}
                        size="small"
                        sx={{ 
                          color: 'text.primary',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                        }}
                      >
                        Rolle ändern
                      </Button>
                      <Button 
                        startIcon={<DeleteIcon sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />}
                        onClick={() => handleOpenDeleteDialog(user)}
                        size="small"
                        sx={{ 
                          color: '#f87171',
                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          py: { xs: 0.5, sm: 1 },
                          minWidth: { xs: 'auto', sm: '100px' },
                          '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
                        }}
                      >
                        Löschen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                  ))}
              </Grid>
            </Box>

            {/* Regular Users Section */}
            <Box sx={{ mb: { xs: 2, sm: 4 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: { xs: 1, sm: 2 }, 
                p: { xs: 0.5, sm: 1 },
                borderLeft: '4px solid #6b7280',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'rgba(107, 114, 128, 0.1)'
              }}>
                <PersonIcon sx={{ color: '#6b7280' }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>Benutzer</Typography>
                <Chip 
                  size="small" 
                  label={users.filter(user => user[FIELDS.ROLE]?.value === 'user').length} 
                  sx={{ 
                    bgcolor: 'rgba(107, 114, 128, 0.2)', 
                    color: '#6b7280',
                    ml: 1
                  }}
                />
              </Box>
              
              <Grid container spacing={{ xs: 3, sm: 4 }}>
                {users
                  .filter(user => user[FIELDS.ROLE]?.value === 'user')
                  .map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id} sx={{ px: { xs: 0.5, sm: 2 } }}>
                  <Card sx={{ 
                    bgcolor: '#232936', 
                    borderRadius: { xs: 2, sm: 3 }, 
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-5px)' },
                      boxShadow: { xs: '0 4px 18px rgba(0, 0, 0, 0.5)', sm: '0 8px 24px rgba(0, 0, 0, 0.6)' },
                    }
                  }}>
                    <CardHeader
                      sx={{ p: { xs: 1.5, sm: 2 } }}
                      avatar={
                        <Avatar sx={{ 
                          bgcolor: '#6b7280'
                        }}>
                          {user[FIELDS.NAME]?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                      }
                      action={
                        <Chip 
                          size="small" 
                          label={user[FIELDS.ROLE]?.value || 'user'}
                          sx={{ 
                            bgcolor: user[FIELDS.ROLE]?.value === 'admin' ? 'rgba(255, 167, 38, 0.2)' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? 'rgba(0, 240, 144, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                            color: user[FIELDS.ROLE]?.value === 'admin' ? '#ffa726' : 
                                  user[FIELDS.ROLE]?.value === 'intern' ? '#00f090' : '#6b7280',
                            borderRadius: 1,
                            mr: 1,
                            mt: 1
                          }}
                        />
                      }
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                            {user[FIELDS.NAME]}
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <EmailIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                          {user[FIELDS.EMAIL]}
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardActions sx={{ justifyContent: 'space-between', p: { xs: 1, sm: 2 } }}>
                      <Button 
                        startIcon={<PersonIcon sx={{ color: '#6b7280', fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />}
                        onClick={(e) => handleRoleMenuOpen(e, user.id)}
                        size="small"
                        sx={{ 
                          color: 'text.primary',
                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          py: { xs: 0.5, sm: 1 },
                          minWidth: { xs: 'auto', sm: '120px' },
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                        }}
                      >
                        Rolle ändern
                      </Button>
                      <Button 
                        startIcon={<DeleteIcon sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' } }} />}
                        onClick={() => handleOpenDeleteDialog(user)}
                        size="small"
                        sx={{ 
                          color: '#f87171',
                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                          py: { xs: 0.5, sm: 1 },
                          minWidth: { xs: 'auto', sm: '100px' },
                          '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' }
                        }}
                      >
                        Löschen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                  ))}
              </Grid>
            </Box>
          </Box>
        ) : currentTab === 1 ? (
          <RoomManagement />
        ) : (
          <BookingManagement />
        )}
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleRoleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            bgcolor: '#232936',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            handleRoleChange(ROLES.ADMIN);
            handleRoleMenuClose();
          }}
          sx={{ color: 'text.primary' }}
        >
          <ListItemIcon>
            <AdminPanelSettingsIcon sx={{ color: '#ffa726' }} />
          </ListItemIcon>
          Admin
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleRoleChange(ROLES.INTERN);
            handleRoleMenuClose();
          }}
          sx={{ color: 'text.primary' }}
        >
          <ListItemIcon>
            <BuildIcon sx={{ color: '#ffc000' }} />
          </ListItemIcon>
          Intern
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleRoleChange(ROLES.USER);
            handleRoleMenuClose();
          }}
          sx={{ color: 'text.primary' }}
        >
          <ListItemIcon>
            <PersonIcon sx={{ color: '#6b7280' }} />
          </ListItemIcon>
          User
        </MenuItem>
      </Menu>
      
      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            bgcolor: '#232936',
            color: 'text.primary',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            minWidth: { xs: '90%', sm: '450px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon sx={{ color: '#f87171' }} />
          Benutzer löschen
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Möchten Sie den Benutzer <strong style={{ color: '#ffa726' }}>{userToDelete?.[FIELDS.NAME]}</strong> wirklich löschen? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            sx={{ color: 'text.secondary' }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            sx={{ 
              bgcolor: '#f87171', 
              '&:hover': { bgcolor: '#ef4444' }
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar Notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </Layout>
  );
}
