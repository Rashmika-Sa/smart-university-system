# 🚀 Quick Setup Guide - Canteen Admin Management

## Prerequisites
- Backend server running (`npm run dev` in `/backend`)
- Frontend server running (`npm run dev` in `/frontend`)
- Logged in as super admin (canteen@sliit.lk with managedCanteen=null)

---

## Step 1: Create Canteen Admins

### Via Frontend UI (Easiest)
1. Navigate to `http://localhost:5173/canteen-admin-management`
2. Click **"Create Admin"** button
3. Fill in the form:

#### Example 1: Barista Admin
```
Name:            Barista Manager
Email:           barista@sliit.lk
Password:        BaristaPwd@123
Managed Canteen: Barista
```
Click Create Admin → Success message appears

#### Example 2: Main Canteen Admin
```
Name:            Main Canteen Manager
Email:           main@sliit.lk
Password:        MainCantPwd@123
Managed Canteen: Main Canteen
```

#### Example 3: Super Admin (Optional)
```
Name:            Canteen Deputy
Email:           deputy@sliit.lk
Password:        DeputyPwd@123
Managed Canteen: (Leave empty)
```

---

## Step 2: Test Barista Admin Access

### Login as Barista Admin
1. Logout from super admin account
2. Navigate to `/login`
3. Enter credentials:
   ```
   Email:    barista@sliit.lk
   Password: BaristaPwd@123
   ```
4. Click Login

### Verify Dashboard
1. Navigate to `/canteen-dashboard`
2. **Expected Result**: 
   - ✅ No dropdown menu visible
   - ✅ Shows "Barista" with "Admin Access" label
   - ✅ Can only see Barista menu items

### Try Adding Item to Barista
1. Fill form:
   ```
   Item Name:       Iced Latte
   Price:           350
   Category:        Beverage
   Image:           (optional URL)
   ```
2. Click "Add to Menu"
3. **Expected Result**: ✅ Item added successfully to Barista canteen

### Try Adding Item to Wrong Canteen (Should Fail)
1. In browser console or API client, modify the request to send:
   ```json
   {
     "name": "Chicken Kotto",
     "price": 450,
     "category": "Rice",
     "canteen": "Main Canteen"
   }
   ```
2. **Expected Result**: ❌ Error "You can only add items to 'Barista' canteen"

---

## Step 3: Test Super Admin Access

### Login as Super Admin
1. Logout from Barista admin
2. Login with:
   ```
   Email:    canteen@sliit.lk
   Password: (your super admin password)
   ```

### Check Dashboard
1. Navigate to `/canteen-dashboard`
2. **Expected Result**:
   - ✅ Dropdown menu visible
   - ✅ Can switch between all 4 canteens
   - ✅ Can add items to ANY canteen

### Switch Canteens and Add Items
1. Select "Main Canteen" from dropdown
2. Add item:
   ```
   Item Name:       Kottu Mix
   Price:           400
   Category:        Rice
   ```
3. Switch to "Birdnest Canteen"
4. Add different item
5. **Expected Result**: ✅ All items added to correct canteens

### Access Admin Management
1. Navigate to `/canteen-admin-management`
2. **Expected Result**:
   - ✅ See list of all canteen admins
   - ✅ Can edit each admin's assignment
   - ✅ Can delete admins

---

## Step 4: Test Admin Update Feature

### Edit Barista Admin
1. On Admin Management page, click "Edit" next to Barista admin
2. Change "Managed Canteen" to "Perera & Sons (P&S)"
3. Click "Update Admin"
4. **Expected Result**: ✅ Admin reassigned to new canteen

### Test With Updated Admin
1. Logout
2. Login as barista@sliit.lk
3. Navigate to dashboard
4. **Expected Result**: 
   - ✅ Now shows "Perera & Sons (P&S)"
   - ✅ Can only manage that canteen's items

---

## Step 5: Promote Admin to Super Admin

### Make Deputy as Super Admin
1. Go to Admin Management page
2. Click "Edit" on deputy@sliit.lk
3. Change "Managed Canteen" to empty (Super Admin)
4. Click "Update Admin"

### Test Deputy as Super Admin
1. Logout
2. Login as deputy@sliit.lk
3. Navigate to dashboard
4. **Expected Result**: 
   - ✅ Dropdown menu now visible
   - ✅ Can access all canteens

---

## Step 6: API Testing (Optional - Using Postman/Curl)

### Test Create Canteen Admin
```bash
curl -X POST http://localhost:5000/api/auth/canteen-admin/create \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  -d '{
    "name": "Subway Manager",
    "email": "subway@sliit.lk",
    "password": "SubwayPwd@123",
    "managedCanteen": "Subway"
  }'
```
**Expected Response**: 
```json
{
  "message": "Canteen admin created successfully",
  "user": {
    "id": "...",
    "name": "Subway Manager",
    "email": "subway@sliit.lk",
    "role": "canteen_admin",
    "managedCanteen": "Subway"
  }
}
```

### Test Add Item (With Permission Check)
**Scenario 1: Correct Canteen**
```bash
curl -X POST http://localhost:5000/api/canteen/add \
  -H "Content-Type: application/json" \
  -H "x-auth-token: BARISTA_ADMIN_TOKEN" \
  -d '{
    "name": "Cold Brew",
    "price": 400,
    "category": "Beverage",
    "canteen": "Barista"
  }'
```
**Expected**: ✅ 201 Created

**Scenario 2: Wrong Canteen**
```bash
curl -X POST http://localhost:5000/api/canteen/add \
  -H "Content-Type: application/json" \
  -H "x-auth-token: BARISTA_ADMIN_TOKEN" \
  -d '{
    "name": "Fried Rice",
    "price": 380,
    "category": "Rice",
    "canteen": "Main Canteen"
  }'
```
**Expected**: ❌ 403 Forbidden
```json
{
  "message": "You can only add items to 'Barista' canteen"
}
```

---

## Common Issues & Solutions

### Issue 1: "No token, authorization denied"
**Solution**: Ensure you're passing the JWT token in the `x-auth-token` header

### Issue 2: "Only super admin can manage canteen admins"
**Solution**: Verify the logged-in user has `managedCanteen: null`

### Issue 3: "You can only add items to 'X' canteen"
**Solution**: This is expected - log in as super admin or the admin for that canteen

### Issue 4: Dropdown not showing on canteen dashboard
**Solution**: Check browser console → Ensure user role is 'canteen_admin' with managedCanteen=null

### Issue 5: "Only SLIIT emails are allowed"
**Solution**: Admin emails must end with @sliit.lk or @my.sliit.lk

---

## Successful Implementation Checklist

- [ ] Backend server running without errors
- [ ] Frontend server running without errors
- [ ] Login as super admin works
- [ ] Created at least 2 canteen-specific admins
- [ ] Created at least 1 item in each canteen using super admin
- [ ] Logged in as canteen-specific admin
- [ ] Verified dropdown is hidden for specific admin
- [ ] Verified specific admin can only see their canteen
- [ ] Tried adding item to wrong canteen (should fail)
- [ ] Tested edit functionality for admin assignment
- [ ] Tested promoting admin to super admin
- [ ] Tested deleting canteen admin
- [ ] All error messages are user-friendly

---

## Database Quick Check

### View All Canteen Admins
Open MongoDB Atlas or local MongoDB client:
```javascript
use('uni-system')
db.users.find({ role: 'canteen_admin' })
```
**Expected**: Shows all canteen admins with their managedCanteen values

### View All Food Items
```javascript
db.fooditems.find()
```
**Expected**: Shows items grouped by canteen field

---

## Next Steps

1. ✅ **Deploy Backend**: Push changes to production server
2. ✅ **Deploy Frontend**: Build and deploy React app
3. ✅ **Database Backup**: Backup MongoDB before production
4. ✅ **Training**: Brief canteen admins on new system
5. ✅ **Monitoring**: Monitor first week of operations

---

## Support

If you encounter any issues:
1. Check browser console for errors (F12)
2. Check backend logs (terminal where npm run dev is running)
3. Verify JWT token is valid
4. Ensure user role and managedCanteen are correctly set in database
5. Check network requests in browser DevTools

---

**System Ready for Production!** 🎉
