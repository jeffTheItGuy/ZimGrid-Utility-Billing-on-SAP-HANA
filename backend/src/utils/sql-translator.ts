/**
 * Translates PostgreSQL-flavoured SQL to SAP HANA 2.0 SQL.
 * Handles the most common dialect differences in this codebase.
 */
export function translatePostgresToHana(sql: string): string {
  let hana = sql;

  // 1. Positional params: $1, $2 → ?
  hana = hana.replace(/\$\d+/g, '?');

  // 2. ILIKE → case-insensitive LIKE via UPPER()
  hana = hana.replace(
    /(\w+(?:\.\w+)?)\s+ILIKE\s+(\?|'[^']*')/gi,
    'UPPER($1) LIKE UPPER($2)'
  );

  // 3. NOW() → CURRENT_TIMESTAMP
  hana = hana.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');

  // 4. CURRENT_DATE - INTERVAL 'N months' → ADD_MONTHS(CURRENT_DATE, -N)
  hana = hana.replace(
    /CURRENT_DATE\s*-\s*INTERVAL\s+'(\d+)\s*months?'/gi,
    'ADD_MONTHS(CURRENT_DATE, -$1)'
  );

  // 5. CURRENT_DATE - INTERVAL 'N days' → ADD_DAYS(CURRENT_DATE, -N)
  hana = hana.replace(
    /CURRENT_DATE\s*-\s*INTERVAL\s+'(\d+)\s*days?'/gi,
    'ADD_DAYS(CURRENT_DATE, -$1)'
  );

  // 6. DATE_TRUNC('month', col) → TRUNC(col, 'MONTH')
  hana = hana.replace(
    /DATE_TRUNC\s*\(\s*'month'\s*,\s*([^)]+)\s*\)/gi,
    "TRUNC($1, 'MONTH')"
  );

  // 7. DATE_TRUNC('day', col) → TRUNC(col, 'DD')
  hana = hana.replace(
    /DATE_TRUNC\s*\(\s*'day'\s*,\s*([^)]+)\s*\)/gi,
    "TRUNC($1, 'DD')"
  );

  // 8. TIMESTAMPTZ → TIMESTAMP
  hana = hana.replace(/TIMESTAMPTZ/gi, 'TIMESTAMP');

  // 9. ON CONFLICT DO NOTHING → strip (HANA uses MERGE / UPSERT)
  hana = hana.replace(/ON CONFLICT DO NOTHING/gi, '');

  // 10. PostGIS → HANA Spatial
  hana = hana.replace(
    /ST_SetSRID\s*\(\s*ST_MakePoint\s*\(([^)]+)\)\s*,\s*4326\s*\)/gi,
    'NEW ST_POINT($1).ST_SRID(4326)'
  );

  return hana;
}
