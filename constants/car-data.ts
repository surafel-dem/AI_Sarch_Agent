export const IrishCarMakesAndModels = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', 'X1', 'X3', 'X5'],
  'Ford': ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'EcoSport'],
  'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'GLA', 'GLC'],
  'Nissan': ['Micra', 'Qashqai', 'Juke', 'X-Trail', 'Leaf'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland'],
  'Peugeot': ['208', '2008', '3008', '5008', '508'],
  'Renault': ['Clio', 'Captur', 'Kadjar', 'Megane', 'Zoe'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'],
  'Toyota': ['Yaris', 'Corolla', 'RAV4', 'C-HR', 'Camry'],
  'Volkswagen': ['Polo', 'Golf', 'Tiguan', 'Passat', 'T-Roc', 'ID.4']
} as const;

export const IrishCounties = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
  'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo',
  'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
  'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
] as const;

export const yearRange = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString());

export const priceRanges = [
  { min: 0, max: 5000, label: 'Under €5,000' },
  { min: 5000, max: 10000, label: '€5,000 - €10,000' },
  { min: 10000, max: 15000, label: '€10,000 - €15,000' },
  { min: 15000, max: 20000, label: '€15,000 - €20,000' },
  { min: 20000, max: 30000, label: '€20,000 - €30,000' },
  { min: 30000, max: 50000, label: '€30,000 - €50,000' },
  { min: 50000, max: null, label: 'Over €50,000' }
];
