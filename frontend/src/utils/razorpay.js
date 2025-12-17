import { Linking } from 'react-native';

/**
 * Generate Razorpay Checkout HTML
 * This will be loaded in a WebView for payment
 */
export const generateRazorpayHTML = (orderDetails) => {
  const { orderId, amount, currency, key, prefill, notes } = orderDetails;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .container {
          text-align: center;
          padding: 20px;
        }
        .loading {
          font-size: 18px;
          color: #0D34B7;
          margin-bottom: 10px;
        }
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #0D34B7;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <div class="loading">Opening Payment Gateway...</div>
      </div>
      <script>
        var options = {
          key: '${key}',
          amount: ${amount},
          currency: '${currency}',
          name: 'Mathur Vaishya Bhavan',
          description: 'Booking Payment',
          order_id: '${orderId}',
          prefill: ${JSON.stringify(prefill)},
          notes: ${JSON.stringify(notes)},
          theme: {
            color: '#0D34B7'
          },
          handler: function (response) {
            // Payment successful
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'success',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }));
          },
          modal: {
            ondismiss: function() {
              // User closed payment modal
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'dismissed',
                message: 'Payment cancelled by user'
              }));
            }
          }
        };

        var rzp = new Razorpay(options);
        
        rzp.on('payment.failed', function (response) {
          // Payment failed
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            error: response.error
          }));
        });

        // Open Razorpay checkout
        setTimeout(function() {
          rzp.open();
        }, 500);
      </script>
    </body>
    </html>
  `;
};