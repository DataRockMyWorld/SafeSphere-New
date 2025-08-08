# SafeSphere Authentication Workflow

## Overview

SafeSphere implements a secure authentication system where users are created by administrators and receive password reset links via email to set their initial passwords.

## User Creation Process

### 1. Admin Creates User (Backend)

**Method 1: Django Admin Interface**
- Navigate to `/admin/` and log in as a superuser
- Go to "Users" section
- Click "Add User"
- Fill in required fields:
  - Email (unique)
  - First Name
  - Last Name
  - Phone Number
  - Role (Admin, Manager, Employee)
  - Department (Operations, Marketing, HSSE, Finance)
  - Position (MD, OPS MANAGER, FINANCE MANAGER, HSSE MANAGER, TECHNICIAN)
- Click "Save"
- System automatically:
  - Generates a random 12-character password
  - Creates a 6-digit reset code (valid for 15 minutes)
  - Sends password reset email to the user

**Method 2: API Endpoint**
- POST to `/api/v1/users/create/`
- Include user data in JSON format
- Requires authentication (admin only)
- Returns user details and confirmation message

### 2. Password Reset Email

The system sends a professionally formatted email containing:
- Welcome message
- Password reset link: `{FRONTEND_URL}/reset-password/{user_id}/{reset_code}/`
- 15-minute expiration warning
- Security notice

**Email Template**: `backend/accounts/templates/accounts/email/password_reset.html`

### 3. User Sets Password (Frontend)

**Password Reset Page**: `/reset-password/{user_id}/{reset_code}`

Features:
- Validates reset link parameters
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password confirmation
- Success/error feedback
- Automatic redirect to login page

## Login Process

### 1. User Login
- Navigate to `/login`
- Enter email and password
- System validates credentials
- Returns JWT tokens (access + refresh)
- Redirects to dashboard

### 2. Security Features
- Account lockout after failed attempts
- Failed login attempt tracking
- Automatic account unlocking after lockout period
- JWT token-based authentication
- Token refresh mechanism

## Password Reset for Existing Users

### Admin Actions
- **Django Admin**: Select users → "Resend password reset email"
- **API**: POST to `/api/v1/users/{user_id}/resend-reset/` (if implemented)

### User Self-Service
- Contact administrator to request password reset
- Admin can resend password reset email from admin interface

## Configuration

### Environment Variables
```bash
# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@safesphere.com

# Frontend URL for password reset links
FRONTEND_URL=http://127.0.0.1:3000  # Development
FRONTEND_URL=https://yourdomain.com  # Production
```

### Security Settings
- Reset code expiration: 15 minutes
- Password minimum length: 8 characters
- Account lockout attempts: Configurable in settings
- Account lockout duration: Configurable in settings

## API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/password-reset-confirm/{user_id}/{reset_code}/` - Confirm password reset

### User Management
- `GET /api/v1/users/me/` - Get current user info
- `GET /api/v1/users/list/` - List all users (admin)
- `POST /api/v1/users/create/` - Create new user (admin)
- `GET /api/v1/users/{id}/` - Get user details
- `PUT /api/v1/users/{id}/` - Update user

## Frontend Routes

- `/login` - Login page
- `/register` - Registration page (if enabled)
- `/reset-password/{user_id}/{reset_code}` - Password reset page
- `/profile` - User profile (authenticated)

## Security Considerations

1. **Password Reset Links**: 15-minute expiration
2. **Reset Codes**: 6-digit numeric codes
3. **Email Verification**: Required for account activation
4. **Account Lockout**: Prevents brute force attacks
5. **JWT Tokens**: Secure token-based authentication
6. **HTTPS**: Required in production
7. **Email Security**: Use app passwords for email services

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify email configuration
   - Check Django logs for email errors

2. **Reset link expired**
   - Admin can resend password reset email
   - Contact administrator for assistance

3. **Invalid reset code**
   - Codes expire after 15 minutes
   - Request new reset email from admin

4. **Account locked**
   - Wait for lockout period to expire
   - Contact administrator to unlock account

### Logs
- Check Django logs for authentication errors
- Monitor email sending logs
- Review failed login attempts

## Development vs Production

### Development
- Email backend: Console (prints to terminal)
- Frontend URL: `http://127.0.0.1:3000`
- Debug mode: Enabled

### Production
- Email backend: SMTP (Gmail, SendGrid, etc.)
- Frontend URL: `https://yourdomain.com`
- Debug mode: Disabled
- HTTPS: Required
- Environment variables: Properly configured 