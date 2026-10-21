type Entry = {
  title: string;
  state: "available" | "partial" | "future";
  description: string;
  route?: string;
};
export const catalog: Record<"ar" | "en", Entry[]> = {
  ar: [
    {
      title: "الحروف والكاميرا",
      state: "partial",
      description:
        "كاميرا فعلية ونقاط اليد ونموذج الحروف الحالي. دقة التعرف لم تُقَس بعد؛ لا يوجد تعرف على الكلمات.",
      route: "translator",
    },
    {
      title: "عبارات التواصل",
      state: "available",
      description:
        "تسع عبارات قابلة للبحث والتعديل والعرض. النطق يعتمد على توفر صوت عربي في المتصفح.",
      route: "dictionary",
    },
    {
      title: "الرادار والتنبيهات المرئية",
      state: "partial",
      description:
        "تعرّف تجريبي محلي على الأصوات بنموذج YAMNet مع تنبيهات وسجل، ووضع مستوى الميكروفون البديل. الاتجاه والمسافة غير متاحين، والدقة تحتاج إلى تحقق أوسع.",
      route: "radar",
    },
    {
      title: "إمكانية الوصول",
      state: "available",
      description:
        "تكبير النص والتباين العالي وتقليل الحركة والعربية والإنجليزية. اختبار قارئ الشاشة البشري لا يزال مطلوباً.",
      route: "settings",
    },
    {
      title: "أوقات الصلاة",
      state: "future",
      description:
        "تحتاج إلى حساب موثوق أو مزود مواقيت وموقع يختاره المستخدم. لا توجد مواقيت أو عد تنازلي مباشر هنا.",
    },
    {
      title: "القبلة",
      state: "future",
      description:
        "تحتاج إلى موقع مأذون وحساب اتجاه ومعايرة المستشعر. لا يُعرض اتجاه ثابت كمعلومة GPS.",
    },
    {
      title: "الساعة الذكية",
      state: "future",
      description:
        "لا توجد ساعة مقترنة أو قراءة نبض. يتطلب الربط تكاملاً فعلياً واختبار جهاز؛ اهتزاز الهاتف ليس اتصال ساعة.",
    },
    {
      title: "السيارة وCarPlay",
      state: "future",
      description:
        "لا توجد مركبة متصلة. يحتاج CarPlay إلى تطبيق أصلي واستحقاقات منصة واختبار آمن.",
    },
    {
      title: "الاستشارة الطبية",
      state: "future",
      description:
        "بوابة الطبيب وتسجيل الشكوى واستشارة الفيديو تحتاج إلى خدمة آمنة. لم يبدأ اتصال أو تسجيل.",
    },
    {
      title: "الطوارئ وSOS",
      state: "future",
      description:
        "لا يُرسل هذا التطبيق طلب نجدة ولا يتصل بخدمة طوارئ. يحتاج إلى شريك تشغيلي وتأكيد تسليم قبل التفعيل.",
    },
    {
      title: "الإشعارات والاهتزاز",
      state: "partial",
      description:
        "حالة مرئية وسجل لتجاوز العتبة أثناء فتح الرادار فقط. اهتزاز الأجهزة وإشعارات الخلفية وجدولة الأذان لم تُنقل بعد.",
      route: "radar",
    },
    {
      title: "الكلام والأسماء",
      state: "future",
      description:
        "التعرف على الكلام ونداء الاسم يحتاج إلى اختيار مزود ومراجعة الخصوصية واختبار اللهجات. لا توجد مراقبة اسم في الخلفية.",
    },
    {
      title: "النص إلى إشارة",
      state: "future",
      description:
        "يتطلب فيديو أو صور إشارات موثقة ومراجعة لغوية للصم. الرسوم المتحركة الأصلية ليست ترجمة معتمدة.",
    },
    {
      title: "الكاميرا الإضافية والمصباح",
      state: "future",
      description:
        "بوابات الهاتف والطبيب تستخدمان مسار الكاميرا الحقيقي المتاح في المترجم فقط. الالتقاط المتخصص والتحكم بالمصباح غير متاحين.",
      route: "translator",
    },
    {
      title: "تطبيق الجوال والعمل دون اتصال",
      state: "partial",
      description:
        "واجهة ويب متجاوبة. التطبيق الأصلي وإثبات إعادة التحميل دون اتصال والعمل في الخلفية ما زالت مطلوبة.",
    },
    {
      title: "المظهر والمشاركة واسم الزائر",
      state: "partial",
      description:
        "تفضيلات العرض الحالية متاحة دون اسم أو حساب. المظاهر الأصلية والمشاركة المخصصة واسم الزائر لم تُنقل بعد.",
      route: "settings",
    },
    {
      title: "مساحة المطورين السحابية",
      state: "future",
      description:
        "لا تتصل هذه النسخة بمساحة Firebase الأصلية. المصادقة والصلاحيات وقواعد الخادم تحتاج إلى مراجعة قبل الربط.",
    },
  ],
  en: [
    {
      title: "Letters and camera",
      state: "partial",
      description:
        "Real camera frames, hand landmarks and the existing alphabet model. Accuracy is unmeasured; word recognition is unavailable.",
      route: "translator",
    },
    {
      title: "Communication phrases",
      state: "available",
      description:
        "Nine searchable, editable text phrases. Speech depends on an available Arabic browser voice.",
      route: "dictionary",
    },
    {
      title: "Radar and visual alerts",
      state: "partial",
      description:
        "Experimental on-device YAMNet sound recognition with alerts, history and microphone-level fallback. Direction and distance remain unavailable; reliability needs wider evaluation.",
      route: "radar",
    },
    {
      title: "Accessibility",
      state: "available",
      description:
        "Larger text, high contrast, reduced motion, Arabic and English. Human screen-reader testing is still needed.",
      route: "settings",
    },
    {
      title: "Prayer times",
      state: "future",
      description:
        "Needs verified calculation or a provider and a user-selected location. No live schedule or countdown is displayed.",
    },
    {
      title: "Qibla",
      state: "future",
      description:
        "Needs authorized location, direction calculation and sensor calibration. No fixed bearing is presented as GPS data.",
    },
    {
      title: "Smart watch",
      state: "future",
      description:
        "No watch is paired and no vitals are read. Requires a real integration and device testing; phone vibration is not watch pairing.",
    },
    {
      title: "Car and CarPlay",
      state: "future",
      description:
        "No vehicle is connected. CarPlay requires a native app, platform entitlements and safe device testing.",
    },
    {
      title: "Doctor consultation",
      state: "future",
      description:
        "The doctor portal, complaint recording and video consultation need a secure service. No call or recording has begun.",
    },
    {
      title: "Emergency and SOS",
      state: "future",
      description:
        "This app does not dispatch assistance or contact emergency services. An operational partner and delivery confirmation are required.",
    },
    {
      title: "Notifications and vibration",
      state: "partial",
      description:
        "Visible state and threshold history while radar is open only. Device vibration, background notifications and prayer scheduling are not migrated.",
      route: "radar",
    },
    {
      title: "Speech and name detection",
      state: "future",
      description:
        "Requires provider selection, privacy review and dialect evaluation. No background name monitoring is active.",
    },
    {
      title: "Text to sign",
      state: "future",
      description:
        "Needs verified sign video or images and Deaf-led linguistic review. Original animated illustrations are not validated translation.",
    },
    {
      title: "Other camera tools and flashlight",
      state: "future",
      description:
        "Phone and doctor concepts lead to the real translator camera. Dedicated capture workflows and torch controls are unavailable.",
      route: "translator",
    },
    {
      title: "Mobile app and offline use",
      state: "partial",
      description:
        "Responsive web interface available. Native apps, reliable offline reload and background operation still need implementation or verification.",
    },
    {
      title: "Appearance, sharing and guest name",
      state: "partial",
      description:
        "Current display preferences work without a name or account. Original themes, custom sharing and guest personalization are not migrated.",
      route: "settings",
    },
    {
      title: "Developer cloud workspace",
      state: "future",
      description:
        "This version does not connect to the original Firebase workspace. Authentication, roles and server rules need review before integration.",
    },
  ],
};
