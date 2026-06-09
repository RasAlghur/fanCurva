import * as Flags from "country-flag-icons/react/3x2";

const FIFA_TO_ALPHA2: Record<string, string> = {
  CAN: "CA",
  MEX: "MX",
  USA: "US",
  AUS: "AU",
  IRQ: "IQ",
  IRN: "IR",
  JPN: "JP",
  JOR: "JO",
  KOR: "KR",
  QAT: "QA",
  KSA: "SA",
  UZB: "UZ",
  ALG: "DZ",
  CPV: "CV",
  COD: "CD",
  CIV: "CI",
  EGY: "EG",
  GHA: "GH",
  MAR: "MA",
  SEN: "SN",
  RSA: "ZA",
  TUN: "TN",
  CUW: "CW",
  HAI: "HT",
  PAN: "PA",
  ARG: "AR",
  BRA: "BR",
  COL: "CO",
  ECU: "EC",
  PAR: "PY",
  URU: "UY",
  NZL: "NZ",
  AUT: "AT",
  BEL: "BE",
  BIH: "BA",
  CRO: "HR",
  CZE: "CZ",
  ENG: "GB-ENG",
  FRA: "FR",
  GER: "DE",
  NED: "NL",
  NOR: "NO",
  POR: "PT",
  SCO: "GB-SCO",
  ESP: "ES",
  SWE: "SE",
  SUI: "CH",
  TUR: "TR",
};

export default function TeamFlag({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  const alpha2 = FIFA_TO_ALPHA2[code];
  if (!alpha2) return <span>🏆</span>;

  const FlagComponent =
    (Flags as Record<string, React.ComponentType<{ className?: string }>>)[
      alpha2
    ] ??
    (Flags as Record<string, React.ComponentType<{ className?: string }>>)[
      "GB"
    ];

  return <FlagComponent className={className} />;
}
