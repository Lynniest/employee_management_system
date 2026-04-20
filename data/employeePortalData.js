export const employeeProfile = {
  name: 'Emma Johnson',
  role: 'Cashier',
  team: 'Front Store',
  weeklyHours: '32 / 40 hrs',
  preference: 'Morning',
  nextShift: 'Friday 08:00–16:00',
  manager: 'Liam Chen',
};

export const employeeStats = [
  { title: 'Upcoming Shifts', value: '4', subtitle: 'Next 7 days' },
  { title: 'Hours This Week', value: '32', subtitle: '8 hrs remaining' },
  { title: 'Swap Requests', value: '1', subtitle: 'Pending manager review' },
  { title: 'Leave Balance', value: '5 days', subtitle: 'Annual leave remaining' },
];

export const mySchedule = [
  { day: 'Monday', shift: '08:00–16:00', location: 'Front Counter', status: 'Completed' },
  { day: 'Tuesday', shift: '08:00–16:00', location: 'Front Counter', status: 'Completed' },
  { day: 'Wednesday', shift: 'Off', location: '-', status: 'Off Day' },
  { day: 'Thursday', shift: '08:00–16:00', location: 'Returns Desk', status: 'Upcoming' },
  { day: 'Friday', shift: '08:00–16:00', location: 'Front Counter', status: 'Upcoming' },
  { day: 'Saturday', shift: '12:00–20:00', location: 'Front Counter', status: 'Upcoming' },
  { day: 'Sunday', shift: 'Off', location: '-', status: 'Rest Day' },
];

export const availabilityPreferences = [
  { label: 'Preferred shift', value: 'Morning' },
  { label: 'Available days', value: 'Mon, Tue, Thu, Fri, Sat' },
  { label: 'Unavailable days', value: 'Wednesday, Sunday' },
  { label: 'Skill tags', value: 'POS, Customer Service, Returns' },
];

export const employeeRequests = [
  { type: 'Shift Swap', date: 'Friday 08:00–16:00', status: 'Pending', detail: 'Requested swap with Mia Davis due to appointment.' },
  { type: 'Leave Request', date: 'May 4, 2026', status: 'Approved', detail: 'Annual leave approved by manager.' },
  { type: 'Availability Update', date: 'Weekend preference', status: 'Submitted', detail: 'Requested fewer Sunday assignments next month.' },
];

export const employeeActions = [
  'Request Shift Swap',
  'Submit Leave Request',
  'Update Availability',
  'Download Schedule',
];
