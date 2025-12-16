# Localization Quick Reference

## Installation & Setup

```bash
# 1. Install dependencies (already in package.json)
npm install

# 2. Build library
ng build ngx-scheduler

# 3. Start testing app
ng serve testing-app
```

## Basic Usage

### In Component
```typescript
import { TranslateService } from '@ngx-translate/core';
import { LocalizationService } from '@adelsoli/ngx-scheduler';

export class MyComponent {
  currentLanguage = 'en';

  constructor(
    private translate: TranslateService,
    private localization: LocalizationService
  ) {}

  ngOnInit() {
    this.translate.setDefaultLanguage('en');
    this.translate.use('en');
  }

  switchToArabic() {
    this.currentLanguage = 'ar';
    this.translate.use('ar');
    this.localization.setLanguage('ar');
  }
}
```

### In Template
```html
<!-- Set direction -->
<div [attr.dir]="localization.getDirection()">

  <!-- Use translate pipe -->
  <h1>{{ 'app.title' | translate }}</h1>
  
  <!-- Pass to scheduler -->
  <ngx-ts 
    [language]="currentLanguage"
    [items]="items"
    [periods]="periods"
    [sections]="sections"
  ></ngx-ts>
</div>
```

## Configuration

### Translation Files Structure
```
src/assets/i18n/
├── en.json
└── ar.json
```

### JSON Format
```json
{
  "namespace": {
    "key": "value",
    "nested": {
      "key": "value"
    }
  }
}
```

### App Config
```typescript
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

## LocalizationService API

```typescript
// Set language
localization.setLanguage('ar')

// Get current language
localization.getCurrentLanguage() // → 'ar'

// Check if RTL
localization.isRTL() // → true

// Get direction
localization.getDirection() // → 'rtl' | 'ltr'

// Get supported languages
localization.getSupportedLanguages() // → ['en', 'ar']

// Translate key
localization.translate('key').subscribe(result => {})

// Instant translation
localization.getInstantTranslation('key') // → 'translated text'
```

## Translation Keys

### Scheduler
- `scheduler.buttons.next`
- `scheduler.buttons.prev`
- `scheduler.buttons.today`
- `scheduler.buttons.gotoDate`
- `scheduler.labels.attendees`
- `scheduler.statuses.busy`
- `scheduler.statuses.free`

### Testing App
- `app.title`
- `app.buttons.addEvent`
- `app.buttons.addAttendee`
- `app.labels.from`
- `app.labels.to`
- `app.legend.busy`

## RTL Support

### Automatic
- Layout reversal ✅
- Text direction ✅
- Flex direction ✅
- Sticky positioning ✅
- Responsive design ✅

### Manual CSS
```css
[dir="rtl"] .my-class {
  direction: rtl;
  flex-direction: row-reverse;
  text-align: right;
}
```

## Add New Language

1. Create `src/assets/i18n/[code].json`
2. Copy English file as template
3. Translate all keys
4. Add code to `LocalizationService`:
   ```typescript
   private supportedLanguages = ['en', 'ar', 'fr'];
   private rtlLanguages = ['ar', 'he', 'fa', 'ur'];
   ```
5. Test with: `[language]="'fr'"`

## Supported Languages

| Code | Name | Direction |
|------|------|-----------|
| en | English | LTR |
| ar | العربية | RTL |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Translations not loading | Check `src/assets/i18n/` exists |
| RTL not applying | Add `[attr.dir]="direction"` to root |
| Date format wrong | Ensure moment.locale is set |
| Headers not sticky | Verify RTL CSS is imported |

## Testing Checklist

- [ ] Language selector works
- [ ] Text translates on switch
- [ ] RTL layout reverses
- [ ] Headers stay sticky
- [ ] No text cut off
- [ ] Mobile responsive
- [ ] Dates format correctly
- [ ] Controls functional

## Common Code Examples

### Language Selector
```html
<select (change)="changeLanguage($event.target?.value)">
  <option value="en">English</option>
  <option value="ar">العربية</option>
</select>
```

### Conditional Translation
```html
<span *ngIf="currentLanguage === 'ar'">
  النص العربي
</span>
<span *ngIf="currentLanguage === 'en'">
  English text
</span>
```

### With Parameters
```typescript
// In component
this.translate.get('key', { name: 'John' })

// In JSON
{ "greeting": "Hello {{name}}" }

// In template
<p>{{ 'greeting' | translate: {name: 'John'} }}</p>
```

## Performance Tips

- Translations lazy load via HTTP
- Cache translations after loading
- Use `| translate` pipe in templates
- Use `getInstantTranslation()` only when needed
- Language switching is instant

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Resources

- [ngx-translate Docs](https://github.com/ngx-translate/core)
- [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md)
- [LOCALIZATION_IMPLEMENTATION.md](./LOCALIZATION_IMPLEMENTATION.md)

## Next Steps

1. Review `LOCALIZATION_GUIDE.md` for detailed documentation
2. Test with `ng serve testing-app`
3. Add custom translations for your app
4. Extend with more languages
5. Customize RTL styles as needed
