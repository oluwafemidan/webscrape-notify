# Job Alert Notification Service - Complete Functionality Overview

## Project Overview
A web scraping-based notification system that monitors job websites for new postings and sends alerts via Telegram. Currently focused on Tripura job alerts.

## Core Architecture & Dependencies

### Current Tech Stack:
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Web Scraping**: Cheerio + Axios
- **Scheduling**: node-cron
- **Logging**: Winston
- **Telegram**: node-telegram-bot-api
- **Environment**: dotenv
- **Security**: helmet, cors

## Database Models

### 1. ExtractedData Model (`src/models/extractedData.js`)
```javascript
{
  id: String (unique) // For deduplication
  title: String (required)
  link: String
  createdAt: Date (default: now)
}
```

### 2. Subscriber Model (`src/models/subscriber.js`)
```javascript
{
  chatId: String (unique, required) // Telegram chat ID
  firstName: String (required)
  subscribedAt: Date (default: now)
}
```

## Core Features & Services

### 1. Web Scraping Service (`src/services/scrapingService.js`)
- **Purpose**: Fetches webpage content using Axios
- **Key Functions**:
  - `fetchWebpage(targetUrl)`: Validates URL and fetches HTML content
  - Error handling for non-200 responses
  - Logging for debugging

### 2. Monitoring Service (`src/services/monitoringService.js`)
- **Purpose**: Core business logic for monitoring websites
- **Key Features**:
  - Scheduled monitoring with configurable intervals
  - In-memory state management for monitoring status
  - Change detection by comparing current vs previous data
  - Statistics tracking (total checks, successful, failed, with changes)

**Key Functions**:
- `startMonitoringService()`: Initializes scheduled monitoring
- `performCheck(isManual)`: Performs website check and comparison
- `findNewRows()`: Detects new content by comparing IDs
- `notifySubscribersAboutChanges()`: Triggers notifications for new content
- `getMonitoringState()`: Returns current monitoring statistics

### 3. Telegram Service (`src/features/telegram/engine.js`)
- **Purpose**: Complete Telegram bot integration
- **Bot Commands**:
  - `/start`: Welcome message and bot introduction
  - `/subscribe`: Subscribe to job notifications
  - `/unsubscribe`: Unsubscribe from notifications
  - `/status`: Check subscription status
  - `/help`: Show available commands

**Key Functions**:
- `initializeTelegramBot()`: Initialize bot with polling
- `addSubscriberById()`: Add new subscriber to database
- `removeSubscriberById()`: Remove subscriber from database
- `notifyAllSubscribers()`: Broadcast message to all subscribers
- `notifyOnlyToTester()`: Send message only to test user
- `escapeMarkdown()`: Escape special characters for Telegram

### 4. Data Extraction System
**Base Architecture** (`src/core/scrapper/`):
- `BaseExtractor`: Abstract base class for extractors
- `extractorManager.js`: Factory pattern for managing extractors
- `HomePageExtractor`: Extracts job notifications from home page using CSS selectors

**Extraction Logic**:
- Uses Cheerio for HTML parsing
- Extracts title and link from `.news-box` elements
- Handles relative URLs conversion
- Generates unique IDs for deduplication

## API Endpoints

### Health & Testing
- `GET /api/health`: Health check endpoint
- `GET /api/test-external-api`: Test external API connectivity
- `GET /test`: Basic test endpoint

### Monitoring Management
- `GET /api/monitoring/status`: Get current monitoring state
- `POST /api/monitoring/check`: Trigger manual website check

### Telegram Management (Admin endpoints)
- `GET /api/telegram/subscribers`: Get all subscribers
- `POST /api/telegram/subscribers`: Add subscriber manually
- `DELETE /api/telegram/subscribers/:chatId`: Remove subscriber
- `POST /api/telegram/subscirbers/ping`: Ping all subscribers

## Core Components

### 1. Scheduling System (`src/core/schedule/schedule.js`)
- Configurable cron jobs with timezone support
- Functions for seconds, minutes, hours scheduling
- Job management (start, stop, cleanup)
- Environment-based enabling/disabling

### 2. Database Setup (`src/core/db/setup.js`)
- MongoDB connection management
- Connection error handling

### 3. Logging System (`src/core/logger/logger.js`)
- Winston-based logging
- Multiple log levels support
- File and console output

### 4. Error Handling (`src/core/exception/errorHandler.js`)
- Custom ApiError class
- Global error handling middleware
- Async wrapper for route handlers

## Environment Configuration

### Required Environment Variables:
- `TELEGRAM_BOT_TOKEN`: Telegram bot authentication
- `MONGODB_URI`: Database connection string
- `HOME_PAGE_URL`: Target website URL to monitor
- `BASE_URL`: Base URL for relative link resolution
- `CHECK_INTERVAL_MINUTES`: Monitoring frequency (default: 15)
- `SCHEDULING_ENABLED`: Enable/disable cron jobs
- `BRODCAST_TELEGRAM_MESSAGE`: Enable/disable telegram broadcasting
- `TESTER_CHAT_ID`: Test user chat ID
- `MAX_ROWS_TO_PARSE`: Limit for parsing performance
- `MAX_ROWS_TO_SEND_NOTIFICATION`: Limit for notification content

## Business Logic Flow

### 1. Startup Process:
- Connect to MongoDB
- Initialize Express app with middleware
- Setup Telegram bot with command handlers
- Start monitoring service with scheduled checks

### 2. Monitoring Cycle:
- Fetch target webpage HTML
- Extract job notifications using CSS selectors
- Compare with previously stored data
- Identify new job postings
- Store new data in database
- Send Telegram notifications to subscribers

### 3. Telegram Bot Interaction:
- Users discover bot and use `/start` command
- Users subscribe with `/subscribe` command
- Bot stores subscriber information in database
- When new jobs are found, bot sends formatted messages
- Users can unsubscribe or check status anytime

## Key Features for NestJS Migration

1. **Modular Architecture**: Already well-structured with separate services
2. **Database Integration**: Mongoose models easily convertible to TypeScript
3. **Scheduled Tasks**: Cron jobs for automated monitoring
4. **External API Integration**: Telegram bot API and web scraping
5. **Error Handling**: Centralized error management
6. **Environment Configuration**: Comprehensive config management
7. **Logging**: Structured logging system
8. **RESTful API**: Standard Express routes convertible to NestJS controllers

## Migration Considerations

### 1. TypeScript Conversion
- All models, services, and controllers need TypeScript interfaces
- Define proper types for all data structures
- Use strict typing for better development experience

### 2. Dependency Injection
- Utilize NestJS DI container
- Convert all services to use @Injectable() decorator
- Proper constructor injection

### 3. Module System
- Organize into feature modules:
  - `TelegramModule`: Bot functionality and subscriber management
  - `MonitoringModule`: Web scraping and monitoring logic
  - `ScrapingModule`: Data extraction services
  - `DatabaseModule`: Models and database configuration

### 4. Configuration Management
- Use NestJS ConfigModule
- Environment validation with class-validator
- Type-safe configuration objects

### 5. Scheduling
- Use NestJS Schedule module (`@nestjs/schedule`)
- Convert cron jobs to @Cron() decorators
- Proper task management

### 6. Database Integration
- Use NestJS Mongoose integration (`@nestjs/mongoose`)
- Convert models to TypeScript schemas
- Proper repository pattern

### 7. Guards & Interceptors
- Replace middleware with NestJS equivalents
- Implement proper authentication guards
- Request/response interceptors

### 8. Exception Filters
- Convert error handling to NestJS exception filters
- Global exception handling
- Custom exception classes

## File Structure Analysis

```
src/
├── constants/           # Application constants
├── controllers/         # Express route controllers
├── core/               # Core functionality
│   ├── db/             # Database connection
│   ├── exception/      # Error handling
│   ├── logger/         # Logging system
│   ├── schedule/       # Cron job management
│   └── scrapper/       # Web scraping base classes
├── features/           # Feature modules
│   ├── homepage/       # Home page extraction
│   ├── notification/   # Notification logic
│   ├── resultpage/     # Result page extraction
│   └── telegram/       # Telegram bot integration
├── middleware/         # Express middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic services
└── utils/              # Utility functions
```

## NestJS Recommended Structure

```
src/
├── app.module.ts       # Root module
├── main.ts            # Application bootstrap
├── config/            # Configuration modules
├── common/            # Shared utilities, guards, interceptors
├── database/          # Database configuration and models
├── modules/           # Feature modules
│   ├── telegram/      # Telegram bot module
│   ├── monitoring/    # Monitoring module
│   ├── scraping/      # Web scraping module
│   └── subscribers/   # Subscriber management
├── shared/            # Shared services and utilities
└── types/             # TypeScript type definitions
```

This system is a complete job alert notification service with web scraping, database management, scheduled monitoring, and Telegram bot integration - well-suited for conversion to a modern NestJS TypeScript application.