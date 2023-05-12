import { test } from '@playwright/test';
import common from "./common";

test('Sitemap Crawl - Desktop', async () => {
    await common.testHappyFlow("Sitemap crawl", "Desktop");
});