import { redirect } from "next/navigation"

// 루트 접속 시 스플래시 화면으로 이동
// 디자인 뷰어는 /design 에서 확인 가능
export default function Page() {
  redirect("/splash")
}