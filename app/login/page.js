import AuthHero from '../../components/auth/AuthHero';
import LoginForm from '../../components/auth/LoginForm';
import { authFeaturePoints } from '../../data/authData';

export default function LoginPage() {
  return (
    <div className="auth-layout">
      <AuthHero
        eyebrow="Workforce access"
        title="Login for managers and employees"
        text="Use one secure entry point for both manager and employee accounts. Managers control employee registration and schedule administration."
        points={authFeaturePoints}
      />
      <LoginForm />
    </div>
  );
}
