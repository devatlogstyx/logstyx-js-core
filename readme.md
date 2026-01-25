# logstyx-js-core

logstyx-js-core is a core SDK for logging in JavaScript applications. It provides a simple and efficient way to send logs to the [Logstyx](https://github.com/devatlogstyx/logstyx) logging platform, allowing developers to manage log levels and contexts effectively with built-in resilience and retry mechanisms.

## For End Users

**Note:** This is the core SDK used by framework-specific packages. Unless you're building a custom integration, you probably want one of these instead:

- **React**: [logstyx-js-react](https://github.com/devatlogstyx/logstyx-js-react)
- **React Native**: [logstyx-js-react-native](https://github.com/devatlogstyx/logstyx-js-react-native)
- **Node.js**: [logstyx-js-node](https://github.com/devatlogstyx/logstyx-js-node)
- **Browser**: [logstyx-js-browser](https://github.com/devatlogstyx/logstyx-js-browser)

These packages provide framework-specific features and better developer experience.

## Self-Hosting

Logstyx can be self-hosted! Check out the [logstyx backend repository](https://github.com/devatlogstyx/logstyx) to deploy your own instance.

When using a self-hosted instance, make sure to set the `endpoint` option to your deployment URL:
```javascript
const logger = useLogstyx({
    projectId: 'your_project_id',
    endpoint: 'https://your-domain.com/api/v1/logs', // Your self-hosted instance
});
```

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Resilience Features](#resilience-features)
- [Contributing](#contributing)
- [License](#license)
  
## Features

- Send structured logs at different levels (info, warning, error, critical)
- Contextual logging with the ability to set and clear contexts
- Payload sanitization to ensure usable log entries
- **Automatic retry with exponential backoff** for failed requests
- **Queue-based delivery** to prevent log loss during network issues
- **Configurable error handling** for monitoring and alerting
- **Custom send functions** for specialized network requirements

## Installation

To install the latest version of the SDK, run:

```bash
npm install github:devatlogstyx/logstyx-js-core#release
```

## Usage

Here's a basic example of how to use the logstyx-js-core in your project:

```javascript
const { useLogstyx } = require('logstyx-js-core');

const logger = useLogstyx({
    projectId: 'your_project_id',
});

// Send an info log
logger.info({ message: "This is an info log!" });

// Send a warning log
logger.warning({ message: "This is a warning log!" });

// Send an error log
logger.error({ message: "This is an error log!" });
```

### Advanced Usage with Error Handling

```javascript
const logger = useLogstyx({
    projectId: 'your_project_id',
    endpoint: 'https://your-domain.com/api/v1/logs',
    maxLogInQueue: 20,
    maxRetries: 3,
    onError: (error, context) => {
        console.error('Logging error:', error.message);
        console.log('Context:', context);
        // Send to your monitoring system
    }
});

// Check queue status
console.log('Pending logs:', logger.getQueueLength());
```

## API Reference

### `useLogstyx(options)`

Initializes the logger instance.

#### Parameters

- `options`: An object containing the following properties:
  - `projectId`: The unique identifier for your project (required)
  - `apiKey`: Your API key for authentication (required for server)
  - `appid`: Application ID, required for mobile apps (required for mobile apps)
  - `endpoint`: API endpoint to send logs to. Use your deployed instance URL (e.g., `https://your-domain.com/api/v1/logs`)
  - `device`: Identifier for the device sending the logs (optional)
  - `signatureFunc`: A function to provide a signature for secure logging (required for server)
  - `sendFunc`: Custom function for sending HTTP requests (optional, defaults to `fetch`)
  - `maxLogInQueue`: Maximum number of logs to queue when offline (optional, default: 12)
  - `onError`: Callback function for error monitoring (optional)

### Logger Methods

- `info(data)`: Sends an information log
- `warning(data)`: Sends a warning log
- `error(data)`: Sends an error log
- `critical(data)`: Sends a critical log
- `send(level, data)`: Send a log with the specified level and data
- `setContext(ctx)`: Set additional context for logging
- `clearContext(keys)`: Clear specified context keys or all context
- `getQueueLength()`: Returns the number of logs currently queued for retry

## Resilience Features

### Automatic Retry Mechanism

The SDK automatically retries failed log requests with exponential backoff:

- **Retry delays**: 1s, 2s, 4s, 8s, 16s, up to 30s maximum
- **Configurable retries**: Set `maxRetries` to control retry attempts
- **Queue management**: Failed logs are queued and processed automatically

### Queue-Based Delivery

When network requests fail, logs are queued and delivered later:

```javascript
const logger = useLogstyx({
    projectId: 'your_project_id',
    maxLogInQueue: 50, // Hold up to 50 failed logs
});

// Logs are queued automatically on failure
logger.error({ event: 'payment_failed' });

// Check queue status
if (logger.getQueueLength() > 10) {
    console.warn('Many logs pending delivery');
}
```

### Error Handling

Monitor logging failures with the `onError` callback:

```javascript
const logger = useLogstyx({
    projectId: 'your_project_id',
    onError: (error, context) => {
        // error: The error that occurred
        // context: Additional information (level, data, queueLength, etc.)
    }
});
```

### Custom Send Function

For specialized network requirements or testing:

```javascript
const logger = useLogstyx({
    projectId: 'your_project_id',
    sendFunc: async (url, options) => {
        // Custom HTTP client
        return await myCustomHttpClient.post(url, options);
    }
});
```

### Behavior Notes

- **Silent by default**: The SDK doesn't throw errors or log to console unless `onError` is configured
- **Oldest logs dropped first**: When queue is full, the oldest pending log is dropped
- **Non-blocking**: Log methods return immediately; delivery happens asynchronously
- **Queue processing**: Queued logs are processed serially

## Contributing

Contributions are welcome! Please create a pull request or raise an issue if you find a bug or have a feature request.