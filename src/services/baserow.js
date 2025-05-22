import axios from 'axios';
import bcryptjs from 'bcryptjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const USERS_TABLE_ID = process.env.NEXT_PUBLIC_USERS_TABLE_ID;
const ROOMS_TABLE_ID = process.env.NEXT_PUBLIC_ROOMS_TABLE_ID;
const BOOKINGS_TABLE_ID = process.env.NEXT_PUBLIC_BOOKINGS_TABLE_ID;

export const FIELDS = {
  // Booking fields
  BOOKING_NAME: 'field_5925',
  BOOKING_NOTES: 'field_5926',
  BOOKING_ACTIVE: 'field_5927',
  BOOKING_DATE: 'field_5942',
  BOOKING_START_TIME: 'field_5943',
  BOOKING_END_TIME: 'field_5944',
  BOOKING_ROOM: 'field_5945',
  BOOKING_USER: 'field_5946',
  BOOKING_STATUS: 'field_5947',
  BOOKING_PRICE: 'field_5948',
  BOOKING_TYPE: 'field_5949',
  BOOKING_USER_EMAIL: 'field_5950',

  // Users fields
  ID: 'field_5931',
  NAME: 'field_5932',
  PASSWORD: 'field_5933',
  ROLE: 'field_5934',
  EMAIL: 'field_5935',

  // Rooms fields
  ROOM_NAME: 'field_5928',
  ROOM_DESCRIPTION: 'field_5929',
  ROOM_ACTIVE: 'field_5930',
  ROOM_IMAGE: 'field_5939',
  ROOM_PRICE_HOUR: 'field_5940',
  ROOM_PRICE_DAY: 'field_5941'
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Token ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Role definitions
export const ROLES = {
  ADMIN: 'admin',  
  USER: 'user',   
  INTERN: 'intern' 
};

export const ROLE_NAMES = {
  2831: ROLES.ADMIN,
  2830: ROLES.USER,
  2832: ROLES.INTERN
};

const roleNameMap = {
  [ROLES.USER]: "user",
  [ROLES.INTERN]: "intern",
  [ROLES.ADMIN]: "admin",
};

// Booking status constants
export const BOOKING_STATUS = {
  PENDING: 2835,
  APPROVED: 2836,
  REJECTED: 2837
};

// Booking type constants
export const BOOKING_TYPE = {
  HOURLY: 2838,
  DAILY: 2839
};

const baserowService = {
  // Rooms functions
  async getAllRooms() {
    try {
      const response = await api.get(`/api/database/rows/table/${ROOMS_TABLE_ID}/`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async createRoom(name, description, imageUrl, priceHour, priceDay, active = true) {
    try {
      const response = await api.post(`/api/database/rows/table/${ROOMS_TABLE_ID}/`, {
        [FIELDS.ROOM_NAME]: name,
        [FIELDS.ROOM_DESCRIPTION]: description,
        [FIELDS.ROOM_IMAGE]: imageUrl,
        [FIELDS.ROOM_PRICE_HOUR]: priceHour.toString(),
        [FIELDS.ROOM_PRICE_DAY]: priceDay.toString(),
        [FIELDS.ROOM_ACTIVE]: active.toString()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async updateRoom(roomId, { name, description, imageUrl, priceHour, priceDay, active }) {
    try {
      const response = await api.patch(`/api/database/rows/table/${ROOMS_TABLE_ID}/${roomId}/`, {
        [FIELDS.ROOM_NAME]: name,
        [FIELDS.ROOM_DESCRIPTION]: description,
        [FIELDS.ROOM_IMAGE]: imageUrl,
        [FIELDS.ROOM_PRICE_HOUR]: priceHour.toString(),
        [FIELDS.ROOM_PRICE_DAY]: priceDay.toString(),
        [FIELDS.ROOM_ACTIVE]: active.toString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  async deleteRoom(roomId) {
    try {
      await api.delete(`/api/database/rows/table/${ROOMS_TABLE_ID}/${roomId}/`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Users functions
  async getUserByEmail(email) {
    try {
      const response = await api.get(`/api/database/rows/table/${USERS_TABLE_ID}/`, {
        params: {
          [`filter__field_5935__equal`]: email
        }
      });

      // Return the first user found or null if no users found
      return response.data.results.length > 0 
        ? response.data.results[0] 
        : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  async getAllUsers() {
    try {
      const response = await api.get(`/api/database/rows/table/${USERS_TABLE_ID}/`);
      return response.data.results.map(user => {
        const { [FIELDS.PASSWORD]: _, ...userData } = user;
        return {
          ...userData,
          id: user.id
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(email, password, name = '') {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Check if this is the first user (will be admin)
      const allUsers = await this.getAllUsers();
      const isFirstUser = allUsers.length === 0;

      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Create user
      const response = await api.post(`/api/database/rows/table/${USERS_TABLE_ID}/`, {
        [FIELDS.EMAIL]: email,
        [FIELDS.PASSWORD]: hashedPassword,
        [FIELDS.NAME]: name,
        [FIELDS.ROLE]: isFirstUser 
          ? ROLES.ADMIN 
          : ROLES.USER
      });

      // Return user data (excluding password)
      const { [FIELDS.PASSWORD]: _, ...userData } = response.data;
      return {
        ...userData,
        id: response.data.id
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.detail || 'Error creating user');
    }
  },

  async updateUserRole(userId, newRole) {
    try {
      // Convert numeric role to string if needed
      const roleToSet = typeof newRole === 'number' 
        ? (ROLE_NAMES[newRole] || ROLES.USER)
        : newRole;

      const response = await api.patch(`/api/database/rows/table/${USERS_TABLE_ID}/${userId}/`, {
        [FIELDS.ROLE]: roleToSet
      });

      const { [FIELDS.PASSWORD]: _, ...userData } = response.data;
      return {
        ...userData,
        id: response.data.id
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error(error.response?.data?.detail || 'Error updating user role');
    }
  },

  async deleteUser(userId) {
    try {
      await api.delete(`/api/database/rows/table/${USERS_TABLE_ID}/${userId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.detail || 'Error deleting user');
    }
  },

  async loginUser(email, password) {
    try {
      console.log('Attempting login for email:', email);
      
      // Search for user by email
      const response = await api.get(`/api/database/rows/table/${USERS_TABLE_ID}/`, {
        params: {
          [`filter__field_5935__equal`]: email
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('User not found');
      }

      const user = response.data.results[0];
      
      // Verify password
      const isPasswordValid = await bcryptjs.compare(
        password, 
        user[FIELDS.PASSWORD]
      );

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Ensure role is a string
      const userRole = user[FIELDS.ROLE];
      const normalizedRole = typeof userRole === 'number' 
        ? (ROLE_NAMES[userRole] || ROLES.USER)
        : userRole;

      // Remove sensitive data
      const { [FIELDS.PASSWORD]: _, ...userData } = user;

      return {
        ...userData,
        [FIELDS.ROLE]: normalizedRole
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Booking functions
  async getAllBookings() {
    try {
      const response = await api.get(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  async createBooking({
    name,
    notes,
    date,
    startTime,
    endTime,
    roomId,
    userId,
    price,
    bookingType,
    userEmail,
    userRole
  }) {
    try {
      // Check if the user is an admin or has a special internal role
      const isInternalUser = userRole === ROLES.ADMIN || userRole === ROLES.INTERN;
      
      // If internal user, set price to 0
      const finalPrice = isInternalUser ? 0 : price;

      const response = await api.post(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/`, {
        [FIELDS.BOOKING_NAME]: name,
        [FIELDS.BOOKING_NOTES]: notes || '',
        [FIELDS.BOOKING_ACTIVE]: 'true',
        [FIELDS.BOOKING_DATE]: date,
        [FIELDS.BOOKING_START_TIME]: startTime,
        [FIELDS.BOOKING_END_TIME]: endTime,
        [FIELDS.BOOKING_ROOM]: roomId,
        [FIELDS.BOOKING_USER]: userId,
        [FIELDS.BOOKING_STATUS]: BOOKING_STATUS.PENDING,
        [FIELDS.BOOKING_PRICE]: finalPrice.toString(),
        [FIELDS.BOOKING_TYPE]: bookingType,
        [FIELDS.BOOKING_USER_EMAIL]: userEmail
      });

      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error(error.response?.data?.detail || 'Error creating booking');
    }
  },

  async updateBooking(bookingId, data) {
    try {
      const response = await api.patch(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/${bookingId}/`, {
        ...Object.entries(data).reduce((acc, [key, value]) => {
          if (FIELDS[key]) {
            acc[FIELDS[key]] = value.toString();
          }
          return acc;
        }, {})
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  async deleteBooking(bookingId) {
    try {
      await api.delete(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/${bookingId}/`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.patch(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/${bookingId}/`, {
        [FIELDS.BOOKING_STATUS]: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  async getRejectedBookings() {
    try {
      const response = await api.get(`/api/database/rows/table/${BOOKINGS_TABLE_ID}/`, {
        params: {
          [`filter__${FIELDS.BOOKING_STATUS}__equal`]: BOOKING_STATUS.REJECTED
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching rejected bookings:', error);
      throw error;
    }
  }
};

export default {
  getAllRooms: baserowService.getAllRooms,
  createRoom: baserowService.createRoom,
  updateRoom: baserowService.updateRoom,
  deleteRoom: baserowService.deleteRoom,
  getAllUsers: baserowService.getAllUsers,
  updateUserRole: baserowService.updateUserRole,
  deleteUser: baserowService.deleteUser,
  createUser: baserowService.createUser,
  loginUser: baserowService.loginUser,
  getUserByEmail: baserowService.getUserByEmail,
  getAllBookings: baserowService.getAllBookings,
  createBooking: baserowService.createBooking,
  updateBooking: baserowService.updateBooking,
  deleteBooking: baserowService.deleteBooking,
  updateBookingStatus: baserowService.updateBookingStatus,
  getRejectedBookings: baserowService.getRejectedBookings
};
