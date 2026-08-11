import { redirect } from "next/navigation";

/** Merged into /my */
export default function MyQuestionsRedirect() {
  redirect("/my");
}
