import { authClient } from "@/auth-client";
import { SignupForm, signupFormSchema } from "@/components/auth/signup-form";
import { redirect } from "next/navigation";
import { z } from "zod";

export default async function Page() {
  const signup = async (data: z.infer<typeof signupFormSchema>) => {
    "use server";
    await authClient.signUp.email({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    });
    redirect("/participate");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Registrieren</h1>
      <p className="text-center my-4">
        Erstellen Sie Ihr Konto für das HSK Klubturnier
      </p>
      <SignupForm onSubmit={signup} />
    </div>
  );
}
