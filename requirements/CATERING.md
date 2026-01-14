# Catering Module - Requirements & Planning

## Overview

The Catering module manages meal planning, dietary requirements, food service management, and meal selections during event registration.

## Status: Planning Phase

**Last Updated:** [Date]
**Status:** Requirements gathering

---

## Core Requirements

### Meal Management

- [ ] **Meal Plans**
  - Meal plan creation (breakfast, lunch, dinner, snacks)
  - Meal plan pricing
  - Date and time assignment
  - Venue/location assignment
  - Capacity limits
  - Meal plan descriptions

- [ ] **Menu Items**
  - Menu item details (name, description, ingredients)
  - Dietary information (vegetarian, vegan, gluten-free, etc.)
  - Allergen information
  - Nutritional information (optional)
  - Image support

- [ ] **Dietary Requirements**
  - User dietary preferences
  - Allergen tracking
  - Special dietary needs (medical, religious)
  - Custom meal requests

### User Features

- [ ] **Meal Selection**
  - Select meal plans during registration
  - View menu items
  - Specify dietary requirements
  - Modify meal selections (if allowed)
  - View meal schedule

- [ ] **Dietary Profile**
  - Manage dietary preferences
  - Save preferences for future events
  - Allergen management

### Admin Features

- [ ] **Meal Planning**
  - Create/edit meal plans
  - Menu item management
  - Dietary requirement tracking
  - Capacity planning
  - Vendor management (if applicable)

- [ ] **Reporting**
  - Meal plan selections count
  - Dietary requirement summary
  - Allergen report
  - Capacity vs. actual counts
  - Special dietary needs report

## Database Schema (Planned)

```sql
-- Meal plans table
meal_plans (
  id, event_id, name, description,
  meal_type, date, time, venue,
  price, capacity, is_required
)

-- Menu items table
menu_items (
  id, meal_plan_id, name, description,
  ingredients, image_url
)

-- Dietary tags
dietary_tags (
  id, name, description
)

-- Menu item dietary tags
menu_item_dietary_tags (
  menu_item_id, dietary_tag_id
)

-- Allergens table
allergens (
  id, name, description
)

-- Menu item allergens
menu_item_allergens (
  menu_item_id, allergen_id
)

-- User meal selections
meal_selections (
  id, registration_id, meal_plan_id,
  selected_at, dietary_notes
)

-- User dietary preferences
user_dietary_preferences (
  user_id, dietary_tag_id, is_preference, is_requirement
)

-- User allergens
user_allergens (
  user_id, allergen_id, severity
)
```

## API Endpoints (Planned)

### Meal Plans
- `GET /api/events/:eventId/meal-plans` - List meal plans
- `GET /api/meal-plans/:id` - Get meal plan details
- `POST /api/events/:eventId/meal-plans` - Create meal plan (admin)
- `PUT /api/meal-plans/:id` - Update meal plan (admin)
- `DELETE /api/meal-plans/:id` - Delete meal plan (admin)

### Menu Items
- `GET /api/meal-plans/:mealPlanId/menu-items` - List menu items
- `POST /api/meal-plans/:mealPlanId/menu-items` - Create menu item (admin)
- `PUT /api/menu-items/:id` - Update menu item (admin)

### Dietary Requirements
- `GET /api/users/me/dietary-preferences` - Get user preferences
- `PUT /api/users/me/dietary-preferences` - Update preferences
- `GET /api/dietary-tags` - List available dietary tags
- `GET /api/allergens` - List available allergens

### Meal Selections
- `GET /api/registrations/:registrationId/meals` - Get meal selections
- `POST /api/meal-plans/:id/select` - Select meal plan
- `DELETE /api/meal-plans/:id/select` - Remove meal selection

## UI Components (Planned)

### Admin Dashboard
- Meal plan management interface
- Menu item editor
- Dietary requirement dashboard
- Meal selection reports
- Capacity management

### End User App
- Meal plan selection during registration
- Menu browsing
- Dietary preference management
- Meal schedule view
- Dietary requirement form

## Offline Support

- [ ] Cache meal plan information
- [ ] Cache menu items
- [ ] Offline meal schedule viewing
- [ ] Queue meal selections for sync

## Integration Points

- **Program Module**: Link meals to sessions (lunch break, etc.)
- **Finance Module**: Meal pricing and invoicing
- **Communication Module**: Meal reminders and dietary requirement confirmations
- **Resources Module**: Menu PDFs and dietary information sheets

## Dietary Tags (Planned)

- Vegetarian
- Vegan
- Gluten-free
- Dairy-free
- Nut-free
- Halal
- Kosher
- Low-sodium
- Diabetic-friendly
- Custom dietary needs

## Allergens (Planned)

- Peanuts
- Tree nuts
- Milk
- Eggs
- Fish
- Shellfish
- Soy
- Wheat
- Sesame
- Other (custom)

## Open Questions

- [ ] Should meal plans be optional or required?
- [ ] How to handle last-minute dietary requirement changes?
- [ ] Should there be meal plan capacity limits?
- [ ] How to handle vendor/caterer integration?
- [ ] Should meal plans support multiple menu options per meal?
- [ ] How to handle special meal requests vs. standard dietary tags?

## Notes

_Add implementation notes, decisions, and updates here as development progresses._
