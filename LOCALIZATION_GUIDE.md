# Localization & RTL Support Guide

## Overview

The ngx-time-scheduler library now supports full localization with Right-to-Left (RTL) language support, particularly for Arabic. This guide explains how to use and extend the localization features.

## Supported Features

✅ **Multi-language Support**: English (en) and Arabic (ar) by default  
✅ **RTL Layout**: Automatic layout reversal for RTL languages  
✅ **Sticky Headers**: Headers remain sticky in both LTR and RTL modes  
✅ **Responsive Design**: UI maintains responsiveness in both directions  
✅ **Translation Management**: ngx-translate integration for easy text management  
✅ **Moment.js Locale**: Automatic locale switching for date formatting  

## Installation

The dependencies are already installed. If you need to reinstall:

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

## Quick Start

### In Your Component

```typescript
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationService } from '@adelsoli/ngx-scheduler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [TranslateModule] // Important!
})
export class AppComponent implements OnInit {
  currentLanguage = 'en';

  constructor(
    private translateService: TranslateService,
    private localizationService: LocalizationService
  ) {}

  ngOnInit() {
    this.initializeLocalization();
  }

  private initializeLocalization() {
    this.translateService.setDefaultLanguage('en');
    this.translateService.use(this.currentLanguage);
    this.localizationService.setLanguage(this.currentLanguage);
  }

  changeLanguage(language: string) {
    this.currentLanguage = language;
    this.translateService.use(language);
    this.localizationService.setLanguage(language);
  }
}
```

### In Your Template

```html
<!-- Pass language to scheduler -->
<ngx-ts
  [language]="currentLanguage"
  [items]="items"
  [periods]="periods"
  [sections]="sections"
  [events]="events"
></ngx-ts>

<!-- Use translate pipe for text -->
<h1>{{ 'app.title' | translate }}</h1>
<button>{{ 'app.buttons.addEvent' | translate }}</button>
```

## Configuration

### Setting Up Translations in Your App

1. Create translation files in `src/assets/i18n/`:

```
src/assets/i18n/
├── en.json
└── ar.json
```

2. English translation (`en.json`):
```json
{
  "app": {
    "title": "Outlook Scheduling Assistant",
    "buttons": {
      "addEvent": "+ Add Event"
    }
  }
}
```

3. Arabic translation (`ar.json`):
```json
{
  "app": {
    "title": "مساعد الجدولة في Outlook",
    "buttons": {
      "addEvent": "+ إضافة حدث"
    }
  }
}
```

### AppConfig Setup

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }).providers ?? []
  ]
};
```

## RTL Styling

RTL styles are automatically applied via CSS when the document `dir="rtl"` attribute is set.

### RTL CSS Features

- **Automatic text direction**: All flex layouts are reversed
- **Border positioning**: Borders and padding are adjusted
- **Sticky positioning**: Left/right positions are swapped
- **Header stickiness**: Headers remain sticky in RTL
- **Responsive adjustments**: Mobile layouts adapt to RTL

### CSS Classes for RTL

The following CSS pseudo-class handles RTL:

```css
[dir="rtl"] .your-class {
  /* RTL-specific styles */
}
```

### Custom RTL Styles

Add to your component's CSS:

```css
[dir="rtl"] .your-custom-component {
  direction: rtl;
  flex-direction: row-reverse;
}
```

## Built-in Translation Keys

### Scheduler Library Keys

```
scheduler.buttons.next
scheduler.buttons.prev
scheduler.buttons.today
scheduler.buttons.gotoDate

scheduler.labels.attendees
scheduler.labels.headerTitle
scheduler.labels.addAttendee
scheduler.labels.selectAttendee

scheduler.placeholders.searchAttendee

scheduler.messages.noResults
scheduler.messages.loading

scheduler.statuses.busy
scheduler.statuses.free
scheduler.statuses.tentative
scheduler.statuses.outOfOffice
scheduler.statuses.workingElsewhere
```

### Testing App Keys

```
app.title
app.buttons.addEvent
app.buttons.addAttendee

app.labels.from
app.labels.to

app.legend.busy
app.legend.free
app.legend.tentative
app.legend.outOfOffice

app.inputs.fromTime
app.inputs.toTime
```

## Supported Languages

Currently supported:
- **English (en)** - Left-to-Right
- **Arabic (ar)** - Right-to-Left

### RTL Languages Recognized

The following languages are automatically detected as RTL:
- `ar` - Arabic
- `he` - Hebrew  
- `fa` - Farsi
- `ur` - Urdu

## Adding a New Language

1. Create a new translation file: `src/assets/i18n/[lang-code].json`
2. Add the language code to the `supportedLanguages` array in `LocalizationService`
3. Add to `rtlLanguages` array if it's an RTL language:

```typescript
// In localization.service.ts
private supportedLanguages = ['en', 'ar', 'fr']; // Add your language
private rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Add if RTL
```

4. Translate all keys in your JSON file

## LocalizationService API

The `LocalizationService` provides helper methods:

```typescript
// Set current language
localizationService.setLanguage('ar').subscribe(() => {
  // Language changed
});

// Get current language
const current = localizationService.getCurrentLanguage(); // 'ar'

// Check if RTL
const isRtl = localizationService.isRTL(); // true

// Get direction
const dir = localizationService.getDirection(); // 'rtl' | 'ltr'

// Get direction attribute
const attr = localizationService.getDirectionAttribute(); // 'rtl'

// Get supported languages
const langs = localizationService.getSupportedLanguages(); // ['en', 'ar']

// Translate key
localizationService.translate('scheduler.buttons.next').subscribe(translated => {
  console.log(translated); // 'التالي'
});

// Instant translation (synchronous)
const instant = localizationService.getInstantTranslation('scheduler.buttons.next'); // 'التالي'
```

## Handling Dates in RTL

Dates are automatically formatted using moment.js locale. The locale is updated when language changes:

```typescript
// In component
changeLanguage(language: string) {
  moment.locale(language);
  this.translateService.use(language);
}
```

## Responsive Design

The library includes responsive CSS rules for RTL:

```css
@media (max-width: 768px) {
  [dir="rtl"] .unified-grid-header {
    flex-direction: column-reverse;
  }
}
```

## Testing the Implementation

### Run the Testing App

```bash
# Build the library
ng build ngx-scheduler

# Serve the testing app
ng serve testing-app
```

### Test Language Switching

1. Open the app in browser
2. Use the language selector dropdown
3. Verify:
   - Layout flips for Arabic
   - Headers remain sticky
   - All text translates
   - Dates format correctly
   - UI remains responsive

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Common Issues & Solutions

### Issue: Translations not loading

**Solution**: Ensure translation files are in `src/assets/i18n/` and the HttpLoaderFactory is configured correctly.

### Issue: RTL not applying

**Solution**: Check that `[dir]="textDirection"` is set on the root container and the CSS files are imported.

### Issue: Headers not sticky in RTL

**Solution**: Verify CSS includes the RTL adjustments for sticky positioning:
```css
[dir="rtl"] .header-left-column {
  left: auto;
  right: 0;
}
```

### Issue: Text alignment wrong in RTL

**Solution**: Ensure the component has `direction: rtl` set and uses `text-align: right` where appropriate.

## Performance Considerations

- Translation loading is done via HTTP (lazy loaded)
- Language switching is instant (already cached)
- RTL styles use efficient CSS selectors
- No performance impact on large datasets

## Future Enhancements

Planned features:
- More language support (Spanish, French, Chinese, etc.)
- Pluralization support
- Date/number formatting options
- Custom translation key validation
- Language detection from browser settings

## Contributing

To add a new language:
1. Create translation JSON file
2. Update `LocalizationService` with new language code
3. Add RTL flag if needed
4. Test with test app
5. Submit PR

## Support

For issues or questions:
1. Check this documentation
2. Review test app implementation
3. Check ngx-translate documentation
4. Open an issue on GitHub
