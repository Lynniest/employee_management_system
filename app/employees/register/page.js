import EmployeeRegistrationForm from '../../../components/auth/EmployeeRegistrationForm';
import { employeeRegistrationOptions } from '../../../data/authData';

export default function EmployeeRegisterPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Manager workspace</p>
          <h1>Employee Registration</h1>
          <p className="hero-text">
            Create employee accounts, set initial credentials, assign departments and skills, and keep onboarding controlled by managers only.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-btn">Create Account</button>
          <button className="secondary-btn">Import Employees</button>
        </div>
      </section>

      <EmployeeRegistrationForm
        departments={employeeRegistrationOptions.departments}
        roles={employeeRegistrationOptions.roles}
        skills={employeeRegistrationOptions.skills}
      />
    </div>
  );
}
