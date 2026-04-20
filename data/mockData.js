export const summaryCards = [
  { title: 'Total Employees', value: '24', subtitle: '18 scheduled this week' },
  { title: 'Coverage Rate', value: '92%', subtitle: 'Target coverage is 95%' },
  { title: 'Overtime Risk', value: '3 staff', subtitle: 'AI flagged excess weekly hours' },
  { title: 'Fairness Score', value: '8.7 / 10', subtitle: 'Balanced weekend assignments' },
];

export const weeklySchedule = [
  { day: 'Monday', morning: 'Emma / Noah', afternoon: 'Sophia / Ava', evening: 'Liam / Ethan', status: 'Optimized' },
  { day: 'Tuesday', morning: 'Noah / Mia', afternoon: 'Sophia / Lucas', evening: 'Liam / Ethan', status: 'Optimized' },
  { day: 'Wednesday', morning: 'Emma / Noah', afternoon: 'Ava / Lucas', evening: 'Liam / Mason', status: 'Review' },
  { day: 'Thursday', morning: 'Emma / Mia', afternoon: 'Sophia / Ava', evening: 'Liam / Ethan', status: 'Optimized' },
  { day: 'Friday', morning: 'Noah / Emma', afternoon: 'Sophia / Lucas', evening: 'Liam / Mason', status: 'Understaffed' },
  { day: 'Saturday', morning: 'Emma / Ava', afternoon: 'Noah / Sophia', evening: 'Liam / Ethan', status: 'Optimized' },
  { day: 'Sunday', morning: 'Mia / Ava', afternoon: 'Sophia / Lucas', evening: 'Liam / Mason', status: 'Review' },
];

export const alerts = [
  { title: 'Understaffed Friday Evening', detail: 'One more cashier is recommended for the 18:00–22:00 shift.' },
  { title: 'Overtime Warning', detail: 'Liam is projected to exceed 40 hours unless one late shift is reassigned.' },
  { title: 'Fairness Recommendation', detail: 'Move one weekend shift from Emma to Mia to improve balance.' },
];

export const aiSuggestions = [
  'Reduce overtime this week',
  'Balance weekend shifts',
  'Add one more cashier Friday night',
  'Prioritize supervisors for late shifts',
];

export const employees = [
  { id: 1, name: 'Emma Johnson', role: 'Cashier', skills: ['POS', 'Customer Service'], hours: 32, preference: 'Morning' },
  { id: 2, name: 'Liam Chen', role: 'Supervisor', skills: ['Leadership', 'Inventory'], hours: 38, preference: 'Evening' },
  { id: 3, name: 'Sophia Kim', role: 'Sales Associate', skills: ['Sales', 'Stocking'], hours: 28, preference: 'Afternoon' },
  { id: 4, name: 'Noah Patel', role: 'Cashier', skills: ['POS', 'Returns'], hours: 35, preference: 'Morning' },
  { id: 5, name: 'Ava Brown', role: 'Sales Associate', skills: ['Sales', 'Display Setup'], hours: 30, preference: 'Afternoon' },
  { id: 6, name: 'Ethan Nguyen', role: 'Supervisor', skills: ['Leadership', 'Scheduling'], hours: 36, preference: 'Evening' },
  { id: 7, name: 'Mia Davis', role: 'Cashier', skills: ['POS', 'Customer Service'], hours: 24, preference: 'Morning' },
  { id: 8, name: 'Lucas Garcia', role: 'Stock Associate', skills: ['Stocking', 'Inventory'], hours: 29, preference: 'Afternoon' },
  { id: 9, name: 'Mason Lee', role: 'Supervisor', skills: ['Leadership', 'Closing'], hours: 34, preference: 'Evening' },
  { id: 10, name: 'Ella Wilson', role: 'Cashier', skills: ['POS', 'Refunds'], hours: 26, preference: 'Morning' },
  { id: 11, name: 'Logan Taylor', role: 'Sales Associate', skills: ['Sales', 'Upselling'], hours: 27, preference: 'Afternoon' },
  { id: 12, name: 'Chloe Martinez', role: 'Stock Associate', skills: ['Inventory', 'Receiving'], hours: 31, preference: 'Afternoon' },
];

export const managerActions = [
  'Approve Final Schedule',
  'Edit Shift Assignments',
  'Review Leave Requests',
  'Open Swap Requests',
  'View AI Forecast Logs',
  'Register New Employee',
];

export const availabilityRows = [
  { name: 'Emma Johnson', mon: '08:00–16:00', tue: '08:00–16:00', wed: 'Off', thu: '08:00–16:00', fri: '08:00–16:00' },
  { name: 'Liam Chen', mon: '14:00–22:00', tue: '14:00–22:00', wed: '14:00–22:00', thu: 'Off', fri: '14:00–22:00' },
  { name: 'Sophia Kim', mon: '10:00–18:00', tue: '10:00–18:00', wed: '10:00–18:00', thu: '10:00–18:00', fri: 'Leave' },
  { name: 'Noah Patel', mon: '08:00–16:00', tue: 'Off', wed: '08:00–16:00', thu: '08:00–16:00', fri: '08:00–16:00' },
];

export const demandForecast = [
  { time: '08:00–12:00', note: 'Steady opening traffic', staffNeeded: '4 staff' },
  { time: '12:00–16:00', note: 'Lunch peak demand', staffNeeded: '6 staff' },
  { time: '16:00–18:00', note: 'Normal traffic volume', staffNeeded: '5 staff' },
  { time: '18:00–22:00', note: 'Evening rush period', staffNeeded: '7 staff' },
];

export const swapRequests = [
  { id: 1, employee: 'Emma Johnson', fromShift: 'Friday 08:00–16:00', toShift: 'Saturday 08:00–16:00', reason: 'Personal appointment' },
  { id: 2, employee: 'Sophia Kim', fromShift: 'Sunday 10:00–18:00', toShift: 'Thursday 10:00–18:00', reason: 'Family event' },
  { id: 3, employee: 'Noah Patel', fromShift: 'Friday 18:00–22:00', toShift: 'Monday 18:00–22:00', reason: 'Class schedule conflict' },
];
