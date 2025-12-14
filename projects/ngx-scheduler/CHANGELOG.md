# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### Major Changes
- 🏗️ **External Header Architecture**: Moved time header outside scroll container for perfect alignment
- ⚡ **Transform-Based Sync**: Implemented GPU-accelerated horizontal scroll synchronization using `translateX`
- 🎨 **Enhanced Visual Differentiation**: Added background-color differentiation for hour separators by row type

### Added
- 🎯 Attendee grouping with collapsible title rows
- 📋 Inline combobox for quick attendee addition with searchable dropdown
- 🖱️ Drag-and-drop time slot selection with visual feedback overlay
- 🚀 Performance optimization with `will-change: transform` for smooth scrolling
- 📱 Responsive design optimized for various screen sizes
- ✨ Selection overlay with inset box-shadows for continuous appearance across rows

### Fixed
- Fixed horizontal scroll jitter between header and body
- Resolved sticky header positioning issues across browsers
- Fixed selection overlay height to span full content area
- Eliminated dual scrollbars (unified to single scroll surface)
- Fixed hour separator visual differentiation for attendee vs non-attendee rows

### Changed
- Improved scroll performance with GPU acceleration
- Enhanced attendee row visual styling with borders
- Updated selection overlay to use box-shadows instead of borders for smoother appearance
- Optimized scroll sync mechanism for better responsiveness

### Technical
- Migrated to external header with transform-based horizontal alignment
- Removed deprecated scrollLeft synchronization logic
- Added `scrollbar-gutter: stable both-edges` for consistent layout
- Implemented `@ViewChild` reference to `timeHeaderInner` for precise scroll control

## [0.0.6] - 2024-12-18

### Changed
- Minor bug fixes and stability improvements

## [0.0.3] - 2024-12-15

### Added
- Initial public release
- Basic time scheduler functionality
- Angular 17+ compatibility
- Moment.js integration for time calculations

[1.0.0]: https://github.com/adelsoli/ngx-time-scheduler/releases/tag/v1.0.0
[0.0.6]: https://github.com/adelsoli/ngx-time-scheduler/releases/tag/v0.0.6
[0.0.3]: https://github.com/adelsoli/ngx-time-scheduler/releases/tag/v0.0.3
