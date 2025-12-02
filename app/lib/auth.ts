// app/lib/auth.ts

// 타입은 선택사항 (안 써도 됨)
export type User = {
  id: number;
  level: number;
};

// 진짜 인증 붙기 전까지 임시 사용용
export async function getUser(): Promise<User | null> {
  // 전부 막고 싶으면 level: 1
  // 테스트로 통과시키고 싶으면 level: 3
  return {
    id: 1,
    level: 1, // 🔴 3으로 바꾸면 접근 허용됨 (테스트용)
  };

  // 아예 전부 로그인 안 된 걸로 취급하려면:
  // return null;
}
