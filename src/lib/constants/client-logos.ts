const ORG_NAME_BY_FILE: Record<string, string> = {
  cfe: "CFE",
  rarras: "Rarras",
  sat: "SAT",
  "somos-estilo": "Somos Estilo",
  soriana: "Soriana",
  tec: "TEC",
};

function derivedName(fileStem: string): string {
  const spaced = fileStem.replace(/[-_]+/g, " ");
  if (spaced.length <= 4) return spaced.toUpperCase();
  return spaced.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function clientLogoName(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, "");
  return ORG_NAME_BY_FILE[stem] ?? derivedName(stem);
}
