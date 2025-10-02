import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventType, BlockedDay } from '@/app/types/types';

// Calendar Store Interface
interface CalendarState {
  // Events
  events: EventType[];
  setEvents: (events: EventType[]) => void;
  addEvent: (event: EventType) => void;
  updateEvent: (id: string, updates: Partial<EventType>) => void;
  deleteEvent: (id: string) => void;
  
  // Blocked Days
  blockedDays: BlockedDay[];
  setBlockedDays: (blockedDays: BlockedDay[]) => void;
  addBlockedDay: (blockedDay: BlockedDay) => void;
  removeBlockedDay: (date: string) => void;
  
  // Calendar View State
  currentView: string;
  setCurrentView: (view: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  
  // UI State
  selectedEvent: EventType | null;
  setSelectedEvent: (event: EventType | null) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Create the calendar store with persistence
export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // Events
      events: [],
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updates } : event
        )
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),
      
      // Blocked Days
      blockedDays: [],
      setBlockedDays: (blockedDays) => set({ blockedDays }),
      addBlockedDay: (blockedDay) => set((state) => ({
        blockedDays: [...state.blockedDays, blockedDay]
      })),
      removeBlockedDay: (date) => set((state) => ({
        blockedDays: state.blockedDays.filter(blocked => blocked.date !== date)
      })),
      
      // Calendar View State
      currentView: 'timeGridWeek',
      setCurrentView: (view) => set({ currentView: view }),
      currentDate: new Date(),
      setCurrentDate: (date) => set({ currentDate: date }),
      
      // UI State
      selectedEvent: null,
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      
      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'calendar-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Persist UI state and modified events/blockedDays
        events: state.events,
        blockedDays: state.blockedDays,
        currentView: state.currentView,
        currentDate: state.currentDate,
      }),
    }
  )
);

// Operators Store Interface
interface OperatorsState {
  operators: any[];
  setOperators: (operators: any[]) => void;
  addOperator: (operator: any) => void;
  updateOperator: (id: string, updates: any) => void;
  deleteOperator: (id: string) => void;
}

// Create the operators store with persistence
export const useOperatorsStore = create<OperatorsState>()(
  persist(
    (set) => ({
      operators: [],
      setOperators: (operators) => set({ operators }),
      addOperator: (operator) => set((state) => ({
        operators: [...state.operators, operator]
      })),
      updateOperator: (id, updates) => set((state) => ({
        operators: state.operators.map(operator =>
          operator.id === id ? { ...operator, ...updates } : operator
        )
      })),
      deleteOperator: (id) => set((state) => ({
        operators: state.operators.filter(operator => operator.id !== id)
      })),
    }),
    {
      name: 'operators-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({
        // Don't persist operators data - always fetch fresh from API
      }),
    }
  )
);

// Users Store Interface  
interface UsersState {
  users: any[];
  setUsers: (users: any[]) => void;
  addUser: (user: any) => void;
  updateUser: (id: string, updates: any) => void;
  deleteUser: (id: string) => void;
}

// Create the users store with persistence
export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({
        users: [...state.users, user]
      })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(user =>
          user.id === id ? { ...user, ...updates } : user
        )
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(user => user.id !== id)
      })),
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({
        // Don't persist users data - always fetch fresh from API
      }),
    }
  )
);
