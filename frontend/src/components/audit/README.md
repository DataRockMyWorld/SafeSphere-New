# ISO 45001:2018 Internal Audit System

## 📋 Components Overview

### Core Components (8 total)

1. **AuditLayout.tsx** - Main layout with navigation tabs
2. **AuditDashboard.tsx** - Dashboard with metrics and charts
3. **AuditPlanner.tsx** - Create and schedule audits
4. **AuditExecution.tsx** - Execute audits with checklists
5. **Findings.tsx** - Manage findings and non-conformities
6. **CAPAManagement.tsx** - CAPA tracking and progress updates
7. **AuditTable.tsx** - Comprehensive table view of all audits
8. **AuditReports.tsx** - View and approve audit reports

### Routes

```
/audit
├── /dashboard - Main dashboard
├── /planner - Create/schedule audits (HSSE Manager only)
├── /execute/:auditId - Execute specific audit (HSSE Manager only)
├── /findings - View and manage findings
├── /capas - Manage CAPAs and track progress
├── /table - Comprehensive table view
└── /reports - View and approve reports
```

## 🎨 Design Features

### Matching Existing Design
- ✅ Material-UI components
- ✅ Inter font family
- ✅ Same color scheme (primary, success, warning, error)
- ✅ Gradient cards with alpha colors
- ✅ Recharts for visualizations
- ✅ Responsive design
- ✅ Consistent spacing and typography

### Color Coding
- **Primary** (#0052D4) - Audit plans, general info
- **Success** (green) - Conforming, completed, closed
- **Warning** (orange) - Minor NCs, pending, medium priority
- **Error** (red) - Major NCs, overdue, critical
- **Info** (blue) - Observations, in-progress

### Key UI Patterns
- Gradient headers
- Alpha-blended backgrounds
- Rounded corners (borderRadius: 2-3)
- Hover effects (translateY, shadow)
- Chip badges for statuses
- Linear progress bars
- Card-based layouts

## 🔐 Permissions

### HSSE Manager (Full Access)
- Create/edit/delete audits
- Execute audits
- Create findings
- Assign CAPAs
- View all data
- Approve reports (if MD delegates)

### All Other Users (Read + Limited Write)
- View audits they're part of
- View findings from their department
- View their assigned CAPAs
- Update progress on their CAPAs
- Upload evidence for their CAPAs
- Add comments

## 📊 Features

### AuditDashboard
- Real-time metrics (audits, findings, CAPAs)
- Compliance score trending
- Findings by ISO clause chart
- Upcoming audits list
- Recent findings list
- Overdue CAPAs alert

### AuditPlanner
- Create audit plans with auto-codes
- Select ISO 45001 clauses
- Assign audit team
- Set schedule and objectives
- Define scope (departments, processes)
- Edit and delete audits

### Findings
- View all findings
- Filter by type, severity, status
- Detailed finding view
- Root cause analysis display
- Evidence attachments
- CAPA assignment
- Summary cards (Major NC, Minor NC, Observations)

### CAPAManagement
- My CAPAs tab
- All CAPAs tab (HSSE Manager)
- Progress tracking (0-100%)
- Update progress with notes
- Overdue alerts
- Priority badges
- Submit for verification

### AuditTable
- Comprehensive side-by-side view
- All audit parameters visible
- Findings breakdown
- CAPA status
- Search and filter
- Export to Excel/PDF (planned)
- Sortable columns

### AuditReports
- View all reports
- Compliance score display
- Findings summary
- Approve reports (MD)
- Download PDF
- Status tracking

### AuditExecution
- Step-by-step checklist
- Progress indicator
- Conformity assessment (Conforming/Minor NC/Major NC/Observation/N/A)
- Evidence upload
- Interview tracking
- Location recording
- Auto-save responses
- Log findings on-the-fly

## 🚀 Quick Start

### Access the Module
```
http://localhost:5173/audit/dashboard
```

### Create Your First Audit (HSSE Manager)
1. Navigate to **Audit Planner**
2. Click **Create New Audit**
3. Fill in:
   - Title
   - Type (Internal/External/etc.)
   - Scope description
   - Start and end dates
   - Select ISO 45001 clauses
   - Assign team members
   - Add objectives
4. Click **Create Audit Plan**

### Execute an Audit (HSSE Manager)
1. Go to **Audit Planner**
2. Click on an audit
3. Build checklist (link questions to ISO clauses)
4. Navigate to execute
5. Answer questions one by one
6. Upload evidence
7. Log findings as needed
8. Complete audit

### Manage Your CAPAs (All Users)
1. Go to **CAPAs** → **My CAPAs**
2. Click **Update Progress** on any CAPA
3. Set progress percentage
4. Add update notes
5. Upload evidence
6. Submit when complete

## 🎯 Next Steps

### Completed ✅
- All 8 components created
- Routing configured
- Navigation integrated
- Layout matching existing design
- Backend fully functional

### Future Enhancements 🔮
- PDF report generation
- Excel export functionality
- Email notifications
- Mobile app optimization
- Offline mode for field audits
- Photo annotation tools
- Voice-to-text for notes
- Calendar integration
- Advanced analytics
- AI-powered root cause suggestions

## 📚 Related Documentation

- **Backend**: `/docs/AUDIT_SYSTEM_IMPLEMENTATION.md`
- **API Endpoints**: `/api/v1/audits/*`
- **Database Models**: `/backend/audits/models.py`
- **Serializers**: `/backend/audits/serializers.py`

## 🆘 Troubleshooting

### Components not showing?
- Check if routes are properly added in `App.tsx`
- Verify imports in `App.tsx`
- Check browser console for errors

### API errors?
- Verify backend is running
- Check authentication token
- Verify HSSE Manager role for write operations

### Styling issues?
- Check theme consistency
- Verify Inter font is loaded
- Check Material-UI version compatibility

## 🎉 You're Ready!

The audit module is fully integrated and ready to use. Access it via:
- Dashboard → ISO 45001 Audit module
- Direct URL: `/audit/dashboard`

**Happy Auditing!** 🛡️✨

