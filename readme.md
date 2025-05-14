# logstyx-js-core

logstyx-js-core is a core SDK for logging in JavaScript applications. It provides a simple and efficient way to send logs to the Logstyx logging platform, allowing developers to manage log levels and contexts effectively.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
  
## Features

- Send structured logs at different levels (info, warning, error, critical).
- Contextual logging with the ability to set and clear contexts.
- Payload sanitization to ensure valid log entries.

## Installation

To install the SDK, run:

```bash
npm install github:devatlogstyx/logstyx-js-core
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

## API Reference

### `useLogstyx(options)`

Initializes the logger instance.

#### Parameters

- `options`: An object containing the following properties:
  - `projectId`: The unique identifier for your project (required).
  - `apiKey`: Your API key for authentication (required for server).
  - `appid`: Application ID, required for mobile apps (required for mobile apps).
  - `endpoint`: API endpoint to send logs to (default: "https://api.logstyx.com/v1/logs").
  - `device`: Identifier for the device sending the logs (optional).
  - `signatureFunc`: A function to provide a signature for secure logging (required for server).

### Logger Methods

- `info(data)`: Sends an information log.
- `warning(data)`: Sends a warning log.
- `error(data)`: Sends an error log.
- `critical(data)`: Sends a critical log.
- `send(level, data)`: Send a log with the specified level and data.
- `setContext(ctx)`: Set additional context for logging.
- `clearContext(keys)`: Clear specified context keys or all context.

## Contributing

Contributions are welcome! Please create a pull request or raise an issue if you find a bug or have a feature request.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.