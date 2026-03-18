import React from 'react';

export default function CPLogo({ size = 40, variant = 'white' }) {
  const src = variant === 'white'
    ? 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c180d84abb747333a6889/ff2b5a406_CPLOGO-WHITE.png'
    : 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c180d84abb747333a6889/2d2aa07c3_CPLOGO-BLACK.png';
}