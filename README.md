# Purple HATS Desktop

Purple hats Desktop is a desktop frontend for [Purple HATS](https://github.com/GovTechSG/purple-hats) accessibility site scanner - a customisable, automated web accessibility testing tool that allows software development teams to find and fix accessibility problems to improve persons with disabilities (PWDs) access to digital services.

<img alt="Purple HATS Desktop main screen" src="https://github.com/GovTechSG/purple-hats-desktop/assets/2021525/8eb8268e-80dd-4aff-b004-a4e7b8949ebc">

## Technology Stack

1. [Electron](https://www.electronjs.org/)
2. [React](https://react.dev/)

## Prerequisites and Installations

### Download Purple HATS Desktop

Purple HATS Desktop is available as a download for Windows and MacOS. Refer to [Installation Guide](/INSTALLATION.md) for step-by-step instructions.

#### Facing issues?

Open an [issue ticket](https://github.com/GovTechSG/purple-hats-desktop/issues) for assistance.

---

## Basic usage

Enter a valid URL to scan in the textbox and press the "Scan" button.  The default settings will crawl your website and scan 100 pages for accessibility issues.

![Purple HATS Desktop main page](https://github.com/GovTechSG/purple-hats-desktop/assets/2021525/7d114637-6337-4f68-a8a4-a7673c4601ef)

## Limit number of pages scanned

If you find a scan takes too long to complete due to large website, or there are too many pages in a sitemap to scan, you may choose to limit number of pages scanned. Click on the drop down and enter the desired number of pages to scan.

![Limit Scan Pages](https://github.com/GovTechSG/purple-hats-desktop/assets/2021525/4bfb1125-138e-4720-9db0-a046a4b1f495)

## Advanced scan options

Click on the "Advanced scan options" button to configure the scan options.

![Advanced Scan Options](https://github.com/GovTechSG/purple-hats-desktop/assets/2021525/caf2c1a6-1acf-433d-9843-3482666ac377)

### Scan Type Selection

#### Website Crawl

The default scan option for Purple HATS desktop. Purple HATS Desktop will crawl and scan all the links (up to page limit) within the domain in the provided URL.

#### Sitemap Crawl

With sitemap crawl, provide a URL to a sitemap file (e.g. `https.domain.com/sitemap.xml`) and Purple HATS Desktop will crawl and scan all the links (up to page limit) within the domain in the provided URL.

#### Custom Flow

Custom flow is used to scan Single-Page Applications (SPAs) or websites that require user authentication. 2 pop-up windows will appear after running the scan. The browser pop-up window will be used to record your actions, proceed with your actions as you would normally do on the website and close the browser window when you are done. The second window is used to log the actions in code (**do not close the second window** until the scan is completed).

![Custom Flow Browser](https://github.com/GovTechSG/purple-hats-desktop/assets/2021525/c5962e1d-80c4-430d-853f-37009302c19d)

### Viewport Options

Customise the viewport options to render your websites for desktop and mobile device users.

#### Desktop

Defaults to 1280x720.

#### Mobile

Defaults to the screen size of iPhone 11.

#### Specific device

<details>
  <summary>Click here for list of device options supported</summary>

- "Desktop Chrome HiDPI"
- "Desktop Edge HiDPI"
- "Desktop Firefox HiDPI"
- "Desktop Safari"
- "Desktop Chrome"
- "Desktop Edge"
- "Desktop Firefox"
- "Blackberry PlayBook"
- "Blackberry PlayBook landscape"
- "BlackBerry Z30"
- "BlackBerry Z30 landscape"
- "Galaxy Note 3"
- "Galaxy Note 3 landscape"
- "Galaxy Note II"
- "Galaxy Note II landscape"
- "Galaxy S III"
- "Galaxy S III landscape"
- "Galaxy S5"
- "Galaxy S5 landscape"
- "Galaxy S8"
- "Galaxy S8 landscape"
- "Galaxy S9+"
- "Galaxy S9+ landscape"
- "Galaxy Tab S4"
- "Galaxy Tab S4 landscape"
- "iPad (gen 6)"
- "iPad (gen 6) landscape"
- "iPad (gen 7)"
- "iPad (gen 7) landscape"
- "iPad Mini"
- "iPad Mini landscape"
- "iPad Pro 11"
- "iPad Pro 11 landscape"
- "iPhone 6"
- "iPhone 6 landscape"
- "iPhone 6 Plus"
- "iPhone 6 Plus landscape"
- "iPhone 7"
- "iPhone 7 landscape"
- "iPhone 7 Plus"
- "iPhone 7 Plus landscape"
- "iPhone 8"
- "iPhone 8 landscape"
- "iPhone 8 Plus"
- "iPhone 8 Plus landscape"
- "iPhone SE"
- "iPhone SE landscape"
- "iPhone X"
- "iPhone X landscape"
- "iPhone XR"
- "iPhone XR landscape"
- "iPhone 11"
- "iPhone 11 landscape"
- "iPhone 11 Pro"
- "iPhone 11 Pro landscape"
- "iPhone 11 Pro Max"
- "iPhone 11 Pro Max landscape"
- "iPhone 12"
- "iPhone 12 landscape"
- "iPhone 12 Pro"
- "iPhone 12 Pro landscape"
- "iPhone 12 Pro Max"
- "iPhone 12 Pro Max landscape"
- "iPhone 12 Mini"
- "iPhone 12 Mini landscape"
- "iPhone 13"
- "iPhone 13 landscape"
- "iPhone 13 Pro"
- "iPhone 13 Pro landscape"
- "iPhone 13 Pro Max"
- "iPhone 13 Pro Max landscape"
- "iPhone 13 Mini"
- "iPhone 13 Mini landscape"
- "Kindle Fire HDX"
- "Kindle Fire HDX landscape"
- "LG Optimus L70"
- "LG Optimus L70 landscape"
- "Microsoft Lumia 550"
- "Microsoft Lumia 550 landscape"
- "Microsoft Lumia 950"
- "Microsoft Lumia 950 landscape"
- "Nexus 10"
- "Nexus 10 landscape"
- "Nexus 4"
- "Nexus 4 landscape"
- "Nexus 5"
- "Nexus 5 landscape"
- "Nexus 5X"
- "Nexus 5X landscape"
- "Nexus 6"
- "Nexus 6 landscape"
- "Nexus 6P"
- "Nexus 6P landscape"
- "Nexus 7"
- "Nexus 7 landscape"
- "Nokia Lumia 520"
- "Nokia Lumia 520 landscape"
- "Nokia N9"
- "Nokia N9 landscape"
- "Pixel 2"
- "Pixel 2 landscape"
- "Pixel 2 XL"
- "Pixel 2 XL landscape"
- "Pixel 3"
- "Pixel 3 landscape"
- "Pixel 4"
- "Pixel 4 landscape"
- "Pixel 4a (5G)"
- "Pixel 4a (5G) landscape"
- "Pixel 5"
- "Pixel 5 landscape"
- "Moto G4"
- "Moto G4 landscape"

</details>

### Custom Width

Enter a custom width in pixels. Minimum width is 320px and maximum width is 1080px.

## Additional Information on Data

Purple HATS Desktop uses third-party open-source tools that may be downloaded over the Internet during the installation process of Purple HATS. Users should be aware of the libraries used by examining `package.json`.

Purple HATS Desktop may send information to the website or URL where the user chooses to initiate a Purple HATS scan. Limited user information such as e-mail address, name, and basic analytics is collected for the purpose of knowing our usage patterns better.
