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
    if (input instanceof Error) {
        return {
            title: input.name,  // or input.constructor.name
            message: input.message,
            stack: input.stack || null
        };
    } else if (input === null || input === undefined) {
        return { message: String(input) };
    } else if (Array.isArray(input)) {
        return { message: JSON.stringify(input) };
    } else if (typeof input === "object") {
        return input;
    }

    return { message: String(input) };
}