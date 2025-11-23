
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { GlobalSettingsService } from '../../services/global-settings.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

interface ValidationResult {
  isValid: boolean;
  iban: string;
  bankName?: string;
  bic?: string;
  branch?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  details?: string; // from AI
  messages?: string[]; // from API
  source: 'API' | 'AI';
}

@Component({
  selector: 'app-info-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './info-search.component.html',
  styles: []
})
export class InfoSearchComponent {
  private geminiService = inject(GeminiService);
  private settings = inject(GlobalSettingsService);

  ibanInput = signal<string>('');
  isLoading = signal<boolean>(false);
  result = signal<ValidationResult | null>(null);
  error = signal<string | null>(null);

  async validate() {
    this.error.set(null);
    this.result.set(null);
    
    const rawIban = this.ibanInput().replace(/\s/g, '').toUpperCase();
    
    if (!rawIban) {
      this.error.set('Please enter an IBAN.');
      return;
    }

    this.isLoading.set(true);

    // 1. Try Public API
    try {
      const apiResponse = await fetch(`https://openiban.com/validate/${rawIban}?getBIC=true&validateBankCode=true`);
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        // Map API response to our result format
        this.result.set({
          isValid: data.valid,
          iban: data.iban || rawIban,
          bankName: data.bankData?.name || 'Unknown Bank',
          bic: data.bankData?.bic || '',
          city: data.bankData?.city || '',
          zip: data.bankData?.zip || '',
          country: this.getCountryName(rawIban.substring(0, 2)),
          messages: data.messages || [],
          source: 'API'
        });
        this.isLoading.set(false);
        return;
      }
    } catch (err) {
      console.warn('API validation failed or unreachable, falling back to AI if enabled.', err);
    }

    // 2. Fallback to Gemini if API failed/unreachable AND AI is enabled
    if (this.settings.aiEnabled()) {
      try {
        const aiData = await this.geminiService.validateIban(rawIban);
        
        this.result.set({
          isValid: aiData.isValid,
          iban: rawIban,
          bankName: aiData.bankName || 'Unknown',
          bic: aiData.bic,
          branch: aiData.branch,
          address: aiData.address,
          city: aiData.city,
          zip: aiData.zip,
          country: aiData.country,
          details: aiData.details,
          source: 'AI'
        });
      } catch (err) {
        console.error(err);
        this.error.set('Validation failed. Public API is unavailable and AI could not process the request.');
      }
    } else {
      this.error.set('Validation API unavailable. Please enable "AI Features" to use advanced validation fallback.');
    }

    this.isLoading.set(false);
  }

  private getCountryName(code: string): string {
    const names: Record<string, string> = {
      'DE': 'Germany', 'GB': 'United Kingdom', 'FR': 'France', 'IE': 'Ireland',
      'ES': 'Spain', 'IT': 'Italy', 'NL': 'Netherlands', 'BE': 'Belgium',
      'AT': 'Austria', 'PT': 'Portugal', 'CH': 'Switzerland', 'SE': 'Sweden',
      'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland'
    };
    return names[code] || code;
  }
}
