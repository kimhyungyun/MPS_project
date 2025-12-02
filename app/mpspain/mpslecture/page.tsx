import { getUser } from "@/app/lib/auth";
import Mpsvideo from "./mpsvideo";
import { redirect } from "next/navigation";


export default async function Page() {
  const user = await getUser();

  // 로그인 개념처럼: user 없으면 로그인 페이지로
  if (!user) {
    redirect("/login");
  }

  // 레벨 3 미만이면 접근 불가
  if (user.level < 3) {
    redirect("/no-access");
  }

  return <Mpsvideo />;
}
