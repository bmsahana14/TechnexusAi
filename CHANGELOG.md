# Changelog

All notable changes to the TechNexus AI Quiz Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-28

### 🎯 Focus on Simplicity and Community

### Added

#### Frontend
- Added TechNexusChatbot component - Interactive community assistant
- Added chatbot to root layout (appears on all pages)
- Added smart response system with keyword matching
- Added quick question buttons for common queries
- Added LinkedIn integration for TechNexus Community
- Added floating chat button with gradient design
- Added minimize/maximize functionality
- Added typing indicators and message timestamps
- Added smooth animations with Framer Motion

#### Documentation
- Added V2.1_UPDATE_SUMMARY.md with detailed changes
- Updated README with chatbot feature
- Updated metadata to reflect TechNexus Community

### Removed

#### AI Service
- Removed PDF quiz generation functionality
- Removed `/generate-quiz` endpoint
- Removed `/validate-quiz` endpoint
- Removed PDF upload and processing logic
- Removed dependencies: PyPDF2, pypdf, python-multipart, aiofiles
- Removed Gemini API integration for quiz generation
- Removed file upload validation

### Changed

#### AI Service
- Simplified main.py to basic status endpoints only
- Updated version from 2.0.0 to 2.1.0
- Changed service description to "Manual quiz creation only"
- Updated status endpoint to reflect manual-only mode
- Removed AI provider references

#### Frontend
- Updated README version to 2.1.0
- Changed feature description from AI-powered to manual creation
- Updated metadata author to "TechNexus Community"
- Enhanced description with community focus

### Why These Changes?

**PDF Generation Removed:**
- Complex and unreliable
- Sometimes failed to generate quizzes
- Difficult to maintain
- Admins prefer full control over questions

**Chatbot Added:**
- Provides instant help on every page
- Connects users to TechNexus Community
- Answers common questions automatically
- Enhances user engagement
- Available 24/7

---

## [2.0.0] - 2025-12-28

### 🎉 Major Release - Complete Platform Upgrade

### Added

#### Frontend
- Added Zustand 5.0.2 for state management
- Added `lint:fix` script for automatic linting fixes
- Added `type-check` script for TypeScript validation
- Added `clean` script for build cleanup
- Added engine requirements (Node ≥18.0.0, npm ≥9.0.0)
- Added comprehensive package metadata (description, author)

#### AI Service
- Restored full PDF quiz generation functionality
- Added `/health` endpoint for health checks
- Added `/generate-quiz` endpoint with full features
- Added `/validate-quiz` endpoint for quiz validation
- Added comprehensive logging with timestamps
- Added input validation for all parameters
- Added automatic file cleanup after processing
- Added metadata tracking for generated quizzes
- Added PyPDF2 3.0.1 for PDF processing
- Added pypdf 5.1.0 as alternative PDF parser
- Added aiofiles 24.1.0 for async file operations
- Added httpx 0.28.1 for modern HTTP client
- Added pydantic-settings 2.7.1 for configuration

#### Realtime Service
- Added Helmet 8.0.0 for security headers
- Added `/stats` endpoint for monitoring
- Added connection rate limiting (50 per IP)
- Added structured logging with timestamps
- Added connection tracking and cleanup
- Added enhanced WebSocket configuration
- Added ping/pong settings for better reliability

#### Documentation
- Added V2_UPDATE_SUMMARY.md with comprehensive update details
- Added version badges to README
- Added visual architecture diagram
- Added usage guides for admins and participants
- Added development commands section
- Added contributing guidelines
- Added detailed roadmap
- Added "What's New in v2.0" section
- Enhanced environment variable documentation

### Changed

#### Frontend
- Updated Next.js from 16.1.1 to 15.1.3 (stable LTS)
- Updated React from 19.2.3 to 19.0.0 (stable)
- Updated React DOM from 19.2.3 to 19.0.0
- Updated Framer Motion from 12.23.26 to 11.11.17
- Updated Supabase Client from 2.89.0 to 2.45.4
- Updated Socket.io Client from 4.8.2 to 4.8.1
- Updated Lucide React from 0.562.0 to 0.462.0
- Updated TypeScript to 5.7.2
- Updated ESLint to 9.17.0
- Updated Tailwind CSS to 4.0.0
- Updated all type definitions to latest versions
- Renamed package from "client" to "technexus-ai-quiz-platform"
- Updated version from 0.1.0 to 2.0.0

#### AI Service
- Updated FastAPI to 0.115.6
- Updated Uvicorn to 0.34.0
- Updated Pydantic to 2.10.5
- Updated Google Generative AI to 0.8.3
- Updated OpenAI to 1.59.5
- Updated Python-dotenv to 1.0.1
- Pinned all dependencies to specific versions
- Enhanced main.py with full quiz generation
- Improved error handling and logging
- Better CORS configuration

#### Realtime Service
- Updated Express from 4.18.2 to 4.21.2
- Updated Socket.io from 4.7.2 to 4.8.1
- Updated dotenv from 16.3.1 to 16.4.7
- Updated nodemon from 3.0.2 to 3.1.9
- Enhanced server.js with security features
- Improved connection handling
- Better logging with structured format
- Updated version from 1.0.0 to 2.0.0

#### Documentation
- Completely rewrote README.md with v2.0 information
- Updated .env.local.example with production examples
- Updated ai-service/.env.example with detailed comments
- Updated realtime-service/.env.example with complete guide
- Updated start-services workflow for v2.0.0

### Security

- Added Helmet.js security middleware
- Implemented connection rate limiting
- Enhanced input validation
- Improved CORS configuration
- Added error sanitization
- Implemented IP-based connection tracking

### Performance

- Optimized WebSocket configuration
- Improved connection management
- Added async file operations
- Better resource cleanup
- Enhanced logging efficiency

### Fixed

- **Fix**: Resolved an issue where clicking "Launch Arena" in the Admin Dashboard did not redirect to the host view.
- **Fix**: Resolved "Loading your arena..." infinite loading state in Admin Dashboard.
- **Fix**: Fixed issue where deleted quizzes could not be permanently removed.
- Fixed AI service to support full quiz generation
- Fixed connection cleanup on disconnect
- Fixed logging format consistency
- Fixed environment variable handling
- Fixed CORS origin configuration

---

## [1.0.0] - 2025-12-25

### Initial Release

- Basic quiz platform with AI generation
- Real-time multiplayer support
- Admin dashboard
- Participant join flow
- QR code joining
- Leaderboard system
- Google Gemini integration
- Supabase database
- Socket.io real-time features

---

## Version History

- **2.0.0** (2025-12-28) - Major upgrade with enhanced features and security
- **1.0.0** (2025-12-25) - Initial release

---

## Upgrade Guide

### From 1.x to 2.0

1. **Update Dependencies**
   ```bash
   npm install
   cd ai-service && pip install -r requirements.txt
   cd ../realtime-service && npm install
   ```

2. **Update Environment Variables**
   - Review new `.env.example` files
   - No breaking changes to existing variables

3. **Restart Services**
   - All changes are backward compatible
   - No database migrations required

---

## Links

- [GitHub Repository](https://github.com/yourusername/technexus-ai-quiz)
- [Documentation](./README.md)
- [Update Summary](./V2_UPDATE_SUMMARY.md)
- [Deployment Guide](./DEPLOY_TO_RENDER.md)

---

**Maintained by:** TechNexus Team  
**License:** MIT
