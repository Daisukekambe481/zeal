const API = '/api/auth'
let pendingEmail = ''

const panels = {
  login:      document.getElementById('loginPanel'),
  signup:     document.getElementById('signupPanel'),
  verify:     document.getElementById('verifyPanel'),
  forgot:     document.getElementById('forgotPanel'),
  resetOtp:   document.getElementById('resetOtpPanel'),
  resetPass:  document.getElementById('resetPassPanel'),
}

// ── FLIP ──
function flip(target) {
  const card = document.getElementById('mainCard')
  card.classList.add('flipping')
  setTimeout(() => {
    Object.values(panels).forEach(p => p.classList.remove('active'))
    if (panels[target]) panels[target].classList.add('active')
  }, 375)
  setTimeout(() => card.classList.remove('flipping'), 750)
}

// ── SUCCESS OVERLAY ──
function showSuccess(label, nextPanel, delay = 2200) {
  const overlay = document.getElementById('successOverlay')
  document.getElementById('successLabel').textContent = label
  overlay.style.display = 'flex'
  setTimeout(() => {
    overlay.style.display = 'none'
    flip(nextPanel)
  }, delay)
}

// ── ALERT ──
function setAlert(id, msg, type = 'err') {
  const el = document.getElementById(id)
  el.textContent = msg
  el.className = `alert ${type} show`
}
function clearAlert(id) {
  document.getElementById(id).className = 'alert'
}

// ── LOADING ──
function setLoading(id, on) {
  const btn = document.getElementById(id)
  btn.disabled = on
  btn.classList.toggle('loading', on)
}

// ── LOGIN ──
async function handleLogin() {
  clearAlert('loginAlert')
  const email    = document.getElementById('loginEmail').value.trim()
  const password = document.getElementById('loginPassword').value
  if (!email || !password) return setAlert('loginAlert', 'Please fill in all fields.')
  setLoading('loginBtn', true)
  try {
    const res  = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('zeal_access_token', data.accessToken)
      localStorage.setItem('zeal_refresh_token', data.refreshToken)
      showSuccess('Welcome back!', 'login')
      setTimeout(() => window.location.href = '/dashboard.html', 2200)
    } else {
      setAlert('loginAlert', data.error || 'Invalid credentials.')
    }
  } catch { setAlert('loginAlert', 'Cannot reach server.') }
  finally { setLoading('loginBtn', false) }
}

// ── SIGNUP ──
async function handleSignup() {
  clearAlert('signupAlert')
  const full_name = document.getElementById('signupName').value.trim()
  const email     = document.getElementById('signupEmail').value.trim()
  const password  = document.getElementById('signupPassword').value
  if (!full_name || !email || !password) return setAlert('signupAlert', 'Please fill in all fields.')
  if (password.length < 10) return setAlert('signupAlert', 'Password must be at least 10 characters.')
  setLoading('signupBtn', true)
  try {
    const res  = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password })
    })
    const data = await res.json()
    if (res.ok) {
      pendingEmail = email
      document.getElementById('verifyEmailDisplay').textContent = email
      flip('verify')
    } else {
      setAlert('signupAlert', data.error || 'Registration failed.')
    }
  } catch { setAlert('signupAlert', 'Cannot reach server.') }
  finally { setLoading('signupBtn', false) }
}

// ── VERIFY EMAIL ──
async function handleVerify() {
  clearAlert('verifyAlert')
  const otp = document.getElementById('verifyOtp').value.trim()
  if (otp.length !== 6) return setAlert('verifyAlert', 'Enter the 6-digit code from your email.')
  setLoading('verifyBtn', true)
  try {
    const res  = await fetch(`${API}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, otp })
    })
    const data = await res.json()
    if (res.ok) {
      showSuccess('Email verified!', 'login')
    } else {
      setAlert('verifyAlert', data.error || 'Invalid code.')
    }
  } catch { setAlert('verifyAlert', 'Cannot reach server.') }
  finally { setLoading('verifyBtn', false) }
}

// ── RESEND VERIFY ──
async function resendVerify() {
  try {
    await fetch(`${API}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail })
    })
    setAlert('verifyAlert', 'New code sent — check your inbox.', 'ok')
  } catch { setAlert('verifyAlert', 'Failed to resend.') }
}

// ── FORGOT PASSWORD ──
async function handleForgot() {
  clearAlert('forgotAlert')
  const email = document.getElementById('forgotEmail').value.trim()
  if (!email) return setAlert('forgotAlert', 'Enter your email address.')
  setLoading('forgotBtn', true)
  try {
    const res = await fetch(`${API}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (res.ok) {
      pendingEmail = email
      flip('resetOtp')
    } else {
      setAlert('forgotAlert', 'Something went wrong.')
    }
  } catch { setAlert('forgotAlert', 'Cannot reach server.') }
  finally { setLoading('forgotBtn', false) }
}

// ── VERIFY RESET OTP ──
async function handleResetOtp() {
  clearAlert('resetOtpAlert')
  const otp = document.getElementById('resetOtp').value.trim()
  if (otp.length !== 6) return setAlert('resetOtpAlert', 'Enter the 6-digit reset code.')
  setLoading('resetOtpBtn', true)
  try {
    const res  = await fetch(`${API}/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, otp })
    })
    const data = await res.json()
    if (res.ok) {
      flip('resetPass')
    } else {
      setAlert('resetOtpAlert', data.error || 'Invalid code.')
    }
  } catch { setAlert('resetOtpAlert', 'Cannot reach server.') }
  finally { setLoading('resetOtpBtn', false) }
}

// ── RESET PASSWORD ──
async function handleReset() {
  clearAlert('resetPassAlert')
  const newPassword = document.getElementById('resetPassword').value
  if (newPassword.length < 10) return setAlert('resetPassAlert', 'Password must be at least 10 characters.')
  setLoading('resetPassBtn', true)
  try {
    const res  = await fetch(`${API}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, otp: document.getElementById('resetOtp').value.trim(), newPassword })
    })
    const data = await res.json()
    if (res.ok) {
      showSuccess('Password reset!', 'login')
    } else {
      setAlert('resetPassAlert', data.error || 'Reset failed.')
    }
  } catch { setAlert('resetPassAlert', 'Cannot reach server.') }
  finally { setLoading('resetPassBtn', false) }
}
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId)
  const isHidden = input.type === 'password'
  input.type = isHidden ? 'text' : 'password'
  btn.innerHTML = isHidden
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
}

// ── ENTER KEY ──
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return
  const active = document.querySelector('.form-container.active')
  if (!active) return
  const id = active.id
  if (id === 'loginPanel')     handleLogin()
  if (id === 'signupPanel')    handleSignup()
  if (id === 'verifyPanel')    handleVerify()
  if (id === 'forgotPanel')    handleForgot()
  if (id === 'resetOtpPanel')  handleResetOtp()
  if (id === 'resetPassPanel') handleReset()
})