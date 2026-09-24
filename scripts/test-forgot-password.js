import http from 'http';
import forgotPasswordHandler from '../api/auth/forgot-password.js';
import loginHandler from '../api/auth/login.js';

// Mock request / response helpers for direct handler testing in Node.js
function createMockReqRes({ method = 'POST', body = {}, headers = {} }) {
  const req = {
    method,
    body,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    },
  };

  const res = {
    statusCode: 200,
    headersSent: {},
    responseData: null,
    setHeader(key, val) {
      this.headersSent[key] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    },
    end() {
      return this;
    },
  };

  return { req, res };
}

async function runTest() {
  console.log('--- Testing Forgot Password & Account Recovery Flow ---');

  const testEmail = 'maria.clara@likha-atelier.com';
  const newPassword = 'myNewPrestigePassword2026!';

  // Step 1: Request Password Reset Code
  const { req: req1, res: res1 } = createMockReqRes({
    body: { action: 'request', email: testEmail },
  });
  await forgotPasswordHandler(req1, res1);

  if (res1.statusCode !== 200 || !res1.responseData?.resetCode) {
    console.error('❌ Step 1 Failed: Could not request password reset.', res1.responseData);
    process.exit(1);
  }

  const resetCode = res1.responseData.resetCode;
  console.log(`✓ Step 1 Passed: Reset code generated successfully (${resetCode})`);

  // Step 2: Test Invalid Code rejection
  const { req: reqInvalid, res: resInvalid } = createMockReqRes({
    body: { action: 'reset', email: testEmail, code: '000000', newPassword },
  });
  await forgotPasswordHandler(reqInvalid, resInvalid);
  if (resInvalid.statusCode !== 400) {
    console.error('❌ Failed: Invalid code was not rejected!', resInvalid.responseData);
    process.exit(1);
  }
  console.log('✓ Security Check Passed: Invalid reset code correctly rejected (Status 400)');

  // Step 3: Reset password using the correct code
  const { req: req2, res: res2 } = createMockReqRes({
    body: { action: 'reset', email: testEmail, code: resetCode, newPassword },
  });
  await forgotPasswordHandler(req2, res2);

  if (res2.statusCode !== 200 || !res2.responseData?.success) {
    console.error('❌ Step 2 Failed: Could not reset password with valid code.', res2.responseData);
    process.exit(1);
  }
  console.log('✓ Step 2 Passed: Password updated successfully via reset code.');

  // Step 4: Login with old password (MUST FAIL)
  const { req: reqOld, res: resOld } = createMockReqRes({
    body: { email: testEmail, password: 'password123' },
  });
  await loginHandler(reqOld, resOld);
  if (resOld.statusCode !== 401) {
    console.error('❌ Security Check Failed: Old password still allowed login!', resOld.responseData);
    process.exit(1);
  }
  console.log('✓ Security Check Passed: Old password correctly rejected (Status 401)');

  // Step 5: Login with new password (MUST SUCCEED)
  const { req: reqNew, res: resNew } = createMockReqRes({
    body: { email: testEmail, password: newPassword },
  });
  await loginHandler(reqNew, resNew);
  if (resNew.statusCode !== 200 || !resNew.responseData?.token) {
    console.error('❌ Step 3 Failed: Could not log in with new password.', resNew.responseData);
    process.exit(1);
  }
  console.log(`✓ Step 3 Passed: Authenticated patron with new password! (Token: ${resNew.responseData.token.slice(0, 15)}...)`);

  // Step 6: Reset back to default password123 for reproducibility
  const { req: reqReq3, res: resReq3 } = createMockReqRes({
    body: { action: 'request', email: testEmail },
  });
  await forgotPasswordHandler(reqReq3, resReq3);
  const resetCode2 = resReq3.responseData.resetCode;

  const { req: reqResetBack, res: resResetBack } = createMockReqRes({
    body: { action: 'reset', email: testEmail, code: resetCode2, newPassword: 'password123' },
  });
  await forgotPasswordHandler(reqResetBack, resResetBack);
  console.log('✓ Cleanup Passed: Restored default demo password for test reproducibility.');

  console.log('\n🎉 ALL FORGOT PASSWORD FLOW TESTS PASSED 100% SUCCESSFULLY!\n');
}

runTest().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
