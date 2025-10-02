import { useCallback } from 'react';
import { useCalendarStore, useOperatorsStore, useUsersStore } from './index';
import { EventType, BlockedDay } from '@/app/types/types';

// Calendar hooks with API integration
export const useCalendarActions = () => {
  const {
    events,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    blockedDays,
    setBlockedDays,
    addBlockedDay,
    removeBlockedDay,
    setIsLoading,
  } = useCalendarStore();

  // Fetch events from API and update store
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Always update with fresh data from API
        setEvents(Array.isArray(data) ? data : data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setEvents, setIsLoading]);

  // Fetch blocked days from API and update store
  const fetchBlockedDays = useCallback(async () => {
    try {
      const response = await fetch('/api/blocked-days');
      if (response.ok) {
        const data = await response.json();
        // Always update with fresh data from API
        setBlockedDays(Array.isArray(data) ? data : data.blockedDays || []);
      }
    } catch (error) {
      console.error('Failed to fetch blocked days:', error);
    }
  }, [setBlockedDays]);

  // Create event with API call and update store
  const createEvent = useCallback(async (event: Omit<EventType, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Handle the API response structure which wraps the event in a result object
        const newEvent = result.success ? result.event : result;
        if (newEvent) {
          addEvent(newEvent);
          // Also refresh the entire events list to ensure consistency
          await fetchEvents();
          return newEvent;
        }
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [addEvent, setIsLoading, fetchEvents]);

  // Update event with API call and update store
  const updateEventAPI = useCallback(async (id: string, updates: Partial<EventType>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        const updatedEvent = await response.json();
        updateEvent(id, updatedEvent);
        return updatedEvent;
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateEvent, setIsLoading]);

  // Delete event with API call and update store
  const deleteEventAPI = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        deleteEvent(id);
        return true;
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setIsLoading(false);
    }
    return false;
  }, [deleteEvent, setIsLoading]);

  // Block day with API call and update store
  const blockDay = useCallback(async (blockedDay: BlockedDay) => {
    try {
      const response = await fetch('/api/blocked-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockedDay),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the entire blocked days list from API response
        if (data.blockedDays) {
          setBlockedDays(data.blockedDays);
        } else {
          addBlockedDay(data.blockedDay);
        }
        return true;
      } else {
        console.error('Failed to block day:', data.error);
      }
    } catch (error) {
      console.error('Failed to block day:', error);
    }
    return false;
  }, [addBlockedDay, setBlockedDays]);

  // Unblock day with API call and update store
  const unblockDay = useCallback(async (date: string) => {
    try {
      const response = await fetch(`/api/blocked-days/${date}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        removeBlockedDay(date);
        return true;
      }
    } catch (error) {
      console.error('Failed to unblock day:', error);
    }
    return false;
  }, [removeBlockedDay]);

  return {
    events,
    blockedDays,
    fetchEvents,
    fetchBlockedDays,
    createEvent,
    updateEvent: updateEventAPI,
    deleteEvent: deleteEventAPI,
    blockDay,
    unblockDay,
  };
};

// Operators hooks with API integration
export const useOperatorsActions = () => {
  const { operators, setOperators, addOperator, updateOperator, deleteOperator } = useOperatorsStore();

  const fetchOperators = useCallback(async () => {
    try {
      const response = await fetch('/api/operators');
      if (response.ok) {
        const data = await response.json();
        // Always update with fresh data from API
        setOperators(Array.isArray(data) ? data : data.operators || []);
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    }
  }, [setOperators]);

  const createOperator = useCallback(async (operator: any) => {
    try {
      const response = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operator),
      });
      
      if (response.ok) {
        const newOperator = await response.json();
        addOperator(newOperator);
        return newOperator;
      }
    } catch (error) {
      console.error('Failed to create operator:', error);
    }
  }, [addOperator]);

  return {
    operators,
    fetchOperators,
    createOperator,
    updateOperator,
    deleteOperator,
  };
};

// Users hooks with API integration
export const useUsersActions = () => {
  const { users, setUsers, addUser, updateUser, deleteUser } = useUsersStore();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [setUsers]);

  const createUser = useCallback(async (user: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      
      if (response.ok) {
        const newUser = await response.json();
        addUser(newUser);
        return newUser;
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }, [addUser]);

  return {
    users,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
