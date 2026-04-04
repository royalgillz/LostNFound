import logo    from '../assets/logo.png';
import logoInv from '../assets/logo-inv.png';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={logo}    alt="LostNFound" className="h-10 logo-light" />
          <img src={logoInv} alt="LostNFound" className="h-10 logo-dark"  />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 text-center mb-1">{title}</h1>
        <p className="text-sm text-neutral-500 text-center mb-8">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
