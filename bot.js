// بوت Smart Shop - نسخة مستقلة تعمل على أي سيرفر أو Render.com
// تشتغل كخادم ويب + بوت فحص رسائل فيسبوك
// لا تحتاج أي مكتبات خارجية - تستخدم Node.js فقط

const http = require('http');

const PAGE_ACCESS_TOKEN = 'EAAXFXdUiD9wBRlZCppDYb731nET1iWwyUBC4BipMuGIQw2GVNRdPFIFIjiul10zNyJ4rEqOvEs6qLyoZCPALzyljuUmOotKnLou2xrSZByNdNEYVGQIrLnpoXFhGBdkGC9c32z9H8KeXdpiE09IaXzIUom7XWGRVNkLrEPJ1c1htTb2FEYhZAraSOrYVHV6UIY6ZBk6qLcegHM6afm1KL';
const PAGE_ID = '121095250978158';
const PORT = process.env.PORT || 3000;
const POLL_INTERVAL = 30000; // 30 ثانية

// ===== نظام الردود الذكي =====

function generateReply(messageText, conversationMessages) {
  const text = messageText.trim();
  const lower = text.toLowerCase();

  // استخراج السياق من آخر الرسائل
  let lastTopic = '';
  let lastQuestion = '';

  if (conversationMessages && conversationMessages.length > 0) {
    for (let i = conversationMessages.length - 1; i >= 0; i--) {
      const msg = conversationMessages[i];
      if (msg.from && msg.from.id === PAGE_ID && msg.message) {
        const botMsg = msg.message.toLowerCase();
        if (botMsg.includes('سعر') || botMsg.includes('500 ألف') || botMsg.includes('دينار')) lastTopic = 'price';
        else if (botMsg.includes('تجريب') || botMsg.includes('نسخة تجريب') || botMsg.includes('5 أيام')) lastTopic = 'trial';
        else if (botMsg.includes('مميزات') || botMsg.includes('إدارة المبيعات')) lastTopic = 'features';
        else if (botMsg.includes('دفع') || botMsg.includes('بريدي موب') || botMsg.includes('سي سي بي')) lastTopic = 'payment';
        else if (botMsg.includes('هل تريد تجربة')) lastQuestion = 'trial_offer';
        break;
      }
    }
  }

  // ===== التحيات =====
  if (/^(مرحب|السلام|سلام|هلا|أهلا|اهلا|هاي|صباح|مساء|كيف حالك|كيفك|شخبارك|شلونك|يا هلا|وسهلا)/.test(lower)) {
    return 'مرحباً بك! مرحباً بك في Smart Shop لتسيير المحلات التجارية.\n\nكيف يمكنني مساعدتك؟ يمكنك سؤالي عن:\n- مميزات البرنامج\n- السعر وطرق الدفع\n- النسخة التجريبية المجانية\n- طلب الشراء\n- الدعم الفني والتواصل';
  }

  // ===== الموافقة =====
  if (/^(نعم|أيوة|ايوة|أه|اه|أوك|اوك|ok|حسنا|موافق|تمام|صح|اي|أي|هات|عطني|أعطني)/.test(lower)) {
    if (lastTopic === 'trial' || lastQuestion === 'trial_offer') {
      return 'ممتاز! حمّل النسخة التجريبية المجانية من هنا:\n\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nالنسخة التجريبية مدتها 5 أيام وتتضمن جميع مميزات البرنامج.\n\nجرب واعطينا رايك! رأيك يهمنا كثيراً ويساعدنا في تحسين البرنامج.\n\nلأي استفسار تواصل معنا: 0775067236';
    }
    if (lastTopic === 'price') {
      return 'رائع! لشراء البرنامج:\n\nالسعر: 500 ألف دينار جزائري\nطرق الدفع: بريدي موب أو سي سي بي\n\nحمّل النسخة التجريبية أولاً (5 أيام مجاناً):\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك!\n\nللتواصل والشراء: 0775067236';
    }
    if (lastTopic === 'features') {
      return 'هل تريد تجربة البرنامج بنفسك؟ النسخة التجريبية المجانية متاحة لمدة 5 أيام!\n\nحمّلها من هنا:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك!';
    }
    return 'يسعدني ذلك! هل تريد معرفة:\n- مميزات البرنامج؟\n- السعر؟\n- تحميل النسخة التجريبية المجانية؟\n- طرق الدفع؟\n\nتفضل بسؤالي!';
  }

  // ===== السعر =====
  if (/سعر|ثمن|كم سعر|بكم|تكلفة|كم يكلف|السعر|الثمن|كلفة|قيمة|كم ثمن|ادفع|أدفع|يدفع/.test(lower)) {
    return 'سعر برنامج Smart Shop هو 500 ألف دينار جزائري فقط.\n\nهذا السعر يشمل:\n- البرنامج الكامل بدون أي قيود\n- جميع التحديثات المستقبلية مجاناً\n- دعم فني متواصل\n- تدريب على استخدام البرنامج\n\nبرنامج Smart Shop استثمار حقيقي لمحلك - سيوفر عليك الوقت والجهد ويضمن إدارة احترافية.\n\nهل تريد تجربة النسخة التجريبية المجانية قبل الشراء؟';
  }

  // ===== النسخة التجريبية =====
  if (/تجريب|نسخة تجريب|تجربة|trial|تست|جرب|أجرب|اجرب|نزل|تحميل|رابط|لينك|مدة التجريب|كم مدة|مجان|حمل|تنزيل|download|link/.test(lower)) {
    return 'نعم، يتوفر نسخة تجريبية مجانية من برنامج Smart Shop!\n\nالمدة: 5 أيام كاملة\nمجانية بالكامل بدون أي تكلفة\nتتضمن جميع مميزات البرنامج\nيمكنك تجربة كل شيء قبل اتخاذ قرار الشراء\n\nرابط التحميل:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك! رأيك يهمنا كثيراً ويساعدنا في تحسين البرنامج. بعد انتهاء الفترة التجريبية، يمكنك الحصول على النسخة الكاملة بسعر 500 ألف دينار جزائري.';
  }

  // ===== طرق الدفع =====
  if (/دفع|payment|بريدي|baridimob|بريدي موب|سي سي بي|ccp|cib|سيسيبي|حوالة|تحويل|طريقة الدفع|كيف أدفع|كيفاش ندفع|كيف ندفع|باريد/.test(lower)) {
    return 'طرق الدفع المتاحة لبرنامج Smart Shop:\n\n1. بريدي موب (BaridiMob)\n- سريع وسهل\n- التحويل فوري\n- الأكثر استخداماً في الجزائر\n\n2. سي سي بي (CIB)\n- تحويل بنكي آمن\n- معتمد في جميع البنوك الجزائرية\n\nبعد إتمام الدفع، ستحصل على النسخة الكاملة من البرنامج فوراً مع تفعيل الدعم الفني.\n\nهل تريد تحميل النسخة التجريبية أولاً؟';
  }

  // ===== المميزات =====
  if (/مميزات|خصائص|فوائد|ماذا يفعل|وظيفة|ماذا يقدم|فائدة|لماذا|مزايا|يدير|يقدم|يشمل|يتضمن|خصوص|خاص/.test(lower)) {
    return 'برنامج Smart Shop يقدم مميزات متكاملة لتسيير محلك التجاري:\n\nإدارة المبيعات:\n- تسجيل المبيعات بسرعة وسهولة\n- إصدار فواتير احترافية\n- تتبع المبيعات اليومية والشهرية\n\nإدارة المخزون:\n- تتبع جميع المنتجات والبضائع\n- تنبيهات عند انخفاض المخزون\n- تنظيم الأصناف والفئات\n\nإدارة العملاء:\n- قاعدة بيانات شاملة للعملاء\n- تتبع الديون والمستحقات\n- سجل المشتريات لكل عميل\n\nالتقارير والإحصائيات:\n- تقارير مفصلة عن المبيعات والأرباح\n- رسوم بيانية توضيحية\n- تصدير التقارير\n\nدعم فني متواصل\n\nكل هذا في برنامج واحد سهل الاستخدام! هل تريد تجربته مجاناً لمدة 5 أيام؟';
  }

  // ===== التواصل =====
  if (/رقم|هاتف|اتصل|اتصال|تواصل|واتساب|whatsapp|call|0775|جوال|موبايل|نوميرو|نمر/.test(lower)) {
    return 'يمكنك التواصل معنا مباشرة عبر:\n\nرقم الهاتف: 0775067236\n\nنحن متواجدون للإجابة على جميع استفساراتك ومساعدتك في أي وقت. لا تتردد في الاتصال بنا!';
  }

  // ===== الشراء =====
  if (/شراء|أشتري|اشتري|أريد|اريد|أحب|احب|نريد|طلب|أطلب|اطلب|كيف أشتري|كيف اشتري|نشري|نشريه/.test(lower)) {
    return 'رائع! خطوة ذكية جداً!\n\nللحصول على برنامج Smart Shop:\n\n1. جرب النسخة التجريبية أولاً (5 أيام مجاناً):\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك! رأيك يهمنا كثيراً.\n\n2. بعد التأكد من أن البرنامج يناسبك، يمكنك الشراء بسعر 500 ألف دينار جزائري\n\n3. طرق الدفع:\n- بريدي موب (BaridiMob)\n- سي سي بي (CIB)\n\n4. تواصل معنا على: 0775067236\n\nستحصل على النسخة الكاملة مع الدعم الفني والتحديثات!';
  }

  // ===== الشكر =====
  if (/شكر|شكرا|ممنون|مشكور|جزاك|بارك|يعطيك|الله يجزيك/.test(lower)) {
    return 'العفو! نحن سعداء بخدمتك. إذا كان لديك أي سؤال آخر عن برنامج Smart Shop، لا تتردد في السؤال. نحن هنا دائماً لمساعدتك!';
  }

  // ===== من أنت =====
  if (/من أنت|من انت|ما هو|ايش هذا|إيش هذا|تعريف|عرفني|قدم لي|عاوز اعرف|شنو|شنوا|أيش|ايش|وش|ويش/.test(lower)) {
    return 'Smart Shop\n\nSmart Shop هو برنامج متكامل لتسيير المحلات التجارية في الجزائر. تم تصميمه خصيصاً لتلبية احتياجات التجار الجزائريين.\n\nما يقدمه البرنامج:\n- إدارة المبيعات بسهولة\n- تتبع المخزون والبضائع\n- إدارة العملاء والديون\n- فواتير احترافية\n- تقارير وإحصائيات مفصلة\n- دعم فني متواصل\n\nالسعر: 500 ألف دينار جزائري\nنسخة تجريبية: 5 أيام مجاناً\nالدفع: بريدي موب أو سي سي بي\n\nهل تريد معرفة المزيد عن أي ميزة محددة؟';
  }

  // ===== المقارنة =====
  if (/مقارنة|أفضل|هل يستحق|تردد|متردد|هل هو جيد|أفضل من|زاد|زايد|غالي|حرام|وايل|صعيب|صعب/.test(lower)) {
    return 'أفهم ترددك، وهذا طبيعي! لكن دعني أوضح لك لماذا Smart Shop هو الخيار الأفضل:\n\nمقابل البرامج الأخرى:\n- مصمم خصيصاً للسوق الجزائري\n- يدعم الدينار الجزائري\n- واجهة عربية سهلة الاستخدام\n- دعم فني محلي سريع\n- تحديثات مجانية مستمرة\n\nاستثمار وليس مصروف:\n- يوفر عليك ساعات من العمل اليدوي\n- يقلل الأخطاء في الحسابات\n- يحسن إدارة المخزون\n- يزيد أرباحك من خلال تنظيم أفضل\n\nجرّب قبل أن تشتري:\nالنسخة التجريبية المجانية لمدة 5 أيام تتيح لك تجربة كل شيء بنفسك!\n\nحمّل النسخة التجريبية وجرب واعطينا رايك:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file';
  }

  // ===== الدعم الفني =====
  if (/مشكلة|مشكل|خطأ|عطل|لا يعمل|ما يشتغل|مساعدة|ساعدني|دعم|فني|يعملش|مش مليح/.test(lower)) {
    return 'لا تقلق! فريق الدعم الفني لدينا جاهز لمساعدتك!\n\nتواصل معنا مباشرة:\nرقم الهاتف: 0775067236\n\nسنساعدك في:\n- تثبيت البرنامج\n- حل أي مشكلة تقنية\n- الإجابة على استفساراتك\n- التدريب على استخدام البرنامج\n\nنحن نضمن لك دعماً فنياً سريعاً ومتواصلاً. لا تتردد في التواصل معنا!';
  }

  // ===== مدة التجريبية =====
  if (/مدة|كم يوم|كم وقت|وقت|يوم|أيام/.test(lower)) {
    return 'مدة النسخة التجريبية من برنامج Smart Shop هي 5 أيام كاملة.\n\nخلال هذه الفترة يمكنك تجربة جميع مميزات البرنامج مجاناً بدون أي قيود.\n\nحمّل النسخة التجريبية:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك! رأيك يهمنا كثيراً ويساعدنا في التحسين.\n\nبعد انتهاء الفترة التجريبية، يمكنك الحصول على النسخة الكاملة بسعر 500 ألف دينار جزائري.';
  }

  // ===== برنامج / محلات =====
  if (/برنامج|محل|محلات|تسيير|تسير|إدارة|اداره|ادارة|مخزون|مبيعات|فواتير|عملاء|كاشير|كاشي/.test(lower)) {
    return 'برنامج Smart Shop هو الحل الأمثل لتسيير محلك التجاري!\n\nيقدم لك:\n- إدارة المبيعات والكاشير\n- تتبع المخزون والبضائع\n- إدارة العملاء والديون\n- إصدار فواتير احترافية\n- تقارير وإحصائيات مفصلة\n\nالسعر: 500 ألف دينار جزائري\nنسخة تجريبية: 5 أيام مجاناً\n\nهل تريد معرفة المزيد عن مميزاته أو تحميل النسخة التجريبية؟';
  }

  // ===== الرفض =====
  if (/^(لا|لأ|لا أريد|لا اريد|مش عاوز|مش حاب|ما نبيش|ما نبغى)/.test(lower)) {
    return 'لا مشكلة! إذا تغير رأيك أو كان لديك أي سؤال مستقبلاً، أنا هنا دائماً لمساعدتك.\n\nيمكنك التواصل معنا في أي وقت على: 0775067236\n\nنتمنى لك يوماً موفقاً!';
  }

  // ===== رد ذكي حسب السياق =====
  if (lastTopic === 'price') {
    return 'هل تريد تجربة النسخة التجريبية المجانية لمدة 5 أيام قبل الشراء؟\n\nحمّلها من هنا:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك!\n\nأو تواصل معنا: 0775067236';
  }

  if (lastTopic === 'features') {
    return 'هل أعجبتك المميزات؟ يمكنك تجربة البرنامج مجاناً لمدة 5 أيام!\n\nحمّل النسخة التجريبية:\nhttps://www.mediafire.com/file/ivgl6o1rlsp65na/Smart_Shop_DZ_Setup.exe/file\n\nجرب واعطينا رايك!\n\nالسعر: 500 ألف دينار جزائري\nالدفع: بريدي موب أو سي سي بي';
  }

  // رد افتراضي
  return 'شكراً لرسالتك! Smart Shop لتسيير المحلات التجارية.\n\nيمكنني مساعدتك في:\n- معرفة مميزات البرنامج\n- السعر وطرق الدفع\n- تحميل النسخة التجريبية المجانية (5 أيام)\n- طلب الشراء\n- الدعم الفني\n\nتفضل بسؤالي!';
}

// ===== فحص الرسائل والرد =====
async function pollMessages() {
  try {
    console.log(`[${new Date().toISOString()}] Checking for new messages...`);

    const convsUrl = `https://graph.facebook.com/v21.0/${PAGE_ID}/conversations?fields=id,snippet,updated_time,message_count&limit=15&access_token=${PAGE_ACCESS_TOKEN}`;
    const convsResponse = await fetch(convsUrl);

    if (!convsResponse.ok) {
      const errText = await convsResponse.text();
      console.error(`Conversations API error (${convsResponse.status}):`, errText);
      return;
    }

    const convsData = await convsResponse.json();

    if (!convsData.data || convsData.data.length === 0) {
      return;
    }

    for (const conv of convsData.data) {
      try {
        // جلب آخر 3 رسائل
        const msgsUrl = `https://graph.facebook.com/v21.0/${conv.id}/messages?fields=id,from,message,created_time&limit=3&access_token=${PAGE_ACCESS_TOKEN}`;
        const msgsResponse = await fetch(msgsUrl);

        if (!msgsResponse.ok) continue;

        const msgsData = await msgsResponse.json();
        if (!msgsData.data || msgsData.data.length === 0) continue;

        const messages = msgsData.data;
        const lastMsg = messages[0];

        // تخطي إذا كانت آخر رسالة من الصفحة (البوت رد بالفعل)
        if (lastMsg.from.id === PAGE_ID) continue;

        // تخطي الرسائل القديمة (أكثر من 5 دقائق)
        const msgTime = new Date(lastMsg.created_time).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - msgTime > fiveMinutes) continue;

        const messageText = lastMsg.message;
        if (!messageText) continue;

        console.log(`New message from ${lastMsg.from.name} (${lastMsg.from.id}): ${messageText}`);

        const senderId = lastMsg.from.id;
        const replyText = generateReply(messageText, messages);
        console.log(`Reply: ${replyText.substring(0, 80)}...`);

        // إرسال الرد
        const sendUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
        const sendResponse = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: senderId },
            message: { text: replyText },
          }),
        });

        if (sendResponse.ok) {
          console.log(`Reply sent to ${lastMsg.from.name}!`);
        } else {
          const errData = await sendResponse.json();
          console.error(`Send error:`, JSON.stringify(errData));
        }

      } catch (msgErr) {
        console.error('Error processing conversation:', msgErr.message);
      }
    }

  } catch (error) {
    console.error('Poll error:', error.message);
  }
}

// ===== خادم ويب بسيط (مطلوب لـ Render.com و UptimeRobot) =====
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: 'Smart Shop Bot v1.0',
      uptime: Math.floor(process.uptime()) + 's',
      lastCheck: new Date().toISOString()
    }));
  } else if (req.url === '/poll') {
    pollMessages().then(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'poll triggered', time: new Date().toISOString() }));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  Smart Shop Bot v1.0`);
  console.log(`  Running on port ${PORT}`);
  console.log(`  Polling every ${POLL_INTERVAL / 1000} seconds`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Manual: http://localhost:${PORT}/poll`);
  console.log(`========================================`);

  // بدء الفحص الدوري
  pollMessages();
  setInterval(pollMessages, POLL_INTERVAL);
});

// معالجة الأخطاء
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
