// Import Vue and the component being tested
import Vue from 'vue'
import App from '../src/App.vue'

// Here are some Jasmine 2.0 tests, though you can
// use any test runner / assertion library combo you prefer
describe('App', () => {
  // Inspect the raw component options
  it('has a created hook', () => {
    expect(typeof App.created).toBe('function')
  })

  // Evaluate the results of functions in
  // the raw component options
  it('sets the correct default data', () => {
    expect(typeof App.data).toBe('function')
    // const defaultData = App.data()
    // expect(defaultData.message).toBe('hello!')
  })

});