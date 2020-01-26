<!-- Copyright (C) 2017 The Android Open Source Project

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<template>

  <div id="app" :class="mainContentClass">

    <md-toolbar class="main-toolbar" :class="navbarClass">
      <h1 class="md-title flex-1">
        <!-- {{title}} -->
        <md-icon class="software-icon white" aria-hidden="false" aria-label="Mobile Friendly">mobile_friendly</md-icon>
        <span class="software-title  white">Winscope</span>
      </h1>

      <div class="def-props-dark-mode">

          <!-- Show Default Section -->
          <md-checkbox v-model="store.displayDefaults" class="md-accent">
            <span class="no-bg">Show default properties</span>
            <md-tooltip md-direction="bottom">
              If checked, shows the value of all properties.
              Otherwise, hides all properties whose value is the default for its data type.
            </md-tooltip>
          </md-checkbox>
        
          <!-- Switch Dark Mode Section -->
           <md-switch v-model="store.dark">
            <span class="no-bg">
              Dark mode
            </span>
          </md-switch>

      </div>

      <div class="md-layout-item md-size-10">
        <md-field>
          <md-select v-model="fileType" id="file-type" name="file-type" class="bg-white pl-10px" placeholder="File type">
            <md-option value="auto" >Detect type</md-option>
            <md-option :value="k" v-for="(v,k) in FILE_TYPES" :key="v.name">{{v.name}}</md-option>
          </md-select>
        </md-field>
      </div>

      <input type="file" @change="onLoadingFile" id="upload-file" v-show="false"/>
      <md-button class="md-raised file-upload-btn md-accent white" for="upload-file" onclick="document.getElementById('upload-file').click()">
        <span class="file-upload-title">Open File</span>
      </md-button>

    </md-toolbar>

    <div class="get-started" v-if="showGetStartedPage()" :class="backgroundClass">
      <div class="component-container">

        <div class="circle-container" :class="secondaryClass">

          <div class="image-container">
            <img :src="require('./assets/cloud-computing-128px.png')" alt="file-upload-image" class="file-upload-image" />
          </div>

          <div class="note-container" :class="textClass">
            <span class="main-note">Load a new trace</span> 
            <span class="note mat-small">You can load a new trace file from disk in order to work with it.</span>
          </div>

          <div class="file-upload-form">
            <md-button class="md-raised bg-dark-blue file-upload-btn" for="upload-file" onclick="document.getElementById('upload-file').click()">
              <span class="file-upload-title white">Select File</span>
              <md-icon class="example-icon white" aria-hidden="false" aria-label="Insert Drive File Icon">insert_drive_file</md-icon>
            </md-button>
          </div>

        </div>

      </div>
    </div>

    <div class="main-content" v-if="!showGetStartedPage()" :class="mainContentClass">

      <div id="timeline" :class="mainContentClass">
        <md-card class="timeline-card" :class="secondaryClass">

          <md-card-header class="card-toolbar md-dense md-elevation-0 p-2px" :class="primaryClass">
            <h2 class="timeline-title flex-spaced">
              <!-- Timeline -->
              <span class="timeline-title-span">{{title}}</span>
              <div>
                <span class="timeline-error" v-if="timeline[timelineIndex].bugs.length > 0">{{timeline[timelineIndex].bugs.join(', ')}}</span>
                <span class="timeline-current-span">{{timelineIndex + 1}} / {{timeline.length}}</span>
              </div>
            </h2>
          </md-card-header>
          <timeline :items="timeline"
                    :selected="tree"
                    @item-selected="onTimelineItemSelected"
                    class="timeline"
          />
          <!-- :curr="timelineIndex" -->
        </md-card>
      </div>

      <div class="container" :class="mainContentClass">
        <div id="screen" :class="secondaryClass">
        <md-card class="rects no-shadow" :class="secondaryClass">
          <!-- <<md-card-header class="card-toolbar md-dense">
            <h2 class="md-title">Screen</h2>
          </<md-card-header> -->
          <md-card-header class="device-screen">
            <rects :bounds="bounds" :rects="rects" :highlight="highlight" @rect-click="onRectClick" />
          </md-card-header>
        </md-card>
        </div>


        <div class="trace-details"> 


            <md-card class="hierarchy" :class="secondaryClass">
              <md-card-header md-tag="md-toolbar" class="card-toolbar md-elevation-0 md-dense md-layout p-5px" :class="primaryClass">
                <h2 class="md-title pl-10px" style="flex: 1;">Hierarchy</h2>
                <md-checkbox v-model="store.showOnlyChangedScreens" class="my-10px">Show changed</md-checkbox>
                <md-checkbox v-model="store.onlyVisible" class="my-10px">Only visible</md-checkbox>
                <md-checkbox v-model="store.flattened" class="my-10px">Flat</md-checkbox>
              </md-card-header>
              <tree-view :item="tree" @item-selected="itemSelected" :selected="hierarchySelected" :filter="hierarchyFilter" :flattened="store.flattened" :shownewlayer="store.showOnlyChangedScreens" ref="hierarchy" />
            </md-card>


            <md-card class="properties" :class="secondaryClass">
              <md-card-header md-tag="md-toolbar" class="card-toolbar md-elevation-0 md-dense md-layout p-5px" :class="primaryClass">
                <h2 class="md-title pl-10px" style="flex: 1">Properties</h2>
                <div class="filter my-10px">
                  <input id="filter" type="search" placeholder="Filter..." v-model="propertyFilterString" />
                </div>
              </md-card-header>
              <tree-view :item="selectedTree" :filter="propertyFilter" :shownewlayer="store.showOnlyChangedScreens" />
            </md-card>


        </div>
  

      </div>
    </div>

  </div>

</template>

<script>

import Vue from 'vue';

import jsonProtoDefs from '../protos/windowmanagertrace.proto';
import jsonProtoDefsSF from '../protos/layerstrace.proto';
import protobuf from 'protobufjs';

import TreeView from './TreeView.vue';
import Timeline from './Timeline.vue';
import Rects from './Rects.vue';

import detectFile from './detectfile.js';
import LocalStore from './localstore.js';

import { transform_json } from './transform.js';
import { transform_layers, transform_layers_trace } from './transform_sf.js';
import { transform_window_service, transform_window_trace } from './transform_wm.js';
import { fill_transform_data, format_transform_type, is_simple_transform } from './matrix_utils.js';

import * as traceMessage from '../protos-js/traceMessage';
import * as serviceMessage from '../protos-js/serviceMessage';
import * as layersMessage from '../protos-js/layersMessage';
import * as layersTraceMessage from '../protos-js/layersTraceMessage';




let protoDefs = protobuf.Root.fromJSON(jsonProtoDefs).addJSON(jsonProtoDefsSF.nested);

let TraceMessage = null;
let ServiceMessage = null;
let LayersMessage = null;
let LayersTraceMessage = null;

if (process.env.NODE_ENV !== 'test') {
    TraceMessage = protoDefs.lookupType("com.android.server.wm.WindowManagerTraceFileProto");
    ServiceMessage = protoDefs.lookupType("com.android.server.wm.WindowManagerServiceDumpProto");
    LayersMessage = protoDefs.lookupType("android.surfaceflinger.LayersProto");
    LayersTraceMessage = protoDefs.lookupType("android.surfaceflinger.LayersTraceFileProto");
} else {
    TraceMessage = traceMessage;
    ServiceMessage = serviceMessage;
    LayersMessage = layersMessage;
    LayersTraceMessage = layersTraceMessage;
}


const find_item = function(_item, stableId) {
    if (_item.stableId === stableId) {
        return _item;
    }
    if (Array.isArray(_item.children)) {
        for (let child of _item.children) {
            let found = find_item(child, stableId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

const formatProto = function(obj) {
    if (!obj || !obj.$type) {
        return;
    }
    if (obj.$type.fullName === '.android.surfaceflinger.RectProto' ||
        obj.$type.fullName === '.android.graphics.RectProto') {
        return `(${obj.left}, ${obj.top})  -  (${obj.right}, ${obj.bottom})`;
    } else if (obj.$type.fullName === '.android.surfaceflinger.FloatRectProto') {
        return `(${obj.left.toFixed(3)}, ${obj.top.toFixed(3)})  -  (${obj.right.toFixed(3)}, ${obj.bottom.toFixed(3)})`;
    }
    else if (obj.$type.fullName === '.android.surfaceflinger.PositionProto') {
        return `(${obj.x.toFixed(3)}, ${obj.y.toFixed(3)})`;
    } else if (obj.$type.fullName === '.android.surfaceflinger.SizeProto') {
        return `${obj.w} x ${obj.h}`;
    } else if (obj.$type.fullName === '.android.surfaceflinger.ColorProto') {
        return `r:${obj.r} g:${obj.g} \n b:${obj.b} a:${obj.a}`;
    } else if (obj.$type.fullName === '.android.surfaceflinger.TransformProto') {
        let transform_type = format_transform_type(obj);
        if (is_simple_transform(obj)) {
            return `${transform_type}`;
        }
        return `${transform_type}  dsdx:${obj.dsdx.toFixed(3)}   dtdx:${obj.dtdx.toFixed(3)}   dsdy:${obj.dsdy.toFixed(3)}   dtdy:${obj.dtdy.toFixed(3)}`;
    }
}

const handleScreenScroll = function (event) {
    event = event || window.event;
    let screen = document.getElementById('screen');
    if (!screen) {
      return;
    }

    let screenPosition = screen.getBoundingClientRect().top;
    if (window.pageYOffset >= screenPosition) {
        screen.style.position = 'sticky';
        screen.style.zIndex = '1';
        screen.style.top = '25px';
    } else {
        screen.style.zIndex = '0';
    }
}

const handleTimelineScroll = function(event) {
    event = event || window.event;
    let timeline = document.getElementById('timeline');
    if (!timeline) {
      return;
    }

    let timelinePosition = timeline.getBoundingClientRect().top;
    if (window.pageYOffset >= timelinePosition) {
        timeline.style.position = 'sticky';
        timeline.style.zIndex = '2';
        timeline.style.top = '0';
    } else {
        timeline.style.position = 'static';
        timeline.style.zIndex = '0';
    }
}

/** Replace enum values with string representation and 
 *  add default values to the proto objects. This function also handles 
 *  a special case with TransformProtos where the matrix may be derived
 *  from the transform type.
 */
const modifyProtoFields = function(protoObj, displayDefaults) {
    if (!protoObj || protoObj !== Object(protoObj) || !protoObj.$type) {
        return;
    }
    for (let fieldName in protoObj.$type.fields) {
        let fieldProperties = protoObj.$type.fields[fieldName];
        let field = protoObj[fieldName];

        if (Array.isArray(field)) {
            field.forEach((item, _) => {
                modifyProtoFields(item, displayDefaults);
            })
            continue;
        }

        if (displayDefaults && !(field)) {
            protoObj[fieldName] = fieldProperties.defaultValue;
        }

        if (fieldProperties.type === 'TransformProto') {
            fill_transform_data(protoObj[fieldName]);
            continue;
        }

        if (fieldProperties.resolvedType && fieldProperties.resolvedType.valuesById) {
            protoObj[fieldName] = fieldProperties.resolvedType.valuesById[protoObj[fieldProperties.name]];
            continue;
        }

        modifyProtoFields(protoObj[fieldName], displayDefaults);
    }
}

const FILE_TYPES = {
    'window_dump': {
        protoType: ServiceMessage,
        transform: transform_window_service,
        name: "WindowManager dump",
        timeline: false,
    },
    'window_trace': {
        protoType: TraceMessage,
        transform: transform_window_trace,
        name: "WindowManager trace",
        timeline: true,
    },
    'layers_dump': {
        protoType: LayersMessage,
        transform: transform_layers,
        name: "SurfaceFlinger dump",
        timeline: false,
    },
    'layers_trace': {
        protoType: LayersTraceMessage,
        transform: transform_layers_trace,
        name: "SurfaceFlinger trace",
        timeline: true,
    },
};



export default {
    name: 'app',
    data() {
        return {
            selectedTree: {},
            hierarchySelected: null,
            tree: {},
            timeline: [],
            bounds: {},
            rects: [],
            highlight: null,
            timelineIndex: 0,
            title: "Winscope Tool",
            filename: "",
            lastSelectedStableId: null,
            propertyFilterString: "",
            store: LocalStore('app', {
                flattened: false,
                onlyVisible: false,
                displayDefaults: true,
                dark: false,
                showOnlyChangedScreens: false
            }),
            FILE_TYPES,
            fileType: "auto",
        }
    },
    created() {
        window.addEventListener('keydown', this.onKeyDown);
        document.title = this.title;
        window.addEventListener('scroll', this.handleScroll);
    },
    methods: {
        onLoadingFile(e) {
            return this.onLoadingProtoFile(e, this.fileType);
        },
        onLoadingProtoFile(event, type) {
            event = event || window.event;

            let files = event.target.files || event.dataTransfer.files;
            let file = files[0];
            if (!file) {
                /** No file selected. */
                return;
            }
            this.filename = file.name;
            this.title = this.filename + " (loading)";

            let reader = new FileReader();
            reader.onload = (e) => {
                this.onLoadedFile(e, type);
            }
            reader.readAsArrayBuffer(files[0]);
        },
        onLoadedFile(event, type) {
          event = event || window.event;

          let buffer = new Uint8Array(event.target.result);
          let filetype = FILE_TYPES[type] || FILE_TYPES[detectFile(buffer)];
          if (!filetype) {
              this.title = this.filename + ": Could not detect file type."
              event.target.value = '';
              return;
          }
          this.title = this.filename + " (loading " + filetype.name + ")";

          let decoded;
          let transformed;
          try {
              decoded = filetype.protoType.decode(buffer);
              modifyProtoFields(decoded, this.store.displayDefaults);
              transformed = filetype.transform(decoded);
          } catch (ex) {
              this.title = this.filename + " (loading " + filetype.name + "):" + ex;
              return;
          } finally {
              event.target.value = '';
          }

          let children = [];
          if (filetype.timeline) {
              for (let i = 0; i < Object.keys(transformed.children).length; i++) {
                let child = Object.assign({}, transformed.children[i]);
                child.id = i + 1;
                child.hasBug = null;
                child.bugs = [];
                children.push(child);
              }
              this.timeline = children;
              
          } else {
              for (let i = 0; i < Object.keys(transformed).length; i++) {
                let child = Object.assign({}, transformed[i]);
                child.id = i + 1;
                child.hasBug = null;
                child.bugs = [];
                children.push(child);
              }
              this.timeline = children;
          }

          this.title = this.filename + " (" + filetype.name + ")";

          this.lastSelectedStableId = null;
          this.onTimelineItemSelected(this.timeline[0], 0);

          this.checkScreenBugs();

        },
        checkNewLayers(current, currentIndex) {
          const previous = this.timeline[currentIndex - 1];
          this.checkNewLayersRecursive(current.children, previous.children)
          return current;
        },
        checkNewLayersRecursive(currentChildren, prevChildren) {

          for (let i = 0; i < currentChildren.length; i++) {

            const curr = currentChildren[i];
            let hasLayer = false;

            for (let j = 0; j < prevChildren.length; j++) {
              const prev = prevChildren[j];
              this.checkNewLayersRecursive(curr.children, prev.children);

              if (curr.name === prev.name) {
                hasLayer = true;
                break;
              }

            }

            currentChildren[i].new = !hasLayer;
          }

        },
        checkChangedPropertiesRecursive(currentChildren, prevChildren) {

          for (let i = 0; i < currentChildren.length; i++) {
            const curr = currentChildren[i];
            const currArray = curr.name.split(':');
            const currProp = currArray[0];
            const currValue = currArray.length > 1 ? currArray[1] : '';
            let hasProp = false;
            let hasChanged = false;
            let was = null;

            for (let j = 0; j < prevChildren.length; j++) {
              const prev = prevChildren[j];
              const prevArray = prev.name.split(':');
              const prevProp = prevArray[0];
              const prevValue = prevArray.length > 1 ? prevArray[1] : '';
              this.checkChangedPropertiesRecursive(curr.children, prev.children);

              if (currProp === prevProp) {
                hasProp = true;
                if (currValue !== prevValue) {
                  hasChanged = true;
                  was = prevValue;
                }
                break;
              }

            }

            /** Below status means the following: 
             *  - 0 = existing & same
                - 1 = existing & changed
                - 2 = new
              */
            let status = hasProp && !hasChanged ? 0 : hasProp && hasChanged ? 1 : !hasProp ? 3 : -1;
            currentChildren[i].status = status;
            currentChildren[i].was = was;
          }

        },
        itemSelected(layer) {
            this.hierarchySelected = layer;
            this.selectedTree = transform_json(layer.obj, layer.name, {
                skip: layer.skip,
                formatter: formatProto
            });

            if (this.store.showOnlyChangedScreens && this.timelineIndex !== 0) {
                const prevIndex = this.timelineIndex - 1;
                const prev = this.timeline[prevIndex];
                let foundPrev = find_item(prev, layer.stableId);
                if (foundPrev) {
                    const prevTimepointLayer = transform_json(foundPrev.obj, foundPrev.name, {
                        skip: foundPrev.skip,
                        formatter: formatProto
                    });
                    this.checkChangedPropertiesRecursive(this.selectedTree.children, prevTimepointLayer.children);
                }
            }


            this.highlight = layer.highlight;
            this.lastSelectedStableId = layer.stableId;
        },
        onRectClick(item) {
            if (item) {
                this.itemSelected(item);
            }
        },
        onTimelineItemSelected(item, index) {
            this.timelineIndex = index;
            if (this.store.showOnlyChangedScreens && this.timelineIndex !== 0) {
              item = this.checkNewLayers(item, index);
            }
            this.tree = item;
            this.rects = [...item.rects].reverse();
            this.bounds = item.bounds;

            this.hierarchySelected = null;
            this.selectedTree = {};
            this.highlight = null;

            if (this.lastSelectedStableId) {
                let found = find_item(item, this.lastSelectedStableId);
                if (found) {
                  this.itemSelected(found);
                }
            }

        },
        onKeyDown(event) {
            event = event || window.event;
            if (event.keyCode == 37 /* left */) {
                this.advanceTimeline(-1);
            } else if (event.keyCode == 39 /* right */) {
                this.advanceTimeline(1);
            } else if (event.keyCode == 38 /* up */) {
                this.$refs.hierarchy.selectPrev();
            } else if (event.keyCode == 40 /* down */) {
                this.$refs.hierarchy.selectNext();
            } else {
                return false;
            }
            event.preventDefault();
            return true;
        },
        advanceTimeline(frames) {
            if (!Array.isArray(this.timeline) || this.timeline.length == 0) {
                return false;
            }
            let nextIndex = this.timelineIndex + frames;
            if (nextIndex < 0) {
                nextIndex = 0;
            }
            if (nextIndex >= this.timeline.length) {
                nextIndex = this.timeline.length - 1;
            }
            this.onTimelineItemSelected(this.timeline[nextIndex], nextIndex);
            return true;
        },
        handleScroll(event) {
            event = event || window.event;
            handleTimelineScroll(event);
            handleScreenScroll(event);
        },
        showGetStartedPage() {
            if (this.timeline.length === 0) {
                return true;
            } else {
                return false;
            }
        },
        checkScreenBugs() {
            let w;
            if(typeof(Worker) !== "undefined") {
                if(typeof(w) == "undefined") {
                  w = new Worker("./workers/screen_bug_detector_worker.js");
                }
                let i = 0;
                let self = this;
                w.postMessage(this.timeline[i]);
                w.onmessage = (event) => {
                  if (event.data) {
                    Vue.delete(self.timeline[i], 'hasBug');
                    self.timeline[i] = event.data;
                    Vue.set(self.timeline[i], 'hasBug', self.timeline[i].hasBug);
                  }
                  if (i < self.timeline.length - 1) {
                    w.postMessage(self.timeline[++i]);
                  }
                };
            } else {
                console.warn("Sorry, your browser does not support Web Workers...");
            }
        },
    },

    computed: {
        prettyDump() {
          return JSON.stringify(this.dump, null, 2);
        },
        hierarchyFilter() {
            return this.store.onlyVisible ? (c, flattened) => {
                return c.visible || c.childrenVisible && !flattened;
            } : null;
        },
        propertyFilter() {
            let filterStrings = this.propertyFilterString.split(",");
            let positive = [];
            let negative = [];
            filterStrings.forEach((f) => {
                if (f.startsWith("!")) {
                    let str = f.substring(1);
                    negative.push((s) => s.indexOf(str) === -1);
                } else {
                    let str = f;
                    positive.push((s) => s.indexOf(str) !== -1);
                }
            });
            let filter = (item) => {
                let apply = (f) => f(item.name);
                return (positive.length === 0 || positive.some(apply))
                    && (negative.length === 0 || negative.every(apply));
            };
            filter.includeChildren = true;
            return filter;
        },
        primaryClass() {
          return this.store.dark ? 'dark-bg-2 bright-text-0' : 'bright-bg-1 bright-text-0';
        },
        secondaryClass() {
          return this.store.dark ? 'dark-bg-1 bright-text-4' : 'bright-bg-3 dark-text-0';
        },
        backgroundClass() {
          return this.store.dark ? 'dark-bg-3' : 'bright-bg-4';
        },
        textClass() {
          return this.store.dark ? 'dark-text-4' : 'dark-text-0';
        },
        navbarClass() {
          return this.store.dark ? 'dark-bg-0 bright-text-0' : 'bright-bg-1 bright-text-0';
        },
        mainContentClass() {
          return this.store.dark ? 'dark-bg-0' : 'bright-bg-4';
        }
    },
    watch: {
        title() {
            document.title = this.title;
        }
    },
    components: {
        'tree-view': TreeView,
        'timeline': Timeline,
        'rects': Rects,
    }
}

</script>

<style lang="css" scoped>


#app {
  height: 100%;
}

.software-title {
  font-size: 22px !important;
  padding-left: 8px;
  cursor: pointer;
}

.software-icon {
  position: relative;
  top: -3px;
  cursor: pointer;
}

.bg-white {
  background-color: white;
}

.bg-orange {
  background-color: #FF9800;
}

.bg-orange.md-checkbox.md-checked .md-checkbox-container {
    background-color: #FF9800;
    border-color: #FF9800;
}

.bg-orange .md-checkbox-label {
  background: #3f51b5;
}

.main-content {
  padding: 8px; 
}

.card-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, .12);
}

.timeline-card {
  margin: 8px;
}

.timeline {
  margin: 6px 16px;
}

.screen {
  border: 1px solid black;
}

.rects {
  flex: none;
  margin: 8px;
  min-width: 500px;
  position: absolute;
}

.white {
  color: white !important;
}

.bg-warn {
  background-color: #ff5722 !important;
}

#file-type input::placeholder {
  color:white !important;
}


#file-type::placeholder {
  color:white !important;
}

#file-type span {
  color: white !important;
}

.bg-dark-blue {
    background-color: #3d50b6 !important;
}

.device-screen {
    height: 750px;
    display: flex;
    justify-content: center;
}


.hierarchy, .properties {
  flex: 1;
  margin: 8px;
  min-width: 400px;
}

.properties {
  max-width: 450px; 
  width: 450px; 
}

.hierarchy > .tree-view, .properties > .tree-view {
  margin: 16px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.mt-10px {
  margin-bottom: 10px;
}

.mb-10px {
  margin-top: 10px;
}

.my-10px {
  margin-top: 10px;
  margin-bottom: 10px;
}

.ml-8px {
  margin-left: 8px;
}

.p-5px {
  padding: 5px;
}

.pl-10px {
  padding-left: 10px;
}

.p-2px {
  padding: 2px;
}

.md-title {
  font-size: 16px !important;
}

.timeline-title {
  font-size: 14px;
  margin: 3px 8px;
}

.timeline-error {
    margin-right: 20px;
    border: 1px solid #FFEB3B;
    padding: 2px 10px;
    font-size: 12px;
    border-radius: 4px;
    color: #FFEB3B;
}

.flex-1 {
  flex: 1;
}



/* ------------ */
/* trace css */

.main-toolbar {
  min-height: 52px;
  height: 6%;
}

.get-started {
  height: 94%;
  min-height: 800px;
}

.component-container {
  width: 100%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Upload Image Container */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Gray Circle Container */
.circle-container {
  -webkit-border-radius: 50%;
  width: 430px;
  height: 430px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  border-radius: 50%;
  background-color: #f1f1f1;
}

.file-upload-form {
  display: flex;
  justify-content: center;
}

.file-upload-title {
  margin-right: 10px;
}

/* Hidden File Input CSS */
.hidden {
  display: none;
  visibility: hidden;
}

/* Note CSS */
.note-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0 20px 0;
  color: rgba(0, 0, 0, 0.54);
  align-items: center;
  flex-direction: column;
}

.main-note {
  margin: 0 0 7px 0;
  width: 260px;
  text-align: center;
}

.note {
  width: 220px;
  text-align: center;
}

.trace-details {
  display: flex;
  flex-wrap: wrap;
  margin-left: 515px;
}

.flex-spaced {
  display: flex;
  justify-content: space-between;
}

.no-shadow {
  box-shadow: none;
}




/* Dark mode - Dark colors */

.dark-bg-0 { background: #212121 !important; }
.dark-bg-1 { background: #333333 !important; }
.dark-bg-2 { background: #555555 !important; }
.dark-bg-3 { background: #777777 !important; }

.dark-text-0 { color: #111111 !important; }
.dark-text-4 { color: #999999 !important; }

/* Dark mode - Bright colors */

.bright-bg-1 { background: #3f51b5 !important; }
.bright-bg-3 { background: #f6f6f6 !important; }
.bright-bg-4 { background: #ffffff !important; }

.bright-text-0 { color: #ffffff !important; }
.bright-text-4 { color: #ffffff !important; }


</style>
