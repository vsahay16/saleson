/* ── Earnings Calculator ── */
function fmt(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function updateCalc() {
  const clients = parseInt(document.getElementById("clients").value);
  const plan = parseInt(document.getElementById("plan").value);
  const rate = parseInt(document.getElementById("rate").value);
  document.getElementById("clients-val").textContent = clients;
  document.getElementById("plan-val").textContent = fmt(plan);
  document.getElementById("rate-val").textContent = rate + "%";
  const totalMRR = clients * plan;
  const monthly = (totalMRR * rate) / 100;
  const annual = monthly * 12;
  const potential = (50 * plan * rate) / 100;
  document.getElementById("monthly-earn").textContent = fmt(monthly);
  document.getElementById("total-mrr").textContent = fmt(totalMRR);
  document.getElementById("comm-rate").textContent = rate + "%";
  document.getElementById("annual-earn").textContent = fmt(annual);
  document.getElementById("potential").textContent = fmt(potential) + " / mo";
}
["clients", "plan", "rate"].forEach((id) =>
  document.getElementById(id).addEventListener("input", updateCalc)
);
updateCalc();

/* ════════════════════════════════════════════════════════
     COUNTRY DATA — flag, dial code, regex validation
  ════════════════════════════════════════════════════════ */
const COUNTRIES = [
  {
    c: "AF",
    flag: "🇦🇫",
    name: "Afghanistan",
    dial: "+93",
    re: /^[7][0-9]{8}$/,
  },
  { c: "AL", flag: "🇦🇱", name: "Albania", dial: "+355", re: /^[6][0-9]{8}$/ },
  { c: "DZ", flag: "🇩🇿", name: "Algeria", dial: "+213", re: /^[5-7][0-9]{8}$/ },
  { c: "AD", flag: "🇦🇩", name: "Andorra", dial: "+376", re: /^[3-9][0-9]{5}$/ },
  { c: "AO", flag: "🇦🇴", name: "Angola", dial: "+244", re: /^[9][0-9]{8}$/ },
  {
    c: "AG",
    flag: "🇦🇬",
    name: "Antigua & Barbuda",
    dial: "+1268",
    re: /^[2689][0-9]{6}$/,
  },
  {
    c: "AR",
    flag: "🇦🇷",
    name: "Argentina",
    dial: "+54",
    re: /^[1-9][0-9]{9}$/,
  },
  { c: "AM", flag: "🇦🇲", name: "Armenia", dial: "+374", re: /^[4-9][0-9]{7}$/ },
  { c: "AU", flag: "🇦🇺", name: "Australia", dial: "+61", re: /^[4][0-9]{8}$/ },
  { c: "AT", flag: "🇦🇹", name: "Austria", dial: "+43", re: /^[6][0-9]{9,12}$/ },
  {
    c: "AZ",
    flag: "🇦🇿",
    name: "Azerbaijan",
    dial: "+994",
    re: /^[5-7][0-9]{8}$/,
  },
  {
    c: "BS",
    flag: "🇧🇸",
    name: "Bahamas",
    dial: "+1242",
    re: /^[2-9][0-9]{6}$/,
  },
  { c: "BH", flag: "🇧🇭", name: "Bahrain", dial: "+973", re: /^[3][0-9]{7}$/ },
  {
    c: "BD",
    flag: "🇧🇩",
    name: "Bangladesh",
    dial: "+880",
    re: /^[1][3-9][0-9]{8}$/,
  },
  { c: "BY", flag: "🇧🇾", name: "Belarus", dial: "+375", re: /^[2-9][0-9]{8}$/ },
  { c: "BE", flag: "🇧🇪", name: "Belgium", dial: "+32", re: /^[4][0-9]{8}$/ },
  { c: "BZ", flag: "🇧🇿", name: "Belize", dial: "+501", re: /^[6][0-9]{6}$/ },
  { c: "BJ", flag: "🇧🇯", name: "Benin", dial: "+229", re: /^[9][0-9]{7}$/ },
  { c: "BT", flag: "🇧🇹", name: "Bhutan", dial: "+975", re: /^[1-8][0-9]{6}$/ },
  { c: "BO", flag: "🇧🇴", name: "Bolivia", dial: "+591", re: /^[6-7][0-9]{7}$/ },
  {
    c: "BA",
    flag: "🇧🇦",
    name: "Bosnia & Herzegovina",
    dial: "+387",
    re: /^[6][0-9]{7}$/,
  },
  { c: "BW", flag: "🇧🇼", name: "Botswana", dial: "+267", re: /^[7][0-9]{7}$/ },
  { c: "BR", flag: "🇧🇷", name: "Brazil", dial: "+55", re: /^[1-9][0-9]{10}$/ },
  { c: "BN", flag: "🇧🇳", name: "Brunei", dial: "+673", re: /^[2-8][0-9]{6}$/ },
  {
    c: "BG",
    flag: "🇧🇬",
    name: "Bulgaria",
    dial: "+359",
    re: /^[4-9][0-9]{8}$/,
  },
  {
    c: "BF",
    flag: "🇧🇫",
    name: "Burkina Faso",
    dial: "+226",
    re: /^[5-7][0-9]{7}$/,
  },
  { c: "BI", flag: "🇧🇮", name: "Burundi", dial: "+257", re: /^[7][0-9]{7}$/ },
  {
    c: "CV",
    flag: "🇨🇻",
    name: "Cabo Verde",
    dial: "+238",
    re: /^[5-9][0-9]{6}$/,
  },
  {
    c: "KH",
    flag: "🇰🇭",
    name: "Cambodia",
    dial: "+855",
    re: /^[1-9][0-9]{7,8}$/,
  },
  {
    c: "CM",
    flag: "🇨🇲",
    name: "Cameroon",
    dial: "+237",
    re: /^[6-9][0-9]{8}$/,
  },
  { c: "CA", flag: "🇨🇦", name: "Canada", dial: "+1", re: /^[2-9][0-9]{9}$/ },
  {
    c: "CF",
    flag: "🇨🇫",
    name: "Central African Republic",
    dial: "+236",
    re: /^[7][0-9]{7}$/,
  },
  { c: "TD", flag: "🇹🇩", name: "Chad", dial: "+235", re: /^[6-9][0-9]{7}$/ },
  { c: "CL", flag: "🇨🇱", name: "Chile", dial: "+56", re: /^[9][0-9]{8}$/ },
  { c: "CN", flag: "🇨🇳", name: "China", dial: "+86", re: /^1[3-9][0-9]{9}$/ },
  { c: "CO", flag: "🇨🇴", name: "Colombia", dial: "+57", re: /^[3][0-9]{9}$/ },
  { c: "KM", flag: "🇰🇲", name: "Comoros", dial: "+269", re: /^[3-9][0-9]{6}$/ },
  { c: "CG", flag: "🇨🇬", name: "Congo", dial: "+242", re: /^[0][0-9]{8}$/ },
  {
    c: "CR",
    flag: "🇨🇷",
    name: "Costa Rica",
    dial: "+506",
    re: /^[6-8][0-9]{7}$/,
  },
  { c: "HR", flag: "🇭🇷", name: "Croatia", dial: "+385", re: /^[9][0-9]{8}$/ },
  { c: "CU", flag: "🇨🇺", name: "Cuba", dial: "+53", re: /^[5][0-9]{7}$/ },
  { c: "CY", flag: "🇨🇾", name: "Cyprus", dial: "+357", re: /^[9][0-9]{7}$/ },
  {
    c: "CZ",
    flag: "🇨🇿",
    name: "Czech Republic",
    dial: "+420",
    re: /^[6-7][0-9]{8}$/,
  },
  { c: "DK", flag: "🇩🇰", name: "Denmark", dial: "+45", re: /^[2-9][0-9]{7}$/ },
  { c: "DJ", flag: "🇩🇯", name: "Djibouti", dial: "+253", re: /^[7][0-9]{7}$/ },
  {
    c: "DM",
    flag: "🇩🇲",
    name: "Dominica",
    dial: "+1767",
    re: /^[2-9][0-9]{6}$/,
  },
  {
    c: "DO",
    flag: "🇩🇴",
    name: "Dominican Republic",
    dial: "+1809",
    re: /^[2-9][0-9]{6}$/,
  },
  { c: "EC", flag: "🇪🇨", name: "Ecuador", dial: "+593", re: /^[9][0-9]{8}$/ },
  { c: "EG", flag: "🇪🇬", name: "Egypt", dial: "+20", re: /^[1][0-9]{9}$/ },
  {
    c: "SV",
    flag: "🇸🇻",
    name: "El Salvador",
    dial: "+503",
    re: /^[6-7][0-9]{7}$/,
  },
  {
    c: "GQ",
    flag: "🇬🇶",
    name: "Equatorial Guinea",
    dial: "+240",
    re: /^[2-9][0-9]{8}$/,
  },
  { c: "ER", flag: "🇪🇷", name: "Eritrea", dial: "+291", re: /^[7][0-9]{6}$/ },
  { c: "EE", flag: "🇪🇪", name: "Estonia", dial: "+372", re: /^[5][0-9]{7}$/ },
  { c: "SZ", flag: "🇸🇿", name: "Eswatini", dial: "+268", re: /^[7][0-9]{7}$/ },
  { c: "ET", flag: "🇪🇹", name: "Ethiopia", dial: "+251", re: /^[9][0-9]{8}$/ },
  { c: "FJ", flag: "🇫🇯", name: "Fiji", dial: "+679", re: /^[7-9][0-9]{6}$/ },
  { c: "FI", flag: "🇫🇮", name: "Finland", dial: "+358", re: /^[4-5][0-9]{8}$/ },
  { c: "FR", flag: "🇫🇷", name: "France", dial: "+33", re: /^[6-7][0-9]{8}$/ },
  { c: "GA", flag: "🇬🇦", name: "Gabon", dial: "+241", re: /^[0][0-9]{7}$/ },
  { c: "GM", flag: "🇬🇲", name: "Gambia", dial: "+220", re: /^[7-9][0-9]{6}$/ },
  { c: "GE", flag: "🇬🇪", name: "Georgia", dial: "+995", re: /^[5][0-9]{8}$/ },
  {
    c: "DE",
    flag: "🇩🇪",
    name: "Germany",
    dial: "+49",
    re: /^[1][5-7][0-9]{9}$/,
  },
  { c: "GH", flag: "🇬🇭", name: "Ghana", dial: "+233", re: /^[2][0-9]{8}$/ },
  { c: "GR", flag: "🇬🇷", name: "Greece", dial: "+30", re: /^[6][0-9]{9}$/ },
  {
    c: "GD",
    flag: "🇬🇩",
    name: "Grenada",
    dial: "+1473",
    re: /^[2-9][0-9]{6}$/,
  },
  {
    c: "GT",
    flag: "🇬🇹",
    name: "Guatemala",
    dial: "+502",
    re: /^[3-5][0-9]{7}$/,
  },
  { c: "GN", flag: "🇬🇳", name: "Guinea", dial: "+224", re: /^[6][0-9]{8}$/ },
  {
    c: "GW",
    flag: "🇬🇼",
    name: "Guinea-Bissau",
    dial: "+245",
    re: /^[9][0-9]{7}$/,
  },
  { c: "GY", flag: "🇬🇾", name: "Guyana", dial: "+592", re: /^[6][0-9]{6}$/ },
  { c: "HT", flag: "🇭🇹", name: "Haiti", dial: "+509", re: /^[3][0-9]{7}$/ },
  {
    c: "HN",
    flag: "🇭🇳",
    name: "Honduras",
    dial: "+504",
    re: /^[8-9][0-9]{7}$/,
  },
  { c: "HU", flag: "🇭🇺", name: "Hungary", dial: "+36", re: /^[2-7][0-9]{8}$/ },
  { c: "IS", flag: "🇮🇸", name: "Iceland", dial: "+354", re: /^[4-9][0-9]{6}$/ },
  { c: "IN", flag: "🇮🇳", name: "India", dial: "+91", re: /^[6-9][0-9]{9}$/ },
  {
    c: "ID",
    flag: "🇮🇩",
    name: "Indonesia",
    dial: "+62",
    re: /^[8][0-9]{8,11}$/,
  },
  { c: "IR", flag: "🇮🇷", name: "Iran", dial: "+98", re: /^[9][0-9]{9}$/ },
  { c: "IQ", flag: "🇮🇶", name: "Iraq", dial: "+964", re: /^[7][0-9]{9}$/ },
  { c: "IE", flag: "🇮🇪", name: "Ireland", dial: "+353", re: /^[8][0-9]{8}$/ },
  { c: "IL", flag: "🇮🇱", name: "Israel", dial: "+972", re: /^[5][0-9]{8}$/ },
  { c: "IT", flag: "🇮🇹", name: "Italy", dial: "+39", re: /^[3][0-9]{9}$/ },
  {
    c: "JM",
    flag: "🇯🇲",
    name: "Jamaica",
    dial: "+1876",
    re: /^[2-9][0-9]{6}$/,
  },
  { c: "JP", flag: "🇯🇵", name: "Japan", dial: "+81", re: /^[7-9][0-9]{9}$/ },
  { c: "JO", flag: "🇯🇴", name: "Jordan", dial: "+962", re: /^[7][0-9]{8}$/ },
  {
    c: "KZ",
    flag: "🇰🇿",
    name: "Kazakhstan",
    dial: "+7",
    re: /^[6-7][0-9]{9}$/,
  },
  { c: "KE", flag: "🇰🇪", name: "Kenya", dial: "+254", re: /^[7][0-9]{8}$/ },
  { c: "KI", flag: "🇰🇮", name: "Kiribati", dial: "+686", re: /^[7][0-9]{4}$/ },
  { c: "KW", flag: "🇰🇼", name: "Kuwait", dial: "+965", re: /^[5-9][0-9]{7}$/ },
  {
    c: "KG",
    flag: "🇰🇬",
    name: "Kyrgyzstan",
    dial: "+996",
    re: /^[5-7][0-9]{8}$/,
  },
  { c: "LA", flag: "🇱🇦", name: "Laos", dial: "+856", re: /^[2][0-9]{9}$/ },
  { c: "LV", flag: "🇱🇻", name: "Latvia", dial: "+371", re: /^[2][0-9]{7}$/ },
  { c: "LB", flag: "🇱🇧", name: "Lebanon", dial: "+961", re: /^[3][0-9]{7}$/ },
  { c: "LS", flag: "🇱🇸", name: "Lesotho", dial: "+266", re: /^[5][0-9]{7}$/ },
  { c: "LR", flag: "🇱🇷", name: "Liberia", dial: "+231", re: /^[7][0-9]{7}$/ },
  { c: "LY", flag: "🇱🇾", name: "Libya", dial: "+218", re: /^[9][0-9]{8}$/ },
  {
    c: "LI",
    flag: "🇱🇮",
    name: "Liechtenstein",
    dial: "+423",
    re: /^[6][0-9]{6}$/,
  },
  { c: "LT", flag: "🇱🇹", name: "Lithuania", dial: "+370", re: /^[6][0-9]{7}$/ },
  {
    c: "LU",
    flag: "🇱🇺",
    name: "Luxembourg",
    dial: "+352",
    re: /^[6][0-9]{8}$/,
  },
  {
    c: "MG",
    flag: "🇲🇬",
    name: "Madagascar",
    dial: "+261",
    re: /^[3][0-9]{8}$/,
  },
  { c: "MW", flag: "🇲🇼", name: "Malawi", dial: "+265", re: /^[8-9][0-9]{8}$/ },
  { c: "MY", flag: "🇲🇾", name: "Malaysia", dial: "+60", re: /^[1][0-9]{8,9}$/ },
  {
    c: "MV",
    flag: "🇲🇻",
    name: "Maldives",
    dial: "+960",
    re: /^[7-9][0-9]{6}$/,
  },
  { c: "ML", flag: "🇲🇱", name: "Mali", dial: "+223", re: /^[5-9][0-9]{7}$/ },
  { c: "MT", flag: "🇲🇹", name: "Malta", dial: "+356", re: /^[7-9][0-9]{7}$/ },
  {
    c: "MH",
    flag: "🇲🇭",
    name: "Marshall Islands",
    dial: "+692",
    re: /^[2-9][0-9]{6}$/,
  },
  {
    c: "MR",
    flag: "🇲🇷",
    name: "Mauritania",
    dial: "+222",
    re: /^[2-4][0-9]{7}$/,
  },
  { c: "MU", flag: "🇲🇺", name: "Mauritius", dial: "+230", re: /^[5][0-9]{7}$/ },
  { c: "MX", flag: "🇲🇽", name: "Mexico", dial: "+52", re: /^[1-9][0-9]{9}$/ },
  {
    c: "FM",
    flag: "🇫🇲",
    name: "Micronesia",
    dial: "+691",
    re: /^[2-9][0-9]{6}$/,
  },
  { c: "MD", flag: "🇲🇩", name: "Moldova", dial: "+373", re: /^[6-7][0-9]{7}$/ },
  { c: "MC", flag: "🇲🇨", name: "Monaco", dial: "+377", re: /^[4-9][0-9]{7}$/ },
  {
    c: "MN",
    flag: "🇲🇳",
    name: "Mongolia",
    dial: "+976",
    re: /^[5-9][0-9]{7}$/,
  },
  {
    c: "ME",
    flag: "🇲🇪",
    name: "Montenegro",
    dial: "+382",
    re: /^[6-9][0-9]{7}$/,
  },
  { c: "MA", flag: "🇲🇦", name: "Morocco", dial: "+212", re: /^[6-7][0-9]{8}$/ },
  {
    c: "MZ",
    flag: "🇲🇿",
    name: "Mozambique",
    dial: "+258",
    re: /^[8][0-9]{8}$/,
  },
  { c: "MM", flag: "🇲🇲", name: "Myanmar", dial: "+95", re: /^[9][0-9]{9}$/ },
  { c: "NA", flag: "🇳🇦", name: "Namibia", dial: "+264", re: /^[8][0-9]{8}$/ },
  { c: "NR", flag: "🇳🇷", name: "Nauru", dial: "+674", re: /^[5][0-9]{6}$/ },
  {
    c: "NP",
    flag: "🇳🇵",
    name: "Nepal",
    dial: "+977",
    re: /^[9][6-8][0-9]{8}$/,
  },
  {
    c: "NL",
    flag: "🇳🇱",
    name: "Netherlands",
    dial: "+31",
    re: /^[6][0-9]{8}$/,
  },
  {
    c: "NZ",
    flag: "🇳🇿",
    name: "New Zealand",
    dial: "+64",
    re: /^[2][0-9]{7,9}$/,
  },
  {
    c: "NI",
    flag: "🇳🇮",
    name: "Nicaragua",
    dial: "+505",
    re: /^[5-8][0-9]{7}$/,
  },
  { c: "NE", flag: "🇳🇪", name: "Niger", dial: "+227", re: /^[7-9][0-9]{7}$/ },
  { c: "NG", flag: "🇳🇬", name: "Nigeria", dial: "+234", re: /^[7-9][0-9]{9}$/ },
  { c: "NO", flag: "🇳🇴", name: "Norway", dial: "+47", re: /^[4-9][0-9]{7}$/ },
  { c: "OM", flag: "🇴🇲", name: "Oman", dial: "+968", re: /^[9][0-9]{7}$/ },
  { c: "PK", flag: "🇵🇰", name: "Pakistan", dial: "+92", re: /^[3][0-9]{9}$/ },
  { c: "PW", flag: "🇵🇼", name: "Palau", dial: "+680", re: /^[7][0-9]{6}$/ },
  { c: "PA", flag: "🇵🇦", name: "Panama", dial: "+507", re: /^[6][0-9]{7}$/ },
  {
    c: "PG",
    flag: "🇵🇬",
    name: "Papua New Guinea",
    dial: "+675",
    re: /^[7][0-9]{7}$/,
  },
  { c: "PY", flag: "🇵🇾", name: "Paraguay", dial: "+595", re: /^[9][0-9]{8}$/ },
  { c: "PE", flag: "🇵🇪", name: "Peru", dial: "+51", re: /^[9][0-9]{8}$/ },
  {
    c: "PH",
    flag: "🇵🇭",
    name: "Philippines",
    dial: "+63",
    re: /^[9][0-9]{9}$/,
  },
  { c: "PL", flag: "🇵🇱", name: "Poland", dial: "+48", re: /^[4-9][0-9]{8}$/ },
  { c: "PT", flag: "🇵🇹", name: "Portugal", dial: "+351", re: /^[9][0-9]{8}$/ },
  { c: "QA", flag: "🇶🇦", name: "Qatar", dial: "+974", re: /^[3-7][0-9]{7}$/ },
  { c: "RO", flag: "🇷🇴", name: "Romania", dial: "+40", re: /^[7][0-9]{8}$/ },
  { c: "RU", flag: "🇷🇺", name: "Russia", dial: "+7", re: /^[9][0-9]{9}$/ },
  { c: "RW", flag: "🇷🇼", name: "Rwanda", dial: "+250", re: /^[7][0-9]{8}$/ },
  {
    c: "KN",
    flag: "🇰🇳",
    name: "Saint Kitts & Nevis",
    dial: "+1869",
    re: /^[2-9][0-9]{6}$/,
  },
  {
    c: "LC",
    flag: "🇱🇨",
    name: "Saint Lucia",
    dial: "+1758",
    re: /^[2-9][0-9]{6}$/,
  },
  {
    c: "VC",
    flag: "🇻🇨",
    name: "Saint Vincent & the Grenadines",
    dial: "+1784",
    re: /^[4][0-9]{6}$/,
  },
  { c: "WS", flag: "🇼🇸", name: "Samoa", dial: "+685", re: /^[7][0-9]{6}$/ },
  {
    c: "SM",
    flag: "🇸🇲",
    name: "San Marino",
    dial: "+378",
    re: /^[6][0-9]{7}$/,
  },
  {
    c: "ST",
    flag: "🇸🇹",
    name: "São Tomé & Príncipe",
    dial: "+239",
    re: /^[9][0-9]{6}$/,
  },
  {
    c: "SA",
    flag: "🇸🇦",
    name: "Saudi Arabia",
    dial: "+966",
    re: /^[5][0-9]{8}$/,
  },
  { c: "SN", flag: "🇸🇳", name: "Senegal", dial: "+221", re: /^[7][0-9]{8}$/ },
  { c: "RS", flag: "🇷🇸", name: "Serbia", dial: "+381", re: /^[6][0-9]{7,8}$/ },
  {
    c: "SC",
    flag: "🇸🇨",
    name: "Seychelles",
    dial: "+248",
    re: /^[2-8][0-9]{6}$/,
  },
  {
    c: "SL",
    flag: "🇸🇱",
    name: "Sierra Leone",
    dial: "+232",
    re: /^[7-8][0-9]{7}$/,
  },
  {
    c: "SG",
    flag: "🇸🇬",
    name: "Singapore",
    dial: "+65",
    re: /^[8-9][0-9]{7}$/,
  },
  { c: "SK", flag: "🇸🇰", name: "Slovakia", dial: "+421", re: /^[9][0-9]{8}$/ },
  {
    c: "SI",
    flag: "🇸🇮",
    name: "Slovenia",
    dial: "+386",
    re: /^[3-7][0-9]{7}$/,
  },
  {
    c: "SB",
    flag: "🇸🇧",
    name: "Solomon Islands",
    dial: "+677",
    re: /^[7][0-9]{6}$/,
  },
  { c: "SO", flag: "🇸🇴", name: "Somalia", dial: "+252", re: /^[6][0-9]{8}$/ },
  {
    c: "ZA",
    flag: "🇿🇦",
    name: "South Africa",
    dial: "+27",
    re: /^[6-8][0-9]{8}$/,
  },
  {
    c: "SS",
    flag: "🇸🇸",
    name: "South Sudan",
    dial: "+211",
    re: /^[9][0-9]{8}$/,
  },
  { c: "ES", flag: "🇪🇸", name: "Spain", dial: "+34", re: /^[6-7][0-9]{8}$/ },
  { c: "LK", flag: "🇱🇰", name: "Sri Lanka", dial: "+94", re: /^[7][0-9]{8}$/ },
  { c: "SD", flag: "🇸🇩", name: "Sudan", dial: "+249", re: /^[9][0-9]{8}$/ },
  {
    c: "SR",
    flag: "🇸🇷",
    name: "Suriname",
    dial: "+597",
    re: /^[7-8][0-9]{6}$/,
  },
  { c: "SE", flag: "🇸🇪", name: "Sweden", dial: "+46", re: /^[7][0-9]{8}$/ },
  {
    c: "CH",
    flag: "🇨🇭",
    name: "Switzerland",
    dial: "+41",
    re: /^[7][0-9]{8}$/,
  },
  { c: "SY", flag: "🇸🇾", name: "Syria", dial: "+963", re: /^[9][0-9]{8}$/ },
  { c: "TW", flag: "🇹🇼", name: "Taiwan", dial: "+886", re: /^[9][0-9]{8}$/ },
  {
    c: "TJ",
    flag: "🇹🇯",
    name: "Tajikistan",
    dial: "+992",
    re: /^[9][0-9]{8}$/,
  },
  {
    c: "TZ",
    flag: "🇹🇿",
    name: "Tanzania",
    dial: "+255",
    re: /^[6-7][0-9]{8}$/,
  },
  { c: "TH", flag: "🇹🇭", name: "Thailand", dial: "+66", re: /^[6-9][0-9]{8}$/ },
  {
    c: "TL",
    flag: "🇹🇱",
    name: "Timor-Leste",
    dial: "+670",
    re: /^[7][0-9]{6}$/,
  },
  { c: "TG", flag: "🇹🇬", name: "Togo", dial: "+228", re: /^[9][0-9]{7}$/ },
  { c: "TO", flag: "🇹🇴", name: "Tonga", dial: "+676", re: /^[7][0-9]{6}$/ },
  {
    c: "TT",
    flag: "🇹🇹",
    name: "Trinidad & Tobago",
    dial: "+1868",
    re: /^[2-9][0-9]{6}$/,
  },
  { c: "TN", flag: "🇹🇳", name: "Tunisia", dial: "+216", re: /^[2-9][0-9]{7}$/ },
  { c: "TR", flag: "🇹🇷", name: "Turkey", dial: "+90", re: /^[5][0-9]{9}$/ },
  {
    c: "TM",
    flag: "🇹🇲",
    name: "Turkmenistan",
    dial: "+993",
    re: /^[6][0-9]{7}$/,
  },
  { c: "TV", flag: "🇹🇻", name: "Tuvalu", dial: "+688", re: /^[9][0-9]{5}$/ },
  { c: "UG", flag: "🇺🇬", name: "Uganda", dial: "+256", re: /^[7][0-9]{8}$/ },
  { c: "UA", flag: "🇺🇦", name: "Ukraine", dial: "+380", re: /^[6-9][0-9]{8}$/ },
  {
    c: "AE",
    flag: "🇦🇪",
    name: "United Arab Emirates",
    dial: "+971",
    re: /^[5][0-9]{8}$/,
  },
  {
    c: "GB",
    flag: "🇬🇧",
    name: "United Kingdom",
    dial: "+44",
    re: /^[7][0-9]{9}$/,
  },
  {
    c: "US",
    flag: "🇺🇸",
    name: "United States",
    dial: "+1",
    re: /^[2-9][0-9]{9}$/,
  },
  { c: "UY", flag: "🇺🇾", name: "Uruguay", dial: "+598", re: /^[9][0-9]{7}$/ },
  {
    c: "UZ",
    flag: "🇺🇿",
    name: "Uzbekistan",
    dial: "+998",
    re: /^[9][0-9]{8}$/,
  },
  { c: "VU", flag: "🇻🇺", name: "Vanuatu", dial: "+678", re: /^[5-7][0-9]{6}$/ },
  { c: "VE", flag: "🇻🇪", name: "Venezuela", dial: "+58", re: /^[4][0-9]{9}$/ },
  { c: "VN", flag: "🇻🇳", name: "Vietnam", dial: "+84", re: /^[3-9][0-9]{8}$/ },
  { c: "YE", flag: "🇾🇪", name: "Yemen", dial: "+967", re: /^[7][0-9]{8}$/ },
  { c: "ZM", flag: "🇿🇲", name: "Zambia", dial: "+260", re: /^[9][0-9]{8}$/ },
  { c: "ZW", flag: "🇿🇼", name: "Zimbabwe", dial: "+263", re: /^[7][0-9]{8}$/ },
];

/* ════════════════════════════════════════════════════════
     STATE
  ════════════════════════════════════════════════════════ */
let selectedCountry = COUNTRIES.find((c) => c.c === "IN");
let verifyMode = "phone"; // 'phone' | 'email'
let generatedOTP = "";
let timerInterval = null;
let intlRedirect = false; // came from intl number

/* ════════════════════════════════════════════════════════
     COUNTRY DROPDOWN
  ════════════════════════════════════════════════════════ */
function buildCountryList(filter) {
  const list = document.getElementById("cd-list");
  list.innerHTML = "";
  const q = (filter || "").toLowerCase();
  const items = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q)
  );
  items.forEach((c) => {
    const div = document.createElement("div");
    div.className = "cd-item" + (c.c === selectedCountry.c ? " selected" : "");
    div.innerHTML = `<span>${c.flag}</span><span class="cd-item-name">${c.name}</span><span class="cd-item-dial">${c.dial}</span>`;
    div.onclick = () => selectCountry(c);
    list.appendChild(div);
  });
}

function toggleCountryDropdown() {
  const dd = document.getElementById("country-dropdown");
  const trig = document.getElementById("country-trigger");
  const open = dd.style.display === "none";
  dd.style.display = open ? "block" : "none";
  trig.classList.toggle("open", open);
  if (open) {
    buildCountryList("");
    document.getElementById("cd-search").value = "";
    document.getElementById("cd-search").focus();
  }
}

function filterCountries(q) {
  buildCountryList(q);
}

function selectCountry(c) {
  selectedCountry = c;
  document.getElementById("ct-flag").textContent = c.flag;
  document.getElementById("ct-name").textContent = c.name;
  document.getElementById("ct-dial").textContent = c.dial;
  document.getElementById("phone-dial-badge").textContent = c.dial;
  document.getElementById("country-dropdown").style.display = "none";
  document.getElementById("country-trigger").classList.remove("open");
  document.getElementById("f-mobile").value = "";
  updateHint();
  checkIntlNotice();
  onMobileInput(document.getElementById("f-mobile"));
}

document.addEventListener("click", function (e) {
  const wrap = document.getElementById("country-select-wrap");
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById("country-dropdown").style.display = "none";
    document.getElementById("country-trigger").classList.remove("open");
  }
});

function updateHint() {
  const h = document.getElementById("mobile-hint");
  if (!h) return;
  const c = selectedCountry;
  h.textContent = `${c.name} (${c.dial}): enter number without country code`;
}

function checkIntlNotice() {
  const isIndia = selectedCountry.c === "IN";
  const notice = document.getElementById("intl-notice");
  const phoneAction =
    document.getElementById("phone-otp-action") ||
    document.getElementById("otp-btn");
  if (notice) notice.style.display = isIndia ? "none" : "flex";
  const btn = document.getElementById("otp-btn");
  if (!isIndia) {
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = ".45";
      btn.style.cursor = "not-allowed";
    }
  }
}

/* ════════════════════════════════════════════════════════
     VERIFY MODE TOGGLE
  ════════════════════════════════════════════════════════ */
function switchVerifyMode(mode, fromIntl) {
  verifyMode = mode;
  intlRedirect = !!fromIntl;
  document
    .getElementById("vt-phone")
    .classList.toggle("active", mode === "phone");
  document
    .getElementById("vt-email")
    .classList.toggle("active", mode === "email");
  document.getElementById("mode-phone").style.display =
    mode === "phone" ? "block" : "none";
  document.getElementById("mode-email").style.display =
    mode === "email" ? "block" : "none";

  if (mode === "email" && fromIntl) {
    const mob = document.getElementById("f-mobile").value;
    document.getElementById("intl-mobile-locked").style.display = mob
      ? "block"
      : "none";
    document.getElementById("locked-dial-badge").textContent =
      selectedCountry.dial;
    document.getElementById("f-locked-mobile").value = mob;
  } else {
    const locked = document.getElementById("intl-mobile-locked");
    if (locked) locked.style.display = "none";
  }
}

/* ════════════════════════════════════════════════════════
     MOBILE INPUT VALIDATION
  ════════════════════════════════════════════════════════ */
function onMobileInput(el) {
  el.value = el.value.replace(/\D/g, "");
  const valid = selectedCountry.re.test(el.value);
  const isIndia = selectedCountry.c === "IN";
  const btn = document.getElementById("otp-btn");
  document.getElementById("mobile-err").style.display =
    el.value.length > 2 && !valid ? "block" : "none";
  if (btn) {
    const canSend = valid && isIndia;
    btn.disabled = !canSend;
    btn.style.opacity = canSend ? "1" : ".45";
    btn.style.cursor = canSend ? "pointer" : "not-allowed";
  }
  checkIntlNotice();
}

/* ════════════════════════════════════════════════════════
     EMAIL INPUT VALIDATION
  ════════════════════════════════════════════════════════ */
function onEmailInput(el) {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
  const btn = document.getElementById("email-otp-btn");
  document.getElementById("email-err").style.display =
    el.value.length > 3 && !valid ? "block" : "none";
  if (btn) {
    btn.disabled = !valid;
    btn.style.opacity = valid ? "1" : ".45";
    btn.style.cursor = valid ? "pointer" : "not-allowed";
  }
}

/* ════════════════════════════════════════════════════════
     SEND OTP
  ════════════════════════════════════════════════════════ */
function sendOTP(type) {
  // generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  toggleLoader(
    type === "phone" ? "Sending OTP via SMS" : "Sending OTP to email"
  );
  target = "";
  if (type === "phone") {
    const mob = document.getElementById("f-mobile").value;
    target = selectedCountry.dial + " " + mob;
  } else {
    const email = document.getElementById("f-verify-email").value.trim();
    target = email;
  }

  fetch("https://saleson.co.inapi/v1/users/getOTP", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company_id: "",
      user_identifier: target.split(" ")[1],
    }),
  })
    // .then(response => response.json())
    .then((response) => {
      toggleLoader();
      if (response.status === 200) {
        document.getElementById("otp-target-display").textContent = target;
        document.getElementById("page-verify").style.display = "none";
        document.getElementById("page-otp").style.display = "block";
        clearOTPBoxes();
        document.getElementById("otp-err").style.display = "none";
        startResendTimer();
        setTimeout(() => {
          document.querySelectorAll(".otp-input")[0].focus();
        }, 80);
      } else {
        alert("Error in getting OTP ");
      }
    })
    .catch((error) => {
      toggleLoader();
      console.error("Error:", error);
      alert("Error in getting OTP ", error);
    });
}

/* ════════════════════════════════════════════════════════
     LOADER HELPER
  ════════════════════════════════════════════════════════ */
function toggleLoader(msg) {
  const loader = document.getElementById("fc-loader");
  document.getElementById("fc-loader-text").textContent = msg || "Please wait…";
  loader.classList.contains("show")
    ? loader.classList.remove("show")
    : loader.classList.add("show");
  // setTimeout(() => { loader.classList.remove('show'); if (then) then(); }, duration || 800);
}

/* ════════════════════════════════════════════════════════
     OTP BOX INTERACTIONS
  ════════════════════════════════════════════════════════ */
function clearOTPBoxes() {
  document.querySelectorAll(".otp-input").forEach((i) => {
    i.value = "";
    i.classList.remove("filled", "error");
  });
}

function otpInput(el, idx) {
  el.value = el.value.replace(/\D/g, "").slice(0, 1);
  el.classList.toggle("filled", el.value !== "");
  document.getElementById("otp-err").style.display = "none";
  document
    .querySelectorAll(".otp-input")
    .forEach((i) => i.classList.remove("error"));
  if (el.value && idx < 5)
    document.querySelectorAll(".otp-input")[idx + 1].focus();
}

function otpKey(e, idx) {
  if (e.key === "Backspace") {
    const boxes = document.querySelectorAll(".otp-input");
    if (!boxes[idx].value && idx > 0) {
      boxes[idx - 1].focus();
      boxes[idx - 1].value = "";
      boxes[idx - 1].classList.remove("filled");
    }
  }
}

function verifyOTP() {
  console.log("target ", target);
  const entered = Array.from(document.querySelectorAll(".otp-input"))
    .map((b) => b.value)
    .join("");
  if (entered.length < 6) {
    document.getElementById("otp-err").textContent =
      "Please enter all 6 digits.";
    document.getElementById("otp-err").style.display = "block";
    return;
  }
  toggleLoader("Verifying OTP");
  fetch("https://saleson.co.inapi/v1/users/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic " + btoa(target.split(" ")[1] + ":" + entered),
    },
    body: JSON.stringify({ auth_type: "OTP" }),
  })
    .then((res) => res.json())
    .then((data) => {
      toggleLoader();
      if (data.status == "Success") {
        localStorage.setItem('userInfo', JSON.stringify(data.user));
				localStorage.setItem('token', data.token);
        clearInterval(timerInterval);
        document.getElementById("page-otp").style.display = "none";
        document.getElementById("page-form").style.display = "block";
        // If email was verified, pre-fill email field and lock it
        if (verifyMode === "email") {
          const ev = document.getElementById("f-verify-email").value.trim();
          const ef = document.getElementById("f-email");
          if (ef) {
            ef.value = ev;
            ef.readOnly = true;
            ef.style.background = "var(--surface)";
            ef.style.color = "var(--ink-mute)";
          }
        }
        const sub = document.getElementById("verified-sub");
        if (sub) sub.textContent = "Verified ✓ — Complete your profile below.";
      } else {
        alert(data.message);
      }
    })
    .catch((err) => {
      toggleLoader();
      console.error(err);
      document
        .querySelectorAll(".otp-input")
        .forEach((b) => b.classList.add("error"));
      document.getElementById("otp-err").textContent =
        "Incorrect OTP. Please try again.";
      document.getElementById("otp-err").style.display = "block";
      setTimeout(() => {
        document
          .querySelectorAll(".otp-input")
          .forEach((b) => b.classList.remove("error"));
        clearOTPBoxes();
        document.querySelectorAll(".otp-input")[0].focus();
      }, 800);
    });
}

function goBackToVerify() {
  clearInterval(timerInterval);
  document.getElementById("page-otp").style.display = "none";
  document.getElementById("page-verify").style.display = "block";
}

function startResendTimer() {
  let secs = 30;
  document.getElementById("resend-timer").style.display = "inline";
  document.getElementById("resend-btn").style.display = "none";
  document.getElementById("timer-count").textContent = secs;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secs--;
    document.getElementById("timer-count").textContent = secs;
    if (secs <= 0) {
      clearInterval(timerInterval);
      document.getElementById("resend-timer").style.display = "none";
      document.getElementById("resend-btn").style.display = "inline";
    }
  }, 1000);
}

function resendOTP() {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(
    `%c Resent OTP: ${generatedOTP}`,
    "background:#d97706;color:#fff;padding:4px 10px;border-radius:4px;font-size:14px;font-weight:bold;"
  );
  clearOTPBoxes();
  document.getElementById("otp-err").style.display = "none";
  startResendTimer();
  document.querySelectorAll(".otp-input")[0].focus();
}

/* ════════════════════════════════════════════════════════
     PARTNER FORM SUBMIT
  ════════════════════════════════════════════════════════ */
function submitPartnerForm() {
  const name = document.getElementById("f-name").value.trim();
  const bName = document.getElementById("b-name").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const address = document.getElementById("f-address").value;
  if (!name || !email || !bName) {
    alert("Please fill in Name, Email, and Business Name.");
    return;
  }
  let payload = {
    company_name: bName,
    name: name,
    email: email,
    // mobile: formData.mobile,
    address: address,
    password: "123456",
    type: "Partner",
  };
  toggleLoader("");
  fetch("https://saleson.co.inapi/v1/companies/setup", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json", 'Authorization':  "Bearer " + localStorage.getItem('token')},
  })
    .then((res) => res.json())
    .then((data) => {
      toggleLoader("");
      if (response.status === 200) {
        document.getElementById("page-form").style.display = "none";
        document.getElementById("form-success").classList.add("show");
        window.scrollTo({
          top: document.getElementById("apply").offsetTop - 100,
          behavior: "smooth",
        });
      } else {
        alert(data.message);
      }
    });
}

/* ════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  buildCountryList("");
  updateHint();
  // Enter on mobile input → Send OTP
  document.getElementById("f-mobile").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const btn = document.getElementById("otp-btn");
      if (!btn.disabled) sendOTP("phone");
    }
  });

  // Enter on email input → Send OTP
  document.getElementById("f-verify-email").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const btn = document.getElementById("email-otp-btn");
      if (!btn.disabled) sendOTP("email");
    }
  });

  // Enter on country search → select first result
  document.getElementById("cd-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = document.querySelector(".cd-item");
      if (first) first.click();
    }
  });

  // Enter anywhere on partner form → submit
  document.getElementById("page-form").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      submitPartnerForm();
    }
  });
});
