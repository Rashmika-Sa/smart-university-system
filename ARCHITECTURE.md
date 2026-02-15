# 🏗️ System Architecture & Quick Reference

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                     Super Admin                          │
│         (canteen@sliit.lk, managedCanteen=null)         │
│  - Can view ALL canteens in dropdown                    │
│  - Can add/edit/delete items in ANY canteen             │
│  - Can create/edit/delete canteen-specific admins       │
│  - Can promote admins to super admin                    │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Barista   │ │Main Canteen │ │  Birdnest   │
    │   Admin     │ │   Admin     │ │   Admin     │
    └─────────────┘ └─────────────┘ └─────────────┘
   (managedCanteen  (managedCanteen (managedCanteen
     ="Barista")    ="Main Canteen") ="Birdnest")
    
    ▼ Can ONLY ▼    ▼ Can ONLY ▼    ▼ Can ONLY ▼
    Manage      Manage            Manage
    Barista     Main Canteen      Birdnest
    Items       Items             Items
```

---

## Data Flow Diagram

```
┌─────────────────┐
│   Login Form    │
└────────┬────────┘
         │
         ▼
   ┌──────────────────┐
   │  Email + Token   │ ──────┐
   └────────┬─────────┘       │
            │                 │
            ▼                 │
  ┌─────────────────┐         │
  │ JWT Validation  │         │
  │ (protect)       │         │
  └────────┬────────┘         │
           │                  │
           ▼                  │
  ┌──────────────────┐        │
  │ Role Check       │        │
  │ (authorize)      │        │
  └────────┬─────────┘        │
           │                  │
           ▼                  │
  ┌────────────────────────┐  │
  │ Canteen Permission     │  │
  │ Check                  │  │
  │ managedCanteen=null?   │  │
  │ OR matches canteen request? │
  └────────┬────────────────┘  │
           │                   │
         YES                   │
           │                   │
           ▼                   │
  ┌─────────────────┐          │
  │ Execute         │          │
  │ Operation       │          │
  └────────┬────────┘          │
           │                   │
           ▼                   │
  ┌─────────────────┐    NO    │
  │ Response Success│◄─────────┘
  └─────────────────┘
           │
           ▼
    ┌────────────────┐
    │ Update State   │
    │ Update UI      │
    └────────────────┘
```

---

## Permission Logic

### Super Admin
```
IF user.role === 'canteen_admin' AND user.managedCanteen === null
  ✅ Can perform ANY operation on ANY canteen
```

### Specific Canteen Admin
```
IF user.role === 'canteen_admin' AND user.managedCanteen !== null
  ✅ Can perform operations ONLY on user.managedCanteen
  ❌ Attempting other canteen → Error 403 Forbidden
```

### Non-Admin
```
IF user.role !== 'canteen_admin'
  ❌ Cannot access canteen management endpoints → Error 403
```

---

## API Route Protection

```
Public Routes (No Auth Required)
├── GET /api/canteen/menu?canteen=X        [View menu]
└── POST /api/auth/send-code               [Register]

Protected Routes (JWT + canteen_admin required)
├── POST /api/canteen/add                  [+ checkCanteenPermission]
├── PUT  /api/canteen/edit/:id             [+ checkCanteenPermission]
├── PUT  /api/canteen/update/:id           [+ checkCanteenPermission]
├── DELETE /api/canteen/delete/:id         [+ checkCanteenPermission]
└── GET /api/canteen/all-canteens          [Super admin only]

Admin Management Routes (JWT + canteen_admin super only)
├── POST /api/auth/canteen-admin/create    [Create new admin]
├── GET  /api/auth/canteen-admin/all       [List all admins]
├── PUT  /api/auth/canteen-admin/:id       [Update admin assignment]
└── DELETE /api/auth/canteen-admin/:id     [Delete admin]
```

---

## Frontend Route Protection

```
Frontend Routes
├── / (Public)
├── /login (Public)
├── /register (Public)
│
└── Protected (<ProtectedRoute>)
    ├── /student-dashboard
    ├── /canteen-selection
    ├── /canteen-menu/:name
    ├── /canteen-dashboard          [Checks role=canteen_admin]
    └── /canteen-admin-management   [Checks role=canteen_admin + managedCanteen=null]
```

---

## Database Schema Overview

### users Collection
```
{
  _id: ObjectId,
  
  // Basic Info
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  universityId: String,
  
  // Authorization
  role: 'student' | 'admin' | 'canteen_admin' | 'staff' | 'instructor' | ...,
  
  // Canteen-Specific
  managedCanteen: 'Main Canteen' | 'Barista' | 'Birdnest' | 'P&S' | null,
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

### fooditems Collection
```
{
  _id: ObjectId,
  
  // Item Details
  name: String,
  price: Number,
  category: 'Rice' | 'Beverage' | 'Short Eats' | 'Dessert',
  
  // Location
  canteen: 'Main Canteen' | 'Barista' | 'Birdnest' | 'P&S',
  
  // Media
  image: String (URL),
  isAvailable: Boolean,
  
  // Audit Trail
  createdBy: ObjectId (ref to User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Component Hierarchy

```
App.jsx
├── Router
│   ├── <ProtectedRoute>
│   │   ├── /canteen-dashboard
│   │   │   └── CanteenDashboard.jsx
│   │   │       ├── Checks: user?.role === 'canteen_admin'
│   │   │       ├── Shows: Dropdown (super) or Fixed canteen (specific)
│   │   │       ├── Form: Add/Edit/Delete items
│   │   │       └── Grid: Display items
│   │   │
│   │   └── /canteen-admin-management
│   │       └── CanteenAdminManagement.jsx
│   │           ├── Checks: user?.role === 'canteen_admin' && !user?.managedCanteen
│   │           ├── Form: Create/Edit/Delete admins
│   │           └── List: All admins with assignments
│   │
│   └── AdminRoute
│       └── /admin-dashboard
│           └── AdminDashboard.jsx
```

---

## State Management Flow

### CanteenDashboard State
```
useEffect (mount) → Get user from localStorage
                  → Determine role & managedCanteen
                  → Set isSuperAdmin flag

useEffect (canteen change) → Fetch menu for selected canteen
                            → Display items in grid

handleSubmit → POST /canteen/add (with JWT token)
             → On success: Refresh menu
             → On error: Show permission error
```

### CanteenAdminManagement State
```
useEffect (mount) → Get user from localStorage
                  → Check if super admin
                  → Redirect if not authorized
                  → Fetch all admins

handleSubmit (create) → POST /auth/canteen-admin/create
                      → Pass name, email, password, managedCanteen
                      → Refresh admin list

handleEdit → Populate form with admin data
           → Enable managedCanteen dropdown

handleDelete → DELETE /auth/canteen-admin/:id
              → Refresh admin list
```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No token, authorization denied" | Missing JWT | Include `x-auth-token` header |
| "User role not authorized" | Not canteen_admin | Login with correct role |
| "You can only manage 'X' canteen" | Wrong canteen access | Use correct admin account |
| "Invalid email domain" | Email not @sliit.lk | Use SLIIT email domain |
| "Admin already exists" | Duplicate email | Use different email |
| "Canteen not found" | Invalid canteen name | Use valid: Barista, Main Canteen, etc |

---

## Key Files Map

```
backend/
├── models/
│   ├── Auth/
│   │   ├── User.js           [Added: managedCanteen field]
│   │   └── Otp.js
│   └── Canteen/
│       └── FoodItem.js        [Updated: canteen enum, added createdBy]
│
├── controllers/
│   ├── Auth/
│   │   └── authController.js [Added: createCanteenAdmin, getAllCanteenAdmins, etc]
│   └── Canteen/
│       └── canteenController.js [Added: permission checks in all operations]
│
├── routes/
│   ├── Auth/
│   │   └── authRoutes.js     [Added: canteen-admin CRUD routes]
│   └── Canteen/
│       └── canteenRoutes.js  [Added: protect + authorize + checkCanteenPermission]
│
├── middleware/
│   └── authMiddleware.js      [Added: checkCanteenPermission middleware]
│
└── server.js

frontend/
├── src/
│   ├── pages/
│   │   └── Canteen/
│   │       ├── CanteenDashboard.jsx           [Updated: permission-based UI]
│   │       └── CanteenAdminManagement.jsx     [NEW: Super admin management]
│   │
│   └── App.jsx                                 [Added: /canteen-admin-management route]
```

---

## Testing Checklist

- [ ] Super admin sees all canteens
- [ ] Super admin can add/edit/delete to any canteen
- [ ] Specific admin only sees their canteen
- [ ] Specific admin cannot add to other canteen
- [ ] Super admin can create canteen admins
- [ ] Super admin can edit admin assignments
- [ ] Super admin can delete admins
- [ ] Promoted admin becomes super admin
- [ ] JWT token is required for all protected routes
- [ ] Email domain validation works

---

## Performance Considerations

1. **Caching**: Frontend stores user info in localStorage
2. **Database**: Index on `email` field for faster lookups
3. **API Calls**: Minimize unnecessary /menu requests
4. **JWT Expiry**: Set to 1h (configurable)

---

## Security Measures

✅ Bcrypt password hashing
✅ JWT token validation
✅ Role-based access control
✅ Canteen permission enforcement
✅ Email domain whitelisting (@sliit.lk)
✅ Request validation
✅ Error messages don't leak sensitive info

---

## Deployment Checklist

- [ ] Backend environment variables set
- [ ] MongoDB connection string verified
- [ ] Frontend API URL points to correct backend
- [ ] JWT_SECRET secure and not exposed
- [ ] Email transporter configured
- [ ] SSL/TLS certificates updated
- [ ] Database backups scheduled
- [ ] Logs configured
- [ ] Admin accounts created
- [ ] Smoke tests passed

---

**Ready for production!** 🎉
