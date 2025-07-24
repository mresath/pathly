export const range = (start: number, stop: number, step = 1) => {
    let result = [];
    for (let a = start; a < stop; a += step) {
        result.push(a);
    }
    return result;
};

export const riemannSum = (func: (x: number) => number, a: number, b: number, n = 1000): number => {
    const dx = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const xi = a + i * dx;
        sum += func(xi) * dx;
    }
    return sum;
};

const bellCurveCache: { [key: string]: { [key: number]: number } } = {};
export const bellCurve = (x: number, mean = 50, stdDev = 17): number => {
    if (bellCurveCache[`${mean}-${stdDev}`] !== undefined) {
        if (bellCurveCache[`${mean}-${stdDev}`][x] !== undefined) {
            return bellCurveCache[`${mean}-${stdDev}`][x];
        } else {
            const result = (100 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp((-((x - mean) ** 2) / (2 * stdDev ** 2)));
            bellCurveCache[`${mean}-${stdDev}`][x] = result;
            return result;
        }
    } else {
        bellCurveCache[`${mean}-${stdDev}`] = {};
        const result = (100 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp((-((x - mean) ** 2) / (2 * stdDev ** 2)));
        bellCurveCache[`${mean}-${stdDev}`][x] = result;
        return result;
    }
};

const bellCurveIntCache: {
    [key: string]: {
        [key: number]: number
    }
} = {};
export const bellCurveInt = (lower: number, upper: number, mean = 50, stdDev = 17): number => {
    var tot: number;
    var rem: number;
    if (bellCurveIntCache[`${mean}-${stdDev}`] !== undefined) {
        if (bellCurveIntCache[`${mean}-${stdDev}`][lower] !== undefined) {
            rem = bellCurveIntCache[`${mean}-${stdDev}`][lower];
        } else {
            rem = riemannSum((x) => bellCurve(x, mean, stdDev), 0, lower);
            bellCurveIntCache[`${mean}-${stdDev}`][lower] = rem;
        }
        if (bellCurveIntCache[`${mean}-${stdDev}`][upper] !== undefined) {
            tot = bellCurveIntCache[`${mean}-${stdDev}`][upper];
        } else {
            tot = riemannSum((x) => bellCurve(x, mean, stdDev), 0, upper);
            bellCurveIntCache[`${mean}-${stdDev}`][upper] = tot;
        }
    } else {
        bellCurveIntCache[`${mean}-${stdDev}`] = {};
        rem = riemannSum((x) => bellCurve(x, mean, stdDev), 0, lower);
        bellCurveIntCache[`${mean}-${stdDev}`][lower] = rem;
        tot = riemannSum((x) => bellCurve(x, mean, stdDev), 0, upper);
        bellCurveIntCache[`${mean}-${stdDev}`][upper] = tot;
    }
    return tot - rem;
};

export const getDate = () => Math.floor(Date.now() / 1000);