export interface UserType {
  id: string;
  name: string;
  avatar: string;
}

export type Operator = {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
};

export type EventType = {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  extendedProps: {
    operator: Operator;
    services: string[];
    description?: string;
  };
};

export type BlockedDay = {
  id: string;
  date: string;
  reason?: string;
};
