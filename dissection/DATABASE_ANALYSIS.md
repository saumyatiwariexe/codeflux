# Database Technology Analysis — LPU UMS

---

## Summary

**Most Probable Database:** Microsoft SQL Server
**Confidence:** MEDIUM

Direct database technology was not accessible from the client. All conclusions are inferred from framework, stack, and publicly observable behavior.

---

## Evidence and Reasoning

### Primary Evidence (Stack-Based Inference)

The UMS runs on:
- **Windows Server** (IIS 10.0 confirmed)
- **ASP.NET WebForms** (confirmed)

The canonical database for this exact stack is **Microsoft SQL Server**. The Microsoft technology trinity — IIS + ASP.NET + SQL Server — is the standard enterprise Windows stack used by:
- Large educational institutions
- Government portals
- Enterprise ERP systems

Built in the early-to-mid 2000s era (consistent with UMS's age), ASP.NET WebForms applications almost universally paired with:
1. **Microsoft SQL Server** (ADO.NET data access, SqlConnection objects)
2. **Microsoft Access** (small installations — unlikely at LPU's scale)

Given LPU serves 40,000+ students and 4,000+ faculty, Microsoft SQL Server is the only realistic option.

**Confidence:** MEDIUM-HIGH for SQL Server specifically.

### Supporting Evidence

| Evidence | Source | Supports |
|---------|--------|---------|
| ASP.NET WebForms framework | HTTP headers (direct) | SQL Server (canonical pairing) |
| IIS 10.0 / Windows Server | HTTP headers (direct) | SQL Server (same vendor ecosystem) |
| Microsoft 365 email | DNS MX record (direct) | Full Microsoft stack commitment |
| "LPU Dashboards" (Business Intelligence portal) | HTML source (direct) | Likely SQL Server Reporting Services (SSRS) or Power BI |
| Data rendering: structured tabular data | Community scrapers | Relational database (not document store) |
| Session data: `ASP.NET_SessionId` | Direct observation | SQL Server Session State provider (common) |

### Against Alternative Databases

| Database | Likelihood | Reasoning |
|---------|-----------|-----------|
| PostgreSQL | VERY LOW | Rare with classic ASP.NET WebForms on Windows |
| MySQL/MariaDB | VERY LOW | ASP.NET + MySQL is an unusual combination in enterprise EDU |
| Oracle | LOW | Possible (Oracle supports .NET), but less common than SQL Server for this era |
| MongoDB | VERY LOW | Document DB not typical for structured ERP; no Node.js evidence |
| SQLite | NOT APPLICABLE | Too small for production at LPU scale |

---

## Database Architecture (Inferred)

Based on community-documented data fields returned by the UMS, the following database schema can be reasonably inferred:

```sql
-- Student master table (inferred from API response fields)
Students (
    RegistrationNumber  VARCHAR PRIMARY KEY,    -- e.g. "12213XXXX"
    Name                NVARCHAR,
    DOB                 DATETIME,
    Phone               VARCHAR,
    ProfileImageBlob    VARBINARY/NVARCHAR,     -- Base64 in response
    RollNumber          VARCHAR,                -- e.g. "RP12614B60"
    CGPA                DECIMAL,
    ProgramCode         VARCHAR,                -- e.g. "P164-NN1"
    SectionCode         VARCHAR,                -- e.g. "P12614"
    AggregateAttendance DECIMAL,
    ...
)

-- Programs / Sections (inferred from response structure)
Programs (
    ProgramCode     VARCHAR PRIMARY KEY,
    ProgramName     NVARCHAR,
    ...
)

Sections (
    SectionCode     VARCHAR PRIMARY KEY,
    ProgramCode     VARCHAR FK,
    ...
)

-- Attendance (inferred)
Attendance (
    StudentReg      VARCHAR FK,
    CourseCode      VARCHAR FK,
    Date            DATE,
    Status          CHAR(1),   -- P/A
    ...
)

-- Timetable (inferred)
Timetable (
    SectionCode     VARCHAR FK,
    CourseCode      VARCHAR FK,
    Day             VARCHAR,
    StartTime       TIME,
    EndTime         TIME,
    Room            VARCHAR,
    FacultyID       VARCHAR FK,
    ...
)

-- Announcements (inferred from URL structure)
Announcements (
    AnnouncementID  INT PRIMARY KEY,    -- ?aid=123309 in URL
    Type            VARCHAR,            -- ?tbl=Online or StuGen
    Content         NVARCHAR(MAX),
    PublishedDate   DATETIME,
    ...
)

-- Marks / Grades (inferred)
Marks (
    StudentReg      VARCHAR FK,
    CourseCode      VARCHAR FK,
    Assessment      VARCHAR,
    Marks           DECIMAL,
    MaxMarks        DECIMAL,
    ...
)
```

> [!NOTE]
> This schema is entirely inferred from the data fields returned by the client. The actual schema is proprietary and unknown. Column names and relationships are illustrative only.

---

## Database Access Pattern (Inferred)

ASP.NET WebForms typically accesses SQL Server via:

1. **ADO.NET** (low-level, direct SQL) — most common in legacy systems of this era
2. **Entity Framework** (ORM) — possible if some modules were modernized
3. **Stored Procedures** — very common in enterprise ERP for complex business logic

Given the age and scale of LPU UMS, ADO.NET with Stored Procedures is the most probable pattern.

---

## Session State Storage (Inferred)

ASP.NET session state can be stored:
1. **InProc** — in memory (single server, no persistence) — UNLIKELY at LPU's scale
2. **StateServer** — ASP.NET State Service — POSSIBLE
3. **SQL Server** — SQL Server Session State provider — LIKELY for a multi-server deployment
4. **Custom provider** — Redis or similar — POSSIBLE in newer modules

Given LPU's scale (tens of thousands of concurrent users), a distributed session store (SQL Server or Redis-backed) is required. SQL Server Session State is the standard choice in the Microsoft stack.

---

## Confident Statements vs. Uncertain Claims

| Statement | Status | Basis |
|-----------|--------|-------|
| Relational database is used | FACT | Structured tabular data returned |
| Windows-ecosystem database | STRONGLY SUPPORTED | Full Windows/Microsoft stack |
| Microsoft SQL Server specifically | LIKELY | Canonical ASP.NET WebForms pairing |
| Exact SQL Server version | UNKNOWN | Not externally observable |
| Oracle Database | POSSIBLE but unlikely | Ruled out by stack preference |
| NoSQL database | VERY UNLIKELY | Structured relational data patterns |

---

## How to Confirm (Authorized Access Required)

To confirm database technology, LPU IT would need to disclose:
1. Database system in use
2. Version
3. Hosting (on-premises vs. Azure SQL)

This was not and cannot be determined from external passive observation.
