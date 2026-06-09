export const TIER_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; accent: string }
> = {
  supporter: {
    color: "#888780",
    bg: "rgba(136,135,128,0.1)",
    border: "rgba(136,135,128,0.3)",
    label: "Supporter",
    accent: "#888780",
  },
  true_fan: {
    color: "#4A9EFF",
    bg: "rgba(74,158,255,0.1)",
    border: "rgba(74,158,255,0.3)",
    label: "True Fan",
    accent: "#4A9EFF",
  },
  ultras: {
    color: "#C084FC",
    bg: "rgba(192,132,252,0.1)",
    border: "rgba(192,132,252,0.3)",
    label: "Ultras",
    accent: "#C084FC",
  },
  legend: {
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
    border: "rgba(255,215,0,0.3)",
    label: "Legend",
    accent: "#FFD700",
  },
};
