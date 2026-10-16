// Single place that controls how prices are displayed across the app.
// Change the prefix/format here and it updates everywhere.
export function formatRupiah(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}
