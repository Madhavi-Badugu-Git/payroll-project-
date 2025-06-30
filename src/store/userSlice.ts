import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  roles?: string[]; // Add roles array
}

export interface LinkedEmployee {
  id: string;
  empId: string;
  name: string;
  designation: string;
}

export interface UserSyncResponse {
  success: boolean;
  user: User;
  linkedEmployee?: LinkedEmployee | null;
}

export interface UserState {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  user: User | null;
  linkedEmployee: LinkedEmployee | null;
  lastSyncResult: UserSyncResponse | null;
  retryCount: number;
}

const initialState: UserState = {
  isLoading: false,
  isSynced: false,
  error: null,
  user: null,
  linkedEmployee: null,
  lastSyncResult: null,
  retryCount: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSyncSuccess: (state, action: PayloadAction<UserSyncResponse>) => {
      state.isLoading = false;
      state.isSynced = true;
      state.error = null;
      state.user = action.payload.user;
      state.linkedEmployee = action.payload.linkedEmployee || null;
      state.lastSyncResult = action.payload;
      state.retryCount = 0;
    },
    setSyncFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isSynced = false;
      state.error = action.payload;
      state.retryCount += 1;
    },
    resetSyncState: state => {
      state.isLoading = false;
      state.isSynced = false;
      state.error = null;
      state.user = null;
      state.linkedEmployee = null;
      state.lastSyncResult = null;
      state.retryCount = 0;
    },
    incrementRetryCount: state => {
      state.retryCount += 1;
    },
    resetRetryCount: state => {
      state.retryCount = 0;
    },
  },
});

export const {
  setSyncLoading,
  setSyncError,
  setSyncSuccess,
  setSyncFailed,
  resetSyncState,
  incrementRetryCount,
  resetRetryCount,
} = userSlice.actions;

export default userSlice.reducer;
