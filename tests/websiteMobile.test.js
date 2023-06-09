import { test } from '@playwright/test';
import common from "./common";

test('Website Crawl - Mobile', async () => {
    await common.testHappyFlow("Website crawl", "Mobile");
});

  