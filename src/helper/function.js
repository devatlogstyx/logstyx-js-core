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

exports.normalizeArgs = (input) => {
    const MAX_DEPTH = 2;
    const MAX_STRING_LENGTH = 500;

    const safeClone = (value, depth = 0, seen = new WeakSet()) => {
        if (value === null || typeof value !== 'object') {
            if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
                return value.substring(0, MAX_STRING_LENGTH) + '... (truncated)';
            }
            return value;
        }

        if (depth >= MAX_DEPTH) {
            return '[Max depth reached]';
        }

        if (seen.has(value)) {
            return '[Circular]';
        }

        seen.add(value);

        if (Array.isArray(value)) {
            return value.slice(0, 10).map(item => safeClone(item, depth + 1, seen));
        }

        const cloned = {};
        for (const key in value) {
            // Skip properties starting with underscore
            if (key.startsWith('_')) continue;

            if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] !== 'function') {
                cloned[key] = safeClone(value[key], depth + 1, seen);
            }
        }
        return cloned;
    };

    if (input instanceof Error) {
        const errorObj = {
            title: input.name ?? input?.constructor?.name,
            message: input.message,
            stack: input.stack || null
        };

        const seen = new WeakSet();

        Object.keys(input).forEach(key => {
            if (!errorObj[key] && typeof input[key] !== 'function') {
                errorObj[key] = safeClone(input[key], 0, seen);
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