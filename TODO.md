# TODO: Add 'Other' Option to Car Dropdown in Service Booking

## Completed Steps
- [x] Update types.ts: Add optional customCarName?: string to the Booking interface.
- [x] Update ServiceBooking.tsx: Add state for customCarName.
- [x] Update ServiceBooking.tsx: Add 'Other' option to the car select dropdown.
- [x] Update ServiceBooking.tsx: Conditionally render an input field when 'Other' is selected.
- [x] Update ServiceBooking.tsx: Modify handleBooking to include customCarName in the booking when 'Other' is selected, with validation.
- [x] Update ServiceBooking.tsx: Update serviceHistory mapping to use customCarName if present, else derive from carId.
- [x] Update AppContext.tsx: Ensure addBooking handles the new field (added to DB insert).

## Followup Steps
- [ ] Test the functionality by selecting 'Other' and entering a custom name, then booking and checking history.
- [ ] Ensure the input is validated (e.g., not empty when 'Other' is selected).
