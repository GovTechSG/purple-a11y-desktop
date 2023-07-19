import { test } from '@playwright/test';
import common from "./common";

test('Sitemap Crawl - Mobile', async () => {
    await common.testHappyFlow("Sitemap crawl", "Mobile");
});