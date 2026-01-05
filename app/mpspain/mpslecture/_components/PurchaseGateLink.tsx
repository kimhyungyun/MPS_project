// app/mpspain/mpslecture/_components/PurchaseGateLink.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  packageId: number;
  className?: string;
  children: React.ReactNode;
};

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

async function isLoggedIn(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('token');
  if (!token) return false;

  const base = normalizeBase(API_BASE_URL);
  if (!base) return true; // API 없으면 일단 토큰 존재로 통과(원하면 false로 바꿔)

  try {
    const res = await fetch(`${base}/api/auth/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      cache: 'no-store',
    });

    return res.ok;
  } catch {
    return false;
  }
}

export default function PurchaseGateLink({ packageId, className, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [checking, setChecking] = useState(false);

  const currentUrl = useMemo(() => {
    const qs = search?.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, search]);

  const onClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (checking) return;

      setChecking(true);
      const ok = await isLoggedIn();
      setChecking(false);

      if (!ok) {
        // 로그인 후 다시 돌아오게 redirect 넣음 (login 페이지에서 처리 가능하면 사용)
        router.push(`/form/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      router.push(`/mpspain/mpslecture/payments?packageId=${packageId}`);
    },
    [checking, currentUrl, packageId, router],
  );

  // Link 형태 유지 (SEO/프리페치), 클릭은 우리가 가로챔
  return (
    <Link
      href={`/mpspain/mpslecture/payments?packageId=${packageId}`}
      onClick={onClick}
      className={className}
      aria-disabled={checking}
    >
      {children}
    </Link>
  );
}
