import { RegisterForm } from "@/components/register-form";
import { Metadata } from "next";

export const metadata : Metadata = {
    title: "Register | bookify",
    description: "Register to bookify",
    openGraph: {
        title: "Register | bookify",
        description: "Register to bookify",
    },
}
function Register() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <RegisterForm />
            </div>
        </div>
    )
}

export default Register;