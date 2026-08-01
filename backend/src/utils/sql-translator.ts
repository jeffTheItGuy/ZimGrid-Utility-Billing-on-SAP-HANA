export function translatePostgresToHana(sql: string): string {
  let hana = sql;
  hana = hana.replace(/\$\d+/g, '?');
  hana = hana.replace(
    /(\w+(?:\.\w+)?)\s+ILIKE\s+(\?|'[^']*')/gi,
    'UPPER($1) LIKE UPPER($2)'
  );
  hana = hana.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP');
  hana = hana.replace(
    /CURRENT_DATE\s*-\s*INTERVAL\s+'(\d+)\s*months?'/gi,
    'ADD_MONTHS(CURRENT_DATE, -$1)'
  );
  hana = hana.replace(
    /CURRENT_DATE\s*-\s*INTERVAL\s+'(\d+)\s*days?'/gi,
    'ADD_DAYS(CURRENT_DATE, -$1)'
  );
  hana = hana.replace(
    /DATE_TRUNC\s*\(\s*'month'\s*,\s*([^)]+)\s*\)/gi,
    "TRUNC($1, 'MONTH')"
  );
  hana = hana.replace(
    /DATE_TRUNC\s*\(\s*'day'\s*,\s*([^)]+)\s*\)/gi,
    "TRUNC($1, 'DD')"
  );
  hana = hana.replace(/\bTIMESTAMPTZ\b/gi, 'TIMESTAMP');
  hana = hana.replace(/ON CONFLICT DO NOTHING/gi, '');
  hana = hana.replace(
    /ST_SetSRID\s*\(\s*ST_MakePoint\s*\(([^)]+)\)\s*,\s*4326\s*\)/gi,
    'NEW ST_POINT($1).ST_SRID(4326)'
  );
  return hana;
}