import { Suspense } from 'react';
import TestVideoClient from './TestVideoPlayer';

export default function Page() {
  return (
    <Suspense fallback={<p>로딩 중입니다...</p>}>
      <TestVideoClient />
    </Suspense>
  );
}
