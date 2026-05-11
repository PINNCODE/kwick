# Data Model: TV Menu Keyboard Navigation

## New State: Focused Index Per Panel

Two new integer states added to `useCascadingMenu` hook:

| Property | Type | Default | Description |
|---|---|---|---|
| `focusedCategoryIndex` | `number` | `0` | Index of the keyboard-focused category item in the categories list |
| `focusedChannelIndex` | `number` | `0` | Index of the keyboard-focused channel item in the channels list |

## Behavior Rules

### Focus Constraints
- **Minimum**: `0` (first item)
- **Maximum**: `length - 1` (last item)
- **No wrap-around**: Focus stops at 0 or length-1, does not wrap
- **Reset on panel switch**: When switching from channels back to categories, `focusedCategoryIndex` resets to the index of the previously selected category
- **Reset on menu open**: Both indices reset to 0 when menu opens
- **Reset on category change**: `focusedChannelIndex` resets to 0 when a new category is selected (channels list changes)

### Focus vs Selection Relationship
- `focusedCategoryIndex` / `focusedChannelIndex` — where the keyboard cursor is (navigation state)
- `selectedCategory` / `selectedChannel` — what was committed via Enter/click (selection state)
- Focus changes do NOT trigger channel changes or category loading
- Only Enter triggers selection from the focused item

### Visual Representation
- **Keyboard focus**: `ring-2 ring-blue-400` outline on the focused item (distinct from selection)
- **Selected state**: `bg-blue-600 text-white` fill (unchanged from current behavior)
- Both can be on the same item: focused item that is also selected shows both styles

## State Transitions

```
Menu Opens
  → focusedCategoryIndex = 0, focusedChannelIndex = 0
  → viewMode = 'categories'

ArrowDown on Categories
  → focusedCategoryIndex = min(focusedCategoryIndex + 1, categories.length - 1)

ArrowUp on Categories
  → focusedCategoryIndex = max(focusedCategoryIndex - 1, 0)

Enter on focused category
  → selectCategory(categories[focusedCategoryIndex].category_id)
  → viewMode = 'channels', activePanel = 1
  → focusedChannelIndex = 0

ArrowDown on Channels
  → focusedChannelIndex = min(focusedChannelIndex + 1, channels.length - 1)

ArrowUp on Channels
  → focusedChannelIndex = max(focusedChannelIndex - 1, 0)

Enter on focused channel
  → selectChannel(channels[focusedChannelIndex])
  → menu closes

Left Arrow on Categories (activePanel === 0)
  → menu closes

Left Arrow on Channels (activePanel === 1)
  → viewMode = 'categories', activePanel = 0
  → focusedCategoryIndex = index of selectedCategory

Right Arrow on Categories (activePanel === 0)
  → selectCategory(categories[focusedCategoryIndex].category_id)
  → viewMode = 'channels', activePanel = 1
  → focusedChannelIndex = 0

Right Arrow on Channels (activePanel === 1)
  → no-op

Menu Closes
  → both indices reset to 0
```
