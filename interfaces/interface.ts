export interface Token {
  token: string;
}

export interface UserData {
  id: number;
  username: string;
}

export interface UserInfo {
  username: string;
  password: string;
}

export interface TimeRecord {
  id?: number;
  userId: number;
  started: string;
  stopped: string;
  length: string;
  goal: string;
  category: string;
  tags: string[];
  isProductive: boolean;
  isDeleted: boolean;
}

export interface CreateTimeRecordDto {
  userId: number;
  started: string;
  stopped: string;
  length: string;
  goal: string;
  category: string;
  tags: string[];
  isProductive: boolean;
  isDeleted: boolean;
}

export interface DailyScheduleItem {
  id: string;
  userId: number;
  name: string;
  minutes: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
}