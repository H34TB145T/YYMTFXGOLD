# FxGold Trading Platform

A professional cryptocurrency trading platform built with React, TypeScript, and PHP backend.

## 🚀 Features

- **Spot Trading**: Buy and sell cryptocurrencies
- **Futures Trading**: Long/short positions with leverage
- **Real-time Prices**: Live cryptocurrency market data
- **User Authentication**: Secure login with 2FA support
- **Admin Panel**: Order management and user oversight
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation

### Backend
- PHP 7.4+ with MySQL
- RESTful API architecture
- Secure authentication system
- Email integration (optional)

## 📦 Installation

### 1. Database Setup
1. Import the SQL file: `supabase/migrations/20250611102415_humble_spire.sql`
2. Update database credentials in `server/config/database.php`

### 2. Frontend Build
```bash
npm install
npm run build
```

### 3. Server Configuration
1. Upload `server/` files to your web server
2. Upload `dist/` contents to your domain root
3. Configure email settings in `server/emailConfig.php`

## 🔧 Configuration

### Database
Update `server/config/database.php`:
```php
$dbname = 'your_database_name';
$username = 'your_db_username';
$password = 'your_db_password';
```

### Email (Optional)
Update `server/emailConfig.php`:
```php
const EMAIL_ENABLED = true; // Set to false to disable
const SMTP_USERNAME = 'your-email@domain.com';
const SMTP_PASSWORD = 'your-password';
```

## 👤 Default Admin Account

- **Email**: admin@fxgold.shop
- **Password**: password

## 🏗️ Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend PHP files
│   ├── api/               # API endpoints
│   ├── config/            # Configuration files
│   └── emailConfig.php    # Email settings
└── supabase/migrations/   # Database schema
```

## 🔒 Security Features

- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Two-factor authentication

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support, please contact the development team.