export type ABO = "A" | "B" | "AB" | "O"
export type Rh = "+" | "-"

export function isCompatible(recipientABO: ABO, recipientRh: Rh, donorABO: ABO, donorRh: Rh) {
  // ABO compatibility
  const map: Record<ABO, ABO[]> = {
    O: ["O"],
    A: ["A", "O"],
    B: ["B", "O"],
    AB: ["A", "B", "AB", "O"],
  }
  const aboOk = map[recipientABO].includes(donorABO)
  // Rh: negative donors can give to +/-; positive donors only to +
  const rhOk = donorRh === "-" ? true : recipientRh === "+"
  return aboOk && rhOk
}

export function kmDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
