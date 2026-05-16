import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Database,
  FileJson2,
  Globe2,
  KeyRound,
  ListChecks,
  Server,
  ShieldAlert,
  TableProperties,
} from 'lucide-react';
import ApiAccessCard from '../components/account/ApiAccessCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import useAuthStore from '../store/useAuthStore';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';
const API_BASE_URL = (
  import.meta.env.VITE_API_URL
  || import.meta.env.VITE_API_BASE_URL
  || `${BASE_URL}/api`
).replace(/\/+$/, '');

const endpointUrl = (path) => `${API_BASE_URL}${path}`;

const copyText = async (value) => {
  const text = String(value || '');
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};

const profileResponse = `{
  "balance": 245.75,
  "currency": "USD",
  "email": "reseller@example.com"
}`;

const productsResponse = `[
  {
    "id": "65f1a1c8e9a5b2a1c9d12001",
    "name": "PUBG Mobile UC 60",
    "price": 1.5,
    "min_qty": 1,
    "max_qty": 50,
    "product_type": "manual",
    "params": [
      {
        "name": "playerId",
        "label": "Player ID",
        "required": true,
        "type": "text"
      },
      {
        "name": "server",
        "label": "Server",
        "required": false,
        "type": "select"
      }
    ]
  }
]`;

const orderRequest = `{
  "productId": "65f1a1c8e9a5b2a1c9d12001",
  "qty": 1,
  "order_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "playerId": "123456789",
  "server": "eu"
}`;

const orderSuccessResponse = `{
  "order_id": "66a88f8c4b40f4a9f0d41010",
  "status": "pending",
  "price": 1.5
}`;

const orderFailureResponse = `{
  "success": false,
  "error_code": 100,
  "message": "Insufficient balance"
}`;

const checkOrdersResponse = `[
  {
    "order_id": "66a88f8c4b40f4a9f0d41010",
    "quantity": 1,
    "price": 1.5,
    "status": "pending",
    "created_at": "2026-05-16T10:30:00.000Z"
  },
  {
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 2,
    "price": 3,
    "status": "completed",
    "created_at": "2026-05-16T10:35:00.000Z"
  }
]`;

const errorCodes = [
  { code: 100, ar: 'رصيد غير كافٍ', en: 'Insufficient balance' },
  { code: 101, ar: 'المنتج غير متاح أو غير مفعل', en: 'Product unavailable/inactive' },
  { code: 102, ar: 'الكمية خارج النطاق المسموح', en: 'Quantity out of range' },
  { code: 120, ar: 'توكن الـ API مفقود', en: 'Token missing' },
  { code: 121, ar: 'توكن غير صالح', en: 'Invalid token' },
  { code: 122, ar: 'حسابك غير مصرح له باستخدام الـ API', en: 'API not allowed' },
  { code: 123, ar: 'خطأ في البيانات المرسلة', en: 'Validation Error' },
];

const parameters = [
  {
    name: 'productId',
    required: 'Required',
    type: 'String',
    description: 'معرف المنتج الذي تم الحصول عليه من مسار المنتجات.',
  },
  {
    name: 'qty',
    required: 'Required',
    type: 'Number',
    description: 'الكمية المطلوبة. يجب أن تكون بين min_qty و max_qty.',
  },
  {
    name: 'order_uuid',
    required: 'Required',
    type: 'UUIDv4',
    description: 'مفتاح منع التكرار. مطلوب لمنع تكرار الطلب أو خصم الرصيد مرتين عند إعادة المحاولة.',
  },
  {
    name: 'playerId',
    required: 'Dynamic',
    type: 'String',
    description: 'مثال لحقل ديناميكي. استخدم أسماء الحقول القادمة في params لكل منتج.',
  },
];

const CodeBlock = ({ children }) => (
  <pre className="overflow-x-auto rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-elevated-rgb)/0.74)] p-4 text-left text-xs leading-6 text-[var(--color-text)] shadow-[var(--shadow-subtle)] [direction:ltr]">
    <code>{children}</code>
  </pre>
);

const Section = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-card-rgb)/0.72)] p-5 shadow-[var(--shadow-subtle)]">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

const EndpointCard = ({ method, path, title, description, children }) => (
  <article className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="rounded-md border border-[color:rgb(var(--color-primary-rgb)/0.35)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] px-2 py-1 font-mono text-xs font-bold text-[var(--color-primary)]">
        {method}
      </span>
      <span className="font-mono text-sm text-[var(--color-text)]">{path}</span>
    </div>
    <h3 className="text-base font-bold text-[var(--color-text)]">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
    <div className="mt-3 rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-elevated-rgb)/0.42)] p-3">
      <p className="mb-2 text-xs font-semibold text-[var(--color-text-secondary)]">الرابط الكامل</p>
      <CodeBlock>{endpointUrl(path)}</CodeBlock>
    </div>
    {children ? <div className="mt-4 space-y-3">{children}</div> : null}
  </article>
);

const ParameterTable = () => (
  <div className="overflow-x-auto rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)]">
    <div className="min-w-[720px]">
      <div className="grid grid-cols-[1fr_92px_90px_2fr] bg-[color:rgb(var(--color-elevated-rgb)/0.72)] text-xs font-bold text-[var(--color-text)]">
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">المعامل</div>
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">الحالة</div>
        <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">النوع</div>
        <div className="p-3">الوصف</div>
      </div>
      {parameters.map((param) => (
        <div key={param.name} className="grid grid-cols-[1fr_92px_90px_2fr] border-t border-[color:rgb(var(--color-border-rgb)/0.72)] text-xs text-[var(--color-text-secondary)]">
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3 font-mono text-[var(--color-text)] [direction:ltr]">{param.name}</div>
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">{param.required}</div>
          <div className="border-l border-[color:rgb(var(--color-border-rgb)/0.72)] p-3">{param.type}</div>
          <div className="p-3 leading-6">{param.description}</div>
        </div>
      ))}
    </div>
  </div>
);

const ApiDocs = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const docsPlainText = useMemo(
    () => `دليل API للموزعين - B2B Reseller API
========================================

1) الروابط الديناميكية
----------------------
Frontend Base URL:
${BASE_URL}

API Base URL:
${API_BASE_URL}

ملاحظة:
كل المسارات التالية تضاف إلى API Base URL. مثال:
${endpointUrl('/client/profile')}

2) التوثيق Authentication
-------------------------
يجب إرسال توكن الـ API في HTTP Headers مع كل طلب:

api-token: YOUR_TOKEN

لا ترسل التوكن داخل Query String ولا داخل كود Frontend عام.

3) Profile - جلب بيانات الحساب
-------------------------------
GET /client/profile
Full URL: ${endpointUrl('/client/profile')}

الوصف:
يعيد رصيد الموزع، العملة، والبريد الإلكتروني المرتبط بالحساب.

Success JSON Response:
${profileResponse}

4) Products - جلب المنتجات والأسعار
-----------------------------------
GET /client/products
Full URL: ${endpointUrl('/client/products')}

الوصف:
يعيد المنتجات النشطة والمتاحة للـ API فقط. السعر price هو السعر النهائي بعد تطبيق خصم/تسعير مجموعة العميل.
الحقل params يحتوي الحقول الديناميكية المطلوبة لإرسال الطلب.

Success JSON Response:
${productsResponse}

5) Place Order - إنشاء طلب
--------------------------
POST /client/orders
Full URL: ${endpointUrl('/client/orders')}

Headers:
api-token: YOUR_TOKEN
Content-Type: application/json

Parameters:
- productId | Required | String | معرف المنتج من GET /client/products.
- qty | Required | Number | الكمية المطلوبة ويجب أن تكون بين min_qty و max_qty.
- order_uuid | Required | UUIDv4 | مفتاح منع التكرار Idempotency Key لمنع الطلبات المكررة والخصم المزدوج.
- dynamic fields مثل playerId | Dynamic | String | أرسل الحقول المطلوبة كما هي موجودة في params للمنتج.

Request Body Example:
${orderRequest}

Success JSON Response:
${orderSuccessResponse}

Failure JSON Response:
${orderFailureResponse}

6) Check Orders - متابعة الطلبات
--------------------------------
GET /client/check?orders=uuid1,id2
Full URL: ${endpointUrl('/client/check?orders=uuid1,id2')}

الوصف:
يمكن تمرير order_id أو order_uuid مفصولة بفواصل. سيتم إرجاع الطلبات التابعة لحسابك فقط.

Success JSON Response:
${checkOrdersResponse}

7) Error Codes Directory
------------------------
${errorCodes.map((item) => `${item.code}: ${item.ar} (${item.en})`).join('\n')}
`,
    []
  );

  const handleCopyDocs = async () => {
    try {
      const copied = await copyText(docsPlainText);
      addToast(copied ? 'تم نسخ الدليل الكامل للمبرمج.' : 'تعذر نسخ الدليل.', copied ? 'success' : 'error');
    } catch {
      addToast('تعذر نسخ الدليل.', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'الروابط والتوثيق', icon: Globe2 },
    { id: 'endpoints', label: 'المسارات والأمثلة', icon: ListChecks },
    { id: 'errors', label: 'أكواد الأخطاء', icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <ApiAccessCard user={user} />

      <Card className="rounded-2xl border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] p-5 shadow-[var(--shadow-subtle)]">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text)]">
              <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
              دليل API للموزعين
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
              مرجع تكامل احترافي لحسابات B2B المصرح لها. يحتوي على الروابط الديناميكية، طريقة التوثيق،
              أمثلة JSON كاملة، قواعد منع التكرار، وأكواد الأخطاء المعتمدة من الخادم.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleCopyDocs}>
            <ClipboardCopy className="h-4 w-4" />
            نسخ الدليل للمبرمج
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[color:rgb(var(--color-primary-rgb)/0.38)] bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]'
                    : 'border-[color:rgb(var(--color-border-rgb)/0.86)] text-[var(--color-text-secondary)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.07)] hover:text-[var(--color-text)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-4">
            <Section
              icon={Server}
              title="الروابط الديناميكية"
              description="لا توجد روابط محلية ثابتة داخل هذا الدليل. يتم توليد الروابط من بيئة التشغيل الحالية وإعدادات المشروع."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <Globe2 className="h-4 w-4 text-[var(--color-primary)]" />
                    BASE_URL
                  </div>
                  <CodeBlock>{BASE_URL}</CodeBlock>
                </div>
                <div className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-surface-rgb)/0.5)] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <Database className="h-4 w-4 text-[var(--color-primary)]" />
                    API_BASE_URL
                  </div>
                  <CodeBlock>{API_BASE_URL}</CodeBlock>
                </div>
              </div>
            </Section>

            <Section
              icon={KeyRound}
              title="التوثيق Authentication"
              description="يجب إرسال توكن الوصول في الهيدر مع كل طلب. أي طلب بدون التوكن أو بتوكن غير صالح سيرفضه الخادم."
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)]">
                <CodeBlock>{`api-token: YOUR_TOKEN`}</CodeBlock>
                <div className="flex gap-3 rounded-xl border border-amber-400/40 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-300/25 dark:bg-amber-950/20 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>
                    احفظ التوكن في الخادم الخاص بك أو بيئة آمنة. لا تقم بتضمينه داخل تطبيق Frontend عام
                    ولا ترسله داخل الرابط كـ query parameter.
                  </p>
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === 'endpoints' ? (
          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/client/profile"
              title="Profile - جلب بيانات الحساب"
              description="يعيد الرصيد الحالي، العملة، والبريد الإلكتروني للموزع المصادق عليه."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Success JSON Response
                </div>
                <CodeBlock>{profileResponse}</CodeBlock>
              </div>
            </EndpointCard>

            <EndpointCard
              method="GET"
              path="/client/products"
              title="Products - جلب المنتجات والأسعار"
              description="يعيد المنتجات النشطة والمتاحة للـ API. السعر price هو السعر النهائي للموزع بعد تطبيق تسعير المجموعة."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <FileJson2 className="h-4 w-4 text-[var(--color-primary)]" />
                  Success JSON Response
                </div>
                <CodeBlock>{productsResponse}</CodeBlock>
              </div>
            </EndpointCard>

            <EndpointCard
              method="POST"
              path="/client/orders"
              title="Place Order - إنشاء طلب"
              description="ينشئ طلبا جديدا ويخصم الرصيد حسب السعر النهائي. order_uuid إلزامي لمنع تكرار الطلبات والخصم المزدوج."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <TableProperties className="h-4 w-4 text-[var(--color-primary)]" />
                  Parameter Table
                </div>
                <ParameterTable />
              </div>
              <div>
                <div className="mb-2 text-sm font-bold text-[var(--color-text)]">Request Body Example</div>
                <CodeBlock>{orderRequest}</CodeBlock>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Success JSON Response
                  </div>
                  <CodeBlock>{orderSuccessResponse}</CodeBlock>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    Failure JSON Response
                  </div>
                  <CodeBlock>{orderFailureResponse}</CodeBlock>
                </div>
              </div>
            </EndpointCard>

            <EndpointCard
              method="GET"
              path="/client/check?orders=uuid1,id2"
              title="Check Orders - متابعة حالة الطلبات"
              description="مرر order_id أو order_uuid مفصولة بفواصل. يعيد الخادم الطلبات التابعة لحسابك فقط."
            >
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Success JSON Response
                </div>
                <CodeBlock>{checkOrdersResponse}</CodeBlock>
              </div>
            </EndpointCard>
          </div>
        ) : null}

        {activeTab === 'errors' ? (
          <Section
            icon={ShieldAlert}
            title="Error Codes Directory"
            description="هذه هي أكواد الأخطاء المعتمدة التي يمكن أن تظهر في ردود API عند فشل الطلب."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {errorCodes.map((item) => (
                <div key={item.code} className="rounded-xl border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-surface-rgb)/0.52)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg border border-red-400/30 bg-red-500/10 px-2 py-1 font-mono text-xs font-bold text-red-500">
                      {item.code}
                    </span>
                    <h3 className="font-bold text-[var(--color-text)]">{item.ar}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.en}</p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </Card>
    </div>
  );
};

export default ApiDocs;
