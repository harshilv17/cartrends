import { redirect } from "next/navigation";

// Landing route — send everyone to the login page.
export default function Home() {
  redirect("/login");
}
