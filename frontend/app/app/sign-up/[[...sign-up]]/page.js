import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/home" />
    </div>
  );
}
