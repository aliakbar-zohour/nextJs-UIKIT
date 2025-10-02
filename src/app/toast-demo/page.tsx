'use client';

import React from 'react';
import { ToastProvider } from '@/components/ui/Toast/ToastProvider';
import { useToastHelpers } from '@/components/ui/Toast/useToast';
import Button from '@/components/ui/Button/Button';

const ToastDemoContent = () => {
  const toast = useToastHelpers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Toast Component Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* English Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">English Toasts</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => toast.success("Operation completed successfully!")}
                  >
                    Success
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => toast.error("An error occurred while processing.")}
                  >
                    Error
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.warning("Please review your information.")}
                  >
                    Warning
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info("New information is available.")}
                  >
                    Info
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">With Titles</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => toast.success("Data saved successfully!", { title: "Success" })}
                  >
                    Success with Title
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => toast.error("Failed to connect to server.", { title: "Connection Error" })}
                  >
                    Error with Title
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Custom Options</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.info("This toast will stay for 10 seconds.", { duration: 10000 })}
                  >
                    Long Duration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.warning("This toast won't auto-dismiss.", { duration: 0 })}
                  >
                    Persistent
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.success("Clean message without icon.", { showIcon: false })}
                  >
                    No Icon
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Persian Section */}
          <div className="space-y-6" dir="rtl">
            <h2 className="text-2xl font-semibold">پیام‌های فارسی</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">انواع پایه</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => toast.success("عملیات با موفقیت انجام شد!")}
                  >
                    موفقیت
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => toast.error("خطایی در انجام عملیات رخ داد.")}
                  >
                    خطا
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.warning("لطفاً اطلاعات را بررسی کنید.")}
                  >
                    هشدار
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.info("اطلاعات جدید در دسترس است.")}
                  >
                    اطلاعات
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">با عنوان</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => toast.success("اطلاعات با موفقیت ذخیره شد!", { title: "موفق" })}
                  >
                    موفقیت با عنوان
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => toast.error("اتصال به سرور برقرار نشد.", { title: "خطای اتصال" })}
                  >
                    خطا با عنوان
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">تنظیمات سفارشی</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.info("این پیام ۱۰ ثانیه نمایش داده می‌شود.", { duration: 10000 })}
                  >
                    مدت طولانی
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => toast.warning("این پیام خودکار بسته نمی‌شود.", { duration: 0 })}
                  >
                    دائمی
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => toast.success("پیام تمیز بدون آیکون.", { showIcon: false })}
                  >
                    بدون آیکون
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <Button 
            variant="outline" 
            onClick={() => toast.dismissAll()}
          >
            Close All Toasts
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              // Show multiple toasts at once
              toast.success("First toast");
              setTimeout(() => toast.info("Second toast"), 200);
              setTimeout(() => toast.warning("Third toast"), 400);
              setTimeout(() => toast.error("Fourth toast"), 600);
            }}
          >
            Show Multiple
          </Button>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Use Toast Component</h3>
          <div className="space-y-2 text-sm">
            <p><strong>1. Wrap your app with ToastProvider:</strong></p>
            <code className="block bg-gray-200 p-2 rounded text-xs">
              {`<ToastProvider maxToasts={5} defaultPosition="top-right">
  <App />
</ToastProvider>`}
            </code>
            
            <p className="mt-4"><strong>2. Use the useToastHelpers hook:</strong></p>
            <code className="block bg-gray-200 p-2 rounded text-xs">
              {`const toast = useToastHelpers();
toast.success("Success message!");
toast.error("Error message!", { title: "Error" });`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToastDemoPage = () => {
  return (
    <ToastProvider maxToasts={5} defaultPosition="top-right">
      <ToastDemoContent />
    </ToastProvider>
  );
};

export default ToastDemoPage;
