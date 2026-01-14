# Admin Dashboard Components

This document lists all admin components that need to be implemented for the BCC Events Admin Dashboard.

## ✅ Implemented Components

### 1. **DataTable** (`components/admin/DataTable.vue`)
High-performance table component with:
- ✅ Multi-column sorting (single/multiple mode)
- ✅ Row selection (single/multiple/checkbox/radiobutton)
- ✅ Context menu support
- ✅ Group by functionality for creating different views
- ✅ Column filtering (text, numeric, date, boolean, select)
- ✅ Resizable columns
- ✅ Reorderable columns
- ✅ Virtual scrolling support
- ✅ Export functionality
- ✅ Pagination
- ✅ Loading states
- ✅ Customizable row styling
- ✅ State persistence (session/local storage)

### 2. **SearchFilter** (`components/admin/SearchFilter.vue`)
Advanced search and filtering component with:
- ✅ Global search with debouncing
- ✅ Field-based filtering
- ✅ Multiple filter types (text, numeric, date, dateRange, boolean, select, multiSelect)
- ✅ Filter operator selection (AND/OR)
- ✅ Active filters display with chips
- ✅ Clear all filters
- ✅ Save view functionality
- ✅ Responsive filter panel

## 📋 Components to Implement

### Core Data Management

#### 3. **Form Builder** (`components/admin/FormBuilder.vue`)
Dynamic form component for creating/editing entities:
- Field types: text, textarea, number, date, select, multiSelect, checkbox, radio, file upload
- Validation rules and error messages
- Conditional field visibility
- Field grouping and sections
- Auto-save functionality
- Form state management

#### 4. **Bulk Actions** (`components/admin/BulkActions.vue`)
Component for performing actions on multiple selected items:
- Action buttons (delete, export, update status, etc.)
- Confirmation dialogs
- Progress indicators
- Batch operation results
- Undo functionality

#### 5. **Data Export** (`components/admin/DataExport.vue`)
Export data in various formats:
- CSV export
- Excel export
- PDF export
- Custom format templates
- Filtered data export
- Scheduled exports

### Navigation & Layout

#### 6. **ModuleContainer** (`components/admin/ModuleContainer.vue`)
Layout container for consistent module pages:
- ✅ Header slot with reusable ModuleHeader component
- ✅ Main content slot
- ✅ Optional sidebar slot (left or right position)
- ✅ Responsive layout (sidebar collapses on mobile)
- ✅ Collapsible sidebar
- ✅ Sticky header option
- ✅ Breadcrumbs support
- ✅ Back button support
- ✅ Action buttons and menu support

#### 7. **ModuleHeader** (`components/admin/ModuleHeader.vue`)
Reusable header component for module pages:
- ✅ Title and subtitle
- ✅ Back button
- ✅ Breadcrumbs
- ✅ Action buttons slot
- ✅ Menu slot or default menu
- ✅ Sticky positioning
- ✅ Responsive design

#### 8. **Sidebar Navigation** (`components/admin/SidebarNav.vue`)
Main navigation component:
- Collapsible menu
- Active route highlighting
- Nested menu items
- Badge notifications
- User profile section
- Search within navigation

#### 9. **Top Bar** (`components/admin/TopBar.vue`)
Header component with:
- Breadcrumbs
- User menu dropdown
- Notifications bell
- Quick actions
- Search bar
- Tenant switcher (for multi-tenant)

#### 10. **Breadcrumbs** (`components/admin/Breadcrumbs.vue`)
Navigation breadcrumb component:
- Dynamic breadcrumb generation
- Clickable navigation
- Custom separators
- Icon support

### User Interface

#### 9. **Modal/Dialog** (`components/admin/Modal.vue`)
Reusable modal component:
- Multiple sizes (small, medium, large, fullscreen)
- Confirmation dialogs
- Form dialogs
- Loading states
- Close on backdrop click
- Keyboard shortcuts (ESC to close)

#### 10. **Toast/Notification** (`components/admin/Toast.vue`)
Notification system:
- Success, error, warning, info types
- Auto-dismiss with configurable timeout
- Action buttons
- Stacking multiple notifications
- Position options (top-right, top-left, etc.)

#### 11. **Confirm Dialog** (`components/admin/ConfirmDialog.vue`)
Confirmation dialog component:
- Customizable message and title
- Icon support
- Primary and secondary actions
- Dangerous action highlighting
- Keyboard shortcuts

### Data Visualization

#### 12. **Dashboard Widgets** (`components/admin/DashboardWidget.vue`)
Reusable dashboard widget:
- Multiple widget types (chart, metric, list, table)
- Drag and drop reordering
- Resizable widgets
- Widget settings
- Refresh functionality
- Export widget data

#### 13. **Chart Components** (`components/admin/Charts/`)
Chart components for analytics:
- Line chart
- Bar chart
- Pie chart
- Area chart
- Donut chart
- Time series chart
- Interactive tooltips
- Export chart as image

#### 14. **Metric Cards** (`components/admin/MetricCard.vue`)
Display key metrics:
- Value with trend indicator
- Percentage change
- Icon support
- Color coding
- Click actions
- Loading states

### Event Management

#### 15. **Event Form** (`components/admin/EventForm.vue`)
Form for creating/editing events:
- Basic event information
- Date/time pickers
- Location selection
- Capacity management
- Registration settings
- Pricing configuration
- Image upload

#### 16. **Event List View** (`components/admin/EventListView.vue`)
List view for events:
- Card/table view toggle
- Filter by status, date, location
- Quick actions
- Bulk operations
- Calendar integration

#### 17. **Registration Manager** (`components/admin/RegistrationManager.vue`)
Manage event registrations:
- Registration list with filters
- Status management
- Payment tracking
- Check-in functionality
- Export registrations
- Communication tools

### User Management

#### 18. **User List** (`components/admin/UserList.vue`)
User management table:
- User search and filters
- Role assignment
- Status management
- Bulk actions
- User details modal

#### 19. **User Form** (`components/admin/UserForm.vue`)
Create/edit user form:
- Personal information
- Authentication settings
- Role and permissions
- Affiliations
- Profile picture upload

#### 20. **Role Manager** (`components/admin/RoleManager.vue`)
Role and permission management:
- Role list
- Permission matrix
- Role assignment
- Custom roles

### Communication

#### 21. **Email Composer** (`components/admin/EmailComposer.vue`)
Email composition component:
- Rich text editor
- Template selection
- Recipient selection (individual, group, filter-based)
- Attachments
- Preview
- Scheduled sending

#### 22. **Notification Center** (`components/admin/NotificationCenter.vue`)
Notification management:
- Notification list
- Mark as read/unread
- Filter by type
- Notification settings
- Real-time updates

### Settings & Configuration

#### 23. **Settings Panel** (`components/admin/SettingsPanel.vue`)
Application settings:
- Tabbed interface
- General settings
- Email settings
- Payment settings
- Integration settings
- Save/cancel actions

#### 24. **Tenant Switcher** (`components/admin/TenantSwitcher.vue`)
Multi-tenant switching:
- Tenant list
- Quick switch
- Tenant search
- Current tenant indicator

### Utilities

#### 25. **File Upload** (`components/admin/FileUpload.vue`)
File upload component:
- Drag and drop
- Multiple file support
- Progress indicators
- File type validation
- Size limits
- Preview functionality
- Image cropping

#### 26. **Date Range Picker** (`components/admin/DateRangePicker.vue`)
Date range selection:
- Calendar picker
- Preset ranges (today, this week, this month, etc.)
- Custom range selection
- Time selection support

#### 27. **Tag Input** (`components/admin/TagInput.vue`)
Tag management component:
- Add/remove tags
- Autocomplete suggestions
- Validation
- Color coding
- Tag categories

#### 28. **Rich Text Editor** (`components/admin/RichTextEditor.vue`)
WYSIWYG editor:
- Formatting toolbar
- Link insertion
- Image insertion
- Table support
- Code blocks
- Markdown support

#### 29. **Color Picker** (`components/admin/ColorPicker.vue`)
Color selection component:
- Color palette
- Custom color input
- Hex/RGB/HSL support
- Preset colors
- Recent colors

#### 30. **Image Cropper** (`components/admin/ImageCropper.vue`)
Image cropping component:
- Crop area selection
- Aspect ratio locking
- Zoom and rotate
- Preview
- Export in different formats

### Advanced Features

#### 31. **Activity Log** (`components/admin/ActivityLog.vue`)
Activity tracking display:
- Chronological list
- Filter by user, action, date
- Search functionality
- Export log
- Real-time updates

#### 32. **Audit Trail** (`components/admin/AuditTrail.vue`)
Change history component:
- Version comparison
- Diff view
- Restore functionality
- User attribution
- Timestamp tracking

#### 33. **Permission Matrix** (`components/admin/PermissionMatrix.vue`)
Visual permission management:
- Role vs. permission grid
- Bulk permission changes
- Permission inheritance
- Visual indicators

#### 34. **Workflow Builder** (`components/admin/WorkflowBuilder.vue`)
Visual workflow creation:
- Drag and drop nodes
- Conditional logic
- Action configuration
- Workflow testing
- Export/import workflows

#### 35. **Report Builder** (`components/admin/ReportBuilder.vue`)
Custom report creation:
- Field selection
- Grouping and aggregation
- Filter configuration
- Chart selection
- Export options
- Scheduled reports

## Component Priority

### High Priority (Phase 1)
1. ✅ DataTable
2. ✅ SearchFilter
3. ✅ Form Builder
4. ✅ Modal/Dialog
5. ✅ Toast/Notification
6. ✅ ConfirmDialog
7. ✅ ModuleContainer & ModuleHeader
8. Sidebar Navigation
9. Top Bar
10. Event Form
11. User List
12. File Upload

### Medium Priority (Phase 2)
11. Bulk Actions
12. Data Export
13. Dashboard Widgets
14. Chart Components
15. Registration Manager
16. Email Composer
17. Settings Panel
18. Date Range Picker
19. Rich Text Editor
20. Activity Log

### Low Priority (Phase 3)
21. Workflow Builder
22. Report Builder
23. Permission Matrix
24. Audit Trail
25. Image Cropper
26. Color Picker
27. Tag Input
28. Workflow Builder

## Implementation Notes

- All components should use PrimeVue as the base UI library
- Design tokens from `@bcc-code/design-tokens` must be used for all styling
- Components should be fully typed with TypeScript
- Components should be responsive and accessible
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax
- Implement proper error handling and loading states
- Add comprehensive prop validation
- Document component usage with examples
