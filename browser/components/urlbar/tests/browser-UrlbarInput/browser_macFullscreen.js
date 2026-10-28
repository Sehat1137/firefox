/* Any copyright is dedicated to the Public Domain.
   https://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_setup(function () {
  UrlbarTestUtils.registerZeroPrefixProvider();
});

add_task(async function test_popup_follows_toolbar() {
  let win = await BrowserTestUtils.openNewBrowserWindow();
  try {
    for (let followsTransforms of [false, true]) {
      for (let nova of [false, true]) {
        info(`Testing followsTransforms=${followsTransforms}, nova=${nova}`);
        await SpecialPowers.pushPrefEnv({
          set: [
            [
              "layout.css.anchor-positioning.follows-transforms.enabled",
              followsTransforms,
            ],
            ["browser.nova.enabled", nova],
          ],
        });
        await UrlbarTestUtils.promiseAutocompleteResultPopup({
          window: win,
          value: "",
        });

        let input = win.gURLBar.querySelector(".urlbar-input-container");
        let inputTop = input.getBoundingClientRect().top;
        let popupTop = win.gURLBar.panel.getBoundingClientRect().top;

        for (let shift of [16, 40, 0]) {
          win.FullScreen.shiftMacToolbarDown(shift);
          await win.promiseDocumentFlushed(() => {});

          let inputRect = input.getBoundingClientRect();
          let popupRect = win.gURLBar.panel.getBoundingClientRect();
          Assert.lessOrEqual(
            Math.abs(inputRect.top - inputTop - shift),
            1,
            `The input follows the toolbar's ${shift}px shift`
          );
          Assert.lessOrEqual(
            Math.abs(popupRect.top - popupTop - shift),
            1,
            `The suggestions follow the toolbar's ${shift}px shift`
          );
        }

        await UrlbarTestUtils.promisePopupClose(win);
        await SpecialPowers.popPrefEnv();
      }
    }
  } finally {
    win.FullScreen.shiftMacToolbarDown(0);
    await BrowserTestUtils.closeWindow(win);
  }
});
