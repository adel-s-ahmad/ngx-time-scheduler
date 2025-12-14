# Attendee Combobox Implementation Guide

## Overview

The attendee combobox is a reusable, standalone Angular component that provides a unified interface for searching and selecting attendees. It combines the functionality of input, dropdown, and button controls into a single, clean combobox component—similar to Outlook's scheduling assistant.

## Architecture

### Component Structure

```
ngx-scheduler/
├── src/lib/
│   ├── attendee-combobox/
│   │   ├── attendee-combobox.component.ts      # Main component logic
│   │   ├── attendee-combobox.component.html    # Template
│   │   └── attendee-combobox.component.css     # Styles
│   ├── ngx-scheduler.component.ts              # Main scheduler
│   ├── ngx-scheduler.component.html            # Scheduler template
│   ├── ngx-scheduler.module.ts                 # Module imports
│   └── ngx-scheduler.model.ts                  # Type definitions
```

### Key Design Principles

1. **Standalone Component**: The combobox is a standalone Angular component (`standalone: true`) for easy integration and minimal dependencies.

2. **Single Responsibility**: Manages only input, filtering, and selection—all business logic (adding/removing) stays in the parent scheduler component.

3. **Reusability**: Can be used independently or as part of the scheduler for selecting any type of items (attendees, resources, etc.).

4. **OnPush Change Detection**: Uses `ChangeDetectionStrategy.OnPush` for performance optimization.

5. **Keyboard Navigation**: Full keyboard support (arrow keys, Enter, Escape) for accessibility.

## Component API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `Attendee[]` | `[]` | Array of attendees to display in the dropdown |
| `placeholder` | `string` | `'Search...'` | Placeholder text for the input field |
| `groupTitle` | `string` | `''` | Optional title for the group (for future extensions) |

### Outputs

| Output | Payload | Description |
|--------|---------|-------------|
| `itemSelected` | `Attendee` | Emitted when user selects an attendee (via click, Enter, or arrow keys) |

### Methods

```typescript
onInputChange(): void           // Called when user types in input
onInputFocus(): void            // Called when input receives focus
onInputBlur(): void             // Called when input loses focus
onKeyDown(event: KeyboardEvent) // Handles keyboard navigation
selectItem(item: Attendee): void // Selects and emits item
onOptionHover(index: number): void // Updates highlighted option on hover
```

## Usage Example

### In Parent Component Template

```html
<app-attendee-combobox
  [items]="getFilteredAttendees(groupKey)"
  [placeholder]="'Add from ' + groupTitle + '...'"
  (itemSelected)="onAttendeeSelected(groupKey, $event)">
</app-attendee-combobox>
```

### In Parent Component Class

```typescript
onAttendeeSelected(groupKey: string, attendee: Attendee): void {
  const group = this.attendeeGroups.find(g => g.key === groupKey);
  if (!group) return;

  // Avoid duplicates
  if (group.attendees.find(a => a.id === attendee.id)) {
    return;
  }

  // Add to group's attendee list
  group.attendees.push(attendee);

  // Add as a visible section row in scheduler
  const newSection = this.attendeeToSection(attendee);
  this.sections = [...(this.sections || []), newSection];
  this.refreshView();
}
```

## Features

### 1. Real-time Filtering

Filters items as the user types, searching both `displayName` and `email` fields:

```typescript
private updateFilteredItems(): void {
  const term = this.filterText.toLowerCase().trim();
  if (!term) {
    this.filteredItems = this.items;
  } else {
    this.filteredItems = this.items.filter(item =>
      item.displayName.toLowerCase().includes(term) ||
      (item.email || '').toLowerCase().includes(term)
    );
  }
}
```

### 2. Keyboard Navigation

- **Arrow Down/Up**: Navigate through options
- **Enter**: Select highlighted option
- **Escape**: Close dropdown
- **Space** (while input focused): Open dropdown

### 3. Mouse Interaction

- **Click Option**: Select and close dropdown
- **Hover**: Highlight option
- **Focus Input**: Open dropdown

### 4. Auto-focus After Selection

After selecting an item, the input automatically refocuses to allow continuous selection:

```typescript
setTimeout(() => {
  this.inputElement?.nativeElement.focus();
}, 0);
```

### 5. Responsive Dropdown

The dropdown closes automatically with a slight delay when focus is lost, allowing click-on-option to work smoothly.

## Styling

The component uses CSS that follows modern design patterns:

- **Input Focus**: Blue border and shadow on focus
- **Dropdown**: Max-height with scrollbar for large lists
- **Options**: Highlight on hover, blue background when selected
- **Smooth Transitions**: 0.15s transitions for better UX
- **Custom Scrollbar**: Styled webkit scrollbar for consistency

Key CSS classes:

```css
.attendee-combobox-wrapper      /* Root container */
.combobox-input-wrapper         /* Input + icon container */
.combobox-input                 /* Input field */
.combobox-dropdown-icon         /* Chevron icon (rotates when open) */
.combobox-dropdown              /* Dropdown menu */
.combobox-option                /* Single option in dropdown */
.combobox-option.is-selected    /* Highlighted option */
.option-name                    /* Attendee name text */
.option-email                   /* Attendee email text */
.combobox-no-results            /* Message when no matches */
```

## Integration with Scheduler

### Step 1: Import the Combobox

In `ngx-scheduler.module.ts`:

```typescript
import { AttendeeComboboxComponent } from './attendee-combobox/attendee-combobox.component';

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    AttendeeComboboxComponent  // Add here
  ],
  exports: [NgxTimeSchedulerComponent, AttendeeComboboxComponent]
})
export class NgxTimeSchedulerModule {}
```

### Step 2: Add to Template

```html
<app-attendee-combobox
  [items]="getFilteredAttendees(groupKey)"
  [placeholder]="'Add from ' + groupTitle + '...'"
  (itemSelected)="onAttendeeSelected(groupKey, $event)">
</app-attendee-combobox>
```

### Step 3: Implement Selection Handler

```typescript
onAttendeeSelected(groupKey: string, attendee: Attendee): void {
  // Implementation (see above)
}
```

## Data Model

### Attendee Interface

```typescript
interface Attendee {
  id: string | number;
  displayName: string;
  email?: string;
  type?: string;  // 'contacts' | 'users' | 'rooms' | custom
}
```

### AttendeeGroupConfig Interface

```typescript
interface AttendeeGroupConfig {
  key: string;      // Unique identifier (used as type filter)
  title: string;    // Display title (e.g., "Contacts", "Users", "Rooms")
}
```

### AttendeeGroup Interface

```typescript
interface AttendeeGroup {
  key: string;
  title: string;
  attendees: Attendee[];  // Currently selected attendees in this group
}
```

## Extensibility

### Custom Filtering

To implement custom filtering beyond name/email, extend the component:

```typescript
// In parent component
getCustomFilteredAttendees(groupKey: string): Attendee[] {
  // Custom filter logic
  return this.availableAttendees.filter(/* ... */);
}
```

Then pass the filtered array to the combobox:

```html
<app-attendee-combobox
  [items]="getCustomFilteredAttendees(groupKey)"
  (itemSelected)="onAttendeeSelected(groupKey, $event)">
</app-attendee-combobox>
```

### Custom Item Template (Future Enhancement)

For custom rendering of options, could extend component with:

```typescript
@ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
```

### Custom Sorting

The combobox respects the order of items in the input array, so sorting can be done before passing:

```typescript
const sorted = [...attendees].sort((a, b) => 
  a.displayName.localeCompare(b.displayName)
);
return sorted;
```

## Performance Considerations

1. **OnPush Change Detection**: Prevents unnecessary checks
2. **TrackBy Functions**: Uses `trackByFn` in *ngFor loops
3. **Lazy Dropdown**: Only renders when open
4. **Debouncing**: Change detection is only marked when needed

## Testing Approach

### Unit Tests (to be implemented)

```typescript
describe('AttendeeComboboxComponent', () => {
  it('should filter items as user types', () => {});
  it('should emit itemSelected on selection', () => {});
  it('should navigate with arrow keys', () => {});
  it('should close on Escape', () => {});
  it('should handle empty search results', () => {});
});
```

### Integration Tests

Test the full flow in the scheduler component:

```typescript
it('should add attendee to group when selected', () => {});
it('should prevent duplicate attendees', () => {});
it('should refocus input after selection', () => {});
```

## Accessibility Features

- ✅ Keyboard-navigable
- ✅ ARIA-friendly structure (can be enhanced with aria-* attributes)
- ✅ Clear visual feedback for selections
- ✅ Proper focus management

## Future Enhancements

1. **Virtual Scrolling**: For very large attendee lists (1000+ items)
2. **Custom Templates**: Allow custom rendering of options
3. **Multi-select**: Support selecting multiple attendees at once
4. **Category Headers**: Group options by type or department
5. **Recent Selections**: Show most recently selected attendees
6. **Async Items**: Support loading items from API
7. **ARIA Attributes**: Full WCAG 2.1 compliance

## Migration Guide

If upgrading from the old three-control approach:

**Before:**
```html
<div class="attendee-combobox">
  <input class="attendee-filter" />
  <select class="attendee-select" />
  <button class="add-attendee-btn" />
</div>
```

**After:**
```html
<app-attendee-combobox
  [items]="items"
  (itemSelected)="onSelected($event)">
</app-attendee-combobox>
```

### Key Changes:

1. **No Manual Selection State**: Component manages selection internally
2. **Automatic Submission**: Selection immediately emits (no separate Add button)
3. **Single Input**: One field replaces three controls
4. **Better Keyboard Support**: Full navigation with arrow keys

## Troubleshooting

### Dropdown Not Showing
- Check that `items` array is not empty
- Verify `isOpen` is true (check with `[class.is-open]="isOpen"` in dropdown)
- Ensure z-index (1000) is not being overridden

### Selection Not Working
- Verify `itemSelected` event handler is properly bound
- Check that emitted attendee object has all required fields
- Ensure OnPush change detection is triggered properly

### Styling Issues
- Component uses standalone styles, may need CSS cascade adjustments
- Check parent container width (expanded to 200px from 120px)
- Verify dropdown overflow (max-height: 240px may need adjustment)

## Contributing

When extending this component:

1. Maintain OnPush change detection strategy
2. Keep single responsibility (don't add business logic)
3. Add proper TypeScript typing
4. Update this documentation
5. Add unit tests for new features
