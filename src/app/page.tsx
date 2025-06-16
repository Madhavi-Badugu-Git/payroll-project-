import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import AppLayout from "./AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <SignedOut>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-semibold mb-4">Welcome to TriNits Payroll</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">Please sign in to access your dashboard.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        {/* Redirect to dashboard if signed in */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.location.href = '/dashboard';
              }
            `,
          }}
        />
        {/* Fallback content, though redirect should occur */}
        <div className="flex flex-col items-center justify-center h-full">
          <p>Redirecting to dashboard...</p>
        </div>
      </SignedIn>
    </AppLayout>
  );
}
