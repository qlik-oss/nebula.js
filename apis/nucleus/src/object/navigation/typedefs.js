/**
 * @function getUrlForSheet
 * @description Gets the URL to the supplied sheet.
 * @param {string} sheetId - The id of the sheet to get the URL for.
 * @returns {string} The URL to the supplied sheet
 */

/**
 * @function goToSheet
 * @description Navigate to the supplied sheet
 * @param {string} sheetId Id of the sheet to navigate to
 * @param {string=} chartId Id of the chart to highlight
 * @returns {boolean} Returns true if the supplied sheet exists
 */

/**
 * @function nextSheet
 * @description Navigate to the next sheet
 * @returns {boolean} Returns true if the next sheet exists
 */

/**
 * @function prevSheet
 * @description Navigate to the previous sheet
 * @returns {boolean} Returns true if the previous sheet exists
 */

/**
 * @function goToStory
 * @description Navigate to the supplied story
 * @param {string} storyId
 * @returns {boolean} Returns true if the suppplied sheet exists
 */

/**
 * @function getCurrentSheetId
 * @description Returns the current sheet id
 * @returns {string|false}
 */

/**
 * @function getCurrentStoryId
 * @description Returns the current story id
 * @returns {string|false}
 */

/**
 * @function refreshDynamicViews
 * @description Refreshes the dynamic views by publishing an event. This will refresh all the dynamic views in the sheet.
 */

/**
 * @function getOdagLinks
 * @description Returns a list of odag links for the user to select in a button navigation
 * @param {qix.Doc} app
 * @returns {Array<object>} A list of odag links
 */

/**
 * @function openOdagPopup
 * @description Shows the odag popup upon a button click
 * @param {qix.Doc} app
 * @param {string} odagLinkId - The odag reference Id
 * @param {HTMLButtonElement} element - The button element to which the popup will be attached to.
 */

/**
 * @interface ObjectNavigation
 * @property {getUrlForSheet=} getUrlForSheet
 * @property {goToSheet=} goToSheet
 * @property {nextSheet=} nextSheet
 * @property {prevSheet=} prevSheet
 * @property {goToStory=} goToStory
 * @property {getCurrentSheetId=} getCurrentSheetId
 * @property {getCurrentStoryId=} getCurrentStoryId
 * @property {refreshDynamicViews=} refreshDynamicViews
 * @property {getOdagLinks=} getOdagLinks
 * @property {openOdagPopup=} openOdagPopup
 */
