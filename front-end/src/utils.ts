export const currencyFormatter = new Intl.NumberFormat(undefined, {
    style:"currency",
    currency:"TWD",
    minimumFractionDigits:0
})

export function dateFormatter(date: number): string {
    let n = new Date(date),
    y = n.getFullYear(),
    m = n.getMonth() + 1,
    d = n.getDate();
    return y + "/" + (m < 10 ? "0" + m : m) + "/" + (d < 10 ? "0" + d : d)
}

export function floatToPercentage(number: number):string {
    // Round the number to the nearest integer
    const roundedNumber = Math.round(number*100);
    // Append the percent symbol
    return roundedNumber + "%";
}