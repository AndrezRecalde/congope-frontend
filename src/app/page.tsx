import { redirect } from 'next/navigation';

// La raíz del sitio redirige al dashboard.
// Si no hay sesión, el Server Layout Guard del
// grupo (dashboard) redirigirá a /login.
export default function HomePage() {
  redirect('/dashboard');
}
