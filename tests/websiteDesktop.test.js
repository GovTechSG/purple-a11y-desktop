import { test } from '@playwright/test';
import common from "./common";

test('Website Crawl - Desktop', async () => {
    await common.testHappyFlow("Website crawl", "Desktop");
});