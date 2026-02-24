# 🏘️ RoadReport - Digital Civic Issue Reporting Platform

> **A modern, transparent platform for citizens to report civic issues and track their resolution in real-time.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://your-vercel-url-here.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20+%20TypeScript-green?style=for-the-badge)](#tech-stack)

## 🌟 Overview

CivicReport bridges the gap between citizens and local government by providing a transparent, real-time platform for reporting and tracking civic issues. Citizens can report problems like potholes, garbage accumulation, or broken streetlights with photos and GPS location, while administrators can manage and update issue status for complete transparency.

### 🎯 **Key Features**
- 📱 **Mobile-First Issue Reporting** - Photo capture with GPS location
- 🗺️ **Interactive Maps** - Visualize issues with markers and heatmaps
- ⚡ **Real-Time Updates** - Live status changes across all users
- 🌍 **Public Transparency** - All community issues visible to everyone
- 🛡️ **Admin Management** - Streamlined issue status management
- 📊 **Analytics Dashboard** - Community health insights
- 🔐 **Secure Authentication** - User accounts with role-based access

## 🚀 Live Demo

**🌐 [Visit Live Application](road-reporter-mu.vercel.app)**

### Demo Accounts
- **Regular User**: Create any account to report issues
- **Admin Access**: `judge@roadreport.demo` / `hackodisha`

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router 6** - Client-side routing
- **Leaflet + React-Leaflet** - Interactive maps
- **Leaflet.heat** - Heatmap visualization
- **Lucide React** - Modern icon library

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication & user management
  - File storage for images

### **Deployment & DevOps**
- **Vercel** - Serverless deployment platform
- **Git** - Version control
- **GitHub** - Code repository

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **VS Code** - Development environment

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │    │   Supabase API   │    │  PostgreSQL DB  │
│                 │◄──►│                  │◄──►│                 │
│ • Maps          │    │ • Authentication │    │ • Issues        │
│ • Real-time UI  │    │ • Real-time      │    │ • Profiles      │
│ • Photo Upload  │    │ • File Storage   │    │ • User Data     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/your-username/civic-report.git
cd civic-report
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create issues table
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_base64 TEXT,
  photo_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage', 'sewage', 'streetlight', 'others')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  reporter_id UUID REFERENCES auth.users(id),
  reporter_email TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public issues are viewable by everyone" ON issues
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update issues" ON issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
```

### 5. Import Demo Data (Optional)
Run the 200+ demo issues SQL script for impressive demo data across major Indian cities.

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 Usage Guide

### For Citizens
1. **Sign up/Login** to create an account
2. **Report Issues** using the "Report Issue" button
   - Take a photo of the problem
   - Add GPS location (automatic)
   - Describe the issue
   - Select category (pothole, garbage, sewage, streetlight, others)
3. **View Community Issues** on the dashboard
   - See all reported issues in your area
   - Track progress on reported problems
   - Use map view to visualize issue density
   - Switch between map and list views
   - Filter by status and category

### For Administrators
1. **Login** with admin credentials
2. **Access Admin Dashboard** via "Admin Control" button
3. **Manage Issues**
   - View all community issues
   - Update status: Pending → In Progress → Resolved
   - Use advanced filters for efficient management
   - Monitor real-time updates across the platform

## 🗺️ Map Features

### **Interactive Visualization**
- **Pin Markers**: Individual issue locations with status-based colors
- **Heatmap Layer**: Density visualization showing problem hotspots
- **Dual View**: Toggle between markers and heatmap or show both
- **Zoom Responsive**: Dynamic radius adjustment for optimal visibility
- **Real-time Updates**: Live marker and heatmap changes

### **Map Controls**
- 📍 **Pin Markers** - Individual issue pins (Red/Blue/Green)
- 🔥 **Heat Density** - Problem concentration areas
- 🎯 **Both Views** - Combined markers and heatmap
- 🔍 **Smart Zoom** - Automatic bounds fitting and preserved view

## ⚡ Real-Time Features

### **Live Updates**
- Issue status changes appear instantly across all users
- New issue reports broadcast to all connected clients
- Real-time connection status indicator
- Automatic reconnection handling

### **Public Transparency Model**
- All community issues visible to everyone
- Admin actions are publicly trackable
- Real-time status updates promote accountability
- Community-wide problem awareness

## 🎨 Design Principles

### **User Experience**
- **Mobile-First**: Responsive design for all devices
- **Intuitive Navigation**: Dashboard → Report → Track progress
- **Visual Feedback**: Clear status indicators and progress tracking
- **Seamless Flow**: No dead ends, always a way back

### **Transparency**
- **Public Access**: All issues visible to community
- **Status Tracking**: Clear progression from pending to resolved
- **Admin Accountability**: Visible admin actions with timestamps

### **Accessibility**
- **Color-coded Status**: Red (Pending), Blue (In Progress), Green (Resolved)
- **Clear Icons**: Intuitive symbols for actions and status
- **Mobile Optimized**: Touch-friendly interface

## 📊 Demo Data

The platform includes 200+ realistic demo issues across major Indian cities:
- **Mumbai** (30 issues) - Financial capital infrastructure
- **Delhi NCR** (35 issues) - Political capital problems
- **Bangalore** (25 issues) - Tech city challenges
- **Chennai** (20 issues) - Coastal city issues
- **+ 8 more cities** with diverse civic problems

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel Dashboard
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 API Integration

### Supabase APIs Used
- **Authentication API** - User signup, login, session management
- **Database API** - CRUD operations on issues and profiles
- **Real-time API** - Live updates via WebSocket connections
- **Storage API** - Photo uploads and management

### Custom Hooks
- `useDashboard` - Issue management and filtering
- `useRealtime` - Real-time subscription handling
- `useAuth` - Authentication state management

## 🎯 Hackathon Impact

### **Technical Achievements**
- ⚡ Real-time updates with Supabase subscriptions
- 🗺️ Advanced mapping with heatmap visualization
- 📱 Mobile-responsive PWA-ready design
- 🔒 Secure authentication with role-based access
- 🏗️ Scalable architecture supporting multiple cities

### **Social Impact**
- 🌍 Promotes civic transparency and accountability
- 👥 Enables community-driven problem solving
- 🏛️ Bridges communication gap between citizens and government
- 📊 Provides data-driven insights for urban planning

### **Innovation**
- 🔥 Interactive heatmaps for problem density visualization
- ⚡ Real-time collaboration between citizens and officials
- 🌐 Public transparency model for community engagement
- 📱 Mobile-first approach for widespread accessibility

## 🏆 Awards Potential

### **Categories**
- **Best Use of Technology** - Real-time features, modern React stack
- **Social Impact** - Civic engagement and transparency
- **Best UI/UX** - Mobile-first, intuitive design
- **Most Practical** - Addresses real-world civic problems
- **People's Choice** - Community-focused solution

## 📈 Future Enhancements

### **Phase 1** (Next Sprint)
- [ ] Push notifications for status updates
- [ ] Enhanced photo management with compression
- [ ] Advanced search and filtering options
- [ ] Issue priority levels

### **Phase 2** (Long Term)
- [ ] Multi-language support for diverse communities
- [ ] Integration with government systems
- [ ] Citizen voting on issue importance
- [ ] Advanced analytics and reporting dashboard
- [ ] Mobile app (React Native)

### **Phase 3** (Scale)
- [ ] Multi-city deployment
- [ ] Department-wise issue routing
- [ ] Performance optimization for 10,000+ issues
- [ ] AI-powered issue categorization
- [ ] Predictive maintenance insights

## 🐛 Known Limitations

- **Photo Size**: 5MB upload limit
- **Heatmap Performance**: Optimization needed for 1000+ concurrent issues
- **Network**: Real-time may disconnect on poor connections
- **Browser Support**: IE not supported (modern browsers only)

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/GunagyeJain/Road-Report/issues)
- **Email**: gunagye.jain@gmail.com
- **Documentation**: [Detailed project wiki](https://github.com/GunagyeJain/Road-Report/wiki)

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Test on mobile devices
- Ensure responsive design
- Update documentation for new features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team** - Excellent Backend-as-a-Service platform
- **Leaflet Community** - Amazing mapping libraries
- **React Team** - Outstanding developer experience
- **OpenStreetMap** - Free, editable map data
- **Indian Metropolitan Cities** - Inspiration for real civic challenges

---

**🌟 Built with passion for digital civic engagement and community transparency! 🌟**

**⭐ If this project helps your community, please give it a star! ⭐**

---

### 🎬 Demo Script for Judges

1. **Landing**: "Welcome to CivicReport - transparent civic issue management"
2. **Community View**: "Everyone can see all reported issues - full transparency"
3. **Issue Reporting**: "Citizens report with photo + GPS in seconds"
4. **Real-time Demo**: "Watch status changes update live across all users"
5. **Map Visualization**: "Heatmap shows problem density - perfect for urban planning"
6. **Admin Powers**: "Government officials can manage and resolve issues efficiently"

**🏆 Ready for hackathon success! 🏆**
