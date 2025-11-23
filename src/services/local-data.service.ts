
import { Injectable } from '@angular/core';

export interface Beneficiary {
  fullName: string;
  bankName: string;
  primaryIdentifier: string;
  secondaryIdentifier: string;
  currency: string;
  street1: string;
  street2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  countryCode: string;
}

export interface BankDef {
  name: string;
  swift: string;
}

interface CountryConfig {
  name: string;
  currency: string;
  banks: BankDef[];
  regions?: string[];
  cities?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  private firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Ahmed', 'Wei', 'Yan', 'Hiroshi', 'Fatima', 'Santiago', 'Elena'];
  private lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Kim', 'Chen', 'Singh', 'Sato'];

  private streetNames = ['Main St', 'High St', 'Park Ave', 'Oak Ln', 'Maple Dr', 'Cedar Blvd', 'Sunset Way', 'Broadway', 'Victoria Rd', 'Church St', 'Station Rd', 'Market St', 'King St'];

  // Simplified banks for brevity, expanding major ones
  private readonly countryData: Record<string, CountryConfig> = {
    'USA': { name: 'United States', currency: 'USD', banks: [{ name: 'Chase', swift: 'CHASUS33' }, { name: 'Bank of America', swift: 'BOFAUS3N' }, { name: 'Wells Fargo', swift: 'PNBPUS33' }, { name: 'Citi', swift: 'CITIUS33' }] },
    'GBR': { name: 'United Kingdom', currency: 'GBP', banks: [{ name: 'Barclays', swift: 'BARCGB22' }, { name: 'HSBC', swift: 'HBUKGB44' }, { name: 'Lloyds', swift: 'LOYDGB22' }, { name: 'NatWest', swift: 'NWBKGB2L' }] },
    'IRL': { name: 'Ireland', currency: 'EUR', banks: [{ name: 'Bank of Ireland', swift: 'BOFIIE2D' }, { name: 'AIB', swift: 'AIBKIE2D' }, { name: 'Ulster Bank', swift: 'ULSBIE2D' }] },
    'DEU': { name: 'Germany', currency: 'EUR', banks: [{ name: 'Deutsche Bank', swift: 'DEUTDEFF' }, { name: 'Commerzbank', swift: 'COBADEFF' }, { name: 'KfW', swift: 'KREDDEFF' }] },
    'FRA': { name: 'France', currency: 'EUR', banks: [{ name: 'BNP Paribas', swift: 'BNPAFRPP' }, { name: 'Societe Generale', swift: 'SOGEFRPP' }, { name: 'Credit Agricole', swift: 'AGRIFRPP' }] },
    'AUS': { name: 'Australia', currency: 'AUD', banks: [{ name: 'Commonwealth Bank', swift: 'CTBAAU2S' }, { name: 'Westpac', swift: 'WPACAU2S' }, { name: 'ANZ', swift: 'ANZBAU3M' }] },
    'CAN': { name: 'Canada', currency: 'CAD', banks: [{ name: 'RBC', swift: 'ROYCCAT2' }, { name: 'TD Bank', swift: 'TDOMCATT' }, { name: 'Scotiabank', swift: 'NOSCCATT' }] },
    'JPN': { name: 'Japan', currency: 'JPY', banks: [{ name: 'MUFG', swift: 'BOTKJPJT' }, { name: 'SMBC', swift: 'SMBCJPJT' }, { name: 'Mizuho', swift: 'MHCBJPJT' }] },
    'SGP': { name: 'Singapore', currency: 'SGD', banks: [{ name: 'DBS', swift: 'DBSSSGSG' }, { name: 'OCBC', swift: 'OCBCSGSG' }, { name: 'UOB', swift: 'UOVBSGSG' }] },
    'BRA': { name: 'Brazil', currency: 'BRL', banks: [{ name: 'Itau', swift: 'ITAUBRSP' }, { name: 'Bradesco', swift: 'BRDEBRSP' }, { name: 'Banco do Brasil', swift: 'BRASBRRJ' }] },
    'NLD': { name: 'Netherlands', currency: 'EUR', banks: [{ name: 'ING', swift: 'INGBNL2A' }, { name: 'ABN AMRO', swift: 'ABNANL2A' }, { name: 'Rabobank', swift: 'RABONL2U' }] },
    'ESP': { name: 'Spain', currency: 'EUR', banks: [{ name: 'Santander', swift: 'BSMDESMM' }, { name: 'BBVA', swift: 'BBVAESMM' }, { name: 'CaixaBank', swift: 'CAIXESBB' }] },
    'ITA': { name: 'Italy', currency: 'EUR', banks: [{ name: 'Intesa Sanpaolo', swift: 'BCITITMM' }, { name: 'UniCredit', swift: 'UNCRITM1' }] },
    'CHE': { name: 'Switzerland', currency: 'CHF', banks: [{ name: 'UBS', swift: 'UBSWCHZH' }, { name: 'Credit Suisse', swift: 'CRESCHZZ' }] },
    'CHN': { name: 'China', currency: 'CNY', banks: [{ name: 'ICBC', swift: 'ICBCCNBJ' }, { name: 'Bank of China', swift: 'BKCHCNBJ' }] },
    'IND': { name: 'India', currency: 'INR', banks: [{ name: 'SBI', swift: 'SBININBB' }, { name: 'HDFC', swift: 'HDFCINBB' }, { name: 'ICICI', swift: 'ICICINBB' }] },
    'HKG': { name: 'Hong Kong', currency: 'HKD', banks: [{ name: 'HSBC HK', swift: 'HSBCHKHH' }, { name: 'Standard Chartered', swift: 'SCBLHKHH' }] },
    'SWE': { name: 'Sweden', currency: 'SEK', banks: [{ name: 'SEB', swift: 'ESSEESS' }, { name: 'Swedbank', swift: 'SWEDSESS' }] },
    'BEL': { name: 'Belgium', currency: 'EUR', banks: [{ name: 'KBC', swift: 'KREDITBE' }, { name: 'Belfius', swift: 'GKCCBEBB' }] },
    'AUT': { name: 'Austria', currency: 'EUR', banks: [{ name: 'Erste Group', swift: 'GIBAATWW' }, { name: 'Raiffeisen', swift: 'RZBAATWW' }] },
    'POL': { name: 'Poland', currency: 'PLN', banks: [{ name: 'PKO BP', swift: 'BPKOPLPW' }, { name: 'Pekao', swift: 'PKOPPLPW' }] },
    'TUR': { name: 'Turkey', currency: 'TRY', banks: [{ name: 'Ziraat', swift: 'TCZBATII' }, { name: 'Isbank', swift: 'ISBKTRIS' }] },
    'ZAF': { name: 'South Africa', currency: 'ZAR', banks: [{ name: 'Standard Bank', swift: 'SBZAZAJJ' }, { name: 'FirstRand', swift: 'FIRNZAJJ' }] },
    'KOR': { name: 'South Korea', currency: 'KRW', banks: [{ name: 'KB Kookmin', swift: 'KOOKKRSE' }, { name: 'Shinhan', swift: 'SHBKKRSE' }] },
    'MEX': { name: 'Mexico', currency: 'MXN', banks: [{ name: 'BBVA Mexico', swift: 'BCMRMXMM' }, { name: 'Banorte', swift: 'BMNOMXMM' }] },
  };

  private readonly countryCodeMap: Record<string, string> = {
    'AFG': 'Afghanistan', 'AGO': 'Angola', 'ALA': 'Åland Islands', 'ALB': 'Albania', 'ARE': 'United Arab Emirates', 'ARG': 'Argentina', 'ATG': 'Antigua and Barbuda', 'AUS': 'Australia', 'AUT': 'Austria',
    'BEL': 'Belgium', 'BEN': 'Benin', 'BES': 'Bonaire', 'BGD': 'Bangladesh', 'BHR': 'Bahrain', 'BHS': 'Bahamas', 'BRA': 'Brazil', 'BRB': 'Barbados',
    'CAN': 'Canada', 'CHE': 'Switzerland', 'CHN': 'China', 'CXR': 'Christmas Island', 'CZE': 'Czechia',
    'DEU': 'Germany', 'DNK': 'Denmark', 'DZA': 'Algeria',
    'ECU': 'Ecuador', 'ESP': 'Spain', 'EST': 'Estonia', 'EUR': 'European Union',
    'FIN': 'Finland', 'FRA': 'France',
    'GBR': 'United Kingdom', 'GGY': 'Guernsey', 'GHA': 'Ghana', 'GIB': 'Gibraltar', 'GIN': 'Guinea', 'GLP': 'Guadeloupe', 'GRC': 'Greece', 'GUF': 'French Guiana',
    'HKG': 'Hong Kong', 'HUN': 'Hungary',
    'IDN': 'Indonesia', 'IMN': 'Isle of Man', 'IND': 'India', 'IRL': 'Ireland', 'ISL': 'Iceland', 'ISR': 'Israel', 'ITA': 'Italy',
    'JAM': 'Jamaica', 'JEY': 'Jersey', 'JPN': 'Japan',
    'KAZ': 'Kazakhstan', 'KHM': 'Cambodia', 'KOR': 'South Korea',
    'LBN': 'Lebanon', 'LBR': 'Liberia', 'LTU': 'Lithuania', 'LUX': 'Luxembourg',
    'MAC': 'Macao', 'MAR': 'Morocco', 'MEX': 'Mexico', 'MKD': 'North Macedonia', 'MYS': 'Malaysia',
    'NGA': 'Nigeria', 'NLD': 'Netherlands', 'NOR': 'Norway', 'NZL': 'New Zealand',
    'PAK': 'Pakistan', 'PHL': 'Philippines', 'POL': 'Poland', 'PYF': 'French Polynesia',
    'QAT': 'Qatar',
    'REU': 'Réunion', 'ROU': 'Romania', 'RUS': 'Russia',
    'SAU': 'Saudi Arabia', 'SGP': 'Singapore', 'SSD': 'South Sudan', 'SWE': 'Sweden', 'SWZ': 'Eswatini', 'SYR': 'Syria',
    'THA': 'Thailand', 'TUR': 'Turkey', 'TWN': 'Taiwan',
    'USA': 'United States', 'UZB': 'Uzbekistan',
    'VNM': 'Vietnam',
    'WLF': 'Wallis and Futuna',
    'XKX': 'Kosovo',
    'ZAF': 'South Africa'
  };

  getAvailableCountries(): { code: string, name: string }[] {
    return Object.entries(this.countryCodeMap)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getBanksForCountry(countryCode: string): BankDef[] {
    const config = this.countryData[countryCode];
    if (config && config.banks) {
      return config.banks;
    }
    // Generic banks if not specifically defined
    return [
      { name: `Bank of ${this.countryCodeMap[countryCode] || countryCode}`, swift: `BO${countryCode}XXXX` },
      { name: `National Bank of ${this.countryCodeMap[countryCode] || countryCode}`, swift: `NB${countryCode}XXXX` },
      { name: `${this.countryCodeMap[countryCode] || countryCode} Commercial Bank`, swift: `CB${countryCode}XXXX` }
    ];
  }

  generateBeneficiaries(
    countryCode: string, 
    count: number, 
    selectedBankSwifts: string[] = [],
    customBanks: BankDef[] = [] 
  ): Beneficiary[] {
    const name = this.countryCodeMap[countryCode] || countryCode;
    const definedConfig = this.countryData[countryCode];
    
    // Fallback config if not fully defined
    const config: CountryConfig = definedConfig || {
      name: name,
      currency: this.guessCurrency(countryCode),
      banks: this.getBanksForCountry(countryCode),
      cities: ['Capital City', 'Port City', 'Industrial City'],
      regions: ['Region A', 'Region B', 'Region C']
    };

    const results: Beneficiary[] = [];
    
    let allAvailableBanks = [...config.banks, ...customBanks];
    let eligibleBanks = allAvailableBanks;

    if (selectedBankSwifts && selectedBankSwifts.length > 0) {
      eligibleBanks = allAvailableBanks.filter(b => selectedBankSwifts.includes(b.swift));
      if (eligibleBanks.length === 0) eligibleBanks = allAvailableBanks;
    } 
    
    for (let i = 0; i < count; i++) {
      results.push(this.createRecord(config, countryCode, eligibleBanks));
    }
    return results;
  }

  private guessCurrency(code: string): string {
    const euroZone = ['AUT', 'BEL', 'CYP', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'PRT', 'SVK', 'SVN', 'ESP', 'EUR'];
    if (euroZone.includes(code)) return 'EUR';
    if (code === 'USA' || code === 'ECU') return 'USD';
    if (code === 'GBR' || code === 'GGY' || code === 'JEY' || code === 'IMN') return 'GBP';
    // Default fallback
    return 'USD';
  }

  private createRecord(config: CountryConfig, code: string, eligibleBanks: BankDef[]): Beneficiary {
    const firstName = this.getRandom(this.firstNames);
    const lastName = this.getRandom(this.lastNames);
    const bank = this.getRandom(eligibleBanks);
    
    return {
      fullName: `${firstName} ${lastName}`,
      bankName: bank.name,
      primaryIdentifier: this.generatePrimaryId(code, bank),
      secondaryIdentifier: bank.swift, // Use the real SWIFT from the bank definition
      currency: config.currency,
      street1: `${Math.floor(Math.random() * 999) + 1} ${this.getRandom(this.streetNames)}`,
      street2: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 100)}` : '',
      city: this.getRandom(config.cities || ['City']),
      region: this.getRandom(config.regions || ['Region']),
      postalCode: this.generatePostalCode(code),
      country: config.name,
      countryCode: code
    };
  }

  private generatePrimaryId(countryCode: string, bank: BankDef): string {
    // Check digits logic (random for test data, typically 'kk' in formats)
    const kk = () => Math.floor(Math.random() * 89 + 10).toString(); 
    const r = (len: number) => Array.from({length: len}, () => Math.floor(Math.random() * 10)).join('');
    const alpha = (len: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({length: len}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    // Extract bank code from SWIFT (usually first 4 characters)
    const bankCode4 = bank.swift.substring(0, 4).toUpperCase();

    // Specific Format Implementations
    switch (countryCode) {
      case 'IRL': // Ireland: IEkk BBBB SSSSSS CCCCCCCC
        // B = Bank Code (4 alpha from BIC), S = Sort Code (6 digits), C = Account (8 digits)
        return `IE${kk()}${bankCode4}${r(6)}${r(8)}`;
      
      case 'GBR': // UK: GBkk BBBB SSSSSS CCCCCCCC
        // B = Bank (4 alpha), S = Sort Code (6), C = Account (8)
        return `GB${kk()}${bankCode4}${r(6)}${r(8)}`;

      case 'DEU': // Germany: DEkk BBBBBBBB CCCCCCCCCC
        // B = BLZ (Bankleitzahl - 8 digits), C = Account (10 digits)
        return `DE${kk()}${r(8)}${r(10)}`;

      case 'FRA': // France: FRkk BBBBB GGGGG CCCCCCCCCCC DD
        // B = Bank (5 digits), G = Guichet (5 digits), C = Account (11 char), D = Key (2 digits)
        return `FR${kk()}${r(5)}${r(5)}${alpha(11)}${r(2)}`;
      
      case 'NLD': // Netherlands: NLkk BBBB CCCCCCCCCC
        // B = Bank (4 alpha), C = Account (10 digits)
        return `NL${kk()}${bankCode4}${r(10)}`;

      case 'ITA': // Italy: ITkk X BBBBB CCCCC XXXXXXXXXXXX
        // X = Check char (1), B = ABI (5), C = CAB (5), X = Account (12)
        return `IT${kk()}${alpha(1)}${r(5)}${r(5)}${alpha(12)}`;

      case 'ESP': // Spain: ESkk BBBB GGGG DC CCCCCCCCCC
        // B = Bank (4), G = Branch (4), DC = Check (2), C = Account (10)
        return `ES${kk()}${r(4)}${r(4)}${r(2)}${r(10)}`;

      case 'BEL': // Belgium: BEkk BBBC CCCC CCXX
        // Structure is specific (12 digits check mod 97). For sim: BEkk + 12 digits
        return `BE${kk()}${r(12)}`;

      case 'USA':
        // USA Primary is Account Number (variable length, usually 8-12)
        return r(Math.floor(Math.random() * 5) + 8);
        
      case 'AUS':
        // BSB (6) + Account (variable). BSB is usually Secondary. Primary is Account.
        return r(9);

      default:
        // Generic IBAN-like structure if it looks like a European/IBAN country
        const ibanCountries = ['AUT', 'EST', 'FIN', 'GRC', 'LUX', 'MLT', 'PRT', 'SVK', 'SVN', 'CYP', 'LVA', 'LTU'];
        if (ibanCountries.includes(countryCode)) {
          return `${countryCode}${kk()}${r(16)}`; // Generic 20 char IBAN
        }
        // Generic Non-IBAN Account Number
        return r(12);
    }
  }

  private generatePostalCode(countryCode: string): string {
    const randomDigits = (len: number) => Array.from({length: len}, () => Math.floor(Math.random() * 10)).join('');
    
    if (['US', 'USA'].includes(countryCode)) return randomDigits(5);
    if (['GB', 'GBR'].includes(countryCode)) return `SW${randomDigits(1)}A ${randomDigits(1)}AA`; 
    if (['IE', 'IRL'].includes(countryCode)) return `D${randomDigits(2)} ${randomDigits(4).toUpperCase()}`;
    return randomDigits(5);
  }

  private getRandom<T>(arr: T[]): T {
    if (!arr || arr.length === 0) return {} as T;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
