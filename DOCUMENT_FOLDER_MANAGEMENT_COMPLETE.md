# Document Folder Management - Implementation Complete

**Date:** November 5, 2025  
**Status:** ✅ Complete and Tested

---

## Overview

Implemented a comprehensive folder management system for the Document Library, allowing HSSE Managers and Superadmins to create custom folders, organize documents, and safely delete folders when empty.

---

## What Was Implemented

### 1. Backend API (Django/DRF)

#### New Model: `DocumentFolder`
**Location:** `backend/documents/models.py`

```python
class DocumentFolder(models.Model):
    id = UUIDField (primary key)
    name = CharField (display name)
    value = CharField (technical identifier, maps to document_type)
    description = TextField (optional)
    created_by = ForeignKey(User)
    is_active = BooleanField
    
    Methods:
    - get_document_count() - returns count of documents in folder
    - is_empty() - checks if folder has any documents
    - can_be_deleted() - validates folder can be safely deleted
```

**Features:**
- Automatic value normalization (uppercase, underscores)
- Validation to prevent duplicate folder values
- Soft delete (sets is_active=False)

#### API Endpoints
**Location:** `backend/api/views.py`, `backend/api/urls.py`

1. **List/Create Folders**
   - `GET /api/v1/documents/folders/` - List all active folders
   - `POST /api/v1/documents/folders/` - Create new folder (HSSE Manager/Superadmin only)

2. **Retrieve/Update/Delete Folder**
   - `GET /api/v1/documents/folders/<uuid:pk>/` - Get folder details
   - `PUT/PATCH /api/v1/documents/folders/<uuid:pk>/` - Update folder (HSSE Manager/Superadmin only)
   - `DELETE /api/v1/documents/folders/<uuid:pk>/` - Delete folder (HSSE Manager/Superadmin only)

**Security & Validation:**
- ✅ Permission checks: Only HSSE Manager and Superadmins can create/update/delete folders
- ✅ Empty-folder validation: Folders can only be deleted if they contain 0 documents
- ✅ Detailed error messages returned to frontend
- ✅ Soft delete implementation (preserves data integrity)

#### Serializers
**Location:** `backend/documents/serializers.py`

```python
DocumentFolderSerializer:
    - Auto-populates created_by from request.user
    - Validates and normalizes folder value
    - Returns computed fields: document_count, is_empty, can_be_deleted
    - Checks for uniqueness before creation
```

#### Database Migrations
**Location:** `backend/documents/migrations/`

1. **0007_add_document_folder.py** - Creates DocumentFolder table
2. **0008_populate_initial_folders.py** - Seeds initial 6 folders:
   - Policy (POLICY)
   - System Document (SYSTEM_DOCUMENT)
   - Procedure (PROCEDURE)
   - Form (FORM)
   - SSOW (SSOW)
   - Other (OTHER)

---

### 2. Frontend UI (React + TypeScript)

#### Enhanced DocumentLibrary Component
**Location:** `frontend/src/components/document/DocumentLibrary.tsx`

**New Features:**

1. **Dynamic Folder Loading**
   - Folders loaded from API instead of hardcoded
   - Real-time folder counts
   - Fallback to default folders if API fails

2. **Folder Creation**
   - "New Folder" button (HSSE Manager only)
   - Dialog with name and description fields
   - Auto-generates value from name
   - Success/error notifications via Snackbar

3. **Folder Deletion**
   - Delete button in list view (only enabled if folder is empty)
   - Confirmation dialog with warning
   - Context menu option
   - Automatic navigation back to home if viewing deleted folder

4. **Improved Navigation**
   - ✅ Breadcrumb navigation (Home > Folder Name)
   - ✅ "Back to Folders" button when inside a folder
   - ✅ Click breadcrumb items to navigate
   - ✅ Folder path state management

5. **Document Interactions**
   - ✅ Click document card/row → Opens file in new tab
   - ✅ Context menu: View/Open, Download, View Details, Delete
   - ✅ Grid view and List view support
   - ✅ Pagination with consistent options [12, 24, 48, 96]

6. **File Upload Enhancements**
   - ✅ Folder selection dropdown (dynamically populated)
   - ✅ File size display
   - ✅ Accepted format indicator
   - ✅ Better error messages
   - ✅ Refreshes folder counts after upload

7. **UX Improvements**
   - ✅ Snackbar notifications (success/error/info)
   - ✅ Loading states
   - ✅ Disabled states for actions
   - ✅ Visual feedback (hover, selection, disabled)

---

## File Type Strategy

### Current Implementation (Recommended)

**Allowed Formats:**
- ✅ **PDF** (.pdf) - **Recommended for all final/approved documents**
- ✅ Word (.doc, .docx) - For editable templates and drafts
- ✅ Excel (.xls, .xlsx) - For data sheets, checklists, risk matrices
- ✅ Images (.jpg, .jpeg, .png) - For evidence photos, diagrams

**Validation:**
- Max file size: 10MB
- Backend validation with detailed error messages
- Frontend accept attribute for user guidance

### Why Not PDF-Only?

**Flexibility for workflow:**
1. **Templates** - Word docs are easier to edit during drafting
2. **Data Collection** - Excel for structured data (risk assessments, audits)
3. **Evidence** - Photos of incidents, equipment, site conditions
4. **Workflow** - Allow editing during DRAFT status, convert to PDF for APPROVED status

**Best Practice Recommendation:**
- Encourage PDF for APPROVED/FINAL documents
- Allow other formats for DRAFT/WORKING documents
- Consider future feature: Auto-convert to PDF on approval

---

## Testing Checklist

✅ **Folder Creation**
- [x] HSSE Manager can create folders
- [x] Regular users cannot create folders
- [x] Duplicate folder values are rejected
- [x] Folder appears immediately in library

✅ **Folder Deletion**
- [x] Cannot delete folder with documents
- [x] Can delete empty folders
- [x] Navigates back to home if viewing deleted folder
- [x] Folder removed from library immediately

✅ **Document Upload**
- [x] Can select folder from dropdown
- [x] File validation works (type and size)
- [x] Document appears in correct folder
- [x] Folder count updates after upload

✅ **Document Viewing**
- [x] Click document opens in new tab
- [x] PDF files open correctly
- [x] Word/Excel files download correctly
- [x] Images display correctly

✅ **Navigation**
- [x] Breadcrumb navigation works
- [x] Back button returns to folder list
- [x] Clicking folder opens it
- [x] Search works across folders

✅ **Document Deletion**
- [x] HSSE Manager can delete documents
- [x] Confirmation dialog appears
- [x] Document removed from folder
- [x] Folder count updates

---

## API Endpoints Reference

### Folder Management
```
GET    /api/v1/documents/folders/           # List all folders
POST   /api/v1/documents/folders/           # Create folder (HSSE/Admin)
GET    /api/v1/documents/folders/<id>/      # Get folder details
PUT    /api/v1/documents/folders/<id>/      # Update folder (HSSE/Admin)
DELETE /api/v1/documents/folders/<id>/      # Delete folder (HSSE/Admin)
```

### Document Management
```
GET    /api/v1/documents/                   # List documents
GET    /api/v1/documents/?category=POLICY   # Filter by folder
POST   /api/v1/documents/                   # Upload document
GET    /api/v1/documents/<id>/              # Get document details
DELETE /api/v1/documents/<id>/              # Delete document
```

---

## Technical Details

### Folder Value Mapping

**Challenge:** The Document model uses `"SYSTEM DOCUMENT"` (with space), but folder values use `"SYSTEM_DOCUMENT"` (with underscore) for URL-safety.

**Solution:** Bidirectional mapping in both frontend and backend:

**Backend** (`backend/api/views.py`):
```python
# When filtering documents by folder
document_type = 'SYSTEM DOCUMENT' if category == 'SYSTEM_DOCUMENT' else category
queryset = queryset.filter(document_type=document_type)
```

**Frontend** (`frontend/src/components/document/DocumentLibrary.tsx`):
```typescript
// When uploading documents
const documentType = uploadFormData.category === 'SYSTEM_DOCUMENT' 
  ? 'SYSTEM DOCUMENT' 
  : uploadFormData.category;

// When filtering documents locally
const docType = doc.document_type === 'SYSTEM DOCUMENT' ? 'SYSTEM_DOCUMENT' : doc.document_type;
```

### Permission System

**Who Can Do What:**

| Action | HSSE Manager | Superadmin | Other Roles |
|--------|--------------|------------|-------------|
| View folders | ✅ | ✅ | ✅ |
| Create folders | ✅ | ✅ | ❌ |
| Delete folders | ✅ | ✅ | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| Delete documents | ✅ | ✅ | ❌ |
| View documents | ✅ | ✅ | ✅ |

---

## User Experience Improvements

### Before
- ❌ Hardcoded folder types
- ❌ No way to create custom folders
- ❌ Documents navigated to detail page (404 errors)
- ❌ No back button from folders
- ❌ Inconsistent pagination
- ❌ Poor error messages

### After
- ✅ Dynamic folders from API
- ✅ Create custom folders via UI
- ✅ Documents open in new tab for viewing
- ✅ Back button + breadcrumb navigation
- ✅ Consistent pagination [12, 24, 48, 96]
- ✅ Detailed error messages via Snackbar

---

## Files Modified

### Backend
1. `backend/documents/models.py` - Added DocumentFolder model
2. `backend/documents/serializers.py` - Added DocumentFolderSerializer + file validation docs
3. `backend/api/views.py` - Added folder CRUD views + category mapping fix
4. `backend/api/urls.py` - Added folder routes
5. `backend/documents/migrations/0007_add_document_folder.py` - Schema migration
6. `backend/documents/migrations/0008_populate_initial_folders.py` - Data migration

### Frontend
1. `frontend/src/components/document/DocumentLibrary.tsx` - Complete overhaul:
   - Dynamic folder loading
   - Folder create/delete handlers
   - Improved navigation (back button, breadcrumbs)
   - Click-to-view documents
   - Enhanced context menu
   - Snackbar notifications
   - Fixed pagination
   - Fixed upload handler with folder mapping

2. `frontend/src/components/document/DocumentDetail.tsx` - Fixed axios imports and API paths

---

## Future Enhancements (Optional)

1. **PDF Conversion Service**
   - Auto-convert Word/Excel to PDF when document status changes to APPROVED
   - Keeps original file as backup

2. **Folder Icons/Colors**
   - Custom icons per folder type
   - Color coding for easier visual identification

3. **Bulk Operations**
   - Move multiple documents between folders
   - Bulk delete with confirmation

4. **Folder Templates**
   - Pre-configure folder structure for new sites
   - Import/export folder configurations

5. **Document Versioning within Folders**
   - Better version history UI
   - Compare versions side-by-side

6. **Advanced Search**
   - Search within specific folders
   - Filter by date range, status, etc.

---

## Migration Commands

```bash
# Already executed:
docker compose exec web python manage.py migrate documents

# Verification:
docker compose exec web python manage.py shell -c "from documents.models import DocumentFolder; print(f'Folders: {DocumentFolder.objects.count()}')"
```

---

## Conclusion

The document folder management system is now fully functional with:
- ✅ Dynamic folder creation and deletion
- ✅ Proper permissions and validation
- ✅ Seamless navigation experience
- ✅ File type flexibility with PDF recommendation
- ✅ All CRUD operations working

The implementation follows best practices for security, UX, and maintainability.

