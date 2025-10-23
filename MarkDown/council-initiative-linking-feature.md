# Council Initiative Linking Feature

## Overview
This feature adds a popup dialog when selecting priority levels (NEED, WANT, or NICE TO HAVE) in the Edit Initiative form. The dialog allows users to link the initiative to one or more City Council priorities and provide justification for the alignment.

## Implementation Details

### Components Created

#### 1. CouncilInitiativeLinkDialog Component
**Location:** `components/initiatives/CouncilInitiativeLinkDialog.tsx`

**Purpose:** 
- Displays a modal dialog when a priority level is selected
- Allows users to select one or more City Council priorities
- Requires justification text explaining how the initiative aligns with council objectives
- Validates that at least one priority is selected and justification is provided

**Key Features:**
- Multi-select checkboxes for all City Council priorities (defined in `CITY_PRIORITIES`)
- Required justification text area
- Color-coded badges showing the selected priority level (NEED/WANT/NICE TO HAVE)
- Information box explaining why linking to council priorities is important
- Validates before allowing confirmation

#### 2. Checkbox Component
**Location:** `components/ui/checkbox.tsx`

**Purpose:** 
- Provides a reusable checkbox UI component using Radix UI
- Used for selecting multiple council priorities in the dialog

### Modified Components

#### 1. InitiativeForm Component
**Location:** `components/initiatives/InitiativeForm.tsx`

**Changes:**
- Added import for `CouncilInitiativeLinkDialog` and `CouncilLinkData` type
- Added state variables:
  - `showCouncilDialog`: Controls dialog visibility
  - `pendingPriorityLevel`: Stores the priority level pending confirmation
  - `councilLinkData`: Stores the selected council priorities and justification
- Modified `onValueChange` handler for RadioGroup to show dialog when priority is selected
- Added visual indicator showing linked council priorities below the priority selection
- Added dialog component at the end of the form

#### 2. AddInitiativeForm Component
**Location:** `components/initiatives/AddInitiativeForm.tsx`

**Changes:**
- Similar changes as InitiativeForm
- Integrated the council linking dialog into the initiative creation flow

## User Flow

1. User fills out initiative details
2. When user selects a priority level (NEED, WANT, or NICE TO HAVE), a dialog appears
3. Dialog presents all City Council priorities as checkboxes
4. User must:
   - Select at least one council priority
   - Provide justification text explaining the alignment
5. User clicks "Confirm & Continue" or "Cancel"
6. If confirmed:
   - Priority level is applied
   - Council priorities are displayed below the priority selection
   - Data is stored in component state
7. If cancelled:
   - Priority selection is reverted
   - Dialog closes

## Data Structure

### CouncilLinkData Interface
```typescript
interface CouncilLinkData {
  councilPriorities: CityPriority[]
  councilJustification: string
}
```

## Future Enhancements

To fully persist this data, you would need to:

1. **Database Schema Updates:**
   - Add fields to the `initiatives` table:
     - `council_priorities` (JSONB or array field)
     - `council_justification` (TEXT field)

2. **Backend Updates:**
   - Modify `createInitiative` and `updateInitiative` actions to accept and save council link data
   - Update the Initiative type definition to include council fields

3. **Display Enhancements:**
   - Show council priorities in initiative lists and detail views
   - Add filtering by council priority
   - Include council alignment in reports

## Testing Checklist

- [ ] Dialog appears when selecting NEED priority
- [ ] Dialog appears when selecting WANT priority
- [ ] Dialog appears when selecting NICE TO HAVE priority
- [ ] Cannot confirm without selecting at least one priority
- [ ] Cannot confirm without providing justification
- [ ] Cancel button reverts priority selection
- [ ] Confirm button applies priority and saves link data
- [ ] Selected priorities display correctly after confirmation
- [ ] Can re-open dialog to modify selections
- [ ] Works in both InitiativeForm and AddInitiativeForm

## Benefits

1. **Strategic Alignment:** Ensures all initiatives are explicitly tied to council priorities
2. **Budget Justification:** Provides documented reasoning for initiative funding
3. **Reporting:** Enables analysis of resource allocation across council priorities
4. **Accountability:** Creates clear traceability from council priorities to department initiatives
5. **Transparency:** Makes strategic alignment visible to stakeholders
