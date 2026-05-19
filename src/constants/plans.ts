import { Fuel, Building2, Zap, Shield, Star, CheckCircle2 } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter', // Logical ID
    name: 'Starter',
    price: '299',
    desc: 'مثالية للشركات الناشئة والمحطات الفردية',
    features: ['إدارة حتى 10 مركبات', 'ربط مع 3 محطات', 'تقارير أساسية', 'دعم فني عبر البريد'],
    color: '#22c55e',
    popular: false,
    icon: Zap
  },
  {
    id: 'professional', // Logical ID
    name: 'Professional',
    price: '799',
    desc: 'الخيار الأفضل للشركات المتوسطة',
    features: ['إدارة حتى 50 مركبة', 'ربط غير محدود للمحطات', 'تقارير متقدمة وذكاء أعمال', 'دعم فني 24/7'],
    color: '#3b82f6',
    popular: true,
    icon: Zap
  },
  {
    id: 'enterprise', // Logical ID
    name: 'Enterprise',
    price: '1999',
    desc: 'للمؤسسات الكبيرة والأساطيل الضخمة',
    features: ['كل شيء في باقة Professional', 'عدد مركبات غير محدود', 'تخصيص كامل للنظام (White Label)', 'مدير حساب مخصص'],
    color: '#8b5cf6',
    popular: false,
    icon: Zap
  }
];
