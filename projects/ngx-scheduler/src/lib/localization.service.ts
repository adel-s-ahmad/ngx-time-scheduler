import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private supportedLanguages = ['en', 'ar'];
  private currentLanguage = 'en';
  private rtlLanguages = ['ar', 'he', 'fa', 'ur'];

  constructor(private translateService: TranslateService) {
    this.initializeTranslations();
  }

  /**
   * Initialize translation service with default and fallback languages
   */
  private initializeTranslations(): void {
    // Set default language
    this.translateService.setDefaultLang('en');
    
    // Add supported languages
    this.translateService.addLangs(this.supportedLanguages);
  }

  /**
   * Set the current language
   */
  setLanguage(languageCode: string): Observable<any> {
    if (this.supportedLanguages.includes(languageCode)) {
      this.currentLanguage = languageCode;
      
      // Update document language and direction
      this.updateDocumentLanguage(languageCode);
      
      return this.translateService.use(languageCode);
    }
    return this.translateService.use(this.currentLanguage);
  }

  /**
   * Get the current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Check if the current language is RTL
   */
  isRTL(): boolean {
    return this.rtlLanguages.includes(this.currentLanguage);
  }

  /**
   * Get text direction (ltr or rtl)
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  /**
   * Get the direction attribute value for HTML
   */
  getDirectionAttribute(): string {
    return this.getDirection();
  }

  /**
   * Update document language and direction
   */
  private updateDocumentLanguage(languageCode: string): void {
    const htmlElement = document.documentElement;
    const isRtl = this.rtlLanguages.includes(languageCode);
    
    htmlElement.lang = languageCode;
    htmlElement.dir = isRtl ? 'rtl' : 'ltr';
    
    // Also add to body for broader CSS selectors
    document.body.dir = isRtl ? 'rtl' : 'ltr';
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [...this.supportedLanguages];
  }

  /**
   * Translate a key
   */
  translate(key: string, params?: any): Observable<string> {
    return this.translateService.get(key, params);
  }

  /**
   * Translate multiple keys
   */
  translateMultiple(keys: string[]): Observable<{ [key: string]: string }> {
    return this.translateService.get(keys);
  }

  /**
   * Get instant translation (synchronous)
   */
  getInstantTranslation(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }
}
