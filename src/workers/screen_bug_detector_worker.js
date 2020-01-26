/*
 * Copyright 2019, The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */




/** This class is concerned with storing the structure for a bug detection function.
 *  NOTHING to change here, unless someone needs to do structural changes to the logic. */
class Detector {
    constructor(detect, error, desc) {
        this.detect = detect;
        this.error = error;
        this.desc = desc;
    }
}

/** This is the main bug detection class. It takes as an input a screen (timepoint)
 *  and iterates over every bug method to check for bugs. */
class ScreenBugDetector {

    constructor(screen) {
        this.screen = screen;
        if (this.screen === undefined) {
            return;
        }
        this.rects = [...this.screen.rects].reverse();
        this.bounds = this.screen.bounds;

        this.bugDetectors = [
            new Detector(this.hasNoNavbar, 'Missing Navbar', 'The navbar is missing for this screen'),
            new Detector(this.hasWhiteScreen, 'White Screen', 'White parts of screen were detected on the display'),
            /** Here one can include new bug detection functions after he created the function below.
             *  A short description is mandatory (as it will show on the view highlighted in red,
             *  wherease long description is optional since it is not yet displayed in the view ) */
        ];

        this.checkScreen();
    }


    // #region - HERE ONE CAN ADD NEW BUG DETECTION FUNCTIONS.

    /** BUG DETECTION FUNCTION - Checks whether the 'NavigationBar'
     *  is part of the visible layers drawn on the screen. */
    hasNoNavbar(self) {
        let bug = true;
        for (let i = 0; i < self.rects.length; i++) {
            // TODO - document why this works.
            if (self.rects[i].label === 'NavigationBar0#0') {
                bug = false;
            }
        }
        return bug;
    }

    /** BUG DETECTION FUNCTION - Checks whether the selected screen has any white areas.
     *  By white areas is meant an area on which nothing is drawn by android currently. 
     *  How this is done currently is that for a screen of size X,Y i create a 2-dimensional
     *  array containing boolean FALSE values for each pixel. Then for each rect that is drawn
     *  above this screen, *  I make the corresponding pixels (items of the 2-dim array) TRUE.
     *  Finally, I iterate over the 2-dim array and if I still find FALSE values then hasBug=TRUE. */
    hasWhiteScreen(self) {

        const surfaceArray = [];
        for (let i = 0; i < self.bounds.height; i++) {
            surfaceArray.push([]);
            for (let j = 0; j < self.bounds.width; j++) {
                surfaceArray[i].push(false);
            }
        }

        for (let i = 0; i < self.rects.length; i++) {
            // TODO - document why this works.
            const visibleRegion = self.rects[i].ref.obj.visibleRegion.rect[0];

            const top = visibleRegion.top || 0;
            const right = visibleRegion.right || 0;
            const bottom = visibleRegion.bottom || 0;
            const left = visibleRegion.left || 0;

            for (let i = top; i < bottom && i < self.bounds.height; i++) {
                for (let j = left; j < right && j < self.bounds.width; j++) {
                    if (surfaceArray[i] && surfaceArray[i][j] !== undefined) {
                        surfaceArray[i][j] = true;
                    }
                }
            }
        }

        for (let i = 0; i < surfaceArray.length; i++) {
            for (let j = 0; j < surfaceArray[i].length; j++) {
                if (surfaceArray[i][j] === false) {
                    return true;
                }
            }
        }

        return false;
    }

    /** -- Add new detection functions here --  */

    // #endregion


    /** Function used to make 'hasBug' property true or false. This 'hasBug  property is used 
     *  to change the color of the timepoints in the timeline to green (correct) to red (buggy).
     *  NOTHING to change here, unless someone needs to do structural changes to the logic. */
    checkScreen() {
        if (this.screenHasBug(this.screen)) {
            this.screen.hasBug = true;
        } else {
            this.screen.hasBug = false;
        }
    }

    /** Function used to iterate over available bug detection methods to test the current screen.  
     *  For each bug it detects, it fills an array of strings, with the messages of the corresponding bug.
     *  NOTHING to change here, unless someone needs to do structural changes to the logic. */
    screenHasBug(screen) {
        for (const detector of this.bugDetectors) {
            if (detector.detect(this)) {
                screen.bugs.push(detector.error);
            }
        }
        return screen.bugs.length > 0 ? true : false;
    }


}

/** Since this functionality is implemented as a Web worker file, this onmessage function
 *  listens for messages from the main javascript thread.
 *  NOTHING to change here, unless someone needs to do structural changes to the logic. */
onmessage = function(event) {
    const response = new ScreenBugDetector(event.data);
    postMessage(response.screen);
}
