import { RootState } from './index';

// User selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectLinkedEmployee = (state: RootState) => state.user.linkedEmployee;
export const selectUserSyncStatus = (state: RootState) => ({
  isLoading: state.user.isLoading,
  isSynced: state.user.isSynced,
  error: state.user.error,
});
export const selectLastSyncResult = (state: RootState) => state.user.lastSyncResult;
export const selectRetryInfo = (state: RootState) => ({
  retryCount: state.user.retryCount,
  canRetry: state.user.retryCount < 5, // MAX_RETRIES = 5
});

// Computed selectors
export const selectUserDisplayName = (state: RootState) => {
  const user = state.user.user;
  if (!user) return null;

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.lastName) {
    return user.lastName;
  } else {
    return user.email;
  }
};

export const selectEmployeeInfo = (state: RootState) => {
  const linkedEmployee = state.user.linkedEmployee;
  if (!linkedEmployee) return null;

  return {
    empId: linkedEmployee.empId,
    name: linkedEmployee.name,
    designation: linkedEmployee.designation,
  };
};

export const selectIsUserLinkedToEmployee = (state: RootState) => {
  return !!state.user.linkedEmployee;
};
