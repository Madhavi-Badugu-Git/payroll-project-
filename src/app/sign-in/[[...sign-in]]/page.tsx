// This page is deprecated - we now use /auth/signin
import { redirect } from 'next/navigation';

export default function SignInPage() {
  redirect('/auth/signin');
}
