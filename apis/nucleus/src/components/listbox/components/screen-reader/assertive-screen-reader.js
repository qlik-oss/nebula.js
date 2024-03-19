import { useContext } from 'react';
import InstanceContext from '../../../../contexts/InstanceContext';

/**
 * Announces the selection state.
 *
 * @ignore
 * @param {Layout} object
 * @returns {string}
 */
function getSRForSelectedState({ layout, translatorDynamic }) {
  const { qStateCounts: s = {} } = layout?.qListObject?.qDimensionInfo || {};

  const count = s.qSelected + s.qSelectedExcluded + s.qLocked + s.qLockedExcluded;

  let t;
  switch (count) {
    case 0:
      t = 'ScreenReader.ZeroSelected';
      break;
    case 1:
      t = 'ScreenReader.OneSelected';
      break;
    default:
      t = 'ScreenReader.ManySelected';
      break;
  }

  const text = translatorDynamic.get(t, [count]);
  return text;
}

function getSearchTranslationString(listCount) {
  let t;
  switch (listCount) {
    case 0:
      t = 'Listbox.NoMatchesForYourTerms';
      break;
    case 1:
      t = 'ScreenReader.OneSearchResult';
      break;
    default:
      t = 'ScreenReader.ManySearchResults';
      break;
  }

  return t;
}

export default function getScreenReaderAssertiveText({ layout, searchInputText, listCount }) {
  const { translator: translatorDynamic } = useContext(InstanceContext);
  const finalStringArr = [];
  if (searchInputText?.length) {
    // Add search result text.
    const srSearchTranslationString = getSearchTranslationString(listCount);
    const srSearchString = translatorDynamic.get(srSearchTranslationString, [listCount]);
    finalStringArr.push(srSearchString);
  }

  // Add selection value text.
  const srSelectionValueText = getSRForSelectedState({ layout, translatorDynamic });
  finalStringArr.push(srSelectionValueText);

  // Merge texts into one text string, targeting the assertive screen reader.
  const finalString = finalStringArr.filter((v) => !!v?.length).join('. ');
  return finalString;
}
