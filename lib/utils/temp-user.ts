import { v4 as uuidv4 } from 'uuid';

const TEMP_USER_ID_KEY = 'temp_user_id';

export function getOrCreateTempUserId(): string {
  if (typeof window === 'undefined') return '';
  
  // Try to get existing temp ID from localStorage
  let tempUserId = localStorage.getItem(TEMP_USER_ID_KEY);
  
  // If no temp ID exists, create one and store it
  if (!tempUserId) {
    // Generate UUID and remove hyphens
    const uuid = uuidv4().replace(/-/g, '');
    tempUserId = `temp${uuid}`;
    localStorage.setItem(TEMP_USER_ID_KEY, tempUserId);
    console.log('Created new temporary user ID:', tempUserId);
  }
  
  return tempUserId;
}

export function clearTempUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TEMP_USER_ID_KEY);
}
