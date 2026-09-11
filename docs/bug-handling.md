# Bug Handling Workflow

## Severity Levels

- Critical: auth bypass, funds error, data loss
- High: core flow broken
- Medium: feature impaired
- Low: visual defect

## Engineering Rules

1. Reproduce before fixing.
2. Add a failing test when possible.
3. Fix root cause.
4. Verify locally.
5. Verify in preview deployment.
6. Add regression coverage.
