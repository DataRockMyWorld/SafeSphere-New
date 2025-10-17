# 🧪 **Management Review & CAPA Testing Guide**

## ✅ **System Status**

```
✅ All migrations applied (9/9)
✅ Seed data loaded (8 types, 8 templates, 185 questions)
✅ Weights distributed and validated
✅ No system check issues
✅ No linter errors
✅ Reminder command working
✅ All routes configured
✅ Frontend components built
```

**Status: READY FOR TESTING** 🎉

---

## 🎯 **Test Scenarios**

### **Test 1: Complete Workflow (Recommended First Test)**

#### **Step 1: Log a Finding**
```
URL: http://localhost:5173/audit/findings

1. Click "Log Finding" button
2. Select an existing audit plan (or create one first)
3. Add attendees: "John Doe, Jane Smith"
4. Select audit date: Today
5. Answer questions:
   - Expand each category
   - Select compliance status for each question
   - Watch score update in real-time
6. Mark at least 2-3 questions as "MAJOR_NC" or "MINOR_NC"
7. Observe the overall score (should be Amber or Red)
8. Click "Submit Finding"

Expected Result:
✅ Finding created: FND-2025-XXXX
✅ Score shows in color-coded box
✅ Success message appears
✅ Redirects to findings list
```

#### **Step 2: Review in Management Review**
```
URL: http://localhost:5173/audit/management-review

1. Observe the dashboard:
   - Summary cards show counts
   - Major NCs card (should show 0 or more)
   - Minor NCs card (should show 0 or more)
   - "Need CAPA" card (should match NCs)

2. Findings table shows:
   - Your finding is listed
   - Finding code displayed
   - Type chip (Major NC / Minor NC)
   - Severity chip with color
   - CAPA column shows ❌ "Need" icon
   - Actions column has buttons

3. Apply filters:
   - Try filtering by Status: "OPEN"
   - Try filtering by Type: "MAJOR_NC"
   - Table updates instantly

Expected Result:
✅ Finding visible in table
✅ Shows "Needs CAPA" indicator
✅ Filters work correctly
✅ Summary cards show correct counts
```

#### **Step 3: Assign CAPA**
```
Still on: http://localhost:5173/audit/management-review

1. Find your finding in the table
2. Click the 🔵 "Assign CAPA" button
3. Quick CAPA Assignment dialog opens

Observe the dialog:
✅ Finding details box at top (code, type, severity)
✅ Title field PRE-FILLED: "CAPA: [finding title]"
✅ Description PRE-FILLED from finding
✅ Root cause PRE-FILLED (if available)
✅ Priority PRE-SET based on severity
✅ Target Date PRE-CALCULATED (14 days for Major NC)

4. Fill remaining fields:
   - Action Plan: "1. Review procedure\n2. Implement changes\n3. Verify"
   - Responsible Person: Select from dropdown
   - Adjust target date if needed

5. Click "Assign CAPA"

Expected Result:
✅ Dialog closes
✅ Success message: "CAPA(s) assigned successfully"
✅ Finding row updates - CAPA column shows ✅
✅ Console shows email notification (if email configured)
✅ Table refreshes automatically
```

#### **Step 4: View CAPA**
```
URL: http://localhost:5173/audit/capas

1. Open CAPA Management page
2. Click "My CAPAs" tab (if you assigned to yourself)

Observe the CAPA card:
✅ Action code: CAPA-2025-XXXX
✅ Title shown
✅ Priority chip with color
✅ Progress bar (0%)
✅ Finding code (BLUE, CLICKABLE) 👈 Test this!
✅ Responsible person name
✅ Target date with countdown
✅ Deadline color:
   - Green if >7 days
   - Yellow if 3-7 days
   - Orange if 1-2 days
   - Red if overdue

3. Click the finding code link
4. New tab opens → Findings page

Expected Result:
✅ CAPA displays correctly
✅ Finding link works (opens findings page)
✅ All data matches what you entered
✅ Deadline countdown accurate
```

#### **Step 5: Test Bulk Assignment**
```
URL: http://localhost:5173/audit/management-review

1. If you have multiple findings needing CAPA:
   - Check the checkboxes for 2-3 findings
   - "Assign CAPA to Selected (3)" button appears
   - Click the button
   - Bulk assignment dialog opens

2. Fill the form:
   - Action plan (same for all)
   - Responsible person
   - Target date

3. Submit

Expected Result:
✅ Multiple CAPAs created (one per finding)
✅ All show in CAPA Management
✅ Multiple email notifications sent
✅ All findings updated
```

---

### **Test 2: Deadline Tracking**

#### **Create a CAPA Due Soon**
```
URL: http://localhost:5173/audit/management-review

1. Create a finding (if you don't have one)
2. Assign CAPA
3. In the dialog, set target date = TOMORROW
4. Submit

Expected Result:
✅ CAPA created with 1-day deadline

5. Go to CAPA Management
6. Observe the CAPA card:
   - Deadline should show "1 day" in RED or ORANGE
   - Visual urgency indicator

Test Command:
docker compose exec web python manage.py send_capa_reminders

Expected Console Output:
🚨 URGENT: CAPA-2025-XXXX (due tomorrow!)
📧 Total reminders sent: 1

✅ Email template shown in console
```

---

### **Test 3: Email Notifications**

```bash
# Send CAPA reminders
docker compose exec web python manage.py send_capa_reminders

Expected Output:
✅ Shows all CAPAs checked
✅ Sends reminders for:
   - Overdue CAPAs (if any)
   - Due in 7 days or less
   - Due tomorrow (URGENT)
✅ Console shows email content
✅ Recipients listed

If SMTP configured:
✅ Real emails sent
✅ Check recipient inbox
✅ Email has:
   - CAPA details
   - Finding link
   - Deadline info
   - Action required
```

---

### **Test 4: Progress Updates**

```
URL: http://localhost:5173/audit/capas

1. Open a CAPA card
2. Click "Update Progress"
3. Dialog opens:
   - Progress slider (0-100%)
   - Update text field
   - Challenges field
   - Next steps field

4. Update to 50%
5. Add text: "Completed training review"
6. Submit

Expected Result:
✅ Progress bar updates to 50%
✅ Card shows new progress
✅ Update recorded

7. Update to 100%
8. Status changes to "PENDING_VERIFICATION"
9. "Submit for Verification" button appears

Expected Result:
✅ CAPA marked complete
✅ Ready for HSSE Manager review
```

---

### **Test 5: Filtering & Search**

```
URL: http://localhost:5173/audit/management-review

1. Create multiple findings:
   - 2 Major NCs
   - 3 Minor NCs
   - 2 Observations

2. Test filters:
   - Status: "OPEN" → Shows only open
   - Severity: "HIGH" → Shows only high
   - Type: "MAJOR_NC" → Shows only Major NCs

Expected Result:
✅ Each filter works independently
✅ Table updates instantly
✅ Summary cards update
✅ "X findings | Y need CAPA" text updates
```

---

### **Test 6: Admin Editing**

```
URL: http://localhost:8000/admin/

1. Login as admin
2. Navigate to: Audits → Audit Checklist Templates
3. Click "System Audit"
4. Scroll to "Audit Checklist Categories"
5. Expand a category
6. Click a question
7. Edit the question text
8. Save

9. Return to frontend
10. Log a new finding
11. Select System Audit
12. Verify your edited question appears

Expected Result:
✅ Question text updated
✅ Changes reflect in frontend immediately
✅ Weight still valid

Test Weight Validation:
docker compose exec web python manage.py validate_weights

Expected Output:
✅ All templates: weights valid
✅ All categories: weights valid
✅ No errors
```

---

### **Test 7: PDF Report**

```
URL: http://localhost:5173/audit/findings

1. Find a finding with responses
2. Click the 📄 "Download PDF" button

Expected Result:
✅ PDF downloads
✅ Opens in new tab/browser
✅ Contains:
   - Finding details
   - Audit information
   - All question responses
   - Compliance status
   - Score breakdown
   - CAPA information (if assigned)
   - Professional formatting
```

---

### **Test 8: Finding Link from CAPA**

```
URL: http://localhost:5173/audit/capas

1. Open any CAPA
2. Observe the "Finding: FND-2025-XXXX" line
3. It should be BLUE and CLICKABLE
4. Click it

Expected Result:
✅ Opens findings page in new tab
✅ Shows the related finding
✅ Can view full finding details
```

---

## 📊 **Verification Checklist**

### **Management Review Page:**
- [ ] Summary cards display correct counts
- [ ] Findings table shows all findings
- [ ] Filters work (status, severity, type)
- [ ] Color coding correct (severity, type)
- [ ] "Needs CAPA" indicators visible
- [ ] "Assign CAPA" button works
- [ ] Bulk selection works
- [ ] "Assign to Selected" button appears

### **Quick CAPA Assignment:**
- [ ] Dialog opens when clicked
- [ ] Finding details box shows correct info
- [ ] Title pre-filled from finding
- [ ] Description pre-filled
- [ ] Root cause pre-filled
- [ ] Priority auto-set from severity
- [ ] Target date auto-calculated
- [ ] Suggested timeline shown
- [ ] Compliance guidelines visible
- [ ] Submit creates CAPA
- [ ] Email notification sent

### **CAPA Management:**
- [ ] CAPA cards display
- [ ] Finding code is clickable
- [ ] Clicking opens findings page
- [ ] Progress bar visible
- [ ] Deadline countdown shown
- [ ] Color coding correct:
  - [ ] Green: >7 days
  - [ ] Yellow: 3-7 days
  - [ ] Orange: 1-2 days
  - [ ] Red: Overdue
- [ ] "Update Progress" works
- [ ] Status changes when 100%

### **Email System:**
- [ ] Reminder command runs
- [ ] Console shows email content
- [ ] Recipients correct
- [ ] 7-day warnings work
- [ ] 1-day urgent works
- [ ] Overdue escalations work

### **Admin Interface:**
- [ ] Can edit questions
- [ ] Can add questions
- [ ] Can adjust weights
- [ ] Changes reflect immediately
- [ ] Weight validation works

### **PDF Generation:**
- [ ] Download button works
- [ ] PDF displays correctly
- [ ] All data included
- [ ] Professional formatting

---

## 🐛 **Troubleshooting**

### **Issue: Management Review page is blank**
```
Check:
1. Are there any findings?
   → Log a finding first
2. Console errors?
   → Open browser DevTools
3. API endpoint working?
   → Check: http://localhost:8000/api/v1/audits/findings/
```

### **Issue: "Assign CAPA" button doesn't appear**
```
Check:
1. Is finding type Major NC or Minor NC?
   → Only NCs need CAPA
2. Does finding already have CAPA?
   → Can only assign once
3. Are you HSSE Manager?
   → Only managers can assign
```

### **Issue: Finding link not clickable**
```
Check:
1. Is text blue?
   → Should be blue and underlined on hover
2. Does it open anything?
   → Should open findings page in new tab
3. Console errors?
   → Check browser console
```

### **Issue: No reminders sent**
```
Check:
1. Are there any CAPAs?
   → Create CAPAs first
2. Are deadlines approaching?
   → Set target date = tomorrow to test
3. Command output?
   → Should show "X reminders sent"
```

### **Issue: Weights don't sum to 100%**
```
Fix:
docker compose exec web python manage.py auto_distribute_weights
docker compose exec web python manage.py validate_weights

Should show: ✅ All weights valid
```

---

## ✅ **Expected Results Summary**

After completing all tests, you should have:

1. **Findings logged** with real-time scores ✅
2. **Management Review page** showing all findings ✅
3. **CAPAs assigned** from findings ✅
4. **Finding-CAPA links** working ✅
5. **Deadline tracking** with color coding ✅
6. **Email reminders** configured ✅
7. **Progress updates** recorded ✅
8. **PDF reports** generated ✅
9. **Admin editing** working ✅
10. **Filters** functioning ✅

**All features operational!** 🎉

---

## 🚀 **Quick Smoke Test (5 minutes)**

```bash
# 1. Check system
docker compose exec web python manage.py check
# Expected: ✅ No issues

# 2. Check data
docker compose exec web python manage.py shell -c "
from audits.models import *
print('✅ Types:', AuditType.objects.count())
print('✅ Templates:', AuditChecklistTemplate.objects.count())
print('✅ Questions:', AuditChecklistQuestion.objects.count())
"
# Expected: 8, 8, 185

# 3. Test reminder
docker compose exec web python manage.py send_capa_reminders
# Expected: ✅ Reminder job complete

# 4. Open frontend
# http://localhost:5173/audit/management-review
# Expected: Page loads, no errors

# 5. Create finding → Assign CAPA → View CAPA → Click finding link
# Expected: Complete workflow works
```

**If all pass: SYSTEM READY! 🎉**

---

## 📞 **Support**

### **Common Questions:**

**Q: Can I edit questions after findings are logged?**
A: Yes! Changes reflect immediately, but existing findings keep their data.

**Q: Can I change weights?**
A: Yes, via admin. Run `validate_weights` after changes.

**Q: How do I schedule automatic reminders?**
A: Add to cron:
```
0 9 * * * cd /path && docker compose exec web python manage.py send_capa_reminders
```

**Q: Can I assign one CAPA to multiple findings?**
A: No, one CAPA per finding. Use bulk assignment for efficiency.

**Q: What if CAPA deadline needs extension?**
A: Update target date in CAPA Management (future enhancement).

---

## 🎉 **READY TO TEST!**

**Start here:**
http://localhost:5173/audit/management-review

**Complete workflow:**
1. Log Finding (3 min)
2. Review in Management Review (1 min)
3. Assign CAPA (2 min)
4. Check CAPA Management (1 min)
5. Test reminder command (1 min)

**Total: 8 minutes to verify complete system!** ⏱️

**Everything is ready!** 🚀🎉✨

