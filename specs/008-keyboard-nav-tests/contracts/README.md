# Contracts: Keyboard Navigation Tests and Polish

**Date**: 2026-05-10
**Feature**: specs/008-keyboard-nav-tests

## Overview

This feature does not introduce new public interfaces or API contracts. It adds test coverage for existing hook callbacks (`movePreviousPanel`, `showCategoriesView`) and validates existing UI behavior (keyboard hints, event handling).

## Existing Contracts (No Changes)

The following hook callbacks are tested but not modified:

### movePreviousPanel

- **Signature**: `() => void`
- **Behavior**:
  - On panel 0: closes the menu
  - On panel 1: returns to categories view with focus restoration
- **Return**: Updates `activePanel`, `viewMode`, and `focusedCategoryIndex` state

### showCategoriesView

- **Signature**: `() => void`
- **Behavior**: Sets view to categories, restores focus to `selectedCategory` index
- **Return**: Updates `viewMode`, `activePanel`, and `focusedCategoryIndex` state
