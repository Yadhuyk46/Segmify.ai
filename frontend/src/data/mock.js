export const stats = [
  { label: "AI Predictions", value: "98.4%", note: "classification confidence" },
  { label: "Customers Analysed", value: "5,000+", note: "seed-ready records" },
  { label: "Revenue Lift", value: "24%", note: "campaign impact estimate" },
];

export const cards = [
  { label: "Total Customers", value: "5,248", delta: "+12.4%" },
  { label: "Active Customers", value: "4,701", delta: "+7.8%" },
  { label: "High Value Customers", value: "842", delta: "+10.1%" },
  { label: "Churn Risk Customers", value: "301", delta: "-4.2%" },
  { label: "Monthly Revenue", value: "$182,400", delta: "+15.6%" },
  { label: "Average Purchase Value", value: "$342", delta: "+5.1%" },
  { label: "Retention Rate", value: "88.7%", delta: "+2.2%" },
  { label: "Segments Created", value: "8", delta: "+1" },
];

export const growth = [
  { name: "Jan", customers: 180, revenue: 24000 },
  { name: "Feb", customers: 220, revenue: 29500 },
  { name: "Mar", customers: 265, revenue: 36100 },
  { name: "Apr", customers: 310, revenue: 40200 },
  { name: "May", customers: 390, revenue: 47400 },
  { name: "Jun", customers: 445, revenue: 56300 },
];

export const segments = [
  { name: "Premium", value: 18 },
  { name: "Loyal", value: 24 },
  { name: "Budget", value: 16 },
  { name: "At-Risk", value: 11 },
  { name: "Occasional", value: 19 },
  { name: "New", value: 12 },
];

export const activity = [
  { title: "Model retrained", text: "KNN classifier accuracy improved to 98.4%", time: "2 min ago" },
  { title: "Segment alert", text: "At-Risk cluster grew 3.2% in APAC region", time: "9 min ago" },
  { title: "Report exported", text: "Quarterly revenue report generated in CSV", time: "18 min ago" },
  { title: "Campaign insight", text: "Premium cohort responded best to loyalty bundles", time: "42 min ago" },
];

export const customers = Array.from({ length: 12 }).map((_, index) => ({
  id: index + 1,
  code: `SEG-${(index + 1).toString().padStart(4, "0")}`,
  name: ["Ava Patel", "Liam Brooks", "Sophia Nguyen", "Noah Reed", "Mia Clarke", "Ethan Shah"][index % 6],
  segment: ["Premium", "Loyal", "Budget", "At-Risk", "Occasional", "New"][index % 6],
  city: ["New York", "Bengaluru", "Toronto", "London", "Dubai", "Berlin"][index % 6],
  spending: 1200 + index * 540,
  loyalty: 52 + index * 3,
  churn: (0.12 + index * 0.04).toFixed(2),
}));
