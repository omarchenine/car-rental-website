# DCMotors Admin Access Guide

## Secure Admin Dashboard

Your admin dashboard is fully password-protected and requires authentication for all protected routes.

### How Admin Access Works

1. **Protected Routes**: The `/admin` path and all sub-routes require authentication
   - `/admin` - Main dashboard (redirects to login if not authenticated)
   - `/admin/login` - Login page
   - `/admin/bookings` - View all bookings
   - `/admin/new` - Add new car
   - `/admin/[id]/edit` - Edit existing car

2. **Password Protection**: 
   - Admin password is stored in the `ADMIN_PASSWORD` environment variable
   - Password is verified server-side in the authentication API
   - Session tokens are used to maintain authenticated state
   - JWT secret stored in `JWT_SECRET` environment variable

3. **Current Credentials**:
   ```
   Password: adminpassword123
   ```

### Accessing the Admin Panel

1. Navigate to: `http://localhost:3000/admin`
2. You'll be redirected to the login page
3. Enter the admin password
4. You'll be granted access to the admin dashboard

### Admin Functions Available

#### Dashboard Overview
- View all listings with status
- Quick access to add new cars
- Edit existing vehicle information

#### Bookings Management
- **View all bookings**: `/admin/bookings`
- See customer information including:
  - Name, email, phone
  - Location
  - Booking type
  - Message/notes
  - Status (pending, confirmed, completed, cancelled)
  - Date submitted
- Quick email and phone contact buttons
- Expandable message preview

#### Car Management
- **Add new cars**: `/admin/new`
- **Edit existing cars**: `/admin/[id]/edit`
- Manage:
  - Basic info (make, model, year, price)
  - Description
  - Features and specifications
  - Images/media
  - Status (active, sold)

### Security Features

✅ **Password-Protected Login**
- Requires admin password to access
- Password verified server-side
- Never transmitted in plain text

✅ **Session Management**
- JWT tokens for session persistence
- Secure HTTP-only cookies (when deployed)
- Token expiration handling

✅ **Protected API Routes**
- Authentication middleware on all admin endpoints
- `/api/auth/login` - Login endpoint
- `/api/auth/logout` - Logout endpoint
- Protected data endpoints

✅ **Environment Variables**
- `ADMIN_PASSWORD` - Encrypted in environment
- `JWT_SECRET` - Signed tokens with secret key
- Not stored in code or version control

### Logout

Click the "Sign out" button in the admin header to log out. You'll be redirected to the login page.

### Bookings Location Feature

The new booking form now includes a location field so you can track where customers are from. This appears in:

1. **Booking Form** - Customers enter their city/location
2. **Admin Dashboard** - Location is displayed for each booking
3. **WhatsApp Message** - Location is included in the WhatsApp message

This helps you understand your customer base and manage deliveries better.

### Troubleshooting Admin Access

**Problem**: Incorrect password error
- **Solution**: Verify the password matches `ADMIN_PASSWORD` environment variable

**Problem**: Stuck on login page
- **Solution**: Clear browser cookies and try again

**Problem**: Session expired
- **Solution**: Log in again with your admin password

**Problem**: Can't access admin panel
- **Solution**: Ensure you're accessing `/admin` route and environment variables are set

### Best Practices

1. **Change Password Regularly**
   - Update `ADMIN_PASSWORD` in environment variables
   - Notify team members of new password

2. **Secure Credentials**
   - Never share admin password in chat/email
   - Use secure password in production (currently: adminpassword123)

3. **Monitor Bookings**
   - Check `/admin/bookings` regularly
   - Follow up with customers promptly
   - Update booking status as orders progress

4. **Backup Data**
   - Bookings are stored in MongoDB
   - Ensure regular database backups
   - Monitor MongoDB connection

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout user

### Bookings
- `GET /api/bookings` - Get all bookings (requires auth)
- `POST /api/bookings` - Create new booking (public)

### Cars
- `GET /api/cars` - Get all cars (public)
- `GET /api/cars/[id]` - Get specific car (public)
- `POST /api/cars` - Create car (requires auth)
- `PATCH /api/cars/[id]` - Update car (requires auth)
- `DELETE /api/cars/[id]` - Delete car (requires auth)

## Summary

Your DCMotors admin dashboard is fully functional and secure. The admin can:

- ✅ View and manage bookings with customer location data
- ✅ Add and edit car listings
- ✅ Monitor all customer inquiries
- ✅ Contact customers directly via email/phone
- ✅ Manage booking status

Everything is protected behind password authentication!
