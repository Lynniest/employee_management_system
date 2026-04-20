'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeGrid from '../../components/EmployeeGrid';
import AvailabilityBoard from '../../components/AvailabilityBoard';
import { apiFetch } from '../../lib/clientApi';

function buildAvailabilityRows(employees, availability) {
  return employees.map((employee) => {
    const byDay = {};
    availability.filter((item) => item.employeeId === employee.id).forEach((item) => {
      byDay[item.day] = item.status;
    });

    return {
      name: employee.name,
      mon: byDay.Monday || '—',
      tue: byDay.Tuesday || '—',
      wed: byDay.Wednesday || '—',
      thu: byDay.Thursday || '—',
      fri: byDay.Friday || '—'
    };
  });
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [availabilityRows, setAvailabilityRows] = useState([]);

  useEffect(() => {
    async function load() {
      const employeeData = await apiFetch('/api/employees');
      const availabilityLists = await Promise.all(
        employeeData.map((employee) => apiFetch(`/api/employees/${employee.id}/availability`))
      );
      const allAvailability = availabilityLists.flat();
      setEmployees(employeeData);
      setAvailabilityRows(buildAvailabilityRows(employeeData, allAvailability));
    }
    load();
  }, []);

  return (
    <div className="page-stack">
      <section className="section-header-card">
        <div>
          <p className="eyebrow">Team directory</p>
          <h1>Employees</h1>
          <p className="section-text">View staff roles, skills, work preferences, and weekly availability before generating the final roster.</p>
        </div>
        <button className="primary-btn" onClick={() => router.push('/employees/register')}>Add Employee</button>
      </section>

      <EmployeeGrid employees={employees} title="All Employees" subtitle={`${employees.length} staff members available for scheduling`} />
      <AvailabilityBoard rows={availabilityRows} />
    </div>
  );
}
