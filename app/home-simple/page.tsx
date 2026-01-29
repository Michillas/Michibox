import { authServer } from "@/lib/auth/server";
import Link from "next/link";
import { signOut } from "../auth/sign-out/actions";

function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-lg transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
}

export default async function HomePage() {
  const { data } = await authServer.getSession();

  if (data && data.user) {
    return (
      <div className="flex flex-col gap-6 min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back!</h1>
            <p className="text-muted-foreground">
              You are signed in as
            </p>
            <p className="text-xl font-bold text-primary">
              {data.user.name || data.user.email}
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><span className="font-medium">Email:</span> {data.user.email}</p>
              <p><span className="font-medium">Email Verified:</span> {data.user.emailVerified ? '✓ Yes' : '✗ No'}</p>
              <p><span className="font-medium">User ID:</span> {data.user.id}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/profile"
              className="w-full text-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              Go to Profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">WatchTracker</h1>
          <p className="text-muted-foreground">
            Track the movies and TV shows you love
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/auth/sign-up"
            className="block w-full text-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/sign-in"
            className="block w-full text-center px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium rounded-lg transition-colors border border-border"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>Free to use • No credit card required</p>
        </div>
      </div>
    </div>
  );
}
