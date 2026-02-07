import { test, expect } from '@playwright/test';

test('verify historical response formatting with user data', async ({ page }) => {
  // Use port 3002 as detected
  await page.goto('http://localhost:3002');

  // Wait for the app to load
  await page.waitForSelector('textarea[placeholder*="Hỏi về lịch sử"]');

  // Mock the API response for the 1911 question
  await page.route('**/api/v1/chat/ask', async (route) => {
    const json = {
      "answer": "Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.\nNăm 1911, Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và.\nNăm 1911, B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
      "events": [
        {
          "event": "Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh",
          "id": null,
          "story": "Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
          "tone": "neutral",
          "year": 1911
        },
        {
          "event": "Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và",
          "id": null,
          "story": "Năm 1911, Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và.",
          "tone": "neutral",
          "year": 1911
        },
        {
          "event": "B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh",
          "id": null,
          "story": "Năm 1911, B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
          "tone": "neutral",
          "year": 1911
        }
      ],
      "intent": "year",
      "no_data": false,
      "query": "{\"question\":\"năm 1911 có sự kiện gì\"}"
    };
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(json),
    });
  });

  // Type the question and press enter
  await page.fill('textarea[placeholder*="Hỏi về lịch sử"]', 'năm 1911 có sự kiện gì');
  await page.keyboard.press('Enter');

  // Wait for the assistant's message - use a more specific selector
  await page.waitForSelector('.prose');

  // Verify the content
  const content = await page.textContent('.prose');
  console.log('Formatted content:', content);

  // Take a screenshot
  await page.screenshot({ path: 'verification.png' });

  expect(content).toContain('Năm 1911');
  expect(content).toContain('Nguyễn Tất Thành ra đi tìm đường cứu nước');
  expect(content).not.toContain('B1.');
  expect(content).not.toContain('Câu hỏi nhắm tới');
});
