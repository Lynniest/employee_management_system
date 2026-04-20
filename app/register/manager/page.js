import AuthHero from '../../../components/auth/AuthHero';
import ManagerRegisterForm from '../../../components/auth/ManagerRegisterForm';
import { authFeaturePoints } from '../../../data/authData';

export default function ManagerRegisterPage() {
  return (
    <div className="auth-layout">
      <AuthHero
        eyebrow="Admin onboarding"
        title="Register a manager account"
        text="Managers can create schedules, review requests, and register employee accounts. Employee self-registration is intentionally disabled."
        points={authFeaturePoints}
      />
      <ManagerRegisterForm />
    </div>
  );
}
