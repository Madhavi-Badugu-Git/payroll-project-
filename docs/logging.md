# Winston Logging Configuration

This application uses Winston for comprehensive logging with the following
features:

## 📋 Log Levels

- **error**: Critical errors that require immediate attention
- **warn**: Warning messages for potential issues
- **info**: General application information
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information

## 🎯 Logging Targets

### Console Logging

- **Development**: Enabled by default with colored output
- **Production**: Disabled by default, can be enabled with `LOG_TO_CONSOLE=true`

### File Logging

- **Development**: Disabled by default, can be enabled with `LOG_TO_FILES=true`
- **Production**: Enabled by default

## 📁 Log Files

Logs are stored in the `/logs` directory:

- **`app-YYYY-MM-DD.log`**: All application logs
- **`error-YYYY-MM-DD.log`**: Error logs only

### File Rotation

- **Max File Size**: 20MB
- **Retention**: 14 days
- **Compression**: Older files are automatically gzipped

## 🔧 Configuration

### Environment Variables

```bash
NODE_ENV=development|production    # Determines default log level and targets
LOG_TO_CONSOLE=true|false         # Force console logging
LOG_TO_FILES=true|false           # Force file logging
```

### Log Levels by Environment

- **Development**: `debug` level (all logs)
- **Production**: `warn` level (warn and error only)

## 📝 Usage

### Import the Logger

```typescript
import { logError, logWarn, logInfo, logDebug, logHttp } from '@/lib/logger';
```

### Logging Methods

```typescript
// Error logging with optional error object
logError('Database connection failed', error);

// Warning with metadata
logWarn('Rate limit approaching', { userId, requestCount: 95 });

// Info logging
logInfo('User logged in', { userId, timestamp: new Date() });

// Debug logging
logDebug('Processing user data', { userId, step: 'validation' });

// HTTP request logging
logHttp('GET /api/users', { method: 'GET', statusCode: 200 });
```

## 🚀 Features

### Structured Logging

All logs include:

- Timestamp
- Log level
- Message
- Optional metadata object

### Error Handling

- Automatic error stack trace capture
- Structured error information
- Type-safe error logging

### HTTP Request Logging

- Automatic request/response logging via middleware
- IP address capture
- User agent tracking
- Route classification (public/private)

## 📊 Log Format

### Console Format (Development)

```
2025-06-26 15:30:45:123 info: User logged in
```

### File Format (JSON)

```json
{
  "timestamp": "2025-06-26 15:30:45:123",
  "level": "info",
  "message": "User logged in",
  "userId": "user_123",
  "metadata": { "loginType": "clerk" }
}
```

## 🔍 Monitoring and Analysis

### Log Analysis

- Structured JSON format enables easy parsing
- Searchable by timestamp, level, user ID, etc.
- Compatible with log analysis tools

### Error Tracking

- All errors are automatically logged with stack traces
- Contextual information helps with debugging
- Easy to integrate with monitoring services

## 🛠️ Integration

### API Routes

All API routes automatically log:

- Request details (method, URL, headers)
- Authentication status
- Success/error responses
- Execution time

### Middleware

The application middleware logs:

- All HTTP requests
- Route protection status
- Client information (IP, User-Agent)

## 🔐 Security Considerations

- Sensitive data (passwords, tokens) are never logged
- User IDs are logged for audit trails
- IP addresses are captured for security monitoring
- Request headers are sanitized before logging

## 📋 Best Practices

1. **Use appropriate log levels**: Don't log everything as error
2. **Include context**: Always provide relevant metadata
3. **Avoid sensitive data**: Never log passwords, tokens, or PII
4. **Use structured logging**: Prefer objects over string concatenation
5. **Monitor log volume**: Adjust levels in production to avoid excessive
   logging

## 🚨 Troubleshooting

### Common Issues

1. **Logs not appearing**: Check environment variables and file permissions
2. **Performance impact**: Reduce log level in production
3. **Disk space**: Monitor log file sizes and retention policies

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development
# or
LOG_LEVEL=debug
```
