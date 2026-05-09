# Quickstart: IPTV Player Development

## Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Git

## Initial Setup

```bash
# Install dependencies
npm install

# Install additional required packages
npm install hls.js swr zustand clsx tailwind-merge
```

## Development Server

```bash
# Start development server
npm run dev

# App will be available at http://localhost:3000
```

## Testing Credentials

For development testing, use these Xtream Codes credentials:

- **Host**: `https://ftvpro.net:8443`
- **Username**: `Trujillo2303`
- **Password**: `MXFF6xME3f`

## Project Structure

```
app/
├── (auth)/           # Route group for auth pages
│   └── login/        # Login screen
├── (player)/         # Route group for player
│   └── page.tsx      # Main player
├── api/xtream/       # API proxy routes
└── components/       # React components
```

## Key Files

- `app/(auth)/login/page.tsx` - Login form with connectivity validation
- `app/(player)/page.tsx` - Fullscreen video player
- `components/player/VideoPlayer.tsx` - HLS.js integration
- `components/menu/MenuOverlay.tsx` - Keyboard navigation menu
- `hooks/useXtreamAuth.ts` - Authentication logic
- `hooks/useChannelPersistence.ts` - Last channel persistence

## Development Workflow

1. **Start with login**: Test connectivity validation and auth flow
2. **Test auto-play**: Verify first channel plays automatically
3. **Test navigation**: Use keyboard shortcuts (M, arrows, Enter)
4. **Test persistence**: Change channel, refresh, verify recovery
5. **Test error handling**: Disconnect network, verify retries and toast

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `M` or `Esc` | Toggle menu |
| `↑` | Previous channel |
| `↓` | Next channel |
| `←` | Previous category |
| `→` | Next category |
| `Enter` | Select channel |

## Debugging

### Check LocalStorage
```javascript
// View saved credentials
JSON.parse(localStorage.getItem('credentials'))

// View last channel
JSON.parse(localStorage.getItem('lastChannel'))

// View error stats
JSON.parse(localStorage.getItem('errorStats'))
```

### Common Issues

1. **CORS errors**: Ensure API routes are used (not direct Xtream calls)
2. **HLS not loading**: Check browser console for hls.js errors
3. **Keyboard not working**: Verify focus is on document (not iframe)

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local` for local development:

```
# No secrets needed - all config via login form
NEXT_PUBLIC_APP_NAME=IPTV Player
```
