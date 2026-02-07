import { test, expect } from '@playwright/test';

test('verify historical response formatting with multi-question flow', async ({ page }) => {
  await page.goto('http://localhost:3002');

  const chatInput = page.locator('textarea[placeholder*="Hỏi về lịch sử"]');
  await expect(chatInput).toBeVisible();

  // 1. Mock first question (No data)
  await page.route('**/api/v1/chat/ask', async (route) => {
    const json = {
      "answer": null,
      "events": [],
      "intent": "greeting",
      "no_data": true,
      "query": "hello bạn là ai"
    };
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(json),
    });
  });

  await chatInput.fill('hello bạn là ai');
  await page.keyboard.press('Enter');

  // Wait for and verify "No information" message
  const firstResponse = page.locator('.prose-vietnamese').first();
  await expect(firstResponse).toBeVisible({ timeout: 10000 });
  await expect(firstResponse).toContainText('không tìm thấy thông tin lịch sử');

  // 2. Mock second question (1911 data)
  await page.route('**/api/v1/chat/ask', async (route) => {
    const json = {
      "answer": "Năm 1911, Nguyễn Tất Thành ...",
      "events": [
        {
          "year": 1911,
          "story": "Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước (1911).",
          "event": "Nguyễn Tất Thành ra đi tìm đường cứu nước (1911)."
        }
      ],
      "intent": "year",
      "no_data": false,
      "query": "năm 1911"
    };
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(json),
    });
  });

  await chatInput.fill('năm 1911');
  await page.keyboard.press('Enter');

  // Wait for and verify the formatted year response
  const secondResponse = page.locator('.prose-vietnamese').nth(1);
  await expect(secondResponse).toBeVisible({ timeout: 10000 });
  await expect(secondResponse).toContainText('Năm 1911');
  await expect(secondResponse).toContainText('Nguyễn Tất Thành ra đi tìm đường cứu nước');

  // Take screenshot of both messages
  await page.screenshot({ path: 'verification_multi_2.png' });
});
