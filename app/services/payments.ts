// app/services/payments.ts

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr') + '/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  // 파일업로드랑 동일한 키
  return localStorage.getItem('token');
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  title?: string;
  customerName?: string;
}

export async function createPaymentOrder(
  lecturePackageId: number,
): Promise<CreateOrderResponse> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}/payments/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ lecturePackageId }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('createPaymentOrder error:', text);
    throw new Error(text || '결제 주문 생성에 실패했습니다.');
  }

  const json = await res.json();
  return json.data ?? json;
}
