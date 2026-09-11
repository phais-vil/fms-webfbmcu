import { oauthProviderIds } from "@/features/identity/server";
import { LoginPanel } from "../login/_components/login-panel";

export default async function RegisterPage() {
  return <LoginPanel providers={oauthProviderIds()} defaultTab="register" />;
}
