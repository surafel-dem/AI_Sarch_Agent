// Irish Car Makes and Models
export const IrishCarMakesAndModels = {
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
  'Ford': ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'EcoSport', 'Edge', 'Galaxy', 'S-Max'],
  'Honda': ['Civic', 'CR-V', 'HR-V', 'Jazz', 'e'],
  'Hyundai': ['i10', 'i20', 'i30', 'i40', 'Kona', 'Tucson', 'Santa Fe', 'IONIQ', 'KONA Electric'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Sorento', 'Stonic', 'XCeed', 'EV6'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Note', 'Ariya'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland', 'Mokka'],
  'Peugeot': ['208', '2008', '308', '3008', '5008', '508', 'Partner', 'Rifter'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Kadjar', 'Koleos', 'Zoe', 'Arkana'],
  'Skoda': ['Fabia', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Scala', 'Enyaq'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'C-HR', 'RAV4', 'Prius', 'Land Cruiser', 'Aygo', 'bZ4X'],
  'Volkswagen': ['Polo', 'Golf', 'Passat', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4'],
  'Volvo': ['S60', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40']
};

// Irish Counties
export const IrishCounties = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
  'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
  'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo',
  'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];

// Fuel Types
export const fuelTypes = [
  'Petrol',
  'Diesel',
  'Hybrid',
  'Plug-in Hybrid',
  'Electric',
  'LPG'
];

// Transmission Types
export const transmissionTypes = [
  'Manual',
  'Automatic',
  'Semi-Automatic',
  'CVT'
];

// Body Types
export const bodyTypes = [
  'Hatchback',
  'Saloon',
  'Estate',
  'SUV',
  'Crossover',
  'Coupe',
  'Convertible',
  'MPV',
  'Van'
];

// Vehicle History
export const vehicleHistory = [
  'New',
  'Used',
  'Demo',
  'Import'
];

// Year Range
export const yearRange = Array.from(
  { length: 25 }, 
  (_, i) => (new Date().getFullYear() - i).toString()
);

// Price Ranges
export const priceRanges = {
  min: [0, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000],
  max: [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000]
};
