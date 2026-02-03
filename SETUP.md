# Global Biometric Attendance System - Local Setup Guide

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version

2. **PostgreSQL Database** (Choose one option):
   - **Option A - Local Installation:**
     - Download from: https://www.postgresql.org/download/windows/
     - Install and remember your postgres password
     - Create a database: `biometric_attendance`
   
   - **Option B - Cloud Database (Recommended for quick setup):**
     - Free options: https://neon.tech or https://supabase.com
     - Create an account and get your DATABASE_URL

## Quick Start (After Installing Node.js)

### 1. Run Setup Script
```powershell
./setup.ps1
```

This will install all required dependencies.

### 2. Configure Database

Edit the `.env` file and update the DATABASE_URL:

**For local PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/biometric_attendance
```

**For cloud database:**
```
DATABASE_URL=postgresql://user:password@host.region.provider.com:5432/database?sslmode=require
```

### 3. Create Database Tables
```powershell
npm run db:push
```

### 4. Start the Application
```powershell
./start.ps1
```

Or manually:
```powershell
npm run dev
```

### 5. Access the Application

Open your browser and go to:
```
http://localhost:5000
```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type check with TypeScript

## Default Test Data

The application will automatically seed some test users on first run:
- Alice Student (fp_alice_001)
- Bob Staff (fp_bob_002)
- Charlie Student

## Features

- ✓ User Management (Students & Staff)
- ✓ Fingerprint Registration
- ✓ Attendance Logging (Sign In/Out)
- ✓ Real-time Dashboard
- ✓ Attendance Reports
- ✓ CSV Export
- ✓ Dark/Light Theme
- ✓ Fingerprint Simulation

## Troubleshooting

**Issue: "node is not recognized"**
- Install Node.js from https://nodejs.org/
- Restart PowerShell after installation

**Issue: "Cannot find module"**
- Run: `npm install`

**Issue: Database connection error**
- Check your DATABASE_URL in .env file
- Make sure PostgreSQL is running
- Verify database exists

**Issue: Port 5000 already in use**
- Change PORT in .env file to another port (e.g., 3000)

## Support

For issues or questions, check the project documentation or create an issue in the repository.
