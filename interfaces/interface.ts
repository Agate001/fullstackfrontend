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
  isProductive: boolean;
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
export interface MdlCalendarEvent {
  Id: number;
  UserId: number;
  Title: string;
  Location: string;
  Note: string;
  When: string;
  IsDeleted: boolean;
}

export interface MdlTimeRecord {
  Id: number;
  UserId: number;
  Started: string;
  Stopped: string;
  Length: string;
  Goal: string;
  Category: string;
  Tags: string[];
  IsProductive: boolean;
  IsDeleted: boolean;
}

export interface MdlUser {
  Id: number;
  Username: string;
  Points: number;
  Streak: number;
  OutgoingRequests: number[];
  IncomingRequests: number[];
  Friends: number[];
  Blocked: number[];
  IsPointsPrivate: boolean;
  IsStreakPrivate: boolean;
  IsDeleted: boolean;
}

export interface RqtAccount {
  Username: string;
  Password: string;
}

export interface RqtCalendarEvent {
  UserId: number;
  Title: string;
  Location: string;
  Note: string;
  When: string;
}

export interface RqtTimeRecord {
  UserId: number;
  Started: string;
  Stopped: string;
  Goal: string;
  Category: string;
  Tags: string[];
  IsProductive: boolean;
}

export interface RqtUserUpdate {
  Id: number;

  BUsername: boolean;
  VUsername: string;

  BPassword: boolean;
  VPasswordOld: string;
  VPasswordNew: string;

  BPoints: boolean;
  VPoints: number;

  BStreak: boolean;
  VStreak: number;

  BIsPointsPrivate: boolean;
  VIsPointsPrivate: boolean;

  BIsStreakPrivate: boolean;
  VIsStreakPrivate: boolean;

  BIsDeleted: boolean;
  VIsDeleted: boolean;
}

export interface RspUser {
  id: number;
  username: string;
  points: number;
  streak: number;
  outgoingRequests: RspUser[];
  incomingRequests: RspUser[];
  friends: RspUser[];
  blocked: RspUser[];
  isPointsPrivate: boolean;
  isStreakPrivate: boolean;
  isDeleted: boolean;
}