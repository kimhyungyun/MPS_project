'use client';

import { useEffect, useRef, useState } from 'react';
import { ANONYMOUS, loadPaymentWidget } from '@tosspayments/payment-widget-sdk';

export function usePaymentWidget(params: { clientKey: string; amount: number | null; enabled: boolean }) {
  const { clientKey, amount, enabled } = params;

  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!clientKey) return;
    if (!amount) return;

    let disposed = false;
    let observer: MutationObserver | null = null;
    let timeoutId: any = null;

    const markReady = () => {
      if (!disposed) setWidgetReady(true);
    };

    const startIframeObserver = () => {
      const container = document.querySelector('#payment-widget');
      if (!container) {
        console.warn('[WIDGET] #payment-widget container not found');
        return;
      }

      const hasIframe = () => !!container.querySelector('iframe');
      if (hasIframe()) {
        markReady();
        return;
      }

      observer = new MutationObserver(() => {
        if (hasIframe()) {
          markReady();
          observer?.disconnect();
          observer = null;
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    };

    const run = async () => {
      try {
        setWidgetError(null);
        setWidgetReady(false);

        // 이미 렌더 되어있으면 금액만 업데이트
        if (paymentWidgetRef.current && paymentMethodsWidgetRef.current) {
          await paymentMethodsWidgetRef.current.updateAmount(amount);
          startIframeObserver();
          timeoutId = setTimeout(() => markReady(), 1200);
          return;
        }

        const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS);
        paymentWidgetRef.current = paymentWidget;

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: amount },
          { variantKey: 'DEFAULT' },
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        paymentWidget.renderAgreement('#agreement');

        if (typeof paymentMethodsWidget?.on === 'function') {
          paymentMethodsWidget.on('ready', () => markReady());
        }

        startIframeObserver();

        timeoutId = setTimeout(() => {
          const container = document.querySelector('#payment-widget');
          const iframeExists = !!container?.querySelector('iframe');
          if (iframeExists) markReady();
          else setWidgetError('결제 위젯 iframe이 생성되지 않았습니다. (키/도메인/차단 가능성)');
        }, 2500);
      } catch (e: any) {
        console.error('[WIDGET] INIT ERROR =', e);
        if (!disposed) {
          setWidgetReady(false);
          setWidgetError(e?.message ?? '결제위젯 초기화 오류');
        }
      }
    };

    run();

    return () => {
      disposed = true;
      observer?.disconnect();
      observer = null;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, clientKey, amount]);

  return {
    widgetReady,
    widgetError,
    paymentWidgetRef,
    paymentMethodsWidgetRef,
  };
}