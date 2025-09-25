# Implement Custom Error Logic

While the data processing pipeline has default mechanisms for handling errors, you'll often need to implement your own logic to fit your application's specific needs, such as sending alerts, logging to an external service, or implementing retry policies. This guide will walk you through how to extend the default error handlers for invalid data and save failures.

For a conceptual overview of how errors are managed in the pipeline, please see the [Error Handling](./core-concepts-error-handling.md) documentation.

```d2
direction: down

start: {
shape: oval
label: "Start Pipeline"
}

processData: "processData()"
validateData: "validateData()"
is-data-valid: {
label: "Data Valid?"
shape: diamond
}

# Invalid data flow
handleInvalidData: "handleInvalidData()"
log-validation-error: "Log Descriptive Error"
send-to-logging-service: {
label: "Send to Logging Service\n(Optional)"
style: {
stroke-dash: 2
}
}
discard-batch: "Discard Batch"

# Save flow
saveData: "saveData(attempt)"
is-save-successful: {
label: "Save Successful?"
shape: diamond
}

# Save error flow
handleSaveError: "handleSaveError(attempt)"
is-retry-possible: {
label: "attempt < MAX_RETRIES?"
shape: diamond
}
log-retry-warning: "Log Warning & Wait"
log-critical-error: "Log Critical Error"
send-critical-alert: {
label: "Send Critical Alert\n(Optional)"
style: {
stroke-dash: 2
}
}
abort: "Abort"

end: {
shape: oval
label: "End"
}

# Main Flow
start -> processData
processData -> validateData
validateData -> is-data-valid

# Branching from validation
is-data-valid -> saveData: "Yes"
is-data-valid -> handleInvalidData: "No"

# Invalid Data Path
handleInvalidData -> log-validation-error
log-validation-error -> send-to-logging-service
send-to-logging-service -> discard-batch
discard-batch -> end

# Save Path
saveData -> is-save-successful
is-save-successful -> end: "Yes"
is-save-successful -> handleSaveError: "No"

# Save Error / Retry Path
handleSaveError -> is-retry-possible
is-retry-possible -> log-retry-warning: "Yes"
log-retry-warning -> saveData: "Retry"

# Final Failure Path
is-retry-possible -> log-critical-error: "No"
log-critical-error -> send-critical-alert
send-critical-alert -> abort
abort -> end
```

## Understanding the Default Handlers

By default, the pipeline includes two key functions for error handling: `handleInvalidData()` and `handleSaveError()`. Their initial implementation simply logs a message to the console.

```javascript Default Error Handlers icon=logos:javascript
// Called when validateData() returns false
function handleInvalidData() {
console.log("处理无效数据");
// Here you can add remedial measures
}

// Called when saveData() fails
function handleSaveError() {
console.log("保存失败，进行错误处理");
}
```

Let's replace these with more robust, custom implementations.

## Handling Invalid Data

The `handleInvalidData` function is triggered when the `validateData` function returns `false`. This is the perfect place to add logic for logging validation failures, notifying an administrator, or cleaning up temporary resources.

In this example, we'll modify `handleInvalidData` to log a more descriptive error message.

### Custom Implementation

```javascript Custom Invalid Data Handler icon=logos:javascript
// Custom logic for handling invalid data
function handleInvalidData() {
const timestamp = new Date().toISOString();
console.error(`[${timestamp}] ERROR: Data validation failed. Discarding batch.`);
// In a real-world scenario, you might send this to a logging service:
// logToExternalService('Data validation failed', { timestamp });
}
```

This revised function now provides a timestamped, more explicit error message, which is much more useful for debugging and monitoring.

## Handling Save Errors

The `handleSaveError` function is called when the `saveData` function fails. A common requirement for this scenario is to implement a retry mechanism. For example, the save operation might fail due to a temporary network issue or a brief database lock.

Let's implement a simple retry logic within `handleSaveError`.

### Custom Implementation

For this example, we'll modify the `saveData` function slightly to accept a retry count and update `handleSaveError` to manage the retries.

```javascript Custom Save Error Handler with Retries icon=logos:javascript
const MAX_RETRIES = 3;

// The main processing function now initiates the save with a retry counter
function processData() {
console.log("处理数据");
// Start the save process with the initial attempt number
saveData(1);
}

// Modified saveData to accept an attempt number
function saveData(attempt) {
console.log(`保存数据 (Attempt ${attempt})...`);
// Randomly decide if the save is successful
const success = Math.random() > 0.2;
if (!success) {
handleSaveError(attempt);
}
}

// Custom logic for handling save failures with retries
function handleSaveError(attempt) {
if (attempt < MAX_RETRIES) {
const nextAttempt = attempt + 1;
console.warn(`保存失败，将在2秒后重试... (Attempt ${nextAttempt})`);
// Using setTimeout to simulate a delay before retrying
setTimeout(() => saveData(nextAttempt), 2000);
} else {
const timestamp = new Date().toISOString();
console.error(`[${timestamp}] CRITICAL: Save operation failed after ${MAX_RETRIES} attempts. Aborting.`);
// In a real-world scenario, you might trigger a critical alert here:
// sendAlert('Save operation failed permanently');
}
}
```

In this implementation, `handleSaveError` now checks if the number of attempts has exceeded the maximum limit. If not, it waits two seconds and then calls `saveData` again. If all retries fail, it logs a critical error.

---

By following these examples, you can replace the default stubs with meaningful error-handling logic that makes your data processing pipeline more resilient and observable. For more details on the individual functions, please refer to the [API Reference](./api-reference-functions.md).