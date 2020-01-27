// Import Vue and the component being tested
import App from '../src/App.vue'



describe('App', () => {
    // Inspect the raw component options
    it('has a created hook', () => {
        expect(typeof App.data).toBe('function')
    })



    it('asht stringa', () => {
        expect(typeof App.name).toBe('string')

    })

});