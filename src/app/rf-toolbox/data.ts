export const vswrTable = [
  { vswr: "1.00", rl: "∞", transLoss: "0.000", reflCoeff: "0.00", transPower: "100.0", reflPower: "0.00" },
  { vswr: "1.10", rl: "26.4", transLoss: "0.010", reflCoeff: "0.05", transPower: "99.8", reflPower: "0.20" },
  { vswr: "1.20", rl: "20.8", transLoss: "0.036", reflCoeff: "0.09", transPower: "99.2", reflPower: "0.80" },
  { vswr: "1.30", rl: "17.7", transLoss: "0.075", reflCoeff: "0.13", transPower: "98.3", reflPower: "1.70" },
  { vswr: "1.40", rl: "15.6", transLoss: "0.122", reflCoeff: "0.17", transPower: "97.2", reflPower: "2.80" },
  { vswr: "1.50", rl: "14.0", transLoss: "0.177", reflCoeff: "0.20", transPower: "96.0", reflPower: "4.00" },
  { vswr: "2.00", rl: "9.5", transLoss: "0.512", reflCoeff: "0.33", transPower: "88.9", reflPower: "11.1" },
  { vswr: "3.00", rl: "6.0", transLoss: "1.249", reflCoeff: "0.50", transPower: "75.0", reflPower: "25.0" },
];

export const dielectricsTable = [
  { name: "RO3003", er: "3.00±0.04", tand: "0.0013", thickness: "0.005\", 0.010\", 0.020\"" },
  { name: "RO4003C", er: "3.38±0.05", tand: "0.0027", thickness: "0.008\", 0.012\", 0.020\"" },
  { name: "RO4350B", er: "3.48±0.05", tand: "0.0037", thickness: "0.004\", 0.010\", 0.020\"" },
  { name: "RT/duroid 5880", er: "2.20±0.02", tand: "0.0009", thickness: "0.005\" to 0.125\"" },
  { name: "Alumina (Al2O3) 99.6%", er: "9.9", tand: "0.0001", thickness: "Various" },
  { name: "Aluminum Nitride (AlN)", er: "8.9", tand: "0.0005", thickness: "Various" },
  { name: "GaAs", er: "12.9", tand: "0.0016", thickness: "Various" },
];

export const waveguideTable = [
  { gb: "BJ320", wr: "WR28", freq: "26.3~40.0", a: "7.112", b: "3.556" },
  { gb: "BJ400", wr: "WR22", freq: "32.9~50.1", a: "5.690", b: "2.845" },
  { gb: "BJ500", wr: "WR18", freq: "39.2~59.6", a: "4.775", b: "2.388" },
  { gb: "BJ620", wr: "WR14", freq: "49.8~75.8", a: "3.759", b: "1.880" },
  { gb: "BJ740", wr: "WR12", freq: "60.5~91.9", a: "3.0988", b: "1.5494" },
  { gb: "BJ900", wr: "WR10", freq: "73.8~112", a: "2.54", b: "1.27" },
  { gb: "BJ1200", wr: "WR8", freq: "92.2~140", a: "2.032", b: "1.016" },
];

export const freqBandsTable = [
  { band: "L Band", freq: "1-2 GHz", wavelength: "15-30 cm", applications: "GPS, Radar, Telecommunications" },
  { band: "S Band", freq: "2-4 GHz", wavelength: "7.5-15 cm", applications: "Wi-Fi, Bluetooth, Weather Radar" },
  { band: "C Band", freq: "4-8 GHz", wavelength: "3.75-7.5 cm", applications: "Satellite, Wi-Fi" },
  { band: "Upper mid-band study range", freq: "4.4-4.8 GHz", wavelength: "6.25-6.81 cm", applications: "WRC-27 IMT study candidate — not an allocation" },
  { band: "Upper mid-band study range", freq: "7.125-8.4 GHz", wavelength: "3.57-4.21 cm", applications: "WRC-27 IMT study candidate — not an allocation" },
  { band: "X Band", freq: "8-12 GHz", wavelength: "2.5-3.75 cm", applications: "Military Radar, Weather" },
  { band: "Ku Band", freq: "12-18 GHz", wavelength: "1.67-2.5 cm", applications: "Satellite Communications" },
  { band: "Upper mid-band study range", freq: "14.8-15.35 GHz", wavelength: "1.95-2.03 cm", applications: "WRC-27 IMT study candidate — not an allocation" },
  { band: "K Band", freq: "18-27 GHz", wavelength: "1.11-1.67 cm", applications: "Radar, Astronomy" },
  { band: "Ka Band", freq: "27-40 GHz", wavelength: "0.75-1.11 cm", applications: "Satellite, 5G" },
  { band: "V Band", freq: "40-75 GHz", wavelength: "4-7.5 mm", applications: "60 GHz WiGig, Radar" },
  { band: "W Band", freq: "75-110 GHz", wavelength: "2.7-4 mm", applications: "Automotive Radar, Imaging" },
  { band: "mmWave", freq: "30-300 GHz", wavelength: "1-10 mm", applications: "5G, 6G, High-res Radar" },
  { band: "Sub-THz (engineering usage)", freq: "100-300 GHz", wavelength: "1-3 mm", applications: "Sensing, Imaging, 6G research" },
  { band: "Terahertz", freq: "0.3-1 THz", wavelength: "0.3-1 mm", applications: "Spectroscopy, Imaging, Communications Research" },
];
