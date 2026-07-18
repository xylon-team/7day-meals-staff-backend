const collectionPath = './postman/7day-meals-staff.postman_collection.json';
const fs = require('fs');
let coll = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Remove 'Staff Auth' if it already exists to avoid duplication
coll.item = coll.item.filter(i => i.name !== 'Staff Auth');

// Add Staff Auth
coll.item.unshift({
  "name": "Staff Auth",
  "item": [
    {
      "name": "Forgot Password",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"mylab.me@gmail.com\"\n}"
        },
        "url": { "raw": "{{base_url}}/staff-auth/forgot-password", "host": ["{{base_url}}"], "path": ["staff-auth", "forgot-password"] }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"mylab.me@gmail.com\",\n  \"otp\": \"123456\"\n}"
        },
        "url": { "raw": "{{base_url}}/staff-auth/verify-otp", "host": ["{{base_url}}"], "path": ["staff-auth", "verify-otp"] }
      }
    },
    {
      "name": "Reset Password",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"mylab.me@gmail.com\",\n  \"otp\": \"123456\",\n  \"new_password\": \"securepassword123\"\n}"
        },
        "url": { "raw": "{{base_url}}/staff-auth/reset-password", "host": ["{{base_url}}"], "path": ["staff-auth", "reset-password"] }
      }
    }
  ]
});

fs.writeFileSync(collectionPath, JSON.stringify(coll, null, 2));
console.log('Postman collection updated with Staff Auth endpoints.');
