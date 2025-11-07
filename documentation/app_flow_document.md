# App Flow Document for DNZwrk Personal CRM

## Onboarding and Sign-In/Sign-Up

When a new user first discovers DNZwrk, they arrive at the application’s landing URL in their browser. There is no traditional sign-up or sign-in process, as all data remains private and local to the device. On initial load, the application checks for a previously installed service worker and prompts the user with an “Add to Home Screen” banner. If the user accepts, the PWA installs itself and appears alongside other apps. If the user declines, the app continues to function in the browser with the same offline capabilities. There is no account creation, password management, or social login, so the user can begin using the CRM immediately without any form of authentication.

## Main Dashboard or Home Page

After installation or loading the URL, the user sees the main dashboard. At the top, a fixed header displays the app name “DNZwrk” and an icon that triggers the commission creation modal. Below the header, a row of summary cards shows real-time totals for all commissions, pending amounts, and completed values. Underneath the summary cards, the commission list presents each commission as a card or table row, showing title, client, amount, status, and date. Alongside the list there are export controls for JSON download, WhatsApp deep-link sharing, and PNG snapshot generation. A bottom navigation bar or persistent floating button remains available for adding new commissions and accessing help or installation instructions.

## Detailed Feature Flows and Page Transitions

When the user clicks the “Add Commission” button in the header or floating action button, an overlay modal appears. This modal contains input fields for title, client name, amount, and status. As the user types, inline validation immediately flags missing or invalid values. If all fields pass validation and the user clicks “Save,” the modal calls a method on the Svelte store. This method wraps a Dexie.js operation that writes the new commission record to IndexedDB. Upon successful write, the modal closes automatically. The commission list below re-renders instantly with the new entry, and the summary cards recalculate to reflect the updated totals.

If the user wants to edit an existing commission, they tap or click the commission card in the list. The same modal opens but with the fields prefilled. After making changes, the user saves again, causing the Dexie store to update the existing record. The list and summary cards update in place without a page reload. To delete a commission, the user selects a delete icon on the card. A small confirmation prompt appears inline; once confirmed, the record is removed from IndexedDB and the UI updates immediately.

Export functionality lives in a static toolbar below the summary cards. When the user selects the JSON export option, the app serializes the current commission array using JSON.stringify and triggers a file download named “dnzwrk-commissions.json.” Choosing the WhatsApp option constructs a whatsapp://send URL containing formatted text of the summaries and opens the device’s share sheet or WhatsApp app. For a PNG export, the user clicks the image button, and the app uses html2canvas to capture the dashboard area. Once the canvas is rendered, a PNG blob is generated and downloaded to the device.

Throughout these flows, navigation happens seamlessly within the single-page app. Opening and closing modals does not trigger full page loads. The service worker ensures that all assets are served from cache when offline, so the user’s interactions remain consistent even without internet connectivity.

## Settings and Account Management

DNZwrk does not include a user account or profile settings section. All user preferences are derived from the local application state. The only configurable behavior is controlled by browser or device settings, such as enabling notifications or managing installed PWA shortcuts. If the user wants to clear all data, they use the browser’s site settings to clear storage, which removes all commissions from IndexedDB. From there, they return directly to the main dashboard flow by reloading the application URL or reopening the PWA.

## Error States and Alternate Paths

If a user attempts to save a commission with missing or invalid data, the modal displays an inline error message beneath each offending field, preventing submission until the data is corrected. In the rare case that a Dexie database operation fails, the application catches the error and displays a transient banner at the top of the screen with a brief description such as “Failed to save. Please try again.” The user can tap this banner to retry the last action. When offline, the service worker intercepts asset requests and serves cached files. If a resource is not in cache, a minimal offline fallback screen appears, offering a button to retry loading when connectivity returns. For export actions, if the device’s sharing intent fails (for example, no WhatsApp app installed), an alert informs the user that the action is unavailable and suggests using the JSON or PNG export instead.

## Conclusion and Overall App Journey

A user lands on the DNZwrk CRM, installs or loads it directly in their browser, and is immediately presented with the dashboard. They create commissions through a simple modal, view real-time summary calculations, and export data with just a click. All interactions happen offline and store data securely in IndexedDB. Validation and error handling ensure the user never loses work, while the PWA setup delivers a native-like experience. Over time, the user returns to the dashboard to add new commissions, edit existing ones, or share summaries via JSON, WhatsApp, or PNG. The entire journey from first use to daily management is smooth, intuitive, and free of interruptions, fulfilling the goal of a private, fast, and reliable personal CRM.