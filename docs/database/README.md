# Database Schema Documentation

This folder contains Entity-Relationship Diagrams (ERDs) for the Botochain voting system database in **dbdiagram.io format**.

## Files

- **`authentication.txt`** - User authentication, roles, permissions, and OTP system
- **`election.txt`** - Election management, voting, candidates, and results

## How to Use

### Viewing the Diagrams

1. Go to [dbdiagram.io](https://dbdiagram.io)
2. Click "Create New Diagram"
3. Copy the entire content from either `.txt` file
4. Paste it into the editor
5. The diagram will render automatically

### Exporting

From dbdiagram.io you can:
- **Export as SQL** - Get DDL statements for your database
- **Export as PNG** - Create visual documentation
- **Share** - Generate shareable links for team collaboration

## Schema Overview

### Authentication System (`authentication.txt`)

**Core Tables:**
- `users` - System users (admins and voters)
- `students` - Student information with enrollment data
- `one_time_passwords` - OTP tokens for 2FA

**Authorization:**
- `roles` - User roles (admin, super-admin, voter)
- `permissions` - Fine-grained permissions
- `model_has_roles` - Users to roles assignment
- `model_has_permissions` - Direct user permissions

**Audit:**
- `login_logs` - Login attempt history with IP/user agent

### Election System (`election.txt`)

**Election Setup:**
- `elections` - Election records with status tracking
- `election_setup` - Setup configuration (theme, schedule, flags)
- `election_school_levels` - Which school levels participate
- `color_themes` - Visual themes for elections

**Structure:**
- `school_levels` - Grade School, Junior High, Senior High, College
- `school_units` - Year levels and courses per school level
- `positions` - Elected positions (e.g., President, VP)
- `position_eligible_units` - Eligibility constraints per position

**Voting:**
- `partylists` - Political parties or groups
- `candidates` - Candidates per position and partylist
- `eligible_voters` - Pre-computed voters per position
- `votes` - Individual votes with blockchain hashes
- `vote_details` - Specific candidate choices per vote

**Results:**
- `election_results` - Tallied results per candidate

## Key Relationships

### Authentication
```
users → model_has_roles → roles → role_has_permissions → permissions
users → model_has_permissions → permissions (direct)
users → login_logs (activity audit)
users → one_time_passwords (2FA)
```

### Election
```
elections ← positions ← candidates → votes
elections ← eligible_voters → students
positions → position_eligible_units → school_units → school_levels
elections ← election_school_levels → school_levels
```

## Important Notes

### Polymorphic Relationships
- `model_has_permissions.model_id` and `model_has_roles.model_id` are polymorphic references (typically `User`)
- `one_time_passwords.authenticatable_id` is polymorphic (typically `User`)
- These are managed by application logic, not database foreign keys

### Blockchain Implementation
- `votes.payload_hash` - SHA256 hash of vote contents
- `votes.previous_hash` - Hash of the previous vote (chain)
- `votes.current_hash` - Current vote's hash
- Enables integrity verification via chain validation

### Constraints
- One vote per student per election (unique constraint)
- One candidate per position per election per partylist
- One position eligibility per unit
- One election setup per election (one-to-one)

## Updates & Modifications

To update these diagrams:

1. Open the file in dbdiagram.io
2. Make changes in the editor
3. Copy the updated code
4. Replace the file content
5. Commit the changes

For database schema changes:
1. Create a Laravel migration: `php artisan make:migration <migration_name>`
2. Update the corresponding ERD file
3. Update any relevant documentation

---

**Last Updated:** February 9, 2026  
**System:** Botochain Voting System  
**Database:** Laravel with Spatie permissions package
