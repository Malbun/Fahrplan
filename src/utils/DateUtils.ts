export const getTimeAsString = (date: Date, seconds: boolean): string => {
    const hh: string = String(date.getHours()).padStart(2, '0');
    const mm: string = String(date.getMinutes()).padStart(2, '0');
    const ss: string = String(date.getSeconds()).padStart(2, '0');
    if (isNaN(date.getHours())) {
        return '';
    }
    if (seconds) {
        return `${hh}:${mm}:${ss}`;
    } else {
        return `${hh}:${mm}`;
    }
}

export const getDateAsString = (date: Date): string => {
    const yyyy: string = String(date.getFullYear()).padStart(2, '0');
    const mm: string = String(date.getMonth() + 1).padStart(2, '0');
    const dd: string = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export const inputStringToDate = (input: string): Date => {
    return new Date(input);
}