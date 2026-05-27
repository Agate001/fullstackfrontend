export interface Token {
  token: string;
}

export interface UserData {
  id: number;
  username: string;
  points: number;
  streak: number;
  isPointsPrivate: boolean;
  isStreakPrivate: boolean;
  isDeleted: boolean;
}

export interface UserInfo {
  username: string;
  password: string;
}

export interface RqtAccount {
  Username: string;
  Password: string;
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
  length?: string;
  goal: string;
  category: string;
  tags: string[];
  isProductive: boolean;
  isDeleted?: boolean;
}

export interface DailyScheduleItem {
  id: string;
  userId: number;
  name: string;
  minutes: number;
}

export interface ScheduleEvent {
  id: number;
  userId: number;
  title: string;
  location: string;
  note: string;
  when: string;
  isDeleted: boolean;
}

export interface CreateCalendarEventDto {
  userId: number;
  title: string;
  location: string;
  note: string;
  when: string;
}

export interface UserUpdateDto {
  id: number;
  bUsername: boolean;
  vUsername: string;
  bPassword: boolean;
  vPasswordOld: string;
  vPasswordNew: string;
  bPoints: boolean;
  vPoints: number;
  bStreak: boolean;
  vStreak: number;
  bIsPointsPrivate: boolean;
  vIsPointsPrivate: boolean;
  bIsStreakPrivate: boolean;
  vIsStreakPrivate: boolean;
  bIsDeleted: boolean;
  vIsDeleted: boolean;
}

export interface RspUser extends UserData {
  outgoingRequests: RspUser[];
  incomingRequests: RspUser[];
  friends: RspUser[];
  blocked: RspUser[];
}
