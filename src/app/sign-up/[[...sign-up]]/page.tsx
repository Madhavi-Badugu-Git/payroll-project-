// This page is deprecated - we now use /auth/signup
import { redirect } from 'next/navigation';

export default function SignUpPage() {
  redirect('/auth/signup');
}
