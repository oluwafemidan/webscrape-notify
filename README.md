# Notification Service Telegram Bot

A NodeJS Application that monitors a website for changes, scrap webpage and sends notifications via Telegram when updates are detected.

## Features

- Monitors a webpage for new entries
- Sends notifications via Telegram when changes are detected
- RESTful API for managing subscriptions and monitoring status
- Configurable check intervals
- In-memory storage for simplicity

## Prerequisites

- Node.js 16.x or higher

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd website-monitor-notification
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration.

## Usage

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

## License

MIT
