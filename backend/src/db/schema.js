/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} password_hash
 * @property {string|null} full_name
 * @property {string|null} avatar_url
 * @property {boolean} is_verified
 * @property {string|null} verification_token
 * @property {Date|null} token_expiry
 * @property {string|null} refresh_token
 * @property {Date|null} last_login
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {string|null} description
 * @property {string|null} color_hex
 * @property {Date} created_at
 */

/**
 * @typedef {Object} DashboardCard
 * @property {number} id
 * @property {number|null} card_id
 * @property {number} user_id
 * @property {string} name
 * @property {string|null} icon
 * @property {string|null} color_hex
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {number} project_id
 * @property {string|null} content
 * @property {'todo'|'doing'|'done'} status
 * @property {Date|null} due_date
 */

/**
 * @typedef {Object} PomodoroSession
 * @property {number} id
 * @property {number} project_id
 * @property {number} duration_minutes
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Resource
 * @property {number} id
 * @property {number} project_id
 * @property {string|null} file_extension
 * @property {string|null} mime_type
 * @property {string|null} url
 * @property {number|null} file_size_kb
 * @property {Date} created_at
 */