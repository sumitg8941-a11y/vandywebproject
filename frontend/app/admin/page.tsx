import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Redirect to the backend admin dashboard
  // Next.js might run on 3001 while Backend is on 3000
  redirect('http://localhost:3000/admin.html');
}