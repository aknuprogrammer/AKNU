# 📚 AKNU Internal Marks System - Complete Flow Explanation

## 🎯 Overview
This system handles Theory Internals (30 marks) and Lab Internals (50 marks) with a complete workflow from Faculty → HOD → Exam Section.

---

## 📋 **STEP-BY-STEP COMPLETE FLOW**

### **STEP 1: Faculty Dashboard (Entry Point)**

**Location:** Pre-Examination → Faculty Subjects

**What you see:**
- 3 Subject Cards displayed:
  1. **Data Structures (THEORY)** - Sections A, B
  2. **Data Structures Lab (LAB)** - Sections A, B  
  3. **Database Systems (THEORY)** - Section A

**What happens:**
- Each card shows:
  - Subject name and code
  - Semester (e.g., Semester 3)
  - Sections available (A, B, C)
  - **Status indicator** showing current status per section
  - "Enter Theory Internals" or "Enter Lab Internals" button

**Demo Data Status:**
- Data Structures (Section A): **Draft** ✅ (You can edit)
- Data Structures (Section B): **Submitted** ⏳ (Waiting for HOD)
- Database Systems (Section A): **Approved** ✅ (HOD approved)

---

### **STEP 2: Theory Internals Entry**

**Click:** "Enter Theory Internals" on Data Structures card

**What you see:**
- Form with filters pre-filled:
  - Academic Year: 2024-25 ✅
  - Semester: Semester 3 ✅
  - Subject: Data Structures ✅
  - Section: (Select A or B)

**When you select Section A and click "Load Students":**
- ✅ **15 students load with marks already filled (Draft status)**
- Table shows:
  - **Test-1** (15 max) - e.g., 12.5 marks
  - **Test-2** (15 max) - e.g., 14.0 marks
  - **Best Test** - Auto-calculated: 14.0 ✅
  - **Assignment** (5 max) - e.g., 4.5 marks
  - **Attendance %** - e.g., 85%
  - **Attendance Marks** - Auto-calculated: 4 marks (80-89% = 4 marks) ✅
  - **Final** - Auto-calculated: 22.5 out of 30 ✅
    - Formula: Best Test (14) + Assignment (4.5) + Attendance (4) = 22.5

**You can:**
- Edit any marks
- Mark students as Absent (disables all fields)
- Click "Save Draft" to save without submitting
- Click "Submit to HOD" to lock and send for review

**When you select Section B and click "Load Students":**
- ✅ **Marks are already submitted**
- Fields are disabled (read-only)
- Status shows: "SUBMITTED"
- You cannot edit (must wait for HOD approval or send-back)

---

### **STEP 3: Lab Internals Entry**

**Click:** "Enter Lab Internals" on Data Structures Lab card

**Same process, but different fields:**
- **Record** (10 max)
- **Performance** (10 max)
- **Internal Test** (15 max)
- **Viva** (15 max)
- **Final** - Auto-calculated: Sum of all (max 50)

**Calculation:** Record + Performance + Internal Test + Viva = Final

---

### **STEP 4: HOD Review & Approval**

**Location:** Pre-Examination → HOD Review

**What you see:**
1. **Filters:**
   - Course: Select "B.Tech CSE"
   - Semester: Select "Semester 3"

2. **Progress Summary Cards:**
   - Pending: Shows count
   - Submitted: Shows count  
   - Approved: Shows count
   - Total Subjects: Shows count

3. **Subjects Table:**
   - Lists all subjects with status breakdown
   - Example: "Data Structures (DSA) - THEORY"
     - Total Students: 15
     - Pending: 1 (Section A - Draft)
     - Submitted: 1 (Section B - Waiting for approval)
     - Approved: 0

**Click "View Details":**
- Modal opens showing all sections and their marks
- For Theory: Shows Test-1, Test-2, Best Test, Assignment, Attendance %, Attendance Marks, Final
- For Lab: Shows Record, Performance, Internal Test, Viva, Final

**Actions available:**
- **Approve** ✅ - Changes status to "APPROVED", moves to Exam Section
- **Send Back** 🔄 - Changes status back to "Draft", faculty can edit again

---

### **STEP 5: Admin Freeze (Final Step)**

**Location:** Pre-Examination → Freeze Marks

**What you see:**
1. **Filters:**
   - Course: Select "B.Tech CSE"
   - Semester: Select "Semester 4" (to see approved entries)

2. **Subjects Table:**
   - Shows subjects with "APPROVED" status
   - Example: "Database Systems (DBMS) - THEORY" - Status: APPROVED
   - Example: "Database Systems Lab (DBMS-LAB) - LAB" - Status: APPROVED

3. **Actions:**
   - **Freeze** button for each approved subject
   - **Freeze All** button (freezes all approved subjects at once)

**When you click "Freeze":**
- ✅ Status changes to "LOCKED"
- ❌ No one can edit anymore (Faculty, HOD, Admin)
- ✅ Marks are finalized and ready for upload to main system

---

## 🔄 **STATUS FLOW DIAGRAM**

```
┌─────────┐
│  DRAFT  │  ← Faculty enters/saves marks
└────┬────┘
     │
     │ Submit to HOD
     ▼
┌──────────┐
│SUBMITTED │  ← Waiting for HOD review
└────┬─────┘
     │
     ├─→ APPROVE ──→ ┌──────────┐
     │               │ APPROVED │  ← Ready for Admin to freeze
     │               └────┬─────┘
     │                    │
     │                    │ Freeze
     │                    ▼
     │               ┌─────────┐
     │               │ LOCKED  │  ← Final, cannot change
     │               └─────────┘
     │
     └─→ SEND BACK ──→ Back to DRAFT
```

---

## 📊 **MARKS CALCULATION EXAMPLES**

### **Theory Internals Example:**

**Student: Rajesh Kumar**
- Test-1: 13.0 marks
- Test-2: 15.0 marks
- **Best Test: 15.0** (auto) ✅
- Assignment: 4.5 marks
- Attendance: 92%
- **Attendance Marks: 5** (92% ≥ 90% = 5 marks) ✅
- **Final: 24.5 out of 30** ✅
  - Calculation: 15 + 4.5 + 5 = 24.5

### **Lab Internals Example:**

**Student: Priya Sharma**
- Record: 8.5 marks
- Performance: 9.0 marks
- Internal Test: 12.0 marks
- Viva: 13.5 marks
- **Final: 43.0 out of 50** ✅
  - Calculation: 8.5 + 9.0 + 12.0 + 13.5 = 43.0

---

## 🎮 **HOW TO TEST THE COMPLETE FLOW**

### **Test 1: View Draft Entry**
1. Go to **Faculty Subjects**
2. Click **Data Structures** → **Enter Theory Internals**
3. Select **Section A** → Click **Load Students**
4. ✅ See 15 students with pre-filled marks (Draft status)
5. ✅ Try editing a mark → See auto-calculation update
6. ✅ Click **Save Draft** → Status remains "Draft"

### **Test 2: Submit to HOD**
1. In the same form (Section A)
2. Click **Submit to HOD**
3. ✅ Confirm → Status changes to "Submitted"
4. ✅ Try editing → Fields are disabled
5. Go back to dashboard → See status updated

### **Test 3: HOD Review**
1. Go to **HOD Review**
2. Select **Course: B.Tech CSE**, **Semester: Semester 3**
3. ✅ See subjects listed with status counts
4. Click **View Details** on "Data Structures - THEORY"
5. ✅ See all sections with marks breakdown
6. For Section B (Submitted): Click **Approve**
7. ✅ Status changes to "Approved"

### **Test 4: Freeze Marks**
1. Go to **Freeze Marks**
2. Select **Course: B.Tech CSE**, **Semester: Semester 4**
3. ✅ See approved subjects listed
4. Click **Freeze** on "Database Systems - THEORY"
5. ✅ Status changes to "Locked"
6. Go back to Faculty → Try to edit → ❌ Cannot edit (locked)

---

## 📁 **DATA STORAGE (localStorage Keys)**

The system stores data with these keys:

**Theory Internals:**
- `theory_internals_{subjectId}_{section}_{academicYear}_{semester}`
- Example: `theory_internals_sub-1_A_2024-25_Semester 3`

**Lab Internals:**
- `lab_internals_{subjectId}_{section}_{academicYear}_{semester}`
- Example: `lab_internals_lab-1_A_2024-25_Semester 3`

**Configuration:**
- `internal_exam_setup` - Stores exam configurations
- `faculty_subject_mappings` - Stores subject-faculty mappings
- `dummy_internals_initialized` - Flag to prevent re-initialization

---

## ✅ **DEMO DATA INCLUDED**

When you first visit, the system automatically creates:

1. **Theory - Data Structures Section A**: DRAFT status
2. **Theory - Data Structures Section B**: SUBMITTED status  
3. **Theory - Database Systems Section A**: APPROVED status
4. **Lab - Data Structures Lab Section A**: DRAFT status
5. **Lab - Data Structures Lab Section B**: SUBMITTED status
6. **Lab - Database Systems Lab Section A**: APPROVED status

All with 15 students and realistic marks!

---

## 🔑 **KEY FEATURES**

✅ **Auto-calculations**: Best test, attendance marks, totals  
✅ **Real-time validation**: Max marks, negative checks  
✅ **Status tracking**: Draft → Submitted → Approved → Locked  
✅ **Section-wise entry**: Each section tracked separately  
✅ **Absent handling**: Mark students absent, auto-disable fields  
✅ **Draft saving**: Save progress without submitting  
✅ **Workflow enforcement**: Cannot edit submitted entries  
✅ **HOD review**: View, approve, or send back  
✅ **Final freeze**: Admin locks marks permanently  

---

## 🚀 **QUICK START GUIDE**

1. **Open Faculty Subjects** → See 3 subjects
2. **Click any subject** → Form loads with filters pre-filled
3. **Select Section** → Click "Load Students"  
4. **See marks** → Already filled with dummy data
5. **Edit if needed** → Auto-calculations update
6. **Submit** → Goes to HOD for review
7. **HOD approves** → Goes to Admin for freeze
8. **Admin freezes** → Marks are final

**That's the complete flow!** 🎉

