export function formatDate(date: Date | string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";
  
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-IN").format(num);
}
