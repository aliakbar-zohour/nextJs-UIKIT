export interface UserType {
  id: string;
  name: string;
  avatar: string;
}

export interface EventType {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  extendedProps?: {
    user?: UserType;
    description?: string;
    services?: string[];
  };
}
