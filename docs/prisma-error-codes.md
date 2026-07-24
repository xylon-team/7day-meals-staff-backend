# Prisma Error Codes Reference

## P2025 - Record Not Found

**Description:** An operation failed because it depends on one or more records that were required but not found.

```typescript
if (error.code === 'P2025') {
  throw new NotFoundException(`Staff with id ${id} not found`);
}
```

---

## P2002 - Unique Constraint Violation

**Description:** A unique constraint would be violated on one or more fields.

```typescript
if (error.code === 'P2002') {
  const target = error.meta?.target as string[] | undefined;
  if (target?.includes('email')) {
    throw new ConflictException(`Email already exists`);
  }
  throw new ConflictException(`Staff credential already exists for this staff member`);
}
```

---

## P2003 - Foreign Key Constraint Violation

**Description:** A foreign key constraint failed on the database.

```typescript
if (error.code === 'P2003') {
  throw new BadRequestException(`Invalid staff_id reference`);
}
```
