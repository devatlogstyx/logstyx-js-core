//@ts-check

const { sanitizeObject, normalizeArgs } = require("../helper/function");

exports.useLogstyx = (options) => {
    let {
        projectId,
        apiKey,
        appid, //required if its from mobile apps
        endpoint,
        device,
        sendFunc,
        signatureFunc,
        maxLogInQueue = 12,
        onError,
    } = options;

    if (typeof sendFunc !== 'function') {
        sendFunc = fetch;
    }

    const queue = [];
    let isProcessing = false;
    let consecutiveFailures = 0;
    let processingTimer = null;

    let sharedContext = {
        appid
    };

    function setContext(ctx) {
        sharedContext = { ...sharedContext, ...ctx };
    }

    function clearContext(keys) {
        if (Array.isArray(keys)) {
            for (const key of keys) delete sharedContext[key];
        } else {
            sharedContext = {};
        }
    }

    function handleError(error, context) {
        // Silent by default, but allow monitoring via callback
        if (typeof onError === 'function') {
            try {
                onError(error, context);
            } catch (e) {
                // console.error(e)
            }
        }
    }

    function scheduleQueueProcessing() {
        // Don't schedule if already processing or timer already pending
        if (isProcessing || processingTimer) {
            return;
        }

        // Only schedule if there's work to do
        if (queue.length > 0) {
            const delay = Math.min(
                1000 * Math.pow(2, consecutiveFailures),
                30000
            );
            processingTimer = setTimeout(processQueue, delay);
        }
    }

    async function processQueue() {
        if (processingTimer) {
            clearTimeout(processingTimer);
            processingTimer = null;
        }

        if (isProcessing || queue.length === 0) {
            return;
        }

        isProcessing = true;

        try {
            const { level, data } = queue[0];
            await send(level, data, true);

            // Success - remove from queue and reset failure counter
            queue.shift();
            consecutiveFailures = 0;

        } catch (e) {
            consecutiveFailures++;

            // Put failed log back at the end of the queue
            const failedLog = queue.shift();
            queue.push(failedLog);

            handleError(e, {
                level: failedLog.level,
                queueLength: queue.length,
                consecutiveFailures
            });
        } finally {
            isProcessing = false;
        }

        // Schedule next processing if queue still has items
        scheduleQueueProcessing();
    }

    async function send(level, data = {}, fromQueue = false) {
        try {
            const payload = sanitizeObject({
                level,
                projectId,
                appid,
                device,
                context: sanitizeObject(sharedContext),
                data: sanitizeObject(normalizeArgs(data))
            });

            let headers = { "Content-Type": "application/json" };

            if (typeof signatureFunc === "function") {
                const { timestamp, signature } = signatureFunc(projectId, apiKey, payload);
                headers.signature = signature;
                headers.timestamp = timestamp;
            }

            const res = await sendFunc(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers
            });

            return res;

        } catch (e) {
            if (fromQueue) {
                throw e;
            }

            // Check if queue is full
            if (queue.length >= maxLogInQueue) {
                const dropped = queue.shift();
                handleError(
                    new Error('Queue full, dropping oldest log'),
                    { dropped }
                );
            }

            // Add to queue
            queue.push({
                level,
                data
            });

            // Schedule processing
            scheduleQueueProcessing();
        }
    }

    return {
        info: (data) => send("INFO", data),
        warning: (data) => send("WARNING", data),
        error: (data) => send("ERROR", data),
        critical: (data) => send("CRITICAL", data),
        send,
        setContext,
        clearContext,
        getQueueLength: () => queue.length,
    };
};