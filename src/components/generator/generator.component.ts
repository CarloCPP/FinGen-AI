
import { Component, signal, inject, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalDataService, Beneficiary, BankDef } from '../../services/local-data.service';

interface ColumnDef {
  id: keyof Beneficiary | string;
  label: string;
  collapsed: boolean;
}

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generator.component.html',
  styles: []
})
export class GeneratorComponent {
  private dataService = inject(LocalDataService);

  // Data Sources
  countries = this.dataService.getAvailableCountries();

  // State
  selectedCountryCode = signal<string>('IRL'); // Default to Ireland
  
  // Search Bar State
  countrySearchQuery = signal<string>('Ireland');
  isCountryDropdownOpen = signal<boolean>(false);
  
  recordCount = signal<number>(5);
  
  // Bank Selection State
  selectedBankSwifts = signal<string[]>([]);
  
  // Custom Bank State
  customBankName = signal<string>('');
  customBankSwift = signal<string>('');

  // Generated Data
  generatedData = signal<Beneficiary[]>([]);
  
  // Tooltip State
  hoveredField = signal<{ content: string, x: number, y: number } | null>(null);
  
  // Toast State
  copiedMessage = signal<{text: string, x: number, y: number} | null>(null);

  // Column Visibility Configuration
  columns = signal<ColumnDef[]>([
    { id: 'fullName', label: 'Name', collapsed: false },
    { id: 'bankName', label: 'Bank', collapsed: false },
    { id: 'primaryIdentifier', label: 'Primary ID', collapsed: false },
    { id: 'secondaryIdentifier', label: 'Secondary ID', collapsed: false },
    { id: 'currency', label: 'Ccy', collapsed: false },
    { id: 'street1', label: 'Street 1', collapsed: false },
    { id: 'street2', label: 'Street 2', collapsed: true }, // Default collapsed
    { id: 'city', label: 'City', collapsed: false },
    { id: 'region', label: 'Region', collapsed: false },
    { id: 'postalCode', label: 'Postal', collapsed: false },
    { id: 'countryCode', label: 'Country Code', collapsed: false },
    { id: 'country', label: 'Country Name', collapsed: true }, // Default collapsed
  ]);

  // Computed
  availableBanks = computed(() => {
    return this.dataService.getBanksForCountry(this.selectedCountryCode());
  });

  filteredCountries = computed(() => {
    const query = this.countrySearchQuery().toLowerCase();
    return this.countries.filter(c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query));
  });

  constructor() {
    // Reset selected banks when country changes
    this.selectedBankSwifts.set([]);
  }

  isCollapsed(colId: string): boolean {
    return this.columns().find(c => c.id === colId)?.collapsed ?? false;
  }

  toggleColumn(colId: string) {
    this.columns.update(cols => cols.map(c => 
      c.id === colId ? { ...c, collapsed: !c.collapsed } : c
    ));
  }

  // Country Selection Logic
  selectCountry(country: { code: string, name: string }) {
    this.selectedCountryCode.set(country.code);
    this.countrySearchQuery.set(country.name);
    this.selectedBankSwifts.set([]); // Clear banks on country change
    this.isCountryDropdownOpen.set(false);
  }

  onSearchFocus() {
    this.isCountryDropdownOpen.set(true);
  }

  onSearchBlur() {
    // Small delay to allow click event on dropdown items to fire
    setTimeout(() => {
      this.isCountryDropdownOpen.set(false);
      // Validate: if current query matches a country, keep it. Else revert.
      const match = this.countries.find(c => c.name.toLowerCase() === this.countrySearchQuery().toLowerCase());
      if (match) {
        if (this.selectedCountryCode() !== match.code) {
          this.selectCountry(match);
        }
      } else {
        // Revert to currently selected country name
        const current = this.countries.find(c => c.code === this.selectedCountryCode());
        if (current) this.countrySearchQuery.set(current.name);
      }
    }, 200);
  }

  toggleBank(swift: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedBankSwifts();
    
    if (checked) {
      this.selectedBankSwifts.set([...current, swift]);
    } else {
      this.selectedBankSwifts.set(current.filter(s => s !== swift));
    }
  }

  isBankSelected(swift: string): boolean {
    return this.selectedBankSwifts().includes(swift);
  }

  // Computed Definitions for Tooltips
  getFieldDefinition(field: string, record: Beneficiary): string {
    switch (field) {
      case 'primaryIdentifier':
        const ibanCountries = ['Ireland', 'Germany', 'France', 'United Kingdom', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Austria'];
        if (ibanCountries.some(c => record.country.includes(c))) {
          return "IBAN (International Bank Account Number).";
        }
        if (record.countryCode === 'USA') return "Domestic Account Number.";
        return "Primary Account Number";
      case 'secondaryIdentifier':
        if (record.countryCode === 'USA') return "ABA Routing Number (Derived from Bank).";
        if (record.countryCode === 'GBR') return "Sort Code (Derived).";
        return "BIC/SWIFT Code.";
      case 'currency':
        return "ISO 4217 Currency Code.";
      case 'bankName':
        return "Issuing Financial Institution.";
      default:
        return field;
    }
  }

  generate() {
    let swiftsToUse = [...this.selectedBankSwifts()];
    let customBanks: BankDef[] = [];

    // Handle Custom Bank
    const customSwift = this.customBankSwift().trim();
    if (customSwift) {
      const customBank: BankDef = {
        name: this.customBankName().trim() || 'Custom Bank',
        swift: customSwift
      };
      customBanks.push(customBank);
      
      if (!swiftsToUse.includes(customSwift)) {
        swiftsToUse.push(customSwift);
      }
    }

    const data = this.dataService.generateBeneficiaries(
      this.selectedCountryCode(), 
      this.recordCount(),
      swiftsToUse,
      customBanks
    );
    this.generatedData.set(data);
  }

  showTooltip(event: MouseEvent, field: string, record: Beneficiary) {
    if (this.isCollapsed(field)) return; // Don't show tooltip if collapsed
    
    const definition = this.getFieldDefinition(field, record);
    this.hoveredField.set({
      content: definition,
      x: event.clientX + 10,
      y: event.clientY + 10
    });
  }

  hideTooltip() {
    this.hoveredField.set(null);
  }

  copyToClipboard(text: string, event: MouseEvent) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    
    this.copiedMessage.set({
      text: 'Copied!',
      x: event.clientX,
      y: event.clientY - 30
    });
    
    setTimeout(() => {
      this.copiedMessage.set(null);
    }, 1500);
  }

  // Export Functions
  exportCSV() {
    if (this.generatedData().length === 0) return;

    const data = this.generatedData();
    const headers = ['Name', 'Bank', 'Primary ID', 'Secondary ID', 'Currency', 'Street 1', 'Street 2', 'City', 'Region', 'Postal Code', 'Country Code', 'Country Name'];
    
    const rows = data.map(record => [
      `"${record.fullName}"`,
      `"${record.bankName}"`,
      `"${record.primaryIdentifier}"`,
      `"${record.secondaryIdentifier}"`,
      `"${record.currency}"`,
      `"${record.street1}"`,
      `"${record.street2}"`,
      `"${record.city}"`,
      `"${record.region}"`,
      `"${record.postalCode}"`,
      `"${record.countryCode}"`,
      `"${record.country}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, 'beneficiaries.csv', 'text/csv');
  }

  exportJSON() {
    if (this.generatedData().length === 0) return;
    const jsonContent = JSON.stringify(this.generatedData(), null, 2);
    this.downloadFile(jsonContent, 'beneficiaries.json', 'application/json');
  }

  private downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
