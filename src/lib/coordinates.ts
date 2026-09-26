/**
 * Tamil Nadu / Dindigul district coordinate lookup table.
 * PSNACET campus center: 10.3684, 77.9855 (Dindigul)
 * All known boarding points for bus routes in this area.
 */

export const PSNACET_CENTER = { lat: 10.3684, lng: 77.9855 };

// Comprehensive place-name → coordinate mapping for Dindigul/Tamil Nadu area
const PLACE_COORDS: Record<string, [number, number]> = {
  // ── PSNACET Campus ──
  "psnacet":              [10.3684, 77.9855],
  "psna":                 [10.3684, 77.9855],
  "psnacet campus":       [10.3684, 77.9855],
  "college":              [10.3684, 77.9855],

  // ── Dindigul City ──
  "dindigul":             [10.3673, 77.9803],
  "dindigul bus stand":   [10.3711, 77.9768],
  "dindigul junction":    [10.3700, 77.9780],
  "dindigul town":        [10.3673, 77.9803],
  "dindigul main road":   [10.3660, 77.9820],
  "dindigul market":      [10.3650, 77.9780],
  "relief centre":        [10.3635, 77.9745],
  "thiruvalluvar statue": [10.3631, 77.9750],
  "new bus stand":        [10.3720, 77.9750],

  // ── NH 44 Corridor ──
  "palani road":          [10.3800, 77.9650],
  "maruthamalai":         [10.3450, 77.9920],
  "oddanchatram":         [10.4917, 77.7448],
  "palani":               [10.4480, 77.5190],
  "natham":               [10.5073, 78.0360],
  "nilakottai":           [10.1723, 77.8668],
  "vedasandur":           [10.5321, 77.9608],

  // ── Sirumalai ──
  "sirumalai":            [10.2700, 78.0400],
  "chinnalapatti":        [10.2935, 77.9130],
  "srirangam":            [10.8627, 78.6897],

  // ── North Dindigul ──
  "reddiarchatram":       [10.4050, 77.9600],
  "batlagundu":           [10.1605, 77.7460],
  "ambaturai":            [10.3100, 77.9900],
  "neykarapatti":         [10.3500, 77.9800],
  "keeripatti":           [10.4200, 78.0100],
  "sooraikudi":           [10.3900, 78.0200],
  "valayapatti":          [10.4100, 77.9900],
  "silamalai":            [10.3800, 77.9400],
  "kannivadi":            [10.5500, 77.9300],

  // ── Madurai direction ──
  "madurai":              [9.9195, 78.1193],
  "sholavandan":          [9.9856, 78.0756],
  "melur":                [10.0455, 78.3352],
  "tirumangalam":         [9.8217, 77.9883],
  "thirumangalam":        [9.8217, 77.9883],
  "usilampatti":          [9.9665, 77.7830],
  "alanganallur":         [10.1062, 78.0905],
  "kodaikanal road":      [10.2220, 77.7660],
  "kodaikanal":           [10.2381, 77.4892],
  "periyakulam":          [10.1200, 77.5400],

  // ── Coimbatore Localities ──
  "coimbatore":           [11.0168, 76.9558],
  "saravanampatti":       [11.0797, 76.9989],
  "kurichi":              [10.9610, 76.9634],
  "singanallur":          [11.0028, 77.0274],
  "peelamedu":            [11.0263, 77.0042],
  "lakshmi mills":        [11.0116, 76.9806],
  "gandhipuram":          [11.0175, 76.9653],
  "ukkadam":              [10.9934, 76.9566],
  "edayarpalayam":        [11.0428, 76.9312],

  "pollachi":             [10.6573, 77.0071],
  "udumalaipettai":       [10.5867, 77.2488],
  "dharapuram":           [10.7309, 77.5194],
  "tirupur":              [11.1085, 77.3411],

  // ── Salem direction ──
  "salem":                [11.6643, 78.1460],
  "rasipuram":            [11.4580, 78.1770],
  "namakkal":             [11.2190, 78.1680],
  "tiruchengode":         [11.3800, 77.8950],

  // ── Nilgiris ──
  "nilgiris":             [11.4064, 76.6932],
  "ooty":                 [11.4100, 76.6950],
  "coonoor":              [11.3530, 76.7959],

  // ── Local Dindigul Streets ──
  "gandhiji road":        [10.3670, 77.9790],
  "valayankulam":         [10.3550, 77.9700],
  "mullipadi":            [10.3800, 77.9700],
  "devathanam":           [10.3750, 77.9950],
  "senthil nagar":        [10.3780, 77.9880],
  "nethaji nagar":        [10.3700, 77.9900],
  "ponmalar nagar":       [10.3650, 77.9950],
  "sakthi nagar":         [10.3620, 77.9840],
  "anna nagar":           [10.3600, 77.9760],
  "nrp":                  [10.3610, 77.9740],
  "vettuvankinar":        [10.3540, 77.9780],
  "thoppupalayam":        [10.3520, 77.9820],
  "ganeshapuram":         [10.3720, 77.9920],
  "thamaraikulam":        [10.3840, 77.9940],
  "sekkadipalayam":       [10.3900, 77.9780],
  "periyanayakanpatti":   [10.4000, 77.9600],
  "ayakudi":              [10.4100, 77.9500],
  "kamarajar colony":     [10.3680, 77.9870],
};

/**
 * Look up coordinates for a stop name.
 * Normalizes to lowercase and tries partial matching.
 * Falls back to PSNACET center + a small deterministic offset.
 */
export function getStopCoordinates(
  stopName: string,
  index: number,
  totalStops: number,
  routeIndex: number
): { lat: number; lng: number } {
  const normalized = stopName.toLowerCase().trim();

  // Exact match
  if (PLACE_COORDS[normalized]) {
    const [lat, lng] = PLACE_COORDS[normalized];
    return { lat, lng };
  }

  // Partial match (stop name contains a known place)
  for (const [key, [lat, lng]] of Object.entries(PLACE_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { lat, lng };
    }
  }

  // Deterministic fallback: spread markers around PSNACET campus
  // Uses index to create a spiral-like pattern so markers don't stack
  const angleStep = (2 * Math.PI) / Math.max(totalStops, 1);
  const angle = angleStep * index + (routeIndex * Math.PI) / 4;
  const radius = 0.005 + index * 0.003; // ~0.5km to 3km radius
  const lat = PSNACET_CENTER.lat + radius * Math.sin(angle);
  const lng = PSNACET_CENTER.lng + radius * Math.cos(angle);
  return { lat, lng };
}
