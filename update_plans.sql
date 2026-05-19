-- Update Subscription Plans to match Landing Page
-- 1. Rename 'Business' to 'Professional'
UPDATE subscription_plans 
SET name = 'Professional', 
    price = 799.00,
    description = 'الخيار الأفضل للشركات المتوسطة',
    features = '["إدارة حتى 50 مركبة", "ربط غير محدود للمحطات", "تقارير متقدمة وذكاء أعمال", "دعم فني 24/7"]'
WHERE name = 'Business';

-- 2. Update 'Starter' price and features
UPDATE subscription_plans
SET price = 299.00,
    description = 'مثالية للشركات الناشئة والمحطات الفردية',
    features = '["إدارة حتى 10 مركبات", "ربط مع 3 محطات", "تقارير أساسية", "دعم فني عبر البريد"]'
WHERE name = 'Starter';

-- 3. Update 'Enterprise' price and features
UPDATE subscription_plans
SET price = 1999.00,
    description = 'للمؤسسات الكبيرة والأساطيل الضخمة',
    features = '["كل شيء في باقة Professional", "عدد مركبات غير محدود", "تخصيص كامل للنظام (White Label)", "مدير حساب مخصص"]'
WHERE name = 'Enterprise';

-- Ensure all plans are active
UPDATE subscription_plans SET is_active = true;