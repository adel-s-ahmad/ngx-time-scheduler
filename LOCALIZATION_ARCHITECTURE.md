# Localization Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Angular Application                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  App Component / Parent Component                        │   │
│  │  ├─ currentLanguage = 'en'                              │   │
│  │  ├─ textDirection = 'ltr'                               │   │
│  │  └─ changeLanguage(lang)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NgxTimeScheduler Component                              │   │
│  │  ├─ @Input() language = 'en'                            │   │
│  │  ├─ isRTL = false                                        │   │
│  │  ├─ textDirection = 'ltr'                                │   │
│  │  └─ ngOnChanges() → updateLocalization()                │   │
│  └──────────────────────────────────────────────────────────┘   │
│          │                          │                            │
│          ▼                          ▼                            │
│  ┌──────────────────┐      ┌──────────────────────────┐         │
│  │ TranslateService │      │ LocalizationService      │         │
│  │ (ngx-translate)  │      │                          │         │
│  │ • use(language)  │      │ • setLanguage()          │         │
│  │ • get(key)       │      │ • isRTL()                │         │
│  │ • instant(key)   │      │ • getDirection()         │         │
│  └──────────────────┘      │ • updateDocumentDir()    │         │
│                            └──────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Translation Files (HTTP Loaded)                │ │
│  │  ┌──────────────────┐         ┌──────────────────┐         │ │
│  │  │  assets/i18n/    │         │  assets/i18n/    │         │ │
│  │  │  en.json         │         │  ar.json         │         │ │
│  │  │                  │         │                  │         │ │
│  │  │  {               │         │  {               │         │ │
│  │  │   scheduler: {}  │         │   scheduler: {}  │         │ │
│  │  │   app: {}        │         │   app: {}        │         │ │
│  │  │  }               │         │  }               │         │ │
│  │  └──────────────────┘         └──────────────────┘         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    CSS Styling                             │ │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐   │ │
│  │  │ .css (LTR Defaults)  │  │ -rtl.css (RTL Override) │   │ │
│  │  │                      │  │                          │   │ │
│  │  │ .flex-container {    │  │ [dir="rtl"] .element {  │   │ │
│  │  │   flex-direction:    │  │   flex-direction:       │   │ │
│  │  │   row;               │  │   row-reverse;          │   │ │
│  │  │ }                    │  │ }                        │   │ │
│  │  └──────────────────────┘  └──────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Selects Language
        │
        ▼
┌─────────────────────────┐
│ changeLanguage('ar')    │
└─────────────────────────┘
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ TranslateService.use()   │    │ LocalizationService.     │
│                          │    │ setLanguage()            │
│ • Load ar.json file      │    │ • Check if RTL           │
│ • Cache translations     │    │ • Update document.dir    │
│ • Update moment locale   │    │ • Emit language change   │
└──────────────────────────┘    └──────────────────────────┘
        │                                      │
        └──────────────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Component receives   │
                │ language change      │
                │ via ngOnChanges()    │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ updateLocalization() │
                │ • Update isRTL       │
                │ • Update direction   │
                │ • detectChanges()    │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ HTML renders with    │
                │ [attr.dir]="dir"     │
                │ [attr.lang]="lang"   │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ CSS applies          │
                │ [dir="rtl"] rules    │
                │ Layout reverses      │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Translate pipe       │
                │ converts keys to     │
                │ translated text      │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ UI displays in       │
                │ correct language     │
                │ & direction          │
                └──────────────────────┘
```

## Component Lifecycle with Localization

```
┌─────────────────────────────────────────────────────────────┐
│  NgxTimeSchedulerComponent Lifecycle                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────────┐
                   │  constructor()    │
                   │  Set up services  │
                   └───────────────────┘
                           │
                           ▼
                   ┌───────────────────┐
                   │  ngOnInit()       │
                   │  initializeLocal  │
                   │  ization()        │
                   │  • setLanguage()  │
                   │  • setLocale()    │
                   └───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Template Renders with:              │
        │  • [attr.dir]="textDirection"        │
        │  • {{ 'key' | translate }}           │
        │  • moment().format() with locale     │
        └──────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────────┐
                   │  ngOnChanges()    │
                   │  if language      │
                   │  changed:         │
                   │  updateLocal()    │
                   └───────────────────┘
                           │
                           ▼
                   ┌───────────────────┐
                   │  ngOnDestroy()    │
                   │  Cleanup          │
                   │  Unsubscribe      │
                   └───────────────────┘
```

## File Structure

```
ngx-time-scheduler/
├── projects/
│   ├── ngx-scheduler/
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── localization.service.ts ✨ NEW
│   │       │   ├── ngx-scheduler.component.ts (MODIFIED)
│   │       │   ├── ngx-scheduler.component.html (MODIFIED)
│   │       │   ├── ngx-scheduler.component.css
│   │       │   ├── ngx-scheduler.component-rtl.css ✨ NEW
│   │       │   ├── ngx-scheduler.module.ts (MODIFIED)
│   │       │   └── public-api.ts (MODIFIED)
│   │       └── assets/
│   │           └── i18n/ ✨ NEW
│   │               ├── en.json
│   │               └── ar.json
│   │
│   └── testing-app/
│       └── src/
│           ├── app/
│           │   ├── app.component.ts (MODIFIED)
│           │   ├── app.component.html (MODIFIED)
│           │   ├── app.component.css (MODIFIED)
│           │   ├── app-rtl.css ✨ NEW
│           │   └── app.config.ts (MODIFIED)
│           └── assets/
│               └── i18n/ ✨ NEW
│                   ├── en.json
│                   └── ar.json
│
├── LOCALIZATION_GUIDE.md ✨ NEW
├── LOCALIZATION_IMPLEMENTATION.md ✨ NEW
├── LOCALIZATION_QUICK_REFERENCE.md ✨ NEW
├── LOCALIZATION_SUMMARY.md ✨ NEW
├── LOCALIZATION_ARCHITECTURE.md ✨ NEW (this file)
└── package.json (MODIFIED)
```

## State Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│                 Global Application State                        │
└────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────────┐        ┌──────────────────┐
        │ Language State   │        │ Direction State  │
        │                  │        │                  │
        │ currentLanguage  │        │ textDirection    │
        │ 'en' | 'ar'      │        │ 'ltr' | 'rtl'    │
        │                  │        │                  │
        │ supportedLangs   │        │ isRTL boolean    │
        │ ['en', 'ar']     │        │ true | false     │
        └──────────────────┘        └──────────────────┘
                │                             │
                └──────────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Document Properties  │
                    │                      │
                    │ document.dir = 'rtl' │
                    │ html.lang = 'ar'     │
                    │ body.dir = 'rtl'     │
                    └──────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────────┐        ┌──────────────────┐
        │ CSS Selector     │        │ Template Binding │
        │                  │        │                  │
        │ [dir="rtl"]      │        │ [attr.dir]       │
        │ .my-class        │        │ {{ key |         │
        │ {                │        │    translate }}  │
        │  flex-direction: │        │                  │
        │  row-reverse;    │        │ moment locale    │
        │ }                │        │ switching        │
        └──────────────────┘        └──────────────────┘
```

## Translation Resolution Process

```
┌──────────────────────────────────┐
│ Template: {{ 'app.title' |       │
│            translate }}          │
└──────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ TranslateService receives        │
│ key: 'app.title'                 │
│ language: 'ar'                   │
└──────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Check cache first                │
│ (ar.json already loaded)         │
└──────────────────────────────────┘
               │
               ├─ Found ──────────┐
               │                  │
               │ Not Found ──┐    │
               │             │    │
               ▼             ▼    ▼
        ┌────────────┐  ┌──────────────┐
        │ HTTP GET   │  │ Return       │
        │ /assets/   │  │ cached       │
        │ i18n/ar.   │  │ translation  │
        │ json       │  │              │
        └────────────┘  └──────────────┘
               │                  │
               ├─ Load ───────────┤
               │                  │
               ▼                  ▼
        ┌──────────────────────────┐
        │ Parse JSON: {            │
        │   "app": {               │
        │     "title": "مساعد..."  │
        │   }                      │
        │ }                        │
        └──────────────────────────┘
               │
               ▼
        ┌──────────────────────────┐
        │ Navigate path:           │
        │ app → title              │
        │ "مساعد الجدولة في Outlook"│
        └──────────────────────────┘
               │
               ▼
        ┌──────────────────────────┐
        │ Render in template       │
        │ <h1>مساعد الجدولة...</h1>│
        └──────────────────────────┘
```

## RTL CSS Application Process

```
Initial HTML:
┌─────────────────────────────────┐
│ <div dir="ltr" class="header">  │
│   <button>Next</button>         │
│   <button>Prev</button>         │
│ </div>                          │
└─────────────────────────────────┘
        │
        │ [JavaScript sets dir="rtl"]
        │
        ▼
┌─────────────────────────────────┐
│ <div dir="rtl" class="header">  │
│   <button>Next</button>         │
│   <button>Prev</button>         │
│ </div>                          │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ CSS Evaluation:                 │
│ [dir="rtl"] .header {           │
│   flex-direction: row-reverse;  │
│   direction: rtl;               │
│ }                               │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Browser Renders:                │
│                                 │
│ [Prev] [Next]                   │
│   ▲      ▲                       │
│   └─ Reversed order             │
└─────────────────────────────────┘
```

## Performance Characteristics

```
┌────────────────────────────────────────────────┐
│  Operation        │ Time      │ Cached │ Note │
├────────────────────────────────────────────────┤
│ Language change   │ Instant   │ ✓      │      │
│ Load en.json      │ ~100-200ms│ ✓      │ 1st  │
│ Load ar.json      │ ~100-200ms│ ✓      │ 1st  │
│ Translation pipe  │ <1ms      │ ✓      │      │
│ Layout flip       │ ~16ms     │ -      │ CSS  │
│ Locale switch     │ <1ms      │ -      │ JS   │
│ detectChanges()   │ <5ms      │ -      │ CD   │
└────────────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────┐
│            Integration Touch Points                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. Component @Input() language                     │
│    ├─ Pass currentLanguage from parent             │
│    ├─ Detected in ngOnChanges()                    │
│    └─ Triggers updateLocalization()                │
│                                                     │
│ 2. Template Bindings                              │
│    ├─ [attr.dir]="textDirection"                  │
│    ├─ [attr.lang]="language"                      │
│    ├─ {{ key | translate }}                       │
│    └─ moment().format() with locale               │
│                                                     │
│ 3. CSS Selectors                                  │
│    ├─ [dir="rtl"] .class-name                     │
│    ├─ Automatic layout reversal                   │
│    └─ No JS-based style manipulation              │
│                                                     │
│ 4. Service Methods                                │
│    ├─ LocalizationService methods                 │
│    ├─ TranslateService methods                    │
│    └─ Direct service injection                    │
│                                                     │
│ 5. Translation Files                              │
│    ├─ HTTP loaded (lazy)                          │
│    ├─ JSON format with nested keys                │
│    └─ Cached after first load                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

This architecture ensures:
- ✅ Scalability for more languages
- ✅ Performance with caching
- ✅ Clean separation of concerns
- ✅ Easy maintenance and testing
- ✅ No breaking changes to existing API
