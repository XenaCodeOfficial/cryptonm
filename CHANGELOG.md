# Changelog

## 2025-01-08

### Fixed
- Chat notification system now properly tracks read/unread messages using database
- Credit card chip repositioned to top-right corner to avoid overlapping text
- All crypto API routes now use `force-dynamic` to prevent Vercel build errors

### Added
- `isRead` field to ChatMessage model with database migration
- `/api/admin/chat/mark-read` endpoint to mark messages as read
- Real credit card chip image to client cards

### Changed
- Chat notifications now use server-side count instead of client-side calculation
- Currency conversion system for multi-currency support (USD, EUR, CHF)
- Rebranded from "NM Crypto" to "Cryptonm"
- Updated all logos and favicon

### Technical
- Added AVIF image format support for uploads
- Improved error handling for file uploads
- Database migrations for chat message tracking
