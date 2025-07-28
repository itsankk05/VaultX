# **App Name**: SafeLock

## Core Features:

- Add Bank Details: Form to input and store bank credentials: bank name, phone number, net banking username/password, mobile banking username/password, ATM PIN, account number. All sensitive info should be encrypted upon submission.
- View/Edit Bank List: Allows users to view a listing of their stored bank credentials, with controls to edit and delete entries. Requires OTP verification to view the full details of any particular entry.
- OTP Input/Verification: OTP input component for verification. OTP is a random 6-digit code valid for 5 minutes, expiring after one use.
- Encrypted Data Storage: JSON file structure for storing encrypted bank records. Supports simulated local storage.
- Encryption/Decryption: Functions for AES-256 encryption/decryption of sensitive bank data.
- Simulated OTP Service: Mock SMS service to generate and send OTP to the user-provided phone number.

## Style Guidelines:

- Primary color: Strong blue (#3F51B5) for trust and security.
- Background color: Light blue-gray (#ECEFF1) for a clean, professional look.
- Accent color: Green (#4CAF50) for positive feedback and actions.
- Body and headline font: 'Inter', sans-serif, for a modern and readable interface.
- Use a set of consistent and professional icons related to banking and security.
- Clean, card-based layout to present bank details in an organized way.