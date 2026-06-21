import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/home" />
    </div>
  );
}
