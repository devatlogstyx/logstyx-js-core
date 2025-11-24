//@ts-check
exports.sanitizeObject = (params) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0) && // Exclude empty arrays
            !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0 && value.constructor === Object) // Exclude empty plain objects
        ) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

const safeClone = (value) => {
    if (value === null || typeof value !== 'object') {
        return value;
    }

    if (seen.has(value)) {
        return '[Circular]';
    }

    seen.add(value);

    if (Array.isArray(value)) {
        return value.map(item => safeClone(item));
    }

    const cloned = {};
    for (const key in value) {
        if (value.hasOwnProperty(key) && typeof value[key] !== 'function') {
            cloned[key] = safeClone(value[key]);
        }
    }
    return cloned;
};

exports.normalizeArgs = (input) => {
    if (input instanceof Error) {
        const errorObj = {
            name: input.name,
            message: input.message,
            stack: input.stack || null
        };

        // Track seen objects to detect circular references
        const seen = new WeakSet();



        // Capture any other custom properties on the error
        Object.keys(input).forEach(key => {
            if (!errorObj[key] && typeof input[key] !== 'function') {
                errorObj[key] = safeClone(input[key]);
            }
        });

        return errorObj;
    }

    if (input === null || input === undefined) {
        return { message: String(input) };
    }

    if (Array.isArray(input)) {
        return { message: JSON.stringify(input) };
    }

    if (typeof input === "object") {
        return input;
    }

    return { message: String(input) };
};