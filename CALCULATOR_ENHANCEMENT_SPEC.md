# Calculator Enhancement Specification

## Branch: `kuklyy/calculator-features`

## Overview

This specification documents the enhancement of the instrumentation score calculator component to support rich markdown display of rule documentation from remote GitHub specifications.

## Project Goals

### Primary Objective
Integrate `react-markdown` library to render detailed rule documentation in modal dialogs, enabling better user understanding of scoring rules and their criteria.

### Secondary Objectives
- Simplify the rule list UI to show only essential information
- Provide detailed rule information through interactive modal dialogs
- Support future integration with remote GitHub specification repositories
- Maintain clean, maintainable component architecture

## Architecture Requirements

### Single Calculator Component Principle
**CRITICAL**: There must be only ONE active calculator component in the codebase.

**Current State**:
- ✅ **Active Component**: `/src/lib/instrumentation-calculator/components/InstrumentationCalculator.tsx`
- ✅ **Legacy Component**: Removed - duplicate component has been consolidated

**Action Completed**:
- ✅ DONE: Consolidate or remove duplicate calculator component
- ✅ DONE: Ensure all imports point to the single source of truth
- ✅ DONE: Verify no other calculator implementations exist

### Component Hierarchy
```
InstrumentationCalculator (main)
├── RuleDetailsDialog (modal wrapper)
└── RuleMarkdown (content renderer)
```

## Technical Implementation

### Dependencies Added
- `react-markdown@^10.1.0` - For rendering markdown content from rule specifications

### Type System Enhancements

Enhanced `Rule` type in `/src/lib/score-drilldown/types.ts`:
```typescript
export type Rule = {
  // ... existing fields
  markdownContent?: string;  // Full markdown from GitHub specs
  criteria?: string;         // Structured criteria text
};
```

### UI/UX Design

#### Rule List View (Simplified)
- Display only rule name and essential metadata
- Remove description paragraphs from list items
- Show priority, category, signal, and impact points
- Include info (i) button for accessing details

#### Modal Dialog View (Detailed)
- Full markdown rendering of rule documentation
- Structured display of criteria and rationale
- Proper typography and formatting
- Scrollable content for long specifications

## Feature Implementation Status

### ✅ Completed Features
1. **React-Markdown Integration**
   - Package installation and setup
   - Type definitions updated
   - Component architecture established

2. **UI Components Created**
   - `RuleMarkdown.tsx` - Renders formatted rule content
   - `RuleDetailsDialog.tsx` - Modal wrapper for rule details

3. **Calculator Enhancement**
   - Modal state management added
   - Info button functionality implemented
   - Event handling for modal display

4. **Rule Toggle Disabled**
   - Temporarily disabled enable/disable functionality
   - Cleaned up event handlers to prevent conflicts

### 🔄 In Progress
1. **Component Consolidation**
   - Multiple calculator components identified
   - Need to merge or remove duplicates

### ✅ TODO Items Completed
1. **Component Architecture Cleanup**
   - ✅ Remove or consolidate duplicate calculator component
   - ✅ Audit all imports and references
   - ✅ Ensure single source of truth

2. **Production Readiness**
   - ✅ Remove debug logging from info button handler
   - ✅ Add error handling for missing markdown content
   - ✅ Optimize performance for large rule sets (extracted FilterTabs component)

3. **Future Enhancements**
   - [ ] GitHub API integration for remote spec fetching
   - [ ] Caching strategy for markdown content
   - [ ] Search functionality within modal content

## File Changes Summary

### Modified Files
- `/src/lib/score-drilldown/types.ts` - Enhanced Rule type
- `/src/lib/score-drilldown/spec-parser.ts` - Added markdown content storage
- `/src/lib/instrumentation-calculator/components/InstrumentationCalculator.tsx` - Main calculator updates
- `/package.json` - Added react-markdown dependency

### Created Files
- `/src/components/RuleMarkdown.tsx` - Markdown rendering component
- `/src/components/RuleDetailsDialog.tsx` - Modal dialog wrapper

### Files Requiring Attention
- ✅ Component consolidation completed - no duplicate components remain

## Testing Requirements

### Manual Testing Checklist
- ✅ Info button opens modal with rule details
- ✅ Modal displays markdown content correctly
- ✅ Modal closes properly when dismissed
- ✅ No rule toggling occurs when clicking info button
- ✅ UI remains responsive across different screen sizes

### Integration Testing
- ✅ Verify single calculator component is used throughout app
- ✅ Test markdown rendering with various content types
- ✅ Confirm proper error handling for missing content

## Performance Considerations

### Optimization Opportunities
- Lazy loading of markdown content
- Memoization of rendered markdown components
- Virtual scrolling for large rule lists

### Memory Management
- Proper cleanup of modal state
- Efficient re-rendering strategies
- Minimized bundle size impact

## Security Considerations

### Markdown Sanitization
- Ensure react-markdown sanitizes input content
- Validate external content sources
- Prevent XSS vulnerabilities in rendered markdown

## Deployment Notes

### Build Requirements
- No additional build steps required
- Standard React build process remains unchanged
- Bundle size increase minimal (~50KB for react-markdown)

### Browser Compatibility
- Modern browsers supporting ES2018+
- React 18+ compatibility maintained
- No additional polyfills required

## Success Criteria

### User Experience
- ✅ Simplified rule list view improves readability
- ✅ Modal provides comprehensive rule information
- ✅ Smooth interaction flow without UI conflicts

### Technical Quality
- ✅ Single calculator component architecture
- ✅ Type-safe implementation
- ✅ Maintainable code structure

### Performance
- ✅ No significant performance degradation
- ✅ Responsive UI interactions
- ✅ Efficient memory usage

---

## Notes

This specification serves as both documentation and a roadmap for completing the calculator enhancement feature. The primary focus should be on consolidating the component architecture to ensure maintainability and prevent future confusion.

**Last Updated**: September 18, 2025
**Author**: Development Team
**Status**: ✅ **COMPLETED** - All primary objectives achieved