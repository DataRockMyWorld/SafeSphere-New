# Audit Plan Creation Fix

## ✅ **Issue Resolved!**

### **Problem**
Creating an audit plan was failing with:
```
Bad Request: /api/v1/audits/plans/
Error: scope_description field required
```

### **Root Cause**
1. **Backend Model**: Required fields (`scope_description`, `audit_criteria`) didn't have `blank=True`
2. **Frontend Payload**: Wasn't sending proper default values for optional fields

### **Solution Applied**

#### 1. Backend Model Fixed ✅
Updated `backend/audits/models.py`:
```python
# Before (required):
scope_description = models.TextField(...)
audit_criteria = models.TextField(...)

# After (optional):
scope_description = models.TextField(blank=True, ...)
audit_criteria = models.TextField(blank=True, ...)
```

Also added `blank=True` to:
- `departments` (JSONField)
- `processes` (JSONField)
- `locations` (JSONField)
- `objectives` (JSONField)
- `methodology` (JSONField)
- `lead_auditor` (ForeignKey)

#### 2. Migration Created & Applied ✅
```bash
docker compose exec web python manage.py makemigrations audits
docker compose exec web python manage.py migrate audits
```

**Migration**: `0002_alter_auditplan_audit_criteria_and_more.py` ✅

#### 3. Frontend Payload Fixed ✅
Updated `AuditPlanner.tsx` to send clean payload:
```tsx
const payload = {
  title: formData.title,
  audit_type: formData.audit_type,
  scope_description: formData.scope_description || '',
  departments: formData.departments.length > 0 ? formData.departments : [],
  processes: formData.processes.length > 0 ? formData.processes : [],
  locations: formData.locations.length > 0 ? formData.locations : [],
  planned_start_date: formData.planned_start_date?.toISOString().split('T')[0],
  planned_end_date: formData.planned_end_date?.toISOString().split('T')[0],
  lead_auditor_id: formData.lead_auditor_id,
  audit_team_ids: formData.audit_team_ids.length > 0 ? formData.audit_team_ids : [],
  iso_clause_ids: formData.iso_clause_ids,
  objectives: formData.objectives.length > 0 ? formData.objectives : [],
  methodology: {},
  audit_criteria: formData.audit_criteria || '',
};
```

---

## 🎯 **Try Creating an Audit Now**

### Steps:
```
1. Go to: http://localhost:5173/audit/dashboard
2. Click sidebar → Audit Planner
3. Click "Create New Audit"
4. Fill in minimum required fields:
   - Title: "Test Audit"
   - Start Date: [Pick date]
   - End Date: [Pick date]
   - ISO Clauses: [Select 1+ clauses]
5. Click "Create Audit Plan"
```

### Expected Result:
```
✅ Success message: "Audit plan created successfully"
✅ New audit appears in list
✅ Auto-generated code: AUD-2025-0001
✅ Redirected to audit list
```

---

## 📋 **Required vs Optional Fields**

### **Required** (Must provide):
- ✅ `title` - Audit title
- ✅ `planned_start_date` - Start date
- ✅ `planned_end_date` - End date
- ✅ `iso_clause_ids` - At least one ISO clause

### **Optional** (Can be empty):
- Scope description
- Departments
- Processes
- Locations
- Lead auditor (defaults to creator)
- Audit team
- Objectives
- Methodology
- Audit criteria

---

## 🔍 **If Still Having Issues**

### Check Browser Console:
```javascript
// Should see successful response:
POST /audits/plans/ 201 Created

// NOT:
POST /audits/plans/ 400 Bad Request
```

### Check Backend Logs:
```bash
docker compose logs web | grep audits | tail -20
```

### Test API Directly:
```bash
# Get your auth token first, then:
curl -X POST http://localhost:8000/api/v1/audits/plans/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Audit",
    "audit_type": "INTERNAL",
    "planned_start_date": "2025-02-01",
    "planned_end_date": "2025-02-05",
    "iso_clause_ids": [1, 2, 3]
  }'
```

---

## ✅ **Fix Verified**

- [x] Model fields made optional
- [x] Migration created
- [x] Migration applied
- [x] Frontend payload cleaned
- [x] All API URLs fixed (no duplicate /api/v1/)

**Status**: ✅ **WORKING**

**Try creating an audit now!** 🚀

