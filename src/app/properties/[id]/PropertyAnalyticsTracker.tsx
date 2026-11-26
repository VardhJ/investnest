'use client';

import { useEffect } from 'react';

interface Props {
  property: Record<string, any>;
  dealScore: Record<string, any> | null;
}

export default function PropertyAnalyticsTracker({ property, dealScore }: Props) {
  useEffect(() => {
    import('@/lib/analytics').then(({ trackEvent }) => {
      trackEvent('property_viewed', {
        property_id: property.id,
        city: property.city,
        bank: property.bank,
        price: property.reserve_price,
        property_type: property.property_type,
        discount: property.discount,
        deal_score: dealScore?.overall,
      });
    });
  }, [property.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
