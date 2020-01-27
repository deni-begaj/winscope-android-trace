// Import Vue and the component being tested
import Timeline from '../src/Timeline.vue'


describe('Timeline', () => {
    // Inspect the raw component options
    it('test itemclass', () => {
        expect(Timeline.methods.itemClass(null)).toBe('selected')
    })

 //   it('emri testit timescale', () => {
 //       expect(Timeline.computed.timestamps()).toBe('selected')
 //   })



});