// War Room — shared formatting utilities

export function formatCurrency(val: number): string {
  return `R${val.toLocaleString("en-ZA")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-ZA");
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
