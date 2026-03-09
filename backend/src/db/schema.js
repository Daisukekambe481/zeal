import { pgTable, serial, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
export const users = pgTable('users', {
  id:                 serial('id').primaryKey(),
  email:              varchar('email', { length: 255 }).unique().notNull(),
  password_hash:      text('password_hash').notNull(),
  full_name:          varchar('full_name', { length: 255 }),
  avatar_url:         text('avatar_url'),
  is_verified:        boolean('is_verified').default(false),
  verification_token: varchar('verification_token', { length: 6 }),
  token_expiry:       timestamp('token_expiry'),
  otp_attempts:       integer('otp_attempts').default(0),
  refresh_token:      text('refresh_token'),
  blacklisted_tokens: text('blacklisted_tokens').array(),
  last_login:         timestamp('last_login'),
  created_at:         timestamp('created_at').defaultNow(),
  updated_at:         timestamp('updated_at').defaultNow(),
})

export const projects = pgTable('projects', {
  id:          serial('id').primaryKey(),
  name:        varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color_hex:   varchar('color_hex', { length: 7 }),
  created_at:  timestamp('created_at').defaultNow(),
})
export const dashboard_cards = pgTable('dashboard_cards', {
  id:        serial('id').primaryKey(),
  card_id:   integer('card_id'),
  user_id:   integer('user_id').notNull().references(() => users.id),
  name:      varchar('name', { length: 255 }).notNull(),
  icon:      varchar('icon', { length: 100 }),
  color_hex: varchar('color_hex', { length: 7 }),
  created_at: timestamp('created_at').defaultNow(),
})
export const tasks = pgTable('tasks', {
  id:         serial('id').primaryKey(),
  project_id: integer('project_id').notNull().references(() => projects.id),
  content:    text('content'),
  status:     varchar('status', { length: 10 }).default('todo'),
  due_date:   timestamp('due_date'),
})
export const pomodoro_sessions = pgTable('pomodoro_sessions', {
  id:               serial('id').primaryKey(),
  project_id:       integer('project_id').notNull().references(() => projects.id),
  duration_minutes: integer('duration_minutes').default(25),
  created_at:       timestamp('created_at').defaultNow(),
})
export const resources = pgTable('resources', {
  id:             serial('id').primaryKey(),
  project_id:     integer('project_id').notNull().references(() => projects.id),
  file_extension: varchar('file_extension', { length: 20 }),
  mime_type:      varchar('mime_type', { length: 100 }),
  url:            text('url'),
  file_size_kb:   integer('file_size_kb'),
  created_at:     timestamp('created_at').defaultNow(),
})