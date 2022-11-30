# Rendering tests

These tests are aimed for more generic rendering tests than the **mashup** and **integration** counterparts. These tests do not rely on a Supernova or custom backend solution for producing screenshots. If you want to test a Supernova based viz, you should instead create either a [mashup](../mashup) or an [integration](../integration) test.

## Tests covered (so far)

- [Listboxes](./listbox)

## Create and run tests

1. Create a folder, e.g. `./test/rendering/listbox`
2. Inside that folder, create:
   - listbox.spec.js - a test file which orchestrates interactions and when to take a screenshot
   - listbox.html - constitutes the "site" that the test file interacts with and creates screenshots from
   - listbox.js - (optional) if you don't want to add all JS code inside of the html file
3. Run tests from the nebula.js root with `yarn test:rendering`
4. The first time, the test will fail and create an image inside of the `__artifacts__/temp` folder. Drag this file to the `__artifacts__/baseline` folder and re-run the test to verify that it passes. Then `git push` the baseline.

Check the [listbox files](./listbox) for details on how to write the code in these files.

## Output folders

Screenshots are stored in the following folders:

- `temp` - new screenshots are stored here
- `baseline` - new screenshots are compared to the baseline version of the image, in order to check validity – only update these if a change is expected
- `regression` - new screenshots are saved here when deviating too much (i.e. when they are invalid)
- `diff` - the difference between the baseline and the regression image
