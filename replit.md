# Overview

Mypet is a full-stack social media platform for pet lovers, built as a modern web application that combines social networking features with pet-specific functionality like lost/found pet reporting and location-based services. The platform allows users to create profiles for their pets, share photos and videos, interact with other pet owners, and help reunite lost pets with their families through an integrated mapping system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom brand color palette (green, yellow, azure theme)
- **State Management**: TanStack React Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing with protected routes
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based auth provider with session management

## Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: Node.js crypto module with scrypt for secure password hashing
- **File Upload**: Multer middleware for handling image/video uploads
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

## Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL instance
- **Schema**: Well-defined table structure with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Core Data Models
- **Users**: Profiles with roles (USER, VET, SHOP, SHELTER, ADMIN), location data, and preferences
- **Animals**: Pet profiles with species, breed, age, bio, and avatar images
- **Posts**: Content sharing with media attachments, captions, and status (NORMAL, LOST, FOUND)
- **Social Features**: Comments, likes, follows, and user interactions
- **Location Services**: Latitude/longitude coordinates for lost/found pet mapping

## File Storage Strategy
- **Current Implementation**: Local file system storage using Multer
- **Architecture Pattern**: Abstracted media storage service with adapter pattern
- **Future Scalability**: Ready for migration to cloud storage (Cloudinary, Supabase, etc.)
- **File Types**: Support for images and videos with size limits and type validation

## Authentication & Security
- **Session Management**: HTTP-only cookies with secure settings for production
- **Password Policy**: Minimum 8 character requirement with secure hashing
- **Route Protection**: Middleware-based authentication checking for protected endpoints
- **Role-Based Access**: User role system for different permission levels

## Frontend Components & UI
- **Design System**: Consistent component library with proper TypeScript interfaces
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Interactive Maps**: Leaflet integration for lost/found pet location services
- **Real-time Features**: Query invalidation for instant UI updates after mutations
- **Form Handling**: Comprehensive form validation with user feedback

## Development & Deployment
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation  
- **Development Tools**: Hot reload, TypeScript checking, and error overlays
- **Code Organization**: Monorepo structure with shared schema and types
- **Environment Configuration**: Separate development and production configurations

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database client and migration tool
- **File System**: Local storage for media files (development/MVP phase)

## Authentication
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management with PostgreSQL store
- **connect-pg-simple**: PostgreSQL session store adapter

## UI & Frontend Libraries  
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Wouter**: Lightweight routing library

## Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking and enhanced developer experience
- **ESLint**: Code linting and formatting standards

## Mapping Services
- **Leaflet**: Interactive maps for location-based features
- **OpenStreetMap**: Map tile provider for the mapping functionality

## Media Processing
- **Multer**: File upload handling middleware
- **File Type Validation**: Built-in support for image and video file types