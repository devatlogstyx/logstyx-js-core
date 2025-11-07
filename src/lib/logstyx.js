//@ts-check

const { sanitizeObject, normalizeArgs } = require("../helper/function");
exports.useLogstyx = (options) => {
    let {
        projectId,
        apiKey,
        appid,//required if its from mobile apps
        endpoint = "https://api.logstyx.com/v1/logs",
        device,
        sendFunc,
        signatureFunc,
    } = options;

    if (typeof sendFunc !== 'function') {
        sendFunc = fetch
    }

    let sharedContext = sanitizeObject({
        appid
    })

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

    async function send(level, data = {}) {
        try {
            const payload = sanitizeObject({
                level,
                projectId,
                device,
                context: sanitizeObject(sharedContext),
                data: sanitizeObject(normalizeArgs(data))
            });

            let headers = { "Content-Type": "application/json" }

            if (typeof signatureFunc === "function") {
                const { timestamp, signature } = signatureFunc(projectId, apiKey, payload)
                headers.signature = signature
                headers.timestamp = timestamp
            }

            return sendFunc(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers
            })
        } catch (e) {
            console.error(e)
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
    };
}
