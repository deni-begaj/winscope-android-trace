import { Detector, ScreenBugDetector } from '../src/screen_bug_detector';


const screenBugDetector = new ScreenBugDetector({ bugs: [], rects: [] });
const detector = new Detector(screenBugDetector.hasNoNavbar, 'Missing Navbar', 'The navbar is missing for this screen');

describe('Screen Bug Detector', () => {

    expect(typeof detector.detect).toBe('function');

    expect(typeof detector.error).toBe('string');

    expect(typeof detector.desc).toBe('string');    

});